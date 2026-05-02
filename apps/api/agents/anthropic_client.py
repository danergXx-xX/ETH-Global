"""
Thin wrapper around Anthropic SDK with prompt caching for AI Treasury Council.

Caching strategy:
- System prompt (base council rules) = cached (5 min TTL)
- Persona prompt (agent-specific) = cached (5 min TTL)
- User message (proposal text) = uncached (changes every debate)

Min cache size for Opus 4.7: 4096 tokens.
Combined system+persona exceeds this threshold.
"""

from __future__ import annotations

import asyncio
import os
import time
from dataclasses import dataclass
from typing import Any

import anthropic
import structlog

log = structlog.get_logger()

DEFAULT_MODEL = "claude-opus-4-7"

# Pricing per million tokens (Claude Opus 4.7, 2026-05)
PRICE_INPUT_PER_MTOK = 5.00
PRICE_CACHE_WRITE_PER_MTOK = 6.25
PRICE_CACHE_READ_PER_MTOK = 0.50
PRICE_OUTPUT_PER_MTOK = 25.00

MAX_RETRIES = 3
RETRY_BASE_DELAY = 1.0


@dataclass(frozen=True)
class UsageStats:
    """Token usage and cost from a single API call."""

    input_tokens: int
    output_tokens: int
    cache_read_input_tokens: int
    cache_creation_input_tokens: int
    cost_usd: float
    latency_s: float


def calculate_cost(
    input_tokens: int,
    output_tokens: int,
    cache_read_input_tokens: int,
    cache_creation_input_tokens: int,
) -> float:
    """Calculate USD cost from token counts."""
    uncached_input = input_tokens - cache_read_input_tokens - cache_creation_input_tokens
    cost = (
        uncached_input * PRICE_INPUT_PER_MTOK / 1_000_000
        + cache_creation_input_tokens * PRICE_CACHE_WRITE_PER_MTOK / 1_000_000
        + cache_read_input_tokens * PRICE_CACHE_READ_PER_MTOK / 1_000_000
        + output_tokens * PRICE_OUTPUT_PER_MTOK / 1_000_000
    )
    return round(cost, 6)


class AnthropicClient:
    """Async Anthropic client with prompt caching and retry logic."""

    def __init__(self, api_key: str | None = None, model_id: str | None = None) -> None:
        self._client = anthropic.AsyncAnthropic(
            api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"),
        )
        self._model = model_id or DEFAULT_MODEL

    async def call_with_cache(
        self,
        system_prompt: str,
        persona_prompt: str,
        user_message: str,
        max_tokens: int = 1000,
        temperature: float | None = None,
    ) -> tuple[str, UsageStats]:
        """
        Call Anthropic API with prompt caching on system + persona blocks.

        Returns (response_text, usage_stats).
        Retries with exponential backoff on 429 (rate limit).
        """
        system_blocks: list[dict[str, Any]] = [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            },
            {
                "type": "text",
                "text": persona_prompt,
                "cache_control": {"type": "ephemeral"},
            },
        ]

        messages = [{"role": "user", "content": user_message}]

        last_error: Exception | None = None

        for attempt in range(MAX_RETRIES):
            try:
                start = time.perf_counter()
                response = await self._client.messages.create(
                    model=self._model,
                    max_tokens=max_tokens,
                    system=system_blocks,
                    messages=messages,
                    timeout=30.0,
                )
                latency = time.perf_counter() - start

                usage = response.usage
                input_tokens = usage.input_tokens
                output_tokens = usage.output_tokens
                cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
                cache_creation = getattr(usage, "cache_creation_input_tokens", 0) or 0

                cost = calculate_cost(input_tokens, output_tokens, cache_read, cache_creation)

                stats = UsageStats(
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cache_read_input_tokens=cache_read,
                    cache_creation_input_tokens=cache_creation,
                    cost_usd=cost,
                    latency_s=round(latency, 2),
                )

                log.info(
                    "anthropic_call",
                    model=self._model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cache_read=cache_read,
                    cache_creation=cache_creation,
                    cost_usd=cost,
                    latency_s=stats.latency_s,
                )

                text = response.content[0].text if response.content else ""
                return text, stats

            except anthropic.RateLimitError as e:
                last_error = e
                delay = RETRY_BASE_DELAY * (2**attempt)
                log.warning(
                    "rate_limit_retry",
                    attempt=attempt + 1,
                    delay_s=delay,
                )
                await asyncio.sleep(delay)

            except anthropic.APIError as e:
                last_error = e
                if attempt < MAX_RETRIES - 1 and e.status_code and e.status_code >= 500:
                    delay = RETRY_BASE_DELAY * (2**attempt)
                    log.warning(
                        "server_error_retry",
                        attempt=attempt + 1,
                        status=e.status_code,
                    )
                    await asyncio.sleep(delay)
                else:
                    raise

        raise last_error  # type: ignore[misc]
