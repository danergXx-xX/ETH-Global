# Dependency Strategy - AI Treasury Council

## Decision: Remove CrewAI, use bare Anthropic SDK

**Date:** 2026-05-02
**Decider:** Hugo (backend) + PM-Lead confirmation
**Status:** Implemented

## Problem

requirements.txt z Phase 0 baseline zawieralo crewai==0.83.0 + crewai-tools==0.17.0.
CrewAI ciagnie ~80 transitive deps (langchain, chromadb, lancedb, openai, instructor, etc.)
ktore wymuszaja nowsza wersje pydantic (>=2.10), co lamie fastapi==0.115.0 (wymaga pydantic <2.10).

Skutek: `pip install -r requirements.txt` failuje z ResolutionImpossible.

## Analiza

### Audit kodu (grep crewai across all branches)

```
feat/agents-bull: 0 importow crewai w plikach .py
feat/api-scaffold: 0 importow crewai w plikach .py
feat/web-scaffold: n/a (frontend)
main: 0 importow crewai
```

Nova zbudowal cala orchestracje na bare Anthropic SDK:
- `agents/anthropic_client.py` - thin wrapper z prompt caching
- `agents/bull_agent.py` - structured output parsing
- `agents/orchestrator.py` - asyncio.gather() parallel execution

CrewAI nigdy nie zostalo zaimportowane w zadnym pliku. To dead dependency.

### Strategie rozwazone

| Strategia | Opis | Verdict |
|-----------|------|---------|
| A: Compatible matrix | Znalezc wersje crewai kompatybilna z pydantic 2.9 | ODRZUCONA - crewai 0.83 wymaga langchain-core ktory wymaga pydantic >=2.10 |
| B: Multi-venv | Osobne venv dla API i agents | ODRZUCONA - niepotrzebna komplikacja skoro crewai nie jest uzywane |
| **C: Remove crewai** | Usunac nieuzywane crewai + crewai-tools | **WYBRANA** - alignment z kodem Novy, zero dep conflicts |

### Test weryfikacyjny

Clean venv (Python 3.12) z pelnym stackiem BEZ crewai:
```
fastapi==0.115.0 + pydantic==2.9.0 + anthropic==0.40.0 + web3==7.5.0 +
structlog==24.4.0 + sentry-sdk==2.18.0 + asyncpg + sqlalchemy + redis + ...
```
Wynik: `Successfully installed` - zero konfliktow, 4/4 testy PASS.

## Python version

Python 3.12 (nie 3.14). Wiele deps (web3, eth-account) wymaga <=3.13.
Python 3.12 jest LTS i stabilny. Pin w pyproject.toml: `target-version = "py312"`.

## Dep groups

| Grupa | Packages | Uzywane od |
|-------|----------|------------|
| Core API | fastapi, uvicorn, pydantic, pydantic-settings, httpx | Phase 0 |
| AI | anthropic | Phase 0 (Nova bull_agent) |
| Blockchain | web3, eth-account | Phase 1 (on-chain reads) |
| Database | asyncpg, sqlalchemy, alembic | Phase 1 (persistent state) |
| Cache | redis | Phase 1 (rate limiting) |
| Data | feedparser, beautifulsoup4, lxml | Phase 1 (Lumen data sources) |
| Observability | structlog, sentry-sdk | Phase 0 (structlog), Phase 4 (sentry) |
| Testing | pytest, pytest-asyncio, respx | Phase 0 |
| Linting | ruff, mypy | Phase 0 |

## Nie uzywane (usuniete)

| Package | Powod usuniecia |
|---------|-----------------|
| crewai==0.83.0 | Zero importow w kodzie. Nova uzywa bare Anthropic SDK |
| crewai-tools==0.17.0 | Dependency crewai, tez nieuzywane |
