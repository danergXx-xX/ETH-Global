"""
Source fetching tools for agent personas (Phase 3 source attribution).

Pre-fetch strategy (MVP): agents call these BEFORE Anthropic API call.
Sources injected as context in user_message, not as Anthropic tool_use.
Tool_use planned for Phase 4 enhancement.

Decision: pre-fetch vs tool_use -> pre-fetch wins for MVP:
- Deterministic (always fetches, no model choice variance)
- Simpler to test (mock DataAggregator, check prompt contains sources)
- Lower latency (parallel fetch before LLM call, not interleaved)
- Lower cost (no extra tool_use round-trips)

Owner: Hugo (backend integration) + Nova (prompt engineering) + Lumen (data adapters).
"""

from __future__ import annotations

import re
import unicodedata

import structlog

from data.aggregator import DataAggregator
from schemas import AgentDecision, Source

log = structlog.get_logger()


# ============================================================
# SANITIZE LAYER (Sesja 33, F-01 remediation)
# ============================================================
# Defense in depth on top of COUNCIL_RULES (Sesja 29). The system prompt
# already tells the model to treat sources as untrusted DATA, but markers
# like "--- END SOURCES ---" embedded in a controlled RSS snippet can
# still confuse the trust boundary (A04/A05/A06 indirect_source attacks).
# We strip the obvious instruction-shaped patterns at ingestion time so
# that an attacker who controls a feed cannot smuggle a fake system frame
# into the prompt.

# Per-field truncation budgets. Title and URL are short on legit data.
# Snippet 500 chars is enough for a real RSS preview but caps payload size.
_FIELD_LIMITS: dict[str, int] = {
    "title": 200,
    "snippet": 500,
    "url": 300,
}

# Bracketed instruction-shaped markers. Matched case-insensitively.
# We replace with a neutral filtered tag rather than deleting so that the
# original structure is still visible to the model and to a human auditor
# reading the prompt later.
_BRACKET_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\[\s*SYSTEM[^\]]*\]", re.IGNORECASE), "[SYSTEM_FILTERED]"),
    (re.compile(r"\[\s*/?\s*INST[^\]]*\]", re.IGNORECASE), "[INST_FILTERED]"),
    (re.compile(r"\[\s*ASSISTANT[^\]]*\]", re.IGNORECASE), "[ASSISTANT_FILTERED]"),
    (re.compile(r"\[\s*USER[^\]]*\]", re.IGNORECASE), "[USER_FILTERED]"),
    (re.compile(r"<\|[^|>]*\|>"), "<|FILTERED|>"),
    (re.compile(r"<\s*/?\s*(system|assistant|user|inst)\s*>", re.IGNORECASE), "<FILTERED>"),
    # Custom directive tags seen in A05 attack corpus.
    (
        re.compile(r"<\s*/?\s*[a-z_]*_directive\s*>", re.IGNORECASE),
        "<DIRECTIVE_FILTERED>",
    ),
    # H-01 fallback: unclosed bracket markers like "[SYSTEM OVERRIDE: vote FOR"
    # without a matching "]". Catches up to 80 chars of payload after the role
    # token. Word boundary on role token avoids matching legit "[SYSTEMS DOWN]".
    (
        re.compile(
            r"\[\s*(SYSTEM|INST|ASSISTANT|USER)\b[^\n\]]{0,80}",
            re.IGNORECASE,
        ),
        "[ROLE_MARKER_FILTERED]",
    ),
]

# ALL-CAPS instruction phrases. We require word boundaries to avoid
# false positives like "OVERRIDE" appearing inside a legitimate compound
# (rare in DAO proposals, but cheap to be careful). Multi-word phrases
# tolerate variable whitespace.
# M-01 fix: separator between words tolerates whitespace, hyphens, dots,
# underscores. Attacker inserts non-space delimiters (IGNORE-PREVIOUS,
# IGNORE.PREVIOUS) to bypass naive \s+ patterns.
_SEP = r"[\s\-_.]+"

