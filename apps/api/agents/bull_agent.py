"""
Bull agent - live Anthropic call with structured output.

Phase 0: single agent live, proves pipeline works end-to-end.
Phase 1: remaining 4 agents go live (same pattern).
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from pydantic import ValidationError

from agents.anthropic_client import AnthropicClient, UsageStats
from agents.personas import BULL, build_system_prompt
from schemas import AgentDecision

logger = logging.getLogger(__name__)

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
) -> AgentDecision:
    """
    Run Bull agent analysis on a proposal.

    Calls Anthropic API with prompt caching, parses structured JSON output
    into AgentDecision. Retries once if JSON parsing fails.
    """
    system_prompt = COUNCIL_RULES
    persona_prompt = build_system_prompt(BULL)

    user_message = USER_PROMPT_TEMPLATE.format(
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

    logger.warning("bull_json_parse_failed_retrying")
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

    raise ValueError(f"Bull agent returned invalid JSON after retry: {response_text[:200]}")


def _parse_response(raw: str, usage: UsageStats) -> AgentDecision | None:
    """Try to parse raw text into AgentDecision. Returns None on failure."""
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        logger.debug("json_decode_error", extra={"raw_start": text[:100]})
        return None

    data["persona"] = "bull"
    data["timestamp"] = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    data["tokens_used"] = usage.input_tokens + usage.output_tokens
    data["cost_usd"] = usage.cost_usd

    try:
        return AgentDecision.model_validate(data)
    except ValidationError as e:
        logger.debug("pydantic_validation_error", extra={"errors": str(e)})
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
