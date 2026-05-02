"""
AgentReputation on-chain updater (Moat 5).

Reads ABI from apps/api/contracts/AgentReputation.json. Uses web3.py to
read getReputation() and write updateReputation(addr, delta) on Base Sepolia.

Authorization model: Sol's deploy script transfers authorizedUpdater to the
backend wallet (BACKEND_WALLET_ADDRESS). If that has not happened, write calls
revert with 'OnlyAuthorizedUpdater' - we catch and log a WARNING instead of
crashing the debate flow.

Persona -> address mapping is a placeholder until Phase 2 ENS subnames assign
real addresses to each agent.
"""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

import structlog
from eth_account import Account
from eth_typing import ChecksumAddress
from web3 import Web3
from web3.exceptions import ContractLogicError

log = structlog.get_logger()

ABI_PATH = Path(__file__).resolve().parent.parent / "contracts" / "AgentReputation.json"

# Phase 1 placeholder addresses. Phase 2 ENS will assign real per-agent wallets.
# Kept stable so smart contract deploy script can pre-register them.
PERSONA_ADDRESSES: dict[str, ChecksumAddress] = {
    "bull": Web3.to_checksum_address("0x0000000000000000000000000000000000000001"),
    "bear": Web3.to_checksum_address("0x0000000000000000000000000000000000000002"),
    "risk": Web3.to_checksum_address("0x0000000000000000000000000000000000000003"),
    "tech": Web3.to_checksum_address("0x0000000000000000000000000000000000000004"),
    "sentiment": Web3.to_checksum_address("0x0000000000000000000000000000000000000005"),
}

ALIGN_DELTA = 10
MISALIGN_DELTA = -5

Decision = Literal["FOR", "AGAINST", "ABSTAIN"]
Consensus = Literal["FOR", "AGAINST", "ABSTAIN", "SPLIT"]


@dataclass(frozen=True)
class ReputationView:
    """Read-only snapshot of an agent's on-chain reputation."""

    score: int
    debates: int
    aligned: int


@dataclass(frozen=True)
class ReputationUpdate:
    """Result of a single updateReputation call."""

    persona: str
    address: str
    delta: int
    new_score: int | None
    tx_hash: str | None
    status: Literal["sent", "skipped_neutral", "skipped_no_consensus", "skipped_unauthorized", "failed"]
    error: str | None = None


def calculate_delta(decision: Decision, consensus: Consensus) -> int | None:
    """
    Returns reputation delta or None when no update should be applied.

    Rules:
    - consensus SPLIT or ABSTAIN -> None (no winning side to align with)
    - agent ABSTAIN -> None (chose not to participate, neutral)
    - decision == consensus -> +ALIGN_DELTA
    - else -> MISALIGN_DELTA
    """
    if consensus in ("SPLIT", "ABSTAIN"):
        return None
    if decision == "ABSTAIN":
        return None
    return ALIGN_DELTA if decision == consensus else MISALIGN_DELTA


def _load_abi() -> list[dict[str, Any]]:
    with ABI_PATH.open("r", encoding="utf-8") as fh:
        data: list[dict[str, Any]] = json.load(fh)
        return data


