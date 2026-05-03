"""
Risk agent - quantitative, statistical persona.

Sesja 21: real Anthropic SDK call replacing the Phase 0 mock placeholder
in apps/api/agents/orchestrator.py.

Decision framework (from personas.RISK):
- Calculates expected value and variance, not just point estimates
- Identifies max drawdown scenarios (90th percentile loss)
- Compares risk-adjusted return vs current treasury allocation
- Recommends FOR/AGAINST based on Sharpe ratio improvement

Source priority: coingecko (volatility, liquidity), defillama (TVL stability).
The Risk persona is data-driven and explicitly avoids emotional bias - if no
sources are available it MUST lower confidence and call this out.
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import RISK
from schemas import AgentDecision, Source


async def run_risk(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
    past_decisions_block: str | None = None,
) -> AgentDecision:
    """
    Run Risk agent analysis on a proposal.

    Risk bias: data-driven, no emotional bias. Expected value, variance,
    tail risk. Recommends position sizing implicitly via confidence and
    decision (FOR with low confidence = small allocation signal).

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Quant data (CoinGecko vol, DefiLlama TVL).

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=RISK,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
        past_decisions_block=past_decisions_block,
    )
