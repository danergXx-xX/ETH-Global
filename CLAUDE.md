# AI Treasury Council - Repo Routing

**Sprint aktywny:** Pia 1.05 - Niedz 3.05 18:00 PL (~50h, ETHGlobal Open Agents 2026)
**Repo:** github.com/danergXx-xX/ETH-Global (private podczas sprintu)
**Owner sesji:** PM-Lead (Maxima + Pico + Atlas inkarnacja) + sesje rownolegle (numerowane Sesja 1, 2, 3, ...)

---

## CO TU BUDUJEMY (1 zdanie)

Multi-agent AI Council debatuje decyzje treasury DAO, on-chain audit trail (0G Storage), ENS subnames per agent z reputation, Proof-of-Work for agents (Moat 5).

---

## SESJE NUMEROWANE (Dan workflow)

Dan zarzadza sesje iTerm po nazwach numerowanych. Mapping bieżący:

| Sesja | Domena | Agent | Branch | Status |
|---|---|---|---|---|
| **Sesja 1** | UX/Frontend | Aiko | feat/web-scaffold | Phase 0+0.5 done |
| **Sesja 2** | Backend | Hugo | feat/api-scaffold | Phase 0 done, Phase 0.5 R-020 in flight |
| **Sesja 3** | Agents | Nova | feat/agents-bull | Phase 0 + self-audit done |
| **Sesja 4** | QA | Quill | feat/qa-tests | Phase 0 e2e + smoke (in flight gdy spawn) |
| **Sesja 5** | Smart Contracts | Sol | feat/contracts-governor (worktree contracts/) | Phase 1A start |

Przyszle: Sesja 6 (Data - Lumen worktree data-ingestion/), Sesja 7 (Demo - Eva worktree demo/).

---

## STRUKTURA REPO

```
~/repos/ai-treasury-council/
├── apps/
│   ├── web/                Next.js 16 + Tailwind v4 + shadcn/ui (Aiko owner, Sesja 1)
│   └── api/                FastAPI + CrewAI + Anthropic SDK (Hugo + Nova owner, Sesja 2+3)
├── contracts/              Foundry + OZ Contracts v5 (Sol owner, Sesja 5 worktree)
│   └── lib/                forge-std + openzeppelin-contracts (juz zainstalowane)
├── infra/                  CI/CD configs
├── docs/                   Nina pisze podczas sprintu
├── scripts/                setup-dev.sh + deployment scripts
├── .github/workflows/      ci.yml (frontend + backend + contracts + gitleaks)
└── tests/                  Quill e2e + integration (Sesja 4)
```

**Branche:**
- `main` - chroniona, merge tylko po Critic + Vera audit pass + atomic Phase wrap
- `feat/web-scaffold` (Aiko Phase 0+0.5)
- `feat/api-scaffold` (Hugo Phase 0+0.5)
- `feat/agents-bull` (Nova Phase 0)
- `feat/qa-tests` (Quill Phase 0 testy)
- `feat/contracts-governor` (Sol Phase 1A)

---

## TWOI EKSPERCI - KONSULTUJ ICH (regula #30b)

Konsultacja agentow NIE jest kosztem do unikania. To **CEL systemu**. Gdy temat dotyka domeny - SKONSULTUJ.

**Tier 1** (inline, 2-5k tokenow): Read pliku definicji + wplec wiedze
**Tier 3** (izolowany subagent, 30-70k): Agent tool z subagent_type

### DEV-TEAM (15 agentow w `~/.claude/agents/dev-team/`)

