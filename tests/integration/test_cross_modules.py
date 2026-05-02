"""
Cross-module integration tests for AI Treasury Council.

Validates that modules integrate correctly after all Phase 0+1A+1C+1D merges:
- main.py imports agents/orchestrator.py (CRITICAL-01 Hugo Quick Fix)
- Orchestrator uses real Bull agent (not mock)
- Proposals encode with real addresses from contracts.ts
- DataAggregator respects per-persona source priority
- ABI files match contracts.ts exports

Quill (QA) - Sesja 15 regression suite.
"""
from __future__ import annotations

import inspect
import json
import re
import sys
from pathlib import Path
from typing import Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from eth_utils import is_checksum_address
from httpx import ASGITransport, AsyncClient

API_ROOT = Path(__file__).resolve().parents[2] / "apps" / "api"
WEB_ROOT = Path(__file__).resolve().parents[2] / "apps" / "web"


@pytest.fixture(autouse=True)
def _api_on_path() -> Generator[None, None, None]:
    api_str = str(API_ROOT)
    added = api_str not in sys.path
    if added:
        sys.path.insert(0, api_str)
    yield
    if added:
        sys.path.remove(api_str)


# ============================================================
# TEST 1: Orchestrator real Bull import (CRITICAL-01 fix)
# ============================================================


class TestOrchestratorImport:
    """Verify CRITICAL-01 fix: main.py uses real orchestrator, not inline mock."""

    def test_main_imports_run_debate_from_orchestrator(self) -> None:
        main_source = (API_ROOT / "main.py").read_text()
        assert "from agents.orchestrator import run_debate" in main_source, (
            "main.py must import run_debate from agents.orchestrator (CRITICAL-01)"
        )

    def test_main_does_not_inline_mock_debate(self) -> None:
        main_source = (API_ROOT / "main.py").read_text()
        assert "async def run_debate" not in main_source, (
            "main.py must NOT contain inline run_debate function (CRITICAL-01)"
        )

    def test_orchestrator_module_imports_bull(self) -> None:
        orch_source = (API_ROOT / "agents" / "orchestrator.py").read_text()
        assert "from agents.bull_agent import run_bull" in orch_source

    def test_orchestrator_calls_real_bull(self) -> None:
        orch_source = (API_ROOT / "agents" / "orchestrator.py").read_text()
        assert "await run_bull(" in orch_source, (
            "orchestrator must call run_bull with await (live API call)"
        )

    def test_run_debate_is_async(self) -> None:
        from agents.orchestrator import run_debate
        assert inspect.iscoroutinefunction(run_debate), (
            "run_debate must be async (awaitable from main.py)"
        )


# ============================================================
# TEST 2: Full debate endpoint with mocked Anthropic
# ============================================================


