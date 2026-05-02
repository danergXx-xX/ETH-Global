# QUILL TEST PLAN - AI Treasury Council

**DRI:** Quill (QA Engineer)
**Sprint:** 2026-05-01 - 2026-05-03 18:00 PL
**Podejscie:** dev pisze unit testy, Quill pisze integration + e2e + smoke + regression

---

## 1. Tech stack

| Warstwa | Narzedzie | Wlasciciel |
|---------|-----------|------------|
| Unit (frontend) | Vitest + React Testing Library | Aiko |
| Unit (backend) | pytest | Hugo |
| Unit (contracts) | Foundry forge test | Sol |
| E2E (UI flows) | Playwright (Chromium) | Quill |
| Integration (API) | Playwright request API | Quill |
| Smoke (post-deploy) | bash + curl | Quill |
| Performance | k6 (Phase 4 stretch) | Quill |

**Dlaczego Playwright a nie Cypress:** Playwright wspiera nativeowo API testing (request fixture), nie trzeba osobnego runnera. Jeden tool do e2e + integration. Plus: lepsze wsparcie dla parallel, trace viewer, auto-wait.

---

## 2. Coverage per Phase

### Phase 0 - Foundations (aktualny)

| Modul | Typ testu | Plik | Status |
|-------|-----------|------|--------|
| Dashboard UI - proposal submit | e2e | `e2e/proposal-flow.spec.ts` | DONE |
| Dashboard UI - agent cards render | e2e | `e2e/proposal-flow.spec.ts` | DONE |
| Dashboard UI - vote tally + verdict | e2e | `e2e/proposal-flow.spec.ts` | DONE |
| I18n PL/EN toggle | e2e | `e2e/i18n-toggle.spec.ts` | DONE |
| I18n localStorage persistence | e2e | `e2e/i18n-toggle.spec.ts` | DONE |
| API /health | integration | `integration/api-debate.spec.ts` | DONE |
| API POST /api/debate | integration | `integration/api-debate.spec.ts` | DONE |
| API validation (empty, too long) | integration | `integration/api-debate.spec.ts` | DONE |
| Post-deploy smoke | smoke | `smoke/post-deploy.sh` | DONE |

### Regression Suite - Cross-module (Sesja 15)

| Modul | Typ testu | Plik | Status |
|-------|-----------|------|--------|
| Orchestrator imports real Bull (CRITICAL-01) | integration | `integration/test_cross_modules.py` | DONE |
| Full /api/debate with mocked Anthropic | integration | `integration/test_cross_modules.py` | DONE |
| Debate: storage failure graceful | integration | `integration/test_cross_modules.py` | DONE |
| Debate: orchestrator crash -> 500 | integration | `integration/test_cross_modules.py` | DONE |
| /api/proposals/encode with real addresses | integration | `integration/test_cross_modules.py` | DONE |
| /api/proposals/encode invalid -> 422 | integration | `integration/test_cross_modules.py` | DONE |
| /api/proposals/recipients demo entries | integration | `integration/test_cross_modules.py` | DONE |
| DataAggregator persona priority order | integration | `integration/test_cross_modules.py` | DONE |
| DataAggregator missing source skipped | integration | `integration/test_cross_modules.py` | DONE |
| DataAggregator source failure continues | integration | `integration/test_cross_modules.py` | DONE |
| ABI files exist + valid JSON | integration | `integration/test_cross_modules.py` | DONE |
| ABI EIP-55 checksums | integration | `integration/test_cross_modules.py` | XFAIL (bug) |
| ABI address format valid | integration | `integration/test_cross_modules.py` | DONE |
| .env.example completeness | integration | `integration/test_cross_modules.py` | DONE |
| CLAUDE.md sanity check (3 tests) | integration | `integration/test_cross_modules.py` | DONE |

**Discovered bugs (Sesja 15):**
- **HIGH:** `contracts.ts` has wrong EIP-55 checksums on all 4 addresses (xfail test)
- **MEDIUM:** `/api/debate` lacks try/except around `run_debate()` - unhandled orchestrator error crashes with 500 (no graceful error response)
- **LOW:** `apps/web/package.json` missing `"typecheck"` script

### Phase 1 - On-chain (planowane)

| Modul | Typ testu | Plik |
|-------|-----------|------|
| Wallet connect (RainbowKit) | e2e | `e2e/wallet-connect.spec.ts` |
| Proposal submit z wallet signature | e2e | `e2e/proposal-signed.spec.ts` |
| WebSocket debate streaming | e2e | `e2e/debate-stream.spec.ts` |
| Governor contract deploy + propose | integration | `integration/governor.spec.ts` |
| 0G Storage upload audit trail | integration | `integration/audit-trail.spec.ts` |
| Smart contract unit tests | unit (Sol) | `contracts/test/` |

### Phase 2 - ENS + Polish

| Modul | Typ testu | Plik |
|-------|-----------|------|
| ENS subnames mint + resolve | e2e | `e2e/ens-subnames.spec.ts` |
| Agent reputation display | e2e | `e2e/reputation.spec.ts` |
| Source attribution footnotes | e2e | `e2e/source-attribution.spec.ts` |
| Timelock countdown | e2e | `e2e/timelock.spec.ts` |

