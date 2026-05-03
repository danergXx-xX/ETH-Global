"""Tests for Anthropic budget tracker (Sesja 49a)."""

from __future__ import annotations

import pytest

from middleware.budget_tracker import (
    BudgetTracker,
    reset_budget_tracker_for_tests,
)


@pytest.mark.asyncio
async def test_initial_snapshot_zero() -> None:
    tracker = BudgetTracker(cap_usd=10.0)
    snap = await tracker.snapshot()
    assert snap.spent_usd == 0.0
    assert snap.debates_count == 0
    assert snap.halted is False
    assert snap.cap_usd == 10.0


@pytest.mark.asyncio
async def test_record_debate_accumulates_cost() -> None:
    tracker = BudgetTracker(cap_usd=10.0, halt_fraction=0.8)
    await tracker.record_debate(cost_usd=1.5)
    await tracker.record_debate(cost_usd=2.5)
    snap = await tracker.snapshot()
    assert snap.spent_usd == pytest.approx(4.0)
    assert snap.debates_count == 2
    assert snap.halted is False


@pytest.mark.asyncio
async def test_halt_triggered_at_threshold() -> None:
    tracker = BudgetTracker(cap_usd=10.0, halt_fraction=0.8)
    assert await tracker.is_halted() is False
    await tracker.record_debate(cost_usd=8.0)  # exactly threshold
    assert await tracker.is_halted() is True
    snap = await tracker.snapshot()
    assert snap.halted is True
    assert snap.pct_used == pytest.approx(80.0)


@pytest.mark.asyncio
async def test_estimate_cost_from_tokens() -> None:
    tracker = BudgetTracker(
        cap_usd=100.0,
        input_usd_per_mtok=15.0,
        output_usd_per_mtok=75.0,
    )
    cost = tracker.estimate_cost_usd(input_tokens=1_000_000, output_tokens=0)
    assert cost == pytest.approx(15.0)
    cost2 = tracker.estimate_cost_usd(input_tokens=0, output_tokens=2_000_000)
    assert cost2 == pytest.approx(150.0)


@pytest.mark.asyncio
async def test_record_debate_via_tokens() -> None:
    tracker = BudgetTracker(
        cap_usd=100.0,
        input_usd_per_mtok=15.0,
        output_usd_per_mtok=75.0,
    )
    await tracker.record_debate(input_tokens=200_000, output_tokens=50_000)
    snap = await tracker.snapshot()
    # 200k input * 15$/M + 50k output * 75$/M = 3.0 + 3.75 = 6.75
    assert snap.spent_usd == pytest.approx(6.75)


@pytest.mark.asyncio
async def test_negative_cost_clamped_to_zero() -> None:
    tracker = BudgetTracker(cap_usd=5.0)
    await tracker.record_debate(cost_usd=-2.0)
    snap = await tracker.snapshot()
    assert snap.spent_usd == 0.0
    assert snap.debates_count == 1


@pytest.mark.asyncio
async def test_singleton_reset_helper_for_tests() -> None:
    a = reset_budget_tracker_for_tests(cap_usd=20.0, halt_fraction=0.5)
    assert a.cap_usd == 20.0
    assert a.halt_fraction == 0.5
    snap = await a.snapshot()
    assert snap.spent_usd == 0.0
