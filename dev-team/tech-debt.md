# Tech-Debt Register - AI Treasury Council

Tracked debt with origin (Hugo / Nova / Atlas wraps), status, and resolution.
Source of truth for post-hackathon cleanup priorities.

Owner: Atlas (Engineering Manager). Updated per Sesja 30 cleanup sprint.

## Status legend

- RESOLVED - fixed and verified, commit hash recorded
- DEFERRED - intentionally postponed (decision documented), trigger condition recorded
- POST-HACKATHON - acceptable for hackathon submission, must address before prod
- OPEN - active, needs work

## Register

### TD-001 - main.py forward refs RESOLVED

**Origin:** Hugo wrap Sesja 16 (pre-existing bug surfaced).
**Issue:** `from __future__ import annotations` + missing `response_model=DebateResponse`
on `/api/debate` caused FastAPI schema generation to skip the response model.
**Resolution:** Hugo Sesja 20 removed the `__future__` import and added
`response_model=DebateResponse` (apps/api/main.py:95).
**Status:** RESOLVED on `main` (verified Sesja 30 - Atlas).

### TD-002 - PERSONA_ADDRESSES placeholder guard RESOLVED

**Origin:** Hugo wrap.
**Issue:** Phase 1 ships with placeholder addresses 0x...001-005. Phase 2 ENS
will assign real per-agent wallets. Risk: placeholder addresses leaking to prod
deployment before Phase 2 lands.
**Resolution:** Defense-in-depth runtime guard in
`services/reputation_updater.py:293-302` raises `RuntimeError` when
`settings.env == "prod"` AND any address in `PERSONA_ADDRESSES` is in the
placeholder range (1 <= int(addr, 16) <= 100). Test coverage:
`tests/test_reputation_updater.py:205 test_placeholder_addresses_blocked_in_prod`.
PM-Lead decision: keep guard even after Phase 2 (cheap insurance).
**Status:** RESOLVED (guard + test verified Sesja 30).

### TD-003 - WebSocket rate limit MemoryStorage POST-HACKATHON

**Origin:** Hugo wrap.
**Issue:** `MemoryStorage` from `limits` library backs the WebSocket rate
limiter (`main.py:limiter`). Single-process only - multi-replica deploys would
have per-replica counters and effectively no rate limit.
**Decision (PM-Lead):** Hackathon submission runs single-instance on Railway -
acceptable. NOT a regression risk for the demo or judging.
**Trigger to fix:** Multi-replica prod deployment.
**Action when triggered:** Swap to `RedisStorage` (limits.storage.redis).
Add `REDIS_URL` to settings, factory pattern in `main.py` to pick storage by
env, update health check to ping Redis.
**Status:** POST-HACKATHON (deferred by PM-Lead decision).

### TD-004 - mypy errors in data/coingecko.py + data/rss.py RESOLVED

**Origin:** Hugo wrap (Lumen scope).
**Issue:** `mypy` reported:
- `data/rss.py:8` - `feedparser` missing library stubs.
- `data/coingecko.py:136` - `_fetch_coin_data` returning `Any` from a function
  declared to return `dict | None`.
- `data/defillama.py:107` (related) - `_get_protocols_list` returning `Any`.

**Resolution (Sesja 30, commit 60c7160):**
- `data/coingecko.py` - explicit `data: dict = resp.json()` annotation.
- `data/defillama.py` - `assert isinstance(data, list)` after `resp.json()`
  to narrow `Any`.
- `pyproject.toml` - added `feedparser` to `ignore_missing_imports`
  override (no public stubs, project doesn't ship typed marker).

**Verification:** `mypy data/` clean. 49/49 data adapter tests pass.
**Status:** RESOLVED.

### TD-005 - F401 unused MagicMock RESOLVED

**Origin:** Nova scope (commit 05465b7 sprzed Sesji 20).
**Issue:** `tests/test_agents_with_sources.py:12` imported `MagicMock` from
`unittest.mock` without referencing it.
**Resolution (Sesja 30, commit 0568a0d):** removed `MagicMock` from import
list, kept `AsyncMock` and `patch`.
**Status:** RESOLVED.

### TD-006 - PERSONA_RUNNERS dual SoT RESOLVED

**Origin:** Nova wrap.
**Issue:** Two parallel registries had to be kept in sync by hand:
- `agents/personas.py` - `ALL_PERSONAS: list[PersonaSpec]` (5 specs)
- `agents/orchestrator.py` - `PERSONA_RUNNERS: dict[str, Callable]` (6
  including adversarial)

Adding a persona required edits in both files plus a new agent module. Easy
to forget one side, silent runtime failure if the orchestrator dict was stale.

**Resolution (Sesja 30, commit c9d91d7):** lazy-import registry by convention
in `agents/personas.py:get_runner(persona_id)`. Convention is
`agents.<id>_agent.run_<id>`. Orchestrator drops the static dict and 6 hard
imports, calls `get_runner(persona.persona_id)` inside `_run_persona_safe`.
Adding a persona now requires:
1. New `PersonaSpec` in `ALL_PERSONAS` (or `PHASE_3_OPTIONAL`)
2. New `agents/<id>_agent.py` with `run_<id>` coroutine

Single source of truth. Failure modes (`ValueError`/`ImportError`/
`AttributeError` from `get_runner`) still produce a `_failure_decision`
instead of crashing the debate (Charter #6 No silent failures preserved).

**Verification:** 183/188 tests pass (5 skipped, 0 failed). Smoke test
confirms `get_runner` resolves all 6 personas (bull/bear/risk/tech/sentiment/
adversarial) to the correct module functions.

**Note:** `tests/test_persona_agents.py` keeps a local
`PERSONA_RUNNERS` dict scoped to its 4 parametrized golden tests
(bear/risk/tech/sentiment) - intentionally explicit, not refactored.

**Status:** RESOLVED.

## Open / new debt observed during Sesja 30

### TD-008 - requirements.txt pytest/pytest-asyncio version conflict RESOLVED

**Observed:** Sesja 30 venv setup. `requirements.txt` pinned `pytest==9.0.3`
and `pytest-asyncio==0.24.0`, but `pytest-asyncio 0.24` requires `pytest<9`.
Fresh `pip install -r requirements.txt` failed with `ResolutionImpossible`.

**Resolution (Sesja 30):** loosened `pytest-asyncio` pin to
`>=1.0,<2.0` (1.x supports pytest 9). 191 tests still pass with
pytest-asyncio 1.3.0.

**Status:** RESOLVED.

### TD-009 - mypy unused module overrides in pyproject.toml LOW

**Observed:** Sesja 30 mypy run reports `pyproject.toml: note: unused
section(s): module = ['agents.anthropic_client', 'agents.orchestrator',
'sentry_sdk.*', 'tests.test_bull_agent', 'uvicorn.*']`. These overrides
were added when those modules were unchecked / had errors. Worth pruning
once the broader mypy coverage is enabled (currently mypy is run only
selectively).

**Priority:** P3 - cosmetic.

## History

- 2026-05-03 (Sesja 30, Atlas) - register created. TD-001/002/004/005/006/008
  resolved. TD-003 deferred POST-HACKATHON. TD-009 logged. Critic + Vera T3
  review applied: tests/test_persona_agents.py PERSONA_RUNNERS now derived
  via get_runner (regression-proof), new tests/test_personas_registry.py
  covers lazy-import path (8 new tests, 191 total / 5 skipped / 0 failed),
  defillama assert replaced with explicit raise.