class TestDebateEndpointIntegration:
    """POST /api/debate -> orchestrator -> mocked at main level -> storage fallback."""

    @pytest.fixture
    def mock_debate_result(self) -> dict:
        from datetime import datetime, timezone
        from schemas import AgentDecision

        decisions = []
        for persona, decision, conf in [
            ("bull", "FOR", 0.85),
            ("bear", "AGAINST", 0.65),
            ("risk", "ABSTAIN", 0.50),
            ("tech", "FOR", 0.70),
            ("sentiment", "FOR", 0.55),
        ]:
            decisions.append(AgentDecision(
                persona=persona,
                decision=decision,
                confidence=conf,
                reasoning=f"Mock {persona} analysis for integration test with sufficient length.",
                claims=[{
                    "text": f"Claim from {persona}",
                    "confidence": conf,
                    "sources": [{
                        "url": f"https://example.com/{persona}",
                        "title": f"{persona} source",
                        "snippet": f"Data from {persona} agent",
                        "weight": 0.5,
                        "source_type": "defillama",
                    }],
                }],
                timestamp=datetime.now(timezone.utc),
                tokens_used=500,
                cost_usd=0.01,
            ))
        return {
            "decisions": decisions,
            "consensus": "FOR",
            "vote_id": "test-vote-id-123",
        }

    @pytest.mark.asyncio
    async def test_debate_returns_5_decisions(self, mock_debate_result: dict) -> None:
        from storage.interface import UploadResult

        with (
            patch("main.run_debate", new_callable=AsyncMock) as mock_debate,
            patch("main.upload_with_fallback", new_callable=AsyncMock) as mock_storage,
        ):
            mock_debate.return_value = mock_debate_result
            mock_storage.return_value = UploadResult(
                cid="bafk_test_123",
                provider="ipfs",
                gateway_url="https://w3s.link/ipfs/bafk_test_123",
                bytes_uploaded=1024,
            )

            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.post(
                    "/api/debate",
                    json={"text": "Allocate 50000 USDC to Aave yield vault"},
                )

            assert resp.status_code == 200
            body = resp.json()
            assert len(body["decisions"]) == 5
            assert body["consensus"] in ("FOR", "AGAINST", "ABSTAIN", "SPLIT")
            assert body["vote_id"] is not None

            personas = [d["persona"] for d in body["decisions"]]
            for p in ("bull", "bear", "risk", "tech", "sentiment"):
                assert p in personas, f"Missing persona: {p}"

            for d in body["decisions"]:
                assert isinstance(d.get("cost_usd"), (float, int, type(None)))

    @pytest.mark.asyncio
    async def test_debate_returns_response_on_storage_failure(
        self, mock_debate_result: dict
    ) -> None:
        with (
            patch("main.run_debate", new_callable=AsyncMock) as mock_debate,
            patch("main.upload_with_fallback", new_callable=AsyncMock) as mock_storage,
        ):
            mock_debate.return_value = mock_debate_result
            mock_storage.side_effect = ConnectionError("Storage unavailable")

            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.post(
                    "/api/debate",
                    json={"text": "Allocate 50000 USDC to Aave yield vault"},
                )

            assert resp.status_code == 200
            body = resp.json()
            assert len(body["decisions"]) == 5
            assert body["audit_trail_cid"] is None

    @pytest.mark.asyncio
    async def test_debate_propagates_error_when_orchestrator_crashes(self) -> None:
        """Orchestrator crash yields 500 (no try/except around run_debate in main.py:72)."""
        with (
            patch("main.run_debate", new_callable=AsyncMock) as mock_debate,
            patch("main.upload_with_fallback", new_callable=AsyncMock),
        ):
            mock_debate.side_effect = RuntimeError("Anthropic API unavailable")

            from main import app
            transport = ASGITransport(app=app, raise_app_exceptions=False)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.post(
                    "/api/debate",
                    json={"text": "Allocate 50000 USDC to Aave yield vault"},
                )

            assert resp.status_code == 500


# ============================================================
# TEST 3: Proposals encode with real addresses
# ============================================================


class TestProposalsEncode:
    """POST /api/proposals/encode with addresses matching contracts.ts."""

    MOCK_USDC_ADDRESS = "0x606ede7755131e6206a29b67d88761eebb3bb59d"
    AAVE_VAULT = "0x1111111111111111111111111111111111111111"

    @pytest.mark.asyncio
    async def test_encode_transfer_returns_valid_calldata(self) -> None:
        with patch("storage.factory.upload_with_fallback", new_callable=AsyncMock):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.post(
                    "/api/proposals/encode",
                    json={
                        "action": {
                            "type": "transfer",
                            "token": self.MOCK_USDC_ADDRESS,
                            "recipient": self.AAVE_VAULT,
                            "amount_wei": "1000000",
                        }
                    },
                )

            assert resp.status_code == 200
            body = resp.json()
            assert body["calldata"].startswith("0x")
            assert body["signature"] == "transfer(address,uint256)"
            assert body["value"] == 0
            assert "1" in body["description"] or "mUSDC" in body["description"]

    @pytest.mark.asyncio
    async def test_encode_invalid_address_returns_422(self) -> None:
        with patch("storage.factory.upload_with_fallback", new_callable=AsyncMock):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.post(
                    "/api/proposals/encode",
                    json={
                        "action": {
                            "type": "transfer",
                            "token": self.MOCK_USDC_ADDRESS,
                            "recipient": "0xINVALID",
                            "amount_wei": "1000",
                        }
                    },
                )
            assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_recipients_list_has_demo_entries(self) -> None:
        with patch("storage.factory.upload_with_fallback", new_callable=AsyncMock):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                resp = await ac.get("/api/proposals/recipients")

            assert resp.status_code == 200
            body = resp.json()
            assert len(body["recipients"]) >= 2
            assert body["token_symbol"] == "mUSDC"
            assert body["token_decimals"] == 6


