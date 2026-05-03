"""
Tech agent - smart contract security and technical due diligence.

Sesja 21: real Anthropic SDK call replacing the Phase 0 mock placeholder
in apps/api/agents/orchestrator.py.

Decision framework (from personas.TECH):
- Checks audit history of target protocol (firms, dates, findings)
- Verifies admin keys / upgrade patterns (immutable vs upgradeable)
- Identifies oracle dependencies and manipulation vectors
- Assesses MEV exposure (sandwich, frontrunning)

Source priority: rss (audit news, incident reports), defillama (protocol meta).
Bias: technically conservative - "unaudited = unsafe" unless overwhelming
evidence to the contrary.
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import TECH
from schemas import AgentDecision, Source


async def run_tech(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
    past_decisions_block: str | None = None,
) -> AgentDecision:
    """
    Run Tech agent analysis on a proposal.

    Tech bias: technically conservative. Reads contracts before whitepapers.
    Will flag unaudited protocols and novel architectures. Open but cautious.

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Audit / protocol news (RSS) + protocol meta
            (DefiLlama). If empty, agent must lower confidence and say so.

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=TECH,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
        past_decisions_block=past_decisions_block,
    )
