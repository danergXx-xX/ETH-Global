"""
Sentiment agent - market psychology and community signals.

Sesja 21: real Anthropic SDK call replacing the Phase 0 mock placeholder
in apps/api/agents/orchestrator.py.

Decision framework (from personas.SENTIMENT):
- Reads social signals: Twitter mentions, Discord, governance forums
- Identifies fear / greed / neutral / contrarian regime
- Cross-references sentiment with price/volume action (divergences)
- Recommends FOR if sentiment + fundamentals align, AGAINST if hype-driven

Source priority: aixbt (sentiment scores), rss (news cycle tone),
coingecko (volume divergence with sentiment).
Bias: contrarian at extremes, trend-following at neutral. Explicitly
rejects FOMO during euphoria peaks and capitulation during panic.
"""

from __future__ import annotations

from agents._runner import run_persona_agent
from agents.anthropic_client import AnthropicClient
from agents.personas import SENTIMENT
from schemas import AgentDecision, Source


async def run_sentiment(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
) -> AgentDecision:
    """
    Run Sentiment agent analysis on a proposal.

    Sentiment bias: contrarian when extremes detected, trend-following at
    neutral. Distinguishes vibes from fundamentals - if hype is unsupported
    by data, votes AGAINST despite green tape.

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: AIXBT sentiment, RSS news, CoinGecko volume.
            If empty, agent must lower confidence and call out the gap.

    Raises:
        ValueError: When the model fails to produce valid JSON twice.
    """
    return await run_persona_agent(
        persona=SENTIMENT,
        proposal_text=proposal_text,
        anthropic_client=anthropic_client,
        pre_fetched_sources=pre_fetched_sources,
    )
