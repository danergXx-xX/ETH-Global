"""
Bull agent - live Anthropic call with structured output + source attribution.

Phase 0: single agent live, proves pipeline works end-to-end.
Phase 3: pre-fetch sources from DataAggregator, inject as context.
Phase 4 (future): Anthropic tool_use for dynamic source selection.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone

from pydantic import ValidationError

import structlog

from agents.anthropic_client import AnthropicClient, UsageStats
from agents.personas import BULL, build_system_prompt
from agents.tools import format_sources_context
from schemas import AgentDecision, Source

log = structlog.get_logger()

COUNCIL_RULES = (
    "You are part of the AI Treasury Council. "
    "A decentralized council of 5 AI agents that debate DAO treasury proposals. "
    "Each agent has a different bias and role. You vote independently. "
    "Your output MUST be valid JSON matching AgentDecision schema exactly. "
    "No markdown, no code fences, no explanation outside JSON."
)

AGENT_DECISION_SCHEMA = json.dumps(AgentDecision.model_json_schema(), indent=2)

USER_PROMPT_TEMPLATE = (
    "Proposal: {proposal}\n\n"
    "{sources_context}\n\n"
    "Provide your analysis as JSON matching this schema exactly:\n"
    "{schema}\n\n"
    "Output ONLY valid JSON. No other text."
)

USER_PROMPT_TEMPLATE_NO_SOURCES = (
    "Proposal: {proposal}\n\n"
    "Provide your analysis as JSON matching this schema exactly:\n"
    "{schema}\n\n"
    "Output ONLY valid JSON. No other text."
)

RETRY_PROMPT = (
    "Your previous response was invalid JSON. "
    "Return ONLY valid JSON matching the AgentDecision schema. "
    "No markdown code fences, no explanation, just the JSON object."
)

MAX_PARSE_RETRIES = 1


async def run_bull(
    proposal_text: str,
    anthropic_client: AnthropicClient,
    pre_fetched_sources: list[Source] | None = None,
) -> AgentDecision:
    """
    Run Bull agent analysis on a proposal.

    Calls Anthropic API with prompt caching, parses structured JSON output
    into AgentDecision. Retries once if JSON parsing fails.

    Args:
        proposal_text: The treasury proposal to analyze.
        anthropic_client: Configured Anthropic client with caching.
        pre_fetched_sources: Sources fetched by orchestrator (Phase 3).
            If None, runs without source context (backward compatible).
    """
    system_prompt = COUNCIL_RULES
    persona_prompt = build_system_prompt(BULL)

    if pre_fetched_sources is not None:
        sources_context = format_sources_context(pre_fetched_sources)
        user_message = USER_PROMPT_TEMPLATE.format(
            proposal=proposal_text,
            sources_context=sources_context,
            schema=AGENT_DECISION_SCHEMA,
        )
    else:
        user_message = USER_PROMPT_TEMPLATE_NO_SOURCES.format(
            proposal=proposal_text,
            schema=AGENT_DECISION_SCHEMA,
        )

    response_text, usage = await anthropic_client.call_with_cache(
        system_prompt=system_prompt,
        persona_prompt=persona_prompt,
        user_message=user_message,
        max_tokens=BULL.max_tokens_output,
    )

    decision = _parse_response(response_text, usage)
    if decision is not None:
        return decision

    log.warning("bull_json_parse_failed_retrying")
    # Retry uses simplified prompt (no sources context) to maximize JSON parse success
    retry_message = f"{RETRY_PROMPT}\n\nOriginal proposal: {proposal_text}"
    response_text, usage_retry = await anthropic_client.call_with_cache(
        system_prompt=system_prompt,
        persona_prompt=persona_prompt,
        user_message=retry_message,
        max_tokens=BULL.max_tokens_output,
    )

    usage = _merge_usage(usage, usage_retry)
    decision = _parse_response(response_text, usage)
    if decision is not None:
        return decision

    log.error("bull_json_parse_exhausted", raw_start=response_text[:200])
    raise ValueError("Bull agent failed to produce valid JSON after retry")


def _parse_response(raw: str, usage: UsageStats) -> AgentDecision | None:
    """Try to parse raw text into AgentDecision. Returns None on failure."""
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        log.debug("json_decode_error", raw_start=text[:100])
        return None

    data["persona"] = "bull"
    data["timestamp"] = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    data["tokens_used"] = usage.input_tokens + usage.output_tokens
    data["cost_usd"] = usage.cost_usd

    try:
        return AgentDecision.model_validate(data)
    except ValidationError as e:
        log.debug("pydantic_validation_error", errors=str(e))
        return None


def _merge_usage(first: UsageStats, second: UsageStats) -> UsageStats:
    """Combine usage stats from two calls (original + retry)."""
    return UsageStats(
        input_tokens=first.input_tokens + second.input_tokens,
        output_tokens=first.output_tokens + second.output_tokens,
        cache_read_input_tokens=first.cache_read_input_tokens + second.cache_read_input_tokens,
        cache_creation_input_tokens=first.cache_creation_input_tokens
        + second.cache_creation_input_tokens,
        cost_usd=round(first.cost_usd + second.cost_usd, 6),
        latency_s=round(first.latency_s + second.latency_s, 2),
    )