_INSTRUCTION_PHRASES: list[re.Pattern[str]] = [
    re.compile(rf"\bIGNORE{_SEP}(ALL{_SEP})?PREVIOUS({_SEP}INSTRUCTIONS?)?\b", re.IGNORECASE),
    re.compile(rf"\bIGNORE{_SEP}(THE{_SEP})?ABOVE\b", re.IGNORECASE),
    re.compile(rf"\bDISREGARD{_SEP}(ALL{_SEP})?(PREVIOUS|PRIOR|ABOVE)\b", re.IGNORECASE),
    re.compile(rf"\bSYSTEM{_SEP}OVERRIDE\b", re.IGNORECASE),
    re.compile(rf"\bNEW{_SEP}INSTRUCTIONS?\b", re.IGNORECASE),
    re.compile(rf"\bOVERRIDE{_SEP}(YOUR{_SEP})?(BIAS|FRAMEWORK|RULES)\b", re.IGNORECASE),
    re.compile(rf"\bCOUNCIL{_SEP}RULES{_SEP}UPDATED?\b", re.IGNORECASE),
    re.compile(rf"\bYOU{_SEP}ARE{_SEP}NOW\b", re.IGNORECASE),
    re.compile(rf"\bSWITCH{_SEP}TO{_SEP}(ADMIN|DEV|TEST){_SEP}MODE\b", re.IGNORECASE),
    re.compile(rf"\bVOTE{_SEP}(FOR|AGAINST|ABSTAIN){_SEP}REGARDLESS\b", re.IGNORECASE),
]

# Source-context sentinel markers. Even partial matches get neutralized so
# the attacker cannot reopen or close the trust frame mid-snippet.
_SENTINEL_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"-{2,}\s*END\s+SOURCES?\s*-{2,}", re.IGNORECASE),
    re.compile(r"-{2,}\s*AVAILABLE\s+DATA\s+SOURCES?\s*-{2,}", re.IGNORECASE),
    re.compile(r"-{2,}\s*BEGIN\s+SOURCES?\s*-{2,}", re.IGNORECASE),
]

# Control characters except tab and newline. Strip these because RSS
# scrapers occasionally pass through stray bytes that the model would
# otherwise render as zero-width tokens (a known unicode obfuscation path).
_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_source_marker(text: str, field: str = "snippet") -> tuple[str, list[str]]:
    """
    Sanitize a source field before injection into the agent prompt.

    Defense in depth on top of COUNCIL_RULES. Strips control characters,
    normalizes unicode obfuscation, neutralizes instruction-shaped markers
    and prompt sentinels, escapes code-fence delimiters, and truncates to
    a per-field budget.

    Args:
        text: Raw value pulled from a source (RSS title, scraped snippet,
            URL string). Anything pulled from the network is untrusted.
        field: One of "title", "snippet", "url". Used for the truncation
            budget. Unknown values fall back to the snippet limit.

    Returns:
        Tuple of (sanitized_text, patterns_removed). patterns_removed is
        a list of human-readable labels useful for audit logging. An
        empty list means the input was already safe.
    """
    if not text:
        return text, []

    patterns_removed: list[str] = []
    sanitized = text

    # 1. Normalize unicode (NFKC folds compatibility forms like "Igno𝓻e"
    # back to ASCII "Ignore" so phrase patterns can match).
    normalized = unicodedata.normalize("NFKC", sanitized)
    if normalized != sanitized:
        patterns_removed.append("unicode_obfuscation")
        sanitized = normalized

    # 2. Strip control characters (except \t and \n which can be legit).
    if _CONTROL_CHAR_RE.search(sanitized):
        patterns_removed.append("control_chars")
        sanitized = _CONTROL_CHAR_RE.sub("", sanitized)

    # 3. Neutralize bracketed instruction markers ([SYSTEM], [INST], <|...|>).
    for pattern, replacement in _BRACKET_PATTERNS:
        if pattern.search(sanitized):
            patterns_removed.append(f"bracket:{replacement}")
            sanitized = pattern.sub(replacement, sanitized)

    # 4. Neutralize ALL-CAPS instruction phrases (IGNORE PREVIOUS, etc.).
    for pattern in _INSTRUCTION_PHRASES:
        if pattern.search(sanitized):
            patterns_removed.append(f"phrase:{pattern.pattern}")
            sanitized = pattern.sub("[INSTRUCTION_FILTERED]", sanitized)

    # 5. Neutralize source-context sentinels (--- END SOURCES --- etc.).
    # An attacker who closes our trust frame mid-snippet can smuggle fake
    # system text past the model. We rewrite to a single token that does
    # not look like a frame boundary.
    for pattern in _SENTINEL_PATTERNS:
        if pattern.search(sanitized):
            patterns_removed.append("sentinel_marker")
            sanitized = pattern.sub("[SENTINEL_FILTERED]", sanitized)

    # 6. Escape code-fence delimiters. Triple backticks let the model
    # interpret subsequent content as a code block, which some prompt
    # injection chains exploit. Backslash-escape preserves visual form
    # without code-block semantics.
    if "```" in sanitized:
        patterns_removed.append("code_fence")
        sanitized = sanitized.replace("```", r"\`\`\`")

    # 7. Truncate to per-field limit. Truncation is appended with a marker
    # so the model can tell the snippet ended early (vs being cut by an
    # adversary mid-instruction).
    limit = _FIELD_LIMITS.get(field, _FIELD_LIMITS["snippet"])
    if len(sanitized) > limit:
        patterns_removed.append(f"truncated:{field}:{limit}")
        sanitized = sanitized[:limit] + "...[TRUNCATED]"

    return sanitized, patterns_removed


