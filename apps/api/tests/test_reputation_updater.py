"""Tests for services.reputation_updater (Moat 5)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from web3 import Web3
from web3.exceptions import ContractLogicError

from services import reputation_updater as ru


# ---- alignment calc ----------------------------------------------------------


class TestAlignmentCalculation:
    def test_aligned_returns_positive_delta(self) -> None:
        assert ru.calculate_delta("FOR", "FOR") == ru.ALIGN_DELTA
        assert ru.calculate_delta("AGAINST", "AGAINST") == ru.ALIGN_DELTA

    def test_misaligned_returns_negative_delta(self) -> None:
        assert ru.calculate_delta("FOR", "AGAINST") == ru.MISALIGN_DELTA
        assert ru.calculate_delta("AGAINST", "FOR") == ru.MISALIGN_DELTA

    def test_abstain_agent_no_update(self) -> None:
        assert ru.calculate_delta("ABSTAIN", "FOR") is None
        assert ru.calculate_delta("ABSTAIN", "AGAINST") is None

    def test_split_or_abstain_consensus_no_update(self) -> None:
        assert ru.calculate_delta("FOR", "SPLIT") is None
        assert ru.calculate_delta("AGAINST", "ABSTAIN") is None

    def test_compute_updates_skips_neutral(self) -> None:
        decisions = [
            ("bull", "FOR"),
            ("bear", "AGAINST"),
            ("risk", "ABSTAIN"),  # skipped
            ("tech", "FOR"),
            ("sentiment", "FOR"),
        ]
        out = ru.compute_updates_for_debate(decisions, "FOR")  # type: ignore[arg-type]
        personas = [p for p, _, _ in out]
        deltas = {p: d for p, _, d in out}

        assert "risk" not in personas
        assert deltas["bull"] == ru.ALIGN_DELTA
        assert deltas["bear"] == ru.MISALIGN_DELTA
        assert deltas["tech"] == ru.ALIGN_DELTA
        assert deltas["sentiment"] == ru.ALIGN_DELTA

    def test_compute_updates_split_consensus_returns_empty(self) -> None:
        decisions = [("bull", "FOR"), ("bear", "AGAINST")]
        assert ru.compute_updates_for_debate(decisions, "SPLIT") == []  # type: ignore[arg-type]


# ---- on-chain interactions ---------------------------------------------------


def _make_updater_with_mocks(
    *,
    private_key: str = "0x" + "11" * 32,
) -> ru.ReputationUpdater:
    """Build an updater whose Web3 + contract are entirely mocked."""
    with patch.object(ru, "Web3") as web3_cls:
        web3_cls.HTTPProvider = MagicMock()
        web3_cls.to_checksum_address = staticmethod(Web3.to_checksum_address)

        w3_instance = MagicMock()
        w3_instance.eth = MagicMock()
        web3_cls.return_value = w3_instance

        contract_mock = MagicMock()
        w3_instance.eth.contract.return_value = contract_mock

        updater = ru.ReputationUpdater(
            rpc_url="http://localhost:8545",
            contract_address="0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44",
            backend_private_key=private_key,
            chain_id=84532,
        )
        # expose mocks for test assertions
        updater._w3_mock = w3_instance  # type: ignore[attr-defined]
        updater._contract_mock = contract_mock  # type: ignore[attr-defined]
        return updater


class TestUpdateReputationCallsContract:
    def test_sends_signed_transaction(self) -> None:
        updater = _make_updater_with_mocks()
        contract = updater._contract_mock  # type: ignore[attr-defined]
        w3 = updater._w3_mock  # type: ignore[attr-defined]

        w3.eth.get_transaction_count.return_value = 7
        build_tx = {"from": "0x", "nonce": 7, "chainId": 84532}
        contract.functions.updateReputation.return_value.build_transaction.return_value = build_tx

        receipt = MagicMock()
        receipt.transactionHash = b"\xaa" * 32
        w3.eth.send_raw_transaction.return_value = b"\xbb" * 32
        w3.eth.wait_for_transaction_receipt.return_value = receipt

        # Subsequent get_reputation read after tx
        contract.functions.getReputation.return_value.call.return_value = (110, 1, 1)

        with patch.object(updater, "_account") as account_mock:
            account_mock.address = "0x" + "ab" * 20
            signed = MagicMock()
            signed.raw_transaction = b"\xcd" * 32
            account_mock.sign_transaction.return_value = signed

            result = updater.update_reputation(
                ru.PERSONA_ADDRESSES["bull"], ru.ALIGN_DELTA
            )

        assert result.status == "sent"
        assert result.delta == ru.ALIGN_DELTA
        assert result.new_score == 110
        contract.functions.updateReputation.assert_called_once()
        w3.eth.send_raw_transaction.assert_called_once_with(b"\xcd" * 32)


class TestGetReputationReturnsTuple:
    def test_returns_three_field_view(self) -> None:
        updater = _make_updater_with_mocks()
        contract = updater._contract_mock  # type: ignore[attr-defined]
        contract.functions.getReputation.return_value.call.return_value = (95, 4, 3)

        view = updater.get_reputation(ru.PERSONA_ADDRESSES["bear"])
        assert view.score == 95
        assert view.debates == 4
        assert view.aligned == 3


class TestGracefulFallback:
    def test_unauthorized_revert_does_not_crash(self) -> None:
        updater = _make_updater_with_mocks()
        contract = updater._contract_mock  # type: ignore[attr-defined]
        w3 = updater._w3_mock  # type: ignore[attr-defined]

        w3.eth.get_transaction_count.return_value = 1
        contract.functions.updateReputation.return_value.build_transaction.side_effect = (
            ContractLogicError("execution reverted: OnlyAuthorizedUpdater")
        )

        with patch.object(updater, "_account") as account_mock:
            account_mock.address = "0x" + "ab" * 20
            result = updater.update_reputation(
                ru.PERSONA_ADDRESSES["risk"], ru.MISALIGN_DELTA
            )

        assert result.status == "skipped_unauthorized"
        assert "OnlyAuthorizedUpdater" in (result.error or "")
        assert result.tx_hash is None

    def test_no_signer_returns_skipped(self) -> None:
        updater = _make_updater_with_mocks(private_key="")  # no key -> no signer
        # _make_updater_with_mocks always sets _account; emulate "no signer":
        updater._account = None  # type: ignore[attr-defined]

        result = updater.update_reputation(
            ru.PERSONA_ADDRESSES["tech"], ru.ALIGN_DELTA
        )
        assert result.status == "skipped_unauthorized"
        assert result.tx_hash is None

    def test_network_error_returns_failed(self) -> None:
        updater = _make_updater_with_mocks()
        w3 = updater._w3_mock  # type: ignore[attr-defined]
        w3.eth.get_transaction_count.side_effect = ConnectionError("rpc down")

        with patch.object(updater, "_account") as account_mock:
            account_mock.address = "0x" + "ab" * 20
            result = updater.update_reputation(
                ru.PERSONA_ADDRESSES["sentiment"], ru.ALIGN_DELTA
            )

        assert result.status == "failed"
        assert "rpc down" in (result.error or "")


# ---- singleton helper --------------------------------------------------------


class TestSingleton:
    def test_returns_none_when_unconfigured(self, monkeypatch: pytest.MonkeyPatch) -> None:
        ru.reset_singleton_for_tests()

        from config import Settings, get_settings

        get_settings.cache_clear()  # type: ignore[attr-defined]
        monkeypatch.setattr(
            "config.Settings",
            lambda **kw: Settings(
                agent_reputation_address="",
                base_sepolia_rpc_url="",
            ),
        )
        try:
            assert ru.get_reputation_updater() is None
        finally:
            get_settings.cache_clear()  # type: ignore[attr-defined]
            ru.reset_singleton_for_tests()
