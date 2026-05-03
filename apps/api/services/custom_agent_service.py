"""
Custom Agent service: spec validation, jailbreak sanitization, Test Arena.

Test Arena rules (Mateusz security boundary):
- NEVER hits production state (no on-chain reputation, no 0G upload).
- NEVER mutates standard persona registry.
- Always runs in sandbox=True mode for audit trail clarity.

For the MVP we run a deterministic mock arena (no live LLM call) so juror
demos remain reproducible and free. The shape of TestArenaResult mirrors what
a live debate produces, so swapping in real Anthropic calls post-hackathon is
isolated to one function (_run_mock_arena -> _run_live_arena).
"""

from __future__ import annotations

import hashlib
import re
import uuid
from datetime import datetime, timezone

import structlog

from schemas import (
    CustomAgent,
    CustomAgentSpec,
    TestArenaResult,
)

log = structlog.get_logger()


# Jailbreak / prompt-injection signal phrases. Conservative match: case
# insensitive substring. False positives are acceptable here - operator
# review (multisig approval) catches edge cases. Mateusz veto guidance:
# block jailbreak strings at API boundary, log + reject.
_INJECTION_PATTERNS: tuple[re.Pattern[str], ...] = tuple(
    re.compile(p, re.IGNORECASE)
    for p in (
        r"\bignore (the |all |previous )?instructions\b",
        r"\bdisregard (the |all |previous )?instructions\b",
        r"\bsystem prompt\b",
        r"\bjailbreak\b",
        r"\bDAN mode\b",
        r"\boverride your (rules|framework|bias)\b",
        r"\bpretend (to be|you are)\b",
        r"\bact as (?!a |an )",  # "act as " followed by something other than "a/an"
        r"<\|.*?\|>",  # special LLM tokens
        r"###\s*system",  # fake system header
        r"\bbase64\b",
        r"</?(script|iframe|svg|onerror|onload)\b",  # html injection
    )
)


class JailbreakRejected(ValueError):
    """Raised when a custom agent system_prompt looks like prompt injection."""


def sanitize_system_prompt(raw: str) -> str:
    """Reject obvious prompt-injection attempts. Return raw on success."""
    for pattern in _INJECTION_PATTERNS:
        match = pattern.search(raw)
        if match is not None:
            log.warning(
                "custom_agent_jailbreak_blocked",
                pattern=pattern.pattern,
                excerpt=raw[max(0, match.start() - 20) : match.end() + 20],
            )
            raise JailbreakRejected(
                f"system_prompt contains a disallowed phrase near "
                f"position {match.start()}"
            )
    return raw


def _decision_seed(spec: CustomAgentSpec, proposal: str) -> int:
    """Stable pseudo-random seed for deterministic mock decisions."""
    digest = hashlib.sha256(
        f"{spec.persona_id}|{spec.system_prompt}|{proposal}".encode("utf-8")
    ).digest()
    return int.from_bytes(digest[:8], "big")


def _run_mock_arena(spec: CustomAgentSpec, proposal: str) -> TestArenaResult:
    """
    Deterministic mock arena. Real LLM execution is post-hackathon.

    The mock picks a verdict from {FOR, AGAINST, ABSTAIN} based on a hash of
    the spec + proposal, then derives standard_consensus from a different
    bucket so 'aligned' has variance across submissions during demo.
    """
    seed = _decision_seed(spec, proposal)
    verdicts = ("FOR", "AGAINST", "ABSTAIN")
    custom_decision = verdicts[seed % 3]
    standard_consensus = verdicts[(seed >> 8) % 3]
    confidence = round(0.55 + ((seed >> 16) % 35) / 100.0, 2)

    aligned = custom_decision == standard_consensus
    reasoning = (
        f"[sandbox] {spec.display_name} applied its custom framework to the "
        f"proposal and reached '{custom_decision}' with confidence {confidence:.2f}. "
        "This is a deterministic mock used for the Test Arena. Real LLM "
        "evaluation runs post-hackathon when the multisig approves the agent."
    )
    return TestArenaResult(
        proposal=proposal,
        custom_decision=custom_decision,  # type: ignore[arg-type]
        custom_confidence=confidence,
        custom_reasoning=reasoning,
        standard_consensus=standard_consensus,  # type: ignore[arg-type]
        aligned_with_consensus=aligned,
        sandbox=True,
    )


async def register_custom_agent(spec: CustomAgentSpec) -> CustomAgent:
    """
    Validate, sanitize, optionally run Test Arena, and produce CustomAgent record.

    Status transitions:
      no test_arena_proposal      -> awaiting_multisig
      test_arena_proposal + run   -> testing (with TestArenaResult attached)
    """
    sanitize_system_prompt(spec.system_prompt)

    arena_result: TestArenaResult | None = None
    if spec.test_arena_proposal:
        arena_result = _run_mock_arena(spec, spec.test_arena_proposal)

    agent = CustomAgent(
        agent_id=f"agent_{uuid.uuid4().hex[:12]}",
        persona_id=spec.persona_id,
        display_name=spec.display_name,
        llm_model=spec.llm_model,
        ens_subname=spec.ens_subname,
        vote_weight=spec.vote_weight,
        trust_gate=spec.trust_gate,
        status="testing" if arena_result else "awaiting_multisig",
        created_at=datetime.now(timezone.utc),
        test_arena_result=arena_result,
    )
    log.info(
        "custom_agent_registered",
        agent_id=agent.agent_id,
        status=agent.status,
        ran_arena=arena_result is not None,
    )
    return agent