class ReputationUpdater:
    """Web3 client for AgentReputation contract on Base Sepolia."""

    def __init__(
        self,
        rpc_url: str,
        contract_address: str,
        backend_private_key: str | None,
        chain_id: int = 84532,
    ) -> None:
        self.rpc_url = rpc_url
        self.chain_id = chain_id
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=_load_abi())
        self._account = Account.from_key(backend_private_key) if backend_private_key else None

    @property
    def has_signer(self) -> bool:
        return self._account is not None

    @property
    def signer_address(self) -> str | None:
        return self._account.address if self._account else None

    def get_reputation(self, agent_address: str) -> ReputationView:
        """
        Read getReputation(addr) -> (score, debates, aligned).

        Raises web3 exceptions on RPC failure - caller decides how to surface.
        """
        addr = Web3.to_checksum_address(agent_address)
        score, debates, aligned = self.contract.functions.getReputation(addr).call()
        return ReputationView(score=int(score), debates=int(debates), aligned=int(aligned))

    def update_reputation(
        self,
        agent_address: str,
        delta: int,
    ) -> ReputationUpdate:
        """
        Sign + send updateReputation(addr, delta). Graceful fallback on
        unauthorized/RPC errors - logs WARNING and returns status='failed'.
        """
        addr = Web3.to_checksum_address(agent_address)

        if self._account is None:
            log.warning(
                "reputation_update_no_signer",
                address=addr,
                delta=delta,
                hint="set BACKEND_WALLET_PRIVATE_KEY",
            )
            return ReputationUpdate(
                persona=_persona_for_address(addr) or "unknown",
                address=addr,
                delta=delta,
                new_score=None,
                tx_hash=None,
                status="skipped_unauthorized",
                error="no signer configured",
            )

        try:
            nonce = self.w3.eth.get_transaction_count(self._account.address)
            tx = self.contract.functions.updateReputation(addr, delta).build_transaction(
                {
                    "from": self._account.address,
                    "nonce": nonce,
                    "chainId": self.chain_id,
                }
            )
            signed = self._account.sign_transaction(tx)
            raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
            tx_hash = self.w3.eth.send_raw_transaction(raw)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            new_view = self.get_reputation(addr)
            log.info(
                "reputation_updated",
                address=addr,
                delta=delta,
                tx_hash=receipt["transactionHash"].hex(),
                new_score=new_view.score,
            )
            return ReputationUpdate(
                persona=_persona_for_address(addr) or "unknown",
                address=addr,
                delta=delta,
                new_score=new_view.score,
                tx_hash=receipt["transactionHash"].hex(),
                status="sent",
            )
        except ContractLogicError as exc:
            msg = str(exc)
            log.warning(
                "reputation_update_unauthorized_or_revert",
                address=addr,
                delta=delta,
                error=msg,
            )
            return ReputationUpdate(
                persona=_persona_for_address(addr) or "unknown",
                address=addr,
                delta=delta,
                new_score=None,
                tx_hash=None,
                status="skipped_unauthorized",
                error=msg,
            )
        except Exception as exc:  # web3 / RPC / network
            log.error(
                "reputation_update_failed",
                address=addr,
                delta=delta,
                error_type=type(exc).__name__,
                error=str(exc),
            )
            return ReputationUpdate(
                persona=_persona_for_address(addr) or "unknown",
                address=addr,
                delta=delta,
                new_score=None,
                tx_hash=None,
                status="failed",
                error=str(exc),
            )

    async def update_reputation_async(self, agent_address: str, delta: int) -> ReputationUpdate:
        """Async wrapper - web3.py is sync, run in thread to avoid blocking the event loop."""
        return await asyncio.to_thread(self.update_reputation, agent_address, delta)

    async def get_reputation_async(self, agent_address: str) -> ReputationView:
        return await asyncio.to_thread(self.get_reputation, agent_address)


def _persona_for_address(addr: str) -> str | None:
    target = Web3.to_checksum_address(addr)
    for persona, mapped in PERSONA_ADDRESSES.items():
        if mapped == target:
            return persona
    return None


def compute_updates_for_debate(
    decisions: list[tuple[str, Decision]],
    consensus: Consensus,
) -> list[tuple[str, str, int]]:
    """
    Pure function: given (persona, decision) pairs and consensus, return list of
    (persona, address, delta) for personas that should be updated. Skips neutral.
    """
    out: list[tuple[str, str, int]] = []
    for persona, decision in decisions:
        if persona not in PERSONA_ADDRESSES:
            continue
        delta = calculate_delta(decision, consensus)
        if delta is None:
            continue
        out.append((persona, PERSONA_ADDRESSES[persona], delta))
    return out


_singleton: ReputationUpdater | None = None


def get_reputation_updater() -> ReputationUpdater | None:
    """
    Lazy singleton. Returns None if config is missing - callers must handle.
    Importing here avoids circular import with config at module load time.
    """
    global _singleton
    if _singleton is not None:
        return _singleton

    from config import get_settings

    settings = get_settings()
    if not settings.agent_reputation_address or not settings.base_sepolia_rpc_url:
        log.warning(
            "reputation_updater_disabled",
            reason="missing agent_reputation_address or base_sepolia_rpc_url",
        )
        return None

    _singleton = ReputationUpdater(
        rpc_url=settings.base_sepolia_rpc_url,
        contract_address=settings.agent_reputation_address,
        backend_private_key=settings.backend_wallet_private_key or None,
        chain_id=settings.base_sepolia_chain_id,
    )
    return _singleton


def reset_singleton_for_tests() -> None:
    global _singleton
    _singleton = None
