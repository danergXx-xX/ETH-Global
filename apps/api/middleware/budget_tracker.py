"""
Anthropic API budget tracker.

Tracks daily USD spend per debate. When 80% of BUDGET_USD_DAILY is exhausted,
new debates are halted (HTTP 503). Counter resets at UTC midnight rollover.

Cost computation:
    cost_usd = (input_tokens * input_price + output_tokens * output_price) / 1_000_000

Default prices reflect Anthropic Opus 4.7 list pricing (Jan 2026): $15/M input,
$75/M output. Override via ANTHROPIC_INPUT_USD_PER_MTOK / ANTHROPIC_OUTPUT_USD_PER_MTOK.

Single-replica safe (matches Railway numReplicas=1). Multi-replica would move
state into Redis with INCR + EXPIRE.
"""

from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone

import structlog

log = structlog.get_logger()

DEFAULT_BUDGET_USD_DAILY = 50.0
DEFAULT_HALT_FRACTION = 0.80  # halt at 80% utilization
DEFAULT_INPUT_USD_PER_MTOK = 15.0
DEFAULT_OUTPUT_USD_PER_MTOK = 75.0


def _float_env(name: str, default: float) -> float:
    raw = os.environ.get(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _utc_date_key() -> str:
    return datetime.now(timezone.utc).date().isoformat()


@dataclass
class BudgetSnapshot:
    """Read-only snapshot for /api/budget endpoint."""

    date_utc: str
    spent_usd: float
    cap_usd: float
    pct_used: float
    halt_threshold_usd: float
    debates_count: int
    halted: bool


@dataclass
class BudgetTracker:
    """Daily Anthropic budget tracker. Resets at UTC midnight."""

    cap_usd: float = DEFAULT_BUDGET_USD_DAILY
    halt_fraction: float = DEFAULT_HALT_FRACTION
    input_usd_per_mtok: float = DEFAULT_INPUT_USD_PER_MTOK
    output_usd_per_mtok: float = DEFAULT_OUTPUT_USD_PER_MTOK
    _date_key: str = field(default_factory=_utc_date_key)
    _spent_usd: float = 0.0
    _debates_count: int = 0

    def __post_init__(self) -> None:
        self._lock = asyncio.Lock()

    @classmethod
    def from_env(cls) -> "BudgetTracker":
        return cls(
            cap_usd=_float_env("BUDGET_USD_DAILY", DEFAULT_BUDGET_USD_DAILY),
            halt_fraction=_float_env("BUDGET_HALT_FRACTION", DEFAULT_HALT_FRACTION),
            input_usd_per_mtok=_float_env(
                "ANTHROPIC_INPUT_USD_PER_MTOK", DEFAULT_INPUT_USD_PER_MTOK
            ),
            output_usd_per_mtok=_float_env(
                "ANTHROPIC_OUTPUT_USD_PER_MTOK", DEFAULT_OUTPUT_USD_PER_MTOK
            ),
        )

    @property
    def halt_threshold_usd(self) -> float:
        return self.cap_usd * self.halt_fraction

    def _maybe_rollover(self) -> None:
        """Caller must hold the lock."""
        today = _utc_date_key()
        if today != self._date_key:
            log.info(
                "budget_rollover",
                from_date=self._date_key,
                to_date=today,
                final_spent_usd=round(self._spent_usd, 4),
                final_debates=self._debates_count,
            )
            self._date_key = today
            self._spent_usd = 0.0
            self._debates_count = 0

    def estimate_cost_usd(self, input_tokens: int, output_tokens: int) -> float:
        return (
            input_tokens * self.input_usd_per_mtok
            + output_tokens * self.output_usd_per_mtok
        ) / 1_000_000.0

    async def is_halted(self) -> bool:
        async with self._lock:
            self._maybe_rollover()
            return self._spent_usd >= self.halt_threshold_usd

    async def record_debate(
        self,
        cost_usd: float | None = None,
        input_tokens: int = 0,
        output_tokens: int = 0,
    ) -> float:
        """
        Add a debate's cost. Either pass cost_usd directly OR pass token counts
        and let the tracker compute cost via configured pricing. Returns new spent total.
        """
        if cost_usd is None:
            cost_usd = self.estimate_cost_usd(input_tokens, output_tokens)
        cost_usd = max(0.0, float(cost_usd))
        async with self._lock:
            self._maybe_rollover()
            self._spent_usd += cost_usd
            self._debates_count += 1
            new_total = self._spent_usd
            halted_now = new_total >= self.halt_threshold_usd
        log.info(
            "budget_debate_recorded",
            cost_usd=round(cost_usd, 4),
            spent_usd=round(new_total, 4),
            cap_usd=self.cap_usd,
            pct=round(new_total / self.cap_usd * 100, 2) if self.cap_usd > 0 else 0,
            debates=self._debates_count,
            halted=halted_now,
        )
        return new_total

    async def snapshot(self) -> BudgetSnapshot:
        async with self._lock:
            self._maybe_rollover()
            spent = self._spent_usd
            count = self._debates_count
            date_key = self._date_key
        pct = (spent / self.cap_usd * 100.0) if self.cap_usd > 0 else 0.0
        return BudgetSnapshot(
            date_utc=date_key,
            spent_usd=round(spent, 4),
            cap_usd=self.cap_usd,
            pct_used=round(pct, 2),
            halt_threshold_usd=self.halt_threshold_usd,
            debates_count=count,
            halted=spent >= self.halt_threshold_usd,
        )


_singleton: BudgetTracker | None = None


def get_budget_tracker() -> BudgetTracker:
    global _singleton
    if _singleton is None:
        _singleton = BudgetTracker.from_env()
    return _singleton


def reset_budget_tracker_for_tests(
    cap_usd: float | None = None,
    halt_fraction: float | None = None,
) -> BudgetTracker:
    global _singleton
    base = BudgetTracker.from_env()
    if cap_usd is not None:
        base.cap_usd = cap_usd
    if halt_fraction is not None:
        base.halt_fraction = halt_fraction
    base._spent_usd = 0.0
    base._debates_count = 0
    base._date_key = _utc_date_key()
    _singleton = base
    return _singleton
