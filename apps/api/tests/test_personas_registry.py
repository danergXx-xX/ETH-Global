"""
Unit tests for personas.get_runner lazy-import registry (TD-006).

Verifies the convention agents.<id>_agent.run_<id> resolves correctly for
every persona in ALL_PERSONAS + PHASE_3_OPTIONAL, and that misuse raises
the documented exception types so _run_persona_safe can route to a
_failure_decision instead of crashing the debate.
"""

from __future__ import annotations

import pytest

from agents import (
    adversarial_agent,
    bear_agent,
    bull_agent,
    risk_agent,
    sentiment_agent,
    tech_agent,
)
from agents.personas import (
    ALL_PERSONAS,
    PHASE_3_OPTIONAL,
    get_runner,
)


EXPECTED = {
    "bull": bull_agent.run_bull,
    "bear": bear_agent.run_bear,
    "risk": risk_agent.run_risk,
    "tech": tech_agent.run_tech,
    "sentiment": sentiment_agent.run_sentiment,
    "adversarial": adversarial_agent.run_adversarial,
}


@pytest.mark.parametrize("persona_id", list(EXPECTED.keys()))
def test_get_runner_resolves_to_module_function(persona_id: str) -> None:
    assert get_runner(persona_id) is EXPECTED[persona_id]


def test_get_runner_unknown_persona_raises_value_error() -> None:
    with pytest.raises(ValueError, match="Unknown persona"):
        get_runner("nonexistent")


def test_every_registered_persona_has_a_runner() -> None:
    """Convention guard: every spec in ALL_PERSONAS+PHASE_3_OPTIONAL resolves."""
    for spec in ALL_PERSONAS + PHASE_3_OPTIONAL:
        runner = get_runner(spec.persona_id)
        assert callable(runner)
        assert runner.__name__ == f"run_{spec.persona_id}"