### Phase 3 - Demo + Submission

| Modul | Typ testu | Plik |
|-------|-----------|------|
| Full happy path regression | e2e | `e2e/full-flow.spec.ts` |
| Cross-browser (Chrome, Firefox) | e2e | playwright.config projects |
| Performance smoke (k6) | perf | `perf/debate-load.js` |

### Phase 4 - Post-deploy

| Modul | Typ testu | Plik |
|-------|-----------|------|
| Production smoke | smoke | `smoke/post-deploy.sh` |
| Uptime monitoring | smoke | cron co 15 min |

---

## 3. Test data strategy

### Mocking

| Zaleznosc | Mock w Phase 0 | Real od Phase |
|-----------|----------------|---------------|
| Anthropic API | TAK (client-side setTimeout) | Phase 1 (respx mock server-side) |
| Web3/wallet | N/A (button disabled) | Phase 1 (Synpress lub anvil) |
| 0G Storage | N/A | Phase 1 (mock SDK) |
| ENS | N/A | Phase 2 (anvil + NameStone mock) |

### Fixtures

- **Proposal text:** "Allocate 100 ETH to DeFi yield strategy" (standard fixture)
- **Empty proposal:** "" (negative test)
- **Long proposal:** 2001 chars (boundary test)
- **Agent decisions:** deterministic mock (5 agents, known votes) for Phase 0 frontend

### Determinism

Phase 0 frontend uzywa `Math.random()` w mock decisions - testy e2e sprawdzaja STRUKTURE (5 kart, tally istnieje, verdict istnieje), nie konkretne wartosci. To poprawne - wartosci beda deterministyczne od Phase 1 (Anthropic mock z ustalonym seed).

---

## 4. CI integration

### Obecne (ci.yml)

```yaml
# Do dodania w Phase 1 (po atomic merge do main):
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: npx playwright install chromium
    - run: cd tests && npx playwright test --project=e2e
```

### Dlaczego nie w Phase 0 CI

Branche nie sa jeszcze zmergowane do main. CI uruchamia sie na push do main/dev i PR do main. Testy e2e dodamy do CI przy atomic merge Phase 0 do main.

---

## 5. Jak uruchomic testy

### E2E (wymaga frontend dev server)

```bash
cd tests && npx playwright test --project=e2e
```

Frontend startuje automatycznie (webServer w playwright.config.ts).

### Integration (wymaga backend)

```bash
# Terminal 1: start backend
cd apps/api && uvicorn main:app --port 8000

# Terminal 2: run tests
cd tests && npx playwright test --project=integration
```

### Smoke (wymaga deployed URLs)

```bash
./tests/smoke/post-deploy.sh http://localhost:3000 http://localhost:8000
```

### Wszystko razem (lokalne)

```bash
# Start backend w tle
cd apps/api && uvicorn main:app --port 8000 &

# Run e2e + integration
cd tests && npx playwright test
```

---

## 6. Rekomendacje dla engineerow (Critic review)

**Aiko (Phase 1):** Dodaj `data-testid` atrybuty do kluczowych komponentow UI:
- `data-testid="decision-badge"` na Badge w DecisionBadge
- `data-testid="verdict-banner"` na VerdictBanner p element
- `data-testid="agent-card"` na kazdej AgentCard
- `data-testid="proposal-form"` na Card z textarea

Bez data-testid testy e2e opieraja sie na selektorach CSS (np. `[class*="bg-green-900"]`) ktore sa kruche przy zmianach Tailwind.

**Hugo (Phase 1):** Backend nie jest auto-startowany przez Playwright webServer (wymaga Python venv). Integration testy wymagaja recznego `uvicorn main:app --port 8000`. Rozwazyc dockeryzacje backendu lub skrypt `scripts/start-api.sh` dla CI.

---

## 7. Bug severity

| Severity | Definicja | Przyklad |
|----------|-----------|---------|
| P0 | Blokuje submission | App crash, blank page, API 500 na happy path |
| P1 | Blokuje stage | Wallet connect failure, debate nie renderuje |
| P2 | Post-hackathon | Minor UI glitch, slow animation, tooltip missing |

---

## 7. Open questions (zaadresowane)

1. **Playwright root vs per-app?** -> Root (`tests/playwright.config.ts`). Centralny punkt, webServer uruchamia frontend automatycznie. Per-app oznaczaloby duplikacje configu.

2. **CI gate przed PR merge?** -> Nie w Phase 0 (branche nie zmergowane). Od Phase 1 atomic merge - tak, e2e jako required check.

3. **Mockowanie Anthropic 100% w CI?** -> TAK. CI zawsze uzywa mockow. Opcjonalny tag `@live` dla manualnych testow z prawdziwym API (nigdy w CI).

4. **Fixture 5 agentow vs 1?** -> Testy sprawdzaja strukture (5 kart), nie konkretne osobowosci. Wystarczy fixture z 5 agentami o znanych personach (bull/bear/risk/tech/sentiment).