| Agent | Domena | Triggery |
|-------|--------|----------|
| **Maxima** | Product Owner / scope decisions | "co MVP", "scope cuts", "stakeholder X chce" |
| **Atlas** | Engineering Manager / blocker triage | "blocker", "engineer X potrzebuje", "tech debt" |
| **Pico** | Project Manager / timeline | "co dzis", "kto co robi", "burnup", "timeline" |
| **Vela** | Product Designer (UX/UI/IA) | "UX", "mockup", "wireframe", "user flow" |
| **Aiko** | Frontend (Next.js + RainbowKit) | "frontend", "React", "wallet connect", "shadcn" |
| **Hugo** | Backend (FastAPI + WebSocket) | "backend", "API endpoint", "FastAPI", "database" |
| **Sol** | Smart contracts (Solidity + Foundry) | "Solidity", "smart contract", "deploy", "Governor" |
| **Nova** | Agentic AI (CrewAI + Anthropic SDK) | "agent persona", "CrewAI", "debate", "prompt caching" |
| **Lumen** | Data engineer (RSS, CoinGecko, DefiLlama) | "RSS", "ingestion", "CoinGecko", "DefiLlama" |
| **Rio** | DevOps (Vercel, Railway, CI/CD) | "deploy", "CI", "Vercel", "Railway", "env" |
| **Critic** | Code Reviewer (auto po commit) | "code review", "review tego pliku" |
| **Quill** | **QA Engineer (oddzielny test agent!)** | "test", "QA", "regression", "e2e", "smoke test" |
| **Eva** | Demo Producer (od Phase 3 worktree) | "demo", "video", "storyboard", "voice-over" |
| **Aria-DAO** | DAO outreach (LOI hunting) | "LOI", "DAO outreach" |
| **Nina** | Technical Writer (README + FEEDBACK.md) | "dokumentacja", "README", "FEEDBACK.md", "arch diagram" |

### GLOBALNI (15+ agentow w `~/.claude/agents/`)

| Agent | Domena | Triggery |
|-------|--------|----------|
| **Maja** | Pioro systemu (copywriting PL+EN dla UI/demo/FEEDBACK.md) | "napisz", "draft", "tlumacz", "copy", "ton" |
| **Mateusz** | Bezpiecznik (security audit smart contracts, secrets, OWASP) | "bezpieczenstwo", "security", "tokeny", "audit" |
| **Vera** | Quality mentor (rubric, challenge) | "challenge", "ocen to", "jakosc", "co mozna lepiej" |
| **Szymon** | Sprzedaz B2B (sales lens, juror perspective) | "sales", "juror", "demo polish", "pitch" |
| **Ada** | Architektura AI / agenci / system | "architektura", "nowy modul", "skill design" |
| **Sora** | Research, deep analiza | "zbadaj", "research", "porownaj opcje" |
| **Leonardo** | Kreatywny brainstormer | "pomysly", "synergia", "co gdybysmy" |
| **Nox** | Inspektor systemu / audit struktury | "audit", "spojnosc", "broken links" |

---

## TESTY - PIERWSZA KLASA (Quill DRI, Charter #4)

**Quill jest oddzielnym agentem testow** - jak w real engineering org. Per agent commit:
- Hugo, Nova, Sol, Aiko - **unit tests inline z kodem**
- **Quill osobno (Sesja 4)** - integration tests, e2e Playwright, smoke tests post-deploy, regression suite

Reguly testow:
1. **Charter #4 Test before merge** - bez excuses "deadline"
2. Unit tests = autor kodu
3. **Integration + e2e + smoke = Quill**
4. **Min coverage:** happy path + 1 edge case per nowy modul
5. Smart contracts: min 5 testow per kontrakt (happy + edge + invariants + reverts + access control)
6. Frontend e2e: krytyczne flows (proposal submit -> debate -> vote -> execute)
7. Regression suite: po kazdym Phase wrap +3-5 nowych test cases

---

## AUTONOMOUS IMPROVEMENT (Dan permission, regula sprintu)

Sesje MAJA POZWOLENIE wdrazac wlasne ulepszenia gdy:
1. **W ramach scope handoffu** (nie scope creep) - np. Aiko Phase 0.5 wybral custom provider zamiast next-intl bo wykryl Turbopack+pnpm conflict
2. **Dokumentujesz decyzje** - w commit msg lub handoff response
3. **Trade-off jasny** - co zyskujesz, co tracisz
4. **PM-Lead audyt post-implementation** - jesli odrzucone, rollback OK

