"""Tests for governance calldata encoding (Phase 1D).

Covers: encode_mock_usdc_transfer, SAMPLE_RECIPIENTS, calldata format,
address validation, uint256 bounds, and POST /api/proposals/encode endpoint.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from governance.calldata import MAX_UINT256, encode_function_call, validate_uint256
from governance.proposals import (
    MOCK_USDC_ADDRESS,
    SAMPLE_RECIPIENTS,
    encode_mock_usdc_transfer,
)
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestEncodeMockUsdcTransfer:
    """Unit tests for encode_mock_usdc_transfer."""

    def test_happy_path_aave_vault(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        result = encode_mock_usdc_transfer(recipient, "100000000")

        assert result["target"].lower() == MOCK_USDC_ADDRESS.lower()
        assert result["value"] == 0
        assert result["calldata"].startswith("0x")
        assert result["signature"] == "transfer(address,uint256)"
        assert "100" in result["description"]
        assert result["basescan_url"].startswith("https://sepolia.basescan.org/address/0x")

    def test_happy_path_eth_treasury(self) -> None:
        recipient = SAMPLE_RECIPIENTS["eth_treasury"]["address"]
        result = encode_mock_usdc_transfer(recipient, "500000000")

        assert result["target"].lower() == MOCK_USDC_ADDRESS.lower()
        assert result["calldata"].startswith("0xa9059cbb")

    def test_zero_amount(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        result = encode_mock_usdc_transfer(recipient, "0")

        assert result["value"] == 0
        assert result["calldata"].startswith("0xa9059cbb")
        assert "0" in result["description"]

    def test_max_uint256(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        max_val = str(MAX_UINT256)
        result = encode_mock_usdc_transfer(recipient, max_val)

        assert result["calldata"].startswith("0xa9059cbb")
        assert len(result["calldata"]) == 2 + (4 + 32 + 32) * 2

    def test_exceeds_uint256_raises(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        too_big = str(MAX_UINT256 + 1)
        with pytest.raises(ValueError, match="Exceeds uint256 max"):
            encode_mock_usdc_transfer(recipient, too_big)

    def test_negative_amount_raises(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        with pytest.raises(ValueError, match="cannot be negative"):
            encode_mock_usdc_transfer(recipient, "-1")

    def test_invalid_address_format_raises(self) -> None:
        with pytest.raises(ValueError, match="Invalid Ethereum address"):
            encode_mock_usdc_transfer("not_an_address", "100")

    def test_short_address_raises(self) -> None:
        with pytest.raises(ValueError, match="Invalid Ethereum address"):
            encode_mock_usdc_transfer("0x1234", "100")

    def test_non_numeric_amount_raises(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        with pytest.raises(ValueError, match="valid integer string"):
            encode_mock_usdc_transfer(recipient, "abc")

    def test_calldata_hex_format(self) -> None:
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        result = encode_mock_usdc_transfer(recipient, "1000000")

        calldata = result["calldata"]
        assert calldata.startswith("0x")
        int(calldata[2:], 16)
        assert len(calldata) == 2 + (4 + 32 + 32) * 2

    def test_checksummed_recipient_in_description(self) -> None:
        recipient = "0x1111111111111111111111111111111111111111"
        result = encode_mock_usdc_transfer(recipient, "1000000")
        assert "0x" in result["description"]

    def test_description_precision_large_amount(self) -> None:
        """Decimal prevents float precision loss for large uint256 values."""
        recipient = SAMPLE_RECIPIENTS["aave_vault"]["address"]
        result = encode_mock_usdc_transfer(recipient, "999999999999999999")
        assert "999999999999.999999" in result["description"]


class TestSampleRecipients:
    """Verify sample recipients structure."""

    def test_has_two_recipients(self) -> None:
        assert len(SAMPLE_RECIPIENTS) == 2

    def test_recipient_keys(self) -> None:
        assert "aave_vault" in SAMPLE_RECIPIENTS
        assert "eth_treasury" in SAMPLE_RECIPIENTS

    def test_recipient_fields(self) -> None:
        for key, recipient in SAMPLE_RECIPIENTS.items():
            assert "address" in recipient, f"{key} missing address"
            assert "label" in recipient, f"{key} missing label"
            assert "description" in recipient, f"{key} missing description"
            assert recipient["address"].startswith("0x"), f"{key} address not 0x-prefixed"
            assert len(recipient["address"]) == 42, f"{key} address wrong length"


class TestValidateUint256:
    """Unit tests for validate_uint256 helper."""

    def test_zero(self) -> None:
        assert validate_uint256(0) == 0

    def test_max(self) -> None:
        assert validate_uint256(MAX_UINT256) == MAX_UINT256

    def test_negative_raises(self) -> None:
        with pytest.raises(ValueError):
            validate_uint256(-1)

    def test_overflow_raises(self) -> None:
        with pytest.raises(ValueError):
            validate_uint256(MAX_UINT256 + 1)


class TestEncodeFunctionCall:
    """Unit tests for generic ABI encoder."""

    def test_transfer_selector(self) -> None:
        result = encode_function_call(
            "transfer(address,uint256)",
            ["address", "uint256"],
            ["0x1111111111111111111111111111111111111111", 100],
        )
        assert result[:4].hex() == "a9059cbb"
        assert len(result) == 4 + 32 + 32

    def test_approve_selector(self) -> None:
        result = encode_function_call(
            "approve(address,uint256)",
            ["address", "uint256"],
            ["0x1111111111111111111111111111111111111111", 0],
        )
        assert result[:4].hex() == "095ea7b3"


class TestEncodeProposalEndpoint:
    """Integration tests for POST /api/proposals/encode."""

    def test_encode_transfer_success(self, client: TestClient) -> None:
        resp = client.post(
            "/api/proposals/encode",
            json={
                "action": {
                    "type": "transfer",
                    "token": MOCK_USDC_ADDRESS,
                    "recipient": SAMPLE_RECIPIENTS["aave_vault"]["address"],
                    "amount_wei": "100000000",
                },
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["target"].lower() == MOCK_USDC_ADDRESS.lower()
        assert data["calldata"].startswith("0xa9059cbb")
        assert data["signature"] == "transfer(address,uint256)"
        assert data["value"] == 0

    def test_encode_invalid_address_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/proposals/encode",
            json={
                "action": {
                    "type": "transfer",
                    "token": MOCK_USDC_ADDRESS,
                    "recipient": "0xinvalid",
                    "amount_wei": "100",
                },
            },
        )
        assert resp.status_code == 422

    def test_encode_negative_amount_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/proposals/encode",
            json={
                "action": {
                    "type": "transfer",
                    "token": MOCK_USDC_ADDRESS,
                    "recipient": SAMPLE_RECIPIENTS["aave_vault"]["address"],
                    "amount_wei": "-100",
                },
            },
        )
        assert resp.status_code == 422

    def test_encode_overflow_amount_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/proposals/encode",
            json={
                "action": {
                    "type": "transfer",
                    "token": MOCK_USDC_ADDRESS,
                    "recipient": SAMPLE_RECIPIENTS["aave_vault"]["address"],
                    "amount_wei": str(MAX_UINT256 + 1),
                },
            },
        )
        assert resp.status_code == 422

    def test_encode_zero_amount_success(self, client: TestClient) -> None:
        resp = client.post(
            "/api/proposals/encode",
            json={
                "action": {
                    "type": "transfer",
                    "token": MOCK_USDC_ADDRESS,
                    "recipient": SAMPLE_RECIPIENTS["aave_vault"]["address"],
                    "amount_wei": "0",
                },
            },
        )
        assert resp.status_code == 200

    def test_missing_action_returns_422(self, client: TestClient) -> None:
        resp = client.post("/api/proposals/encode", json={})
        assert resp.status_code == 422


class TestRecipientsEndpoint:
    """Integration tests for GET /api/proposals/recipients."""

    def test_list_recipients(self, client: TestClient) -> None:
        resp = client.get("/api/proposals/recipients")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["recipients"]) == 2
        assert data["token_symbol"] == "mUSDC"
        assert data["token_decimals"] == 6
        assert data["token_address"].startswith("0x")

    def test_recipient_fields_complete(self, client: TestClient) -> None:
        resp = client.get("/api/proposals/recipients")
        for r in resp.json()["recipients"]:
            assert "key" in r
            assert "address" in r
            assert "label" in r
            assert "description" in r
            assert r["address"].startswith("0x")
            assert len(r["address"]) == 42