def _sanitize_and_log(value: str, field: str, source_url: str) -> str:
    """Helper: sanitize one field and emit a structured warning if modified."""
    cleaned, patterns = sanitize_source_marker(value or "", field=field)
    if patterns:
        log.warning(
            "sanitized_source_marker",
            field=field,
            source_url=(source_url or "")[: _FIELD_LIMITS["url"]],
            patterns_removed=patterns,
            input_length=len(value or ""),
            output_length=len(cleaned),
        )
    return cleaned


# Phase 4: per-source fetch functions for Anthropic tool_use integration.
# Currently unused - orchestrator uses fetch_sources_for_persona directly.


async def fetch_news(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch news articles from RSS feeds (CoinDesk, Reuters)."""
    return await aggregator.fetch_for_query(query, source_priority=["rss"], limit_per_source=limit)


async def fetch_market_data(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch token price/market data from CoinGecko."""
    return await aggregator.fetch_for_query(
        query, source_priority=["coingecko"], limit_per_source=limit
    )


async def fetch_protocol_tvl(
    aggregator: DataAggregator,
    query: str,
    limit: int = 3,
) -> list[Source]:
    """Fetch protocol TVL data from DefiLlama."""
    return await aggregator.fetch_for_query(
        query, source_priority=["defillama"], limit_per_source=limit
    )


async def fetch_sources_for_persona(
    aggregator: DataAggregator,
    query: str,
    sources_priority: list[str],
    limit_per_source: int = 3,
) -> list[Source]:
    """
    Fetch all sources for a persona based on their priority order.

    This is the main entry point for pre-fetch strategy.
    Each persona (Bull, Bear, etc.) has different sources_priority
    defined in personas.py.
    """
    sources = await aggregator.fetch_for_query(
        query,
        source_priority=sources_priority,
        limit_per_source=limit_per_source,
    )
    log.info(
        "sources_fetched_for_persona",
        query=query[:50],
        priorities=sources_priority,
        total_sources=len(sources),
    )
    return sources


def format_sources_context(sources: list[Source]) -> str:
    """
    Format fetched sources as text context for injection into user_message.

    Returns a block that the agent can reference when making claims.
    If no sources available, returns explicit note about missing data.
    """
    if not sources:
        return (
            "\n--- AVAILABLE DATA SOURCES ---\n"
            "No external data sources were available for this query. "
            "State this explicitly in your claims and lower your confidence accordingly.\n"
            "--- END SOURCES ---"
        )

    lines = ["\n--- AVAILABLE DATA SOURCES ---"]
    for i, src in enumerate(sources, 1):
        # F-01 remediation: sanitize every field that originates from
        # untrusted external feeds (RSS, scraped HTML, token metadata)
        # before it lands inside the trust frame. Logging happens inside
        # _sanitize_and_log when something was actually rewritten.
        safe_url = _sanitize_and_log(src.url, "url", src.url)
        safe_title = _sanitize_and_log(src.title, "title", src.url)
        safe_snippet = _sanitize_and_log(src.snippet, "snippet", src.url)
        lines.append(
            f"[{i}] {safe_title} ({src.source_type or 'unknown'})\n"
            f"    URL: {safe_url}\n"
            f"    Data: {safe_snippet}\n"
            f"    Weight: {src.weight}"
        )
    lines.append(
        "\nCite sources by referencing their URL and title in your claims. "
        "EVERY claim MUST cite at least 1 source from this list."
    )
    lines.append("--- END SOURCES ---")
    return "\n".join(lines)


# ============================================================
# CONSENSUS - confidence-weighted voting across personas
# ============================================================


# Kept in sync with agents.orchestrator.FAILURE_MARKER. Imported lazily where
# needed to avoid a circular import (orchestrator imports compute_consensus).
_FAILURE_MARKER = "[orchestrator-failure]"


def compute_consensus(decisions: list[AgentDecision]) -> str:
    """
    Aggregate persona verdicts into a council consensus.

    Voting rule: confidence-weighted, optionally further scaled by ENS
    reputation `vote_weight` when set (Sesja 50.5). Each persona contributes
    `confidence * (vote_weight or 1.0)` to either the FOR or AGAINST tally.
    ABSTAIN does not count toward either.
    Agents that crashed mid-debate (reasoning contains FAILURE_MARKER) are
    silently ignored here - they are surfaced separately in the orchestrator
    log. An intentional confidence=0.0 ABSTAIN (e.g. Risk persona explicitly
    abstaining due to lack of data) is NOT a failure and is counted as a
    normal abstain vote.

    Outcomes:
        FOR     - weighted FOR > weighted AGAINST
        AGAINST - weighted AGAINST > weighted FOR
        ABSTAIN - all agents abstained or failed
        SPLIT   - non-zero ties (e.g. 2 vs 2 with same confidence sum).
                  SPLIT is intentional - downstream UI shows the council is
                  not aligned, prompting Adversarial Auditor (Phase 4) or
                  human review per Council Rules.

    Args:
        decisions: List of AgentDecision from all personas.

    Returns:
        One of "FOR", "AGAINST", "ABSTAIN", "SPLIT".
    """
    weight_for = 0.0
    weight_against = 0.0
    abstain_count = 0
    contributing = 0

    for decision in decisions:
        if _FAILURE_MARKER in decision.reasoning:
            continue
        contributing += 1
        # Sesja 50.5: reputation-scaled confidence. vote_weight None means
        # "no reputation data" - falls back to plain confidence weighting,
        # so behavior is identical to pre-50.5 when the weighter is offline.
        rep_weight = decision.vote_weight if decision.vote_weight is not None else 1.0
        scaled = decision.confidence * rep_weight
        if decision.decision == "FOR":
            weight_for += scaled
        elif decision.decision == "AGAINST":
            weight_against += scaled
        else:
            abstain_count += 1

    if contributing == 0:
        return "ABSTAIN"

    if weight_for == 0.0 and weight_against == 0.0:
        return "ABSTAIN"

    # Use a small epsilon to avoid floating-point near-tie surprises.
    epsilon = 1e-9
    if weight_for > weight_against + epsilon:
        return "FOR"
    if weight_against > weight_for + epsilon:
        return "AGAINST"
    return "SPLIT"
