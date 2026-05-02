# Phase 0: Bull live, pozostali mock. Phase 1 = wszyscy live.
"""
Debate orchestrator for AI Treasury Council.

Runs all 5 agents on a proposal and returns consensus.
Phase 0: Only Bull calls real Anthropic API. Bear/Risk/Tech/Sentiment return mocks.
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from uuid import uuid4

import structlog

from agents.anthropic_client import AnthropicClient
from agents.bull_agent import run_bull
from schemas import AgentDecision

log = structlog.get_logger()

_client: AnthropicClient | None = None


def get_client() -> AnthropicClient:
    """Lazy singleton for AnthropicClient."""
    global _client
    if _client is None:
        _client = AnthropicClient()
    return _client


def _mock_decision(
    persona: str,
    decision: str,
    confidence: float,
    reasoning: str,
) -> AgentDecision:
    """Generate a mock AgentDecision for Phase 0 non-Bull agents."""
    return AgentDecision(
        persona=persona,  # type: ignore[arg-type]
        decision=decision,  # type: ignore[arg-type]
        confidence=confidence,
        reasoning=reasoning,
        claims=[
            {
                "text": f"Mock claim from {persona} agent (Phase 0 placeholder)",
                "confidence": confidence,
                "sources": [
                    {
                        "url": "https://defillama.com",
                        "title": f"Mock source for {persona}",
                        "snippet": "This is a placeholder source. Real data in Phase 1.",
                        "weight": 0.5,
                        "source_type": "defillama",
                    }
                ],
            }
        ],
        timestamp=datetime.now(timezone.utc),
        tokens_used=0,
        cost_usd=0.0,
    )


def _generate_mocks() -> list[AgentDecision]:
    """Generate mock decisions for Bear, Risk, Tech, Sentiment."""
    return [
        _mock_decision(
            persona="bear",
            decision="AGAINST",
            confidence=0.65,
            reasoning=(
                "Mock Bear analysis: potential downside risks identified. "
                "Smart contract risk and market volatility require caution. "
                "Waiting for Phase 1 live analysis with real data sources."
            ),
        ),
        _mock_decision(
            persona="risk",
            decision="ABSTAIN",
            confidence=0.50,
            reasoning=(
                "Mock Risk analysis: insufficient quantitative data for Phase 0. "
                "Expected value calculation requires live market feeds. "
                "Abstaining until Phase 1 data integration is complete."
            ),
        ),
        _mock_decision(
            persona="tech",
            decision="FOR",
            confidence=0.70,
            reasoning=(
                "Mock Tech analysis: target protocol has multiple audits. "
                "No critical vulnerabilities in public audit reports. "
                "Technical risk appears manageable based on available data."
            ),
        ),
        _mock_decision(
            persona="sentiment",
            decision="FOR",
            confidence=0.55,
            reasoning=(
                "Mock Sentiment analysis: community reception is neutral to positive. "
                "No extreme fear or greed signals detected. "
                "Social media volume within normal range."
            ),
        ),
    ]


def _calculate_consensus(decisions: list[AgentDecision]) -> str:
    """Simple majority: FOR vs AGAINST. ABSTAIN does not count."""
    votes_for = sum(1 for d in decisions if d.decision == "FOR")
    votes_against = sum(1 for d in decisions if d.decision == "AGAINST")

    if votes_for > votes_against:
        return "FOR"
    if votes_against > votes_for:
        return "AGAINST"
    if votes_for == 0 and votes_against == 0:
        return "ABSTAIN"
    return "SPLIT"


async def run_debate(proposal_text: str) -> dict:
    """
    Run full council debate on a proposal.

    Contract: Hugo calls this from /api/debate endpoint.
    Returns dict with decisions, consensus, vote_id.
    """
    start = time.perf_counter()
    client = get_client()

    bull_decision = await run_bull(proposal_text, client)
    mock_decisions = _generate_mocks()

    all_decisions = [bull_decision] + mock_decisions
    consensus = _calculate_consensus(all_decisions)
    total_latency = round(time.perf_counter() - start, 2)

    total_cost = sum(d.cost_usd or 0.0 for d in all_decisions)

    log.info(
        "debate_complete",
        agents_count=len(all_decisions),
        consensus=consensus,
        total_cost_usd=total_cost,
        total_latency_s=total_latency,
        bull_live=True,
    )

    return {
        "decisions": all_decisions,
        "consensus": consensus,
        "vote_id": str(uuid4()),
    }
