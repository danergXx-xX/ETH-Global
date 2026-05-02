"""
Bull agent - optimistic, opportunity-seeking persona.

Phase 0: single agent live (proven Sesja 17 source attribution).
Sesja 21: refactored to thin wrapper over agents._runner.run_persona_agent
to share parsing/retry/cost-tracking with bear/risk/tech/sentiment.

Public surface preserved (run_bull signature) for backward compatibility
with apps/api/main.py and existing tests.
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import BULL
from schemas import AgentDecision, Source


async def run_bull(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
) -> AgentDecision:
    """
    Run Bull agent analysis on a proposal.

    Bull bias: opportunity-seeking, weights tailwinds and adoption signals.
    Default lens is opportunity, not risk (Bear handles risk).

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Sources fetched by orchestrator (Phase 3).
            If None, runs without source context (backward compatible).

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=BULL,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
    )
