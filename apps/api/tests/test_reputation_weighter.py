"""Tests for services.reputation_weighter (Sesja 50.5)."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from services import reputation_weighter as rw


@pytest.fixture(autouse=True)
def _reset_cache_state(monkeypatch: pytest.MonkeyPatch) -> None:
    """Default to cache-disconnected and updater-absent for unit isolation."""
    monkeypatch.setattr(rw.cache, "is_connected", lambda: False)


@pytest.mark.asyncio
async def test_happy_path_contract_read_applies_weight() -> None:
    """Reputation 87 from contract -> vote_weight 0.87 -> weighted 0.696."""
    fake_view = MagicMock(score=87, debates=10, aligned=8)
    fake_updater = MagicMock()
    fake_updater.get_reputation_async = AsyncMock(return_value=fake_view)

    with patch.object(rw, "get_reputation_updater", return_value=fake_updater):
        # cache_set may try to fire even when disconnected - patch to no-op
        with patch.object(rw.cache, "cache_set", AsyncMock(return_value=False)):
            result = await rw.calculate_weighted_vote("bull", base_vote=0.8)

    assert result.persona == "bull"
    assert result.reputation_score == 87.0
    assert result.vote_weight == pytest.approx(0.87)
    assert result.weighted_vote == pytest.approx(0.8 * 0.87)
    assert result.source == "contract"


@pytest.mark.asyncio
async def test_no_reputation_data_falls_back_to_default_weight() -> None:
    """No updater configured -> vote_weight 1.0, weighted == base."""
    with patch.object(rw, "get_reputation_updater", return_value=None):
        result = await rw.calculate_weighted_vote("bear", base_vote=0.5)

    assert result.reputation_score is None
    assert result.vote_weight == rw.DEFAULT_VOTE_WEIGHT
    assert result.weighted_vote == 0.5
    assert result.source == "fallback"


@pytest.mark.asyncio
async def test_max_weight_clamped() -> None:
    """Reputation > 200 must clamp at MAX_VOTE_WEIGHT (2.0)."""
    fake_view = MagicMock(score=350, debates=50, aligned=49)
    fake_updater = MagicMock()
    fake_updater.get_reputation_async = AsyncMock(return_value=fake_view)

    with patch.object(rw, "get_reputation_updater", return_value=fake_updater):
        with patch.object(rw.cache, "cache_set", AsyncMock(return_value=False)):
            result = await rw.calculate_weighted_vote("risk", base_vote=0.9)

    assert result.reputation_score == 350.0
    assert result.vote_weight == rw.MAX_VOTE_WEIGHT
    assert result.weighted_vote == pytest.approx(0.9 * rw.MAX_VOTE_WEIGHT)


@pytest.mark.asyncio
async def test_min_weight_zero_score() -> None:
    """Reputation 0 -> vote_weight 0 -> agent has no influence."""
    fake_view = MagicMock(score=0, debates=10, aligned=0)
    fake_updater = MagicMock()
    fake_updater.get_reputation_async = AsyncMock(return_value=fake_view)

    with patch.object(rw, "get_reputation_updater", return_value=fake_updater):
        with patch.object(rw.cache, "cache_set", AsyncMock(return_value=False)):
            result = await rw.calculate_weighted_vote("tech", base_vote=0.7)

    assert result.reputation_score == 0.0
    assert result.vote_weight == 0.0
    assert result.weighted_vote == 0.0


@pytest.mark.asyncio
async def test_contract_read_failure_falls_back() -> None:
    """RPC error during contract read -> fallback weight, no crash."""
    fake_updater = MagicMock()
    fake_updater.get_reputation_async = AsyncMock(side_effect=ConnectionError("rpc down"))

    with patch.object(rw, "get_reputation_updater", return_value=fake_updater):
        result = await rw.calculate_weighted_vote("sentiment", base_vote=0.6)

    assert result.reputation_score is None
    assert result.vote_weight == rw.DEFAULT_VOTE_WEIGHT
    assert result.weighted_vote == 0.6
    assert result.source == "fallback"


@pytest.mark.asyncio
async def test_unknown_persona_short_circuits_to_fallback() -> None:
    """Persona not in PERSONA_ADDRESSES never hits contract."""
    with patch.object(rw, "get_reputation_updater") as mock_updater:
        result = await rw.calculate_weighted_vote("ghost", base_vote=0.4)
        mock_updater.assert_not_called()

    assert result.source == "fallback"
    assert result.vote_weight == rw.DEFAULT_VOTE_WEIGHT


@pytest.mark.asyncio
async def test_cache_hit_skips_contract_call() -> None:
    """When Redis returns a cached score, contract is never read."""
    with patch.object(rw.cache, "is_connected", return_value=True):
        with patch.object(rw.cache, "cache_get", AsyncMock(return_value=72.0)):
            with patch.object(rw, "get_reputation_updater") as mock_updater:
                result = await rw.calculate_weighted_vote("bull", base_vote=1.0)
                mock_updater.assert_not_called()

    assert result.reputation_score == 72.0
    assert result.vote_weight == pytest.approx(0.72)
    assert result.source == "cache"
