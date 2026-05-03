"""
Perplexity API adapter dla Tech (audit history, recent exploits) + Sentiment (news beyond RSS).

Endpoint: https://api.perplexity.ai/chat/completions (model: sonar-pro)
Auth: Bearer PERPLEXITY_API_KEY
Cache: Redis 300s TTL (przez services.cache - Hugo Infra)

Graceful degrade: gdy PERPLEXITY_API_KEY brak lub API down - return [] + log warning.
NIE crash, fallback chain w aggregator.fetch_for_query przejmuje (DDG -> RSS).

Owner: Lumen + Hugo (LUMEN-HUGO-RESEARCH Sesja 50).
"""

from __future__ import annotations

import hashlib
import os
from typing import Any

import httpx
import structlog

from schemas import Source
from services.cache import cache_get, cache_set

log = structlog.get_logger()

API_URL = "https://api.perplexity.ai/chat/completions"
DEFAULT_MODEL = "sonar-pro"
CACHE_TTL_SECONDS = 300
REQUEST_TIMEOUT = 20.0
DEFAULT_WEIGHT = 0.85

MIN_QUERY_LENGTH = 2


def _api_key() -> str | None:
    key = os.environ.get("PERPLEXITY_API_KEY")
    if key and key.strip() and not key.startswith("pplx-xxx"):
        return key.strip()
    return None


def _cache_key(query: str, model: str) -> str:
    digest = hashlib.sha256(f"{model}|{query}".encode("utf-8")).hexdigest()[:16]
    return f"datasrc:perplexity:{digest}"


async def query_perplexity(
    question: str,
    model: str = DEFAULT_MODEL,
    *,
    client: httpx.AsyncClient | None = None,
) -> dict[str, Any] | None:
    """
    Wywoluje Perplexity API. Zwraca {answer, sources, confidence} albo None.

    None gdy: brak API key, blad sieciowy, malformed response.
    Caller decyduje co zrobic (typowo: fallback do DDG / RSS).
    """
    if len(question.strip()) < MIN_QUERY_LENGTH:
        return None

    key = _api_key()
    if key is None:
        log.warning("perplexity_no_api_key", query_len=len(question))
        return None

    cache_id = _cache_key(question, model)
    cached = await cache_get(cache_id)
    if isinstance(cached, dict) and "answer" in cached:
        log.debug("perplexity_cache_hit", model=model)
        return cached

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a crypto research assistant. Answer concisely with concrete "
                    "facts, dates, protocol names, and audit firms. Always cite sources."
                ),
            },
            {"role": "user", "content": question},
        ],
        "temperature": 0.2,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    own_client = client is None
    if own_client:
        client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
    try:
        assert client is not None
        resp = await client.post(API_URL, headers=headers, json=payload)
        resp.raise_for_status()
        raw = resp.json()
    except (httpx.HTTPStatusError, httpx.RequestError, httpx.TimeoutException) as exc:
        log.warning("perplexity_request_failed", error=str(exc), error_type=type(exc).__name__)
        return None
    except (ValueError, KeyError) as exc:
        log.warning("perplexity_decode_failed", error=str(exc))
        return None
    finally:
        if own_client and client is not None:
            await client.aclose()

    parsed = _parse_response(raw)
    if parsed is None:
        return None

    await cache_set(cache_id, parsed, ttl_seconds=CACHE_TTL_SECONDS)
    log.info(
        "perplexity_fetched",
        model=model,
        n_sources=len(parsed.get("sources", [])),
        answer_len=len(parsed.get("answer", "")),
    )
    return parsed


def _parse_response(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Wyciaga answer + citations z Perplexity response. Tolerancyjny na malformed."""
    try:
        choices = raw.get("choices", [])
        if not choices:
            log.warning("perplexity_empty_choices")
            return None
        message = choices[0].get("message", {})
        answer = message.get("content", "").strip()
        if not answer:
            return None

        citations: list[str] = raw.get("citations") or []
        sources: list[dict[str, str]] = []
        for idx, url in enumerate(citations[:10]):
            if not isinstance(url, str) or not url.startswith(("http://", "https://")):
                continue
            sources.append(
                {
                    "url": url,
                    "title": f"Perplexity citation {idx + 1}",
                    "snippet": answer[:500],
                }
            )

        usage = raw.get("usage", {})
        confidence = 0.8 if sources else 0.5

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
            "tokens": usage.get("total_tokens"),
        }
    except (AttributeError, TypeError, IndexError) as exc:
        log.warning("perplexity_parse_error", error=str(exc))
        return None


class PerplexitySource:
    """DataSource adapter (kompatybilny z aggregator factory pattern)."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    @property
    def source_type(self) -> str:
        return "perplexity"

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=REQUEST_TIMEOUT)
        return self._client

    async def fetch(self, query: str, limit: int = 5) -> list[Source]:
        """Fetch sources via Perplexity. Empty list gdy degraded."""
        result = await query_perplexity(query, client=self._get_client())
        if result is None:
            return []

        answer = result.get("answer", "")
        snippet_base = answer[:500] if answer else query[:500]
        items: list[Source] = []

        for src in result.get("sources", [])[:limit]:
            try:
                items.append(
                    Source(
                        url=src["url"],
                        title=src.get("title", "Perplexity source"),
                        snippet=src.get("snippet", snippet_base)[:500],
                        weight=DEFAULT_WEIGHT,
                        source_type="perplexity",
                    )
                )
            except (KeyError, ValueError):
                continue

        if not items and answer:
            items.append(
                Source(
                    url="https://www.perplexity.ai/",
                    title=f"Perplexity research: {query[:80]}",
                    snippet=snippet_base,
                    weight=DEFAULT_WEIGHT * 0.7,
                    source_type="perplexity",
                )
            )

        return items[:limit]

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def __aenter__(self) -> PerplexitySource:
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.close()
