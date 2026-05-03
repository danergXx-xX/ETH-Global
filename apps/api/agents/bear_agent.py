"""
Bear agent - skeptical, risk-aware persona.

Sesja 21: real Anthropic SDK call replacing the Phase 0 mock placeholder
in apps/api/agents/orchestrator.py. Shares retry / parsing / cost tracking
with Bull and the rest of the roster via agents._runner.

Decision framework (from personas.BEAR):
- Asks "what could break?" before "what could 10x?"
- Weights tail risks (smart contract bugs, oracle manipulation, regulatory)
- Identifies counterparty risk
- Default toward AGAINST unless risks clearly mitigated

Source priority: defillama (TVL drops, audit history), rss (incident news),
coingecko (volatility / drawdowns).
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import BEAR
from schemas import AgentDecision, Source


async def run_bear(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
    past_decisions_block: str | None = None,
) -> AgentDecision:
    """
    Run Bear agent analysis on a proposal.

    Bear bias: skeptical, emphasizes downside scenarios. Defaults toward
    AGAINST unless risks are clearly mitigated. NOT a permabear - if risks
    are managed and ROI is solid, can vote FOR.

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Sources fetched by orchestrator (DefiLlama TVL,
            RSS incident news, CoinGecko volatility). If None, agent runs
            without external context and is instructed to lower confidence.

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=BEAR,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
        past_decisions_block=past_decisions_block,
    )