# ============================================================
# TEST 4: DataAggregator persona priority
# ============================================================


class TestDataAggregatorPriority:
    """Verify fetch_for_query respects per-persona source_priority order."""

    @pytest.mark.asyncio
    async def test_bull_priority_order(self) -> None:
        from data.aggregator import DataAggregator
        from schemas import Source

        call_order: list[str] = []

        class FakeSource:
            def __init__(self, name: str) -> None:
                self._name = name

            @property
            def source_type(self) -> str:
                return self._name

            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                call_order.append(self._name)
                return [
                    Source(
                        url=f"https://{self._name}.example",
                        title=f"{self._name} result",
                        snippet=f"Data from {self._name}",
                        weight=0.5,
                        source_type=self._name,
                    )
                ]

        registry = {
            "coingecko": FakeSource("coingecko"),
            "defillama": FakeSource("defillama"),
            "rss": FakeSource("rss"),
        }
        agg = DataAggregator(registry=registry)
        bull_priority = ["coingecko", "defillama", "rss"]
        results = await agg.fetch_for_query("aave", source_priority=bull_priority)

        assert call_order == ["coingecko", "defillama", "rss"], (
            f"Bull priority order violated: {call_order}"
        )
        assert len(results) == 3

    @pytest.mark.asyncio
    async def test_missing_source_skipped_gracefully(self) -> None:
        from data.aggregator import DataAggregator
        from schemas import Source

        class FakeSource:
            def __init__(self, name: str) -> None:
                self._name = name

            @property
            def source_type(self) -> str:
                return self._name

            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                return [
                    Source(
                        url=f"https://{self._name}.example",
                        title="test",
                        snippet="test",
                        weight=0.5,
                    )
                ]

        registry = {"coingecko": FakeSource("coingecko")}
        agg = DataAggregator(registry=registry)
        results = await agg.fetch_for_query(
            "btc", source_priority=["aixbt", "coingecko", "nonexistent"]
        )
        assert len(results) == 1

    @pytest.mark.asyncio
    async def test_source_failure_continues(self) -> None:
        from data.aggregator import DataAggregator
        from schemas import Source

        class FailSource:
            @property
            def source_type(self) -> str:
                return "fail"

            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                raise ConnectionError("Network down")

        class OkSource:
            @property
            def source_type(self) -> str:
                return "ok"

            async def fetch(self, query: str, limit: int = 5) -> list[Source]:
                return [
                    Source(
                        url="https://ok.example",
                        title="ok",
                        snippet="works",
                        weight=0.5,
                    )
                ]

        registry = {"fail": FailSource(), "ok": OkSource()}
        agg = DataAggregator(registry=registry)
        results = await agg.fetch_for_query("eth", source_priority=["fail", "ok"])
        assert len(results) == 1


# ============================================================
# TEST 5: ABI files match contracts.ts exports
# ============================================================


