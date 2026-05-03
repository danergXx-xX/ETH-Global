"""
ENS reputation as off-chain voting weight (Sesja 50.5).

Reads agent reputation score (0-100) from AgentReputation contract on Base
Sepolia, applies it as a multiplier on the persona's confidence vote during
consensus calculation:

    weighted_vote = base_vote * (reputation_score / 100)

This is the "off-chain reasoning layer above on-chain governance" the demo
voice-over (Eva) references. The on-chain Governor still tallies token-weighted
human votes - this weighter only affects the AI Council's pre-vote consensus.

Caching strategy:
    1. Try Redis (TTL 60s) for fast hot-path reads.
    2. On miss, fall back to AgentReputation contract via web3.py
       (services.reputation_updater.ReputationUpdater.get_reputation_async).
    3. On any failure (no signer, RPC down, persona unmapped), default
       vote_weight = 1.0 (no boost, no penalty) so debates never stall.

Owner: Nova (Agentic AI) + Hugo (Backend Infra).
Demo dependency: voice-over claim "vote weight calculated from ENS reputation".
"""

from __future__ import annotations

from dataclasses import dataclass

import structlog

from services import cache
from services.reputation_updater import (
    PERSONA_ADDRESSES,
    get_reputation_updater,
)

log = structlog.get_logger()

CACHE_TTL_SECONDS = 60
REPUTATION_NORMALIZER = 100.0
DEFAULT_VOTE_WEIGHT = 1.0
# Hard cap: even an over-performing agent (score > 200) cannot dominate the
# council more than 2x. Aligns with AgentReputation Pydantic schema bound.
MAX_VOTE_WEIGHT = 2.0
MIN_VOTE_WEIGHT = 0.0


@dataclass(frozen=True)
class WeightedVote:
    """Outcome of applying reputation weight to a base vote."""

    persona: str
    base_vote: float
    reputation_score: float | None
    vote_weight: float
    weighted_vote: float
    source: str  # "cache" | "contract" | "fallback"


def _cache_key(persona: str) -> str:
    return f"reputation:score:{persona.lower()}"


def _clamp_weight(raw: float) -> float:
    if raw < MIN_VOTE_WEIGHT:
        return MIN_VOTE_WEIGHT
    if raw > MAX_VOTE_WEIGHT:
        return MAX_VOTE_WEIGHT
    return raw


async def get_reputation_score(persona: str) -> tuple[float | None, str]:
    """
    Resolve agent reputation_score in [0, 100+] for a persona.

    Returns (score, source) where source is one of:
        - "cache":    fetched from Redis
        - "contract": fetched from AgentReputation via web3
        - "fallback": no data available - caller should treat as 1.0 weight

    Never raises - returns (None, "fallback") on any error.
    """
    if persona not in PERSONA_ADDRESSES:
        log.debug("reputation_weighter_unknown_persona", persona=persona)
        return None, "fallback"

    cached = await cache.cache_get(_cache_key(persona))
    if isinstance(cached, (int, float)):
        return float(cached), "cache"

    updater = get_reputation_updater()
    if updater is None:
        return None, "fallback"

    try:
        view = await updater.get_reputation_async(PERSONA_ADDRESSES[persona])
    except Exception as exc:
        # web3 raises a heterogeneous family of errors (ContractLogicError,
        # Web3Exception, ConnectionError, ValueError on bad RPC payloads).
        # We never want a debate to crash because reputation lookup failed -
        # demo voice-over depends on graceful degradation.
        log.warning(
            "reputation_weighter_contract_read_failed",
            persona=persona,
            error_type=type(exc).__name__,
            error=str(exc),
        )
        return None, "fallback"

    # Uninitialized contract path: AgentReputation.sol initializes new agents
    # to score=100 in the constructor. If we read (score=0, debates=0) it
    # almost certainly means the persona has not been registered on this
    # contract yet (test env, fresh deploy, wrong address). Treat as fallback
    # rather than zeroing the agent out of consensus - a slashed-to-zero agent
    # would also have debates>0, distinguishing the two cases.
    if int(view.score) == 0 and int(view.debates) == 0:
        log.debug(
            "reputation_weighter_uninitialized",
            persona=persona,
            address=PERSONA_ADDRESSES[persona],
        )
        return None, "fallback"

    score = float(view.score)
    await cache.cache_set(_cache_key(persona), score, ttl_seconds=CACHE_TTL_SECONDS)
    return score, "contract"


async def calculate_weighted_vote(persona: str, base_vote: float) -> WeightedVote:
    """
    Apply ENS reputation as multiplier on a base vote (typically confidence).

    Formula:  weighted_vote = base_vote * (reputation_score / 100)

    Default to vote_weight=1.0 when reputation data is unavailable so the
    consensus still functions identically to pre-Sesja-50.5 behavior.

    Args:
        persona: persona_id (bull/bear/risk/tech/sentiment/adversarial).
        base_vote: typically AgentDecision.confidence in [0.0, 1.0].

    Returns:
        WeightedVote with full audit trail (score, weight, source).
    """
    score, source = await get_reputation_score(persona)
    if score is None:
        weight = DEFAULT_VOTE_WEIGHT
    else:
        weight = _clamp_weight(score / REPUTATION_NORMALIZER)

    weighted = base_vote * weight
    log.info(
        "reputation_weighted_vote",
        persona=persona,
        base_vote=round(base_vote, 4),
        reputation_score=score,
        vote_weight=round(weight, 4),
        weighted_vote=round(weighted, 4),
        source=source,
    )
    return WeightedVote(
        persona=persona,
        base_vote=base_vote,
        reputation_score=score,
        vote_weight=weight,
        weighted_vote=weighted,
        source=source,
    )
