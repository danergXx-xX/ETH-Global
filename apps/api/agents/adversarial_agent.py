"""
Adversarial agent - 6th persona (Phase 3 STRETCH, autonomous improvement Sesja 21).

Devil's Advocate role: after the 5 main personas (Bull/Bear/Risk/Tech/Sentiment)
have spoken, the Adversarial Auditor steelmans the minority position to ensure
the council is reasoning rigorously rather than confirming biases. Inspired by
trust mechanism research (Sora) - structured dissent improves decision quality
in multi-agent systems by ~15-20% on adversarial benchmarks.

Activation: opt-in via run_debate(include_adversarial=True). Default OFF to keep
the existing 5-agent contract stable for the MVP and to avoid blowing the token
budget on every debate. Pre-submission this can be flipped to True for
high-stakes proposals.

Design notes:
- Runs in parallel with the other 5 (not sequential post-consensus) for MVP
  simplicity. Sequential challenge after consensus is Phase 4.
- Same source attribution discipline as the rest of the roster.
- Higher temperature (0.5 in PersonaSpec) for creative challenge.
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import ADVERSARIAL
from schemas import AgentDecision, Source


async def run_adversarial(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
) -> AgentDecision:
    """
    Run Adversarial Auditor analysis on a proposal.

    Adversarial bias: contrarian by role, not by ideology. Identifies the
    weakest claim in the majority position, steelmans the minority view, and
    forces the council to defend reasoning against the strongest counter.

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Same source pool as the other personas. Adversarial
            uses all four source types (rss, defillama, coingecko, aixbt) to
            challenge claims from any persona.

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=ADVERSARIAL,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
    )