class TestABIConsistency:
    """Verify ABI JSON files exist and contracts.ts references them."""

    EXPECTED_ABIS = [
        "CouncilToken.json",
        "AICouncilGovernor.json",
        "TimelockController.json",
        "MockUSDC.json",
    ]

    def test_all_abi_files_exist(self) -> None:
        abi_dir = WEB_ROOT / "lib" / "abi"
        for abi_file in self.EXPECTED_ABIS:
            path = abi_dir / abi_file
            assert path.exists(), f"Missing ABI file: {path}"

    def test_abi_files_are_valid_json(self) -> None:
        abi_dir = WEB_ROOT / "lib" / "abi"
        for abi_file in self.EXPECTED_ABIS:
            path = abi_dir / abi_file
            data = json.loads(path.read_text())
            assert isinstance(data, (list, dict)), f"{abi_file} is not valid ABI JSON"

    def test_contracts_ts_imports_all_abis(self) -> None:
        contracts_ts = (WEB_ROOT / "lib" / "contracts.ts").read_text()
        for name in ("CouncilTokenAbi", "AICouncilGovernorAbi", "TimelockControllerAbi", "MockUSDCAbi"):
            assert name in contracts_ts, f"contracts.ts missing import: {name}"

    @pytest.mark.xfail(
        reason="KNOWN BUG: contracts.ts has wrong EIP-55 checksums (Sesja 15 discovery). "
        "Needs fix by Sol/Aiko before production deploy.",
        strict=True,
    )
    def test_contracts_ts_has_eip55_checksums(self) -> None:
        """All addresses in contracts.ts must be EIP-55 checksummed."""
        contracts_ts = (WEB_ROOT / "lib" / "contracts.ts").read_text()
        addresses = re.findall(r'"(0x[0-9a-fA-F]{40})"', contracts_ts)
        assert len(addresses) >= 4, f"Expected >=4 addresses, found {len(addresses)}"
        non_checksummed = [a for a in addresses if not is_checksum_address(a)]
        assert not non_checksummed, (
            f"Non-EIP-55 checksummed addresses in contracts.ts: {non_checksummed}"
        )

    def test_contracts_ts_addresses_have_correct_length(self) -> None:
        """All addresses are valid hex format (40 hex chars after 0x)."""
        contracts_ts = (WEB_ROOT / "lib" / "contracts.ts").read_text()
        addresses = re.findall(r'"(0x[0-9a-fA-F]{40})"', contracts_ts)
        assert len(addresses) >= 4
        for addr in addresses:
            assert len(addr) == 42
            assert addr.startswith("0x")


# ============================================================
# TEST 6: .env.example completeness
# ============================================================


class TestEnvExample:
    """Verify .env.example has all config vars referenced in config.py."""

    def test_all_settings_in_env_example(self) -> None:
        env_example = (API_ROOT / ".env.example").read_text()
        from config import Settings
        fields = Settings.model_fields

        missing = []
        for field_name in fields:
            env_var = field_name.upper()
            if env_var not in env_example:
                missing.append(env_var)

        assert not missing, f".env.example missing vars: {missing}"


# ============================================================
# TEST 7: CLAUDE.md version check (313 lines post-REVISE)
# ============================================================


class TestCLAUDEMD:
    """Verify CLAUDE.md in repo root is up-to-date."""

    def test_claude_md_exists(self) -> None:
        path = Path(__file__).resolve().parents[2] / "CLAUDE.md"
        assert path.exists(), "CLAUDE.md missing from repo root"

    def test_claude_md_has_reasonable_size(self) -> None:
        path = Path(__file__).resolve().parents[2] / "CLAUDE.md"
        lines = path.read_text().splitlines()
        assert len(lines) >= 100, f"CLAUDE.md too short ({len(lines)} lines) - possibly truncated"

    def test_claude_md_references_key_modules(self) -> None:
        path = Path(__file__).resolve().parents[2] / "CLAUDE.md"
        content = path.read_text()
        for keyword in ("Governor", "Storage", "debate", "Quill"):
            assert keyword.lower() in content.lower(), (
                f"CLAUDE.md missing reference to {keyword}"
            )