**NIE robic:**
- Scope creep (np. "dodaje Stripe payment skoro robie auth")
- Zmiana architektury bez konsultacji Zen/Ada Tier 1
- Downgrade wersji bez rzeczywistego conflict
- Skip security/test wymagan (Charter #4, #5 inviolable)

**Filozofia Dana:** "Fajny team kazdy moze cos fajnego wpasc". Sesje sa senior eng peers, nie blind doer.

---

## KNOWLEDGE PACK (9 tech docs - READ przed implementacja)

Lokalizacja: `/Users/danergy/Documents/Obsidian/Dan-Vault/Projects/AI-Tech/ETHGlobal-Open-Agents/knowledge-pack/`

| Plik | Kiedy czytac |
|------|--------------|
| `01-crewai-multi-agent.md` | Nova przed CrewAI implementation |
| `02-openzeppelin-governor.md` | Sol przed Governor + Timelock + ERC20Votes |
| `03-rainbowkit-wagmi-viem.md` | Aiko przed wallet connect (Phase 1B) |
| `04-0g-storage-sdk.md` | Hugo + Lumen przed 0G Storage upload (Phase 1C) |
| `05-foundry.md` | Sol przed Foundry deploy + tests |
| `06-claude-api-caching.md` | Nova przed prompt caching setup |
| `07-ens-subnames.md` | Sol + Aiko przed Phase 2 ENS |

**Reguła:** ZAWSZE czytaj knowledge-pack przed implementacja. Dla nowych wersji bibliotek - **plus Context7 query** dla aktualnej dokumentacji.

---

## DEV-TEAM DOCS (vault, czytaj per potrzeba)

Lokalizacja: `/Users/danergy/Documents/Obsidian/Dan-Vault/Projects/AI-Tech/ETHGlobal-Open-Agents/dev-team/`

| Plik | Co | Kiedy |
|------|----|-------|
| `_CHARTER.md` | 8 wartosci org | Konflikt scope/quality/velocity |
| `PLAN-v3.md` | Master plan z 50h timeline | Planowanie Phase X |
| `phase-mapping.md` | SSOT Phase ↔ Etap ↔ Day | Konfuzja nazw |
| `risk-register.md` | 21 ryzyk live | Nowy risk discovery |
| `escalation-matrix.md` | Eskalacje per severity | Blocker >2h |
| `quality-gates.md` | Quality gates per stage | Stage end |
| `daily-cadence.md` | 9:00 standup, 14:00 mid, 21:00 wrap | Codziennie |
| `code-review-checklist.md` | Critic checklist | Auto-invoke po commit |
| `handoff-template.md` | Format handoffu agent->agent | Oddawanie pracy |

---

## EXTERNAL INPUT (kluczowe konteksty)

| Plik | Co |
|------|----|
| `external-input/matthew-mvp-plan.md` | Plan wykonawczy Matthewa (Phase 0-4) |
| `external-input/matthew-audio-transcript.md` | Audio Matthewa - Moat 5 PoW for agents |
| `external-input/trust-research.md` | Sora 5 mechanizmow trust (OBLIGATORYJNE w MVP) |
| `external-input/team-status-and-decisions.md` | Decyzje + NOT-TO-DO list |

---

## STANDARDY (FUNDAMENT)

### Polskie znaki ZAWSZE (regula #69)
KAZDY tekst dla user (UI, komentarze widoczne, dokumenty) ma polskie diakrytyki (a, c, e, l, n, o, s, z). Bez wyjatkow. Kod/JSON keys = ASCII.

### Anti-AI-zmy (regula globalna)
- ZAKAZ em-dashes (-), en-dashes (-), typograficzne cudzyslowy (""''), bullet (-), strzalki (->)
- ASCII interpunkcja: zwykly myslnik (-), proste cudzyslowy ("), 3 kropki (...), tekst "->"

### Charter 8 wartosci (egzekutor: Atlas + Vera + Critic)
1. **Quality > velocity > scope** (POSTAVIENIE pod presja sprintu)
2. Ownership (DRI)
3. Document as you build
4. Test before merge (Quill jako DRI)
5. Security is not optional (Mateusz veto power)
6. No silent failures (structured logging od Day 1)
7. Honest communication (blocker -> mowimy)
8. Build for sedziów + DAO

### Coding standards
- **Python:** type hints, docstrings publiczne, parametryzowane SQL, NIE bare except, logging > print
- **TypeScript:** strict mode, no `any`, JSDoc publiczne, ESLint clean
- **Solidity:** NatSpec, CEI pattern, ReentrancyGuard, immutable gdzie mozna

---

## I18N (Aiko Phase 0.5 IMPLEMENTED)

UI dwujezyczny PL + EN:
- Lokalizacja: `apps/web/lib/i18n.tsx` (custom provider, NIE next-intl - Turbopack+pnpm+Next16 conflict)
- Bundles: `apps/web/messages/pl.json` + `messages/en.json`
- Toggle: `apps/web/components/language-toggle.tsx` w headerze
- Default: navigator.language detect, persisted localStorage
- Tlumaczenia: Maja konsultacja Tier 1 dla nowych textow

---

## CLOUD DESIGN (Phase 1+ workflow Dana)

Dla zlozonych UX (Phase 1+ debate viewer typewriter, vote/execute UI, source attribution tooltip, timelock countdown, ENS labels):
- **Dan robi mockup w Cloud Design** (Figma / v0 / Excalidraw / Claude artifacts) - PM-Lead daje duzy prompt do Cloud Design
- Vela = standby konsultant Tier 1
- Mockup -> handoff dla Aiko Phase X implementacja 1:1

---

## REGULA #59g - AGENT REVIEW PO IMPLEMENTACJI

Po kazdym commicie znaczacej zmiany:
1. **Critic T3** - code review (auto-invoke po >50 linii lub nowy plik)
2. **Vera T3** - rubric scoring (na koniec stage)
3. **Mateusz T3** - security audit (smart contracts, secrets)
4. **Quill** - integration/e2e tests (po nowym feature, Sesja 4)
5. Dopiero PASS -> merge do main (atomic per Phase)

Sesje NIE merguja same do main. Oddaja na branchu, **PM-Lead audyt + atomic merge**.

---

## QUICK REFERENCE

| Potrzeba | Idz do |
|----------|--------|
| "Co mam dzis robic?" | Phase mapping + handoff `Projects/.../handoffs/[date]-[from]-to-[you].md` |
| "Jak zrobic w Solidity/CrewAI/wagmi?" | Knowledge pack + Context7 query |
| "Czy to bezpieczne?" | Mateusz T1/T3 |
| "Jak napisac po EN/PL?" | Maja T1 |
| "Czy to dobrze zaprojektowane?" | Vera T1/T3 lub Ada (architektura) |
| "Co mowia jurorzy?" | `/panel` skill |
| "Co decydujemy MVP vs cuts?" | Maxima T1 |
| "Kto robi co i kiedy?" | `dev-team/PLAN-v3.md` + Pico |
| "Jak napisac test e2e?" | Quill T1/T3 (Sesja 4 robi base) |

---

## NIE ZAPOMNIJ

- **Konsultuj agentow PROAKTYWNIE** - Dan: "30-70k tokenow to nie jest dla mnie problem"
- **Polskie znaki ZAWSZE** w UI/komentarzach widocznych dla user
- **Anti-AI-zmy ZERO TOLERANCJI** w generowanych tekstach
- **Quality > velocity > scope** pod presja sprintu
- **Test before merge** - Quill jako DRI dla integration/e2e/smoke
- **Knowledge pack PRZED kodem** dla nowych bibliotek (Context7 dla aktualnosci)
- **Branche, NIE bezposredni merge do main** - PM-Lead audyt + atomic merge per Phase
- **Handoff document dla Tier 2-3 zadan** - format w `dev-team/handoff-template.md`
- **Autonomous improvement OK** w ramach scope (dokumentuj decyzje)
