# AI Treasury Council - Repo Routing

**Sprint aktywny:** Pia 1.05 - Niedz 3.05 18:00 PL (~50h, ETHGlobal Open Agents 2026)
**Repo:** github.com/danergXx-xX/ETH-Global (private podczas sprintu)
**Owner sesji:** PM-Lead (Maxima + Pico + Atlas inkarnacja) + 3+ sesje rownolegle (Aiko/Hugo/Nova + workrees Sol/Lumen/Eva od Phase 1+)

---

## CO TU BUDUJEMY (1 zdanie)

Multi-agent AI Council debatuje decyzje treasury DAO, on-chain audit trail (0G Storage), ENS subnames per agent z reputation, Proof-of-Work for agents (Moat 5).

---

## STRUKTURA REPO

```
~/repos/ai-treasury-council/
├── apps/
│   ├── web/                Next.js 16 + Tailwind v4 + shadcn/ui (Aiko owner)
│   └── api/                FastAPI + CrewAI + Anthropic SDK (Hugo + Nova owner)
├── contracts/              Foundry + OZ Contracts v5 (Sol owner, worktree od Phase 1A)
│   └── lib/                forge-std + openzeppelin-contracts (juz zainstalowane)
├── infra/                  CI/CD configs
├── docs/                   Nina pisze podczas sprintu
├── scripts/                setup-dev.sh + deployment scripts
├── .github/workflows/      ci.yml (frontend + backend + contracts + gitleaks)
├── .pre-commit-config.yaml gitleaks + anti-AI-zmów
├── .gitignore              Mateusz security baseline
└── .env.example            SSOT secrets (NIGDY commit .env)
```

**Branche:**
- `main` - chroniona, merge tylko po Critic + Vera audit pass
- `feat/web-scaffold` - Aiko Phase 0+0.5
- `feat/api-scaffold` - Hugo Phase 0
- `feat/agents-bull` - Nova Phase 0
- Phase 1+ branches: `feat/contracts-governor`, `feat/storage-0g`, `feat/wagmi-vote`, `feat/ens-subnames`, `feat/agent-reputation`

---

## TWOI EKSPERCI (KONSULTUJ ICH - REGULA #30b)

Konsultacja agentow NIE jest kosztem do unikania. To CEL systemu. Gdy temat dotyka domeny - SKONSULTUJ.

### Tier 1 (inline, 2-5k tokenow): Read pliku definicji + wplec wiedze
### Tier 3 (izolowany subagent, 30-70k): Agent tool z subagent_type

### DEV-TEAM (15 agentow, dla tego sprintu)

| Agent | Domena | Plik | Triggery |
|-------|--------|------|----------|
| **Maxima** | Product Owner / scope decisions | `~/.claude/agents/dev-team/maxima.md` | "co MVP", "scope cuts", "stakeholder X chce" |
| **Atlas** | Engineering Manager / blocker triage | `~/.claude/agents/dev-team/atlas.md` | "blocker", "engineer X potrzebuje", "tech debt" |
| **Pico** | Project Manager / timeline | `~/.claude/agents/dev-team/pico.md` | "co dzis", "kto co robi", "burnup", "timeline" |
| **Vela** | Product Designer (UX/UI/IA) | `~/.claude/agents/dev-team/vela.md` | "UX", "mockup", "wireframe", "user flow" |
| **Aiko** | Frontend (Next.js + RainbowKit) | `~/.claude/agents/dev-team/aiko.md` | "frontend", "React", "wallet connect", "shadcn" |
| **Hugo** | Backend (FastAPI + WebSocket) | `~/.claude/agents/dev-team/hugo.md` | "backend", "API endpoint", "FastAPI", "database" |
| **Sol** | Smart contracts (Solidity + Foundry) | `~/.claude/agents/dev-team/sol.md` | "Solidity", "smart contract", "deploy", "Governor" |
| **Nova** | Agentic AI (CrewAI + Anthropic SDK) | `~/.claude/agents/dev-team/nova.md` | "agent persona", "CrewAI", "debate", "prompt caching" |
| **Lumen** | Data engineer (RSS, CoinGecko, DefiLlama) | `~/.claude/agents/dev-team/lumen.md` | "RSS", "ingestion", "CoinGecko", "DefiLlama" |
| **Rio** | DevOps (Vercel, Railway, CI/CD) | `~/.claude/agents/dev-team/rio.md` | "deploy", "CI", "Vercel", "Railway", "env" |
| **Critic** | Code Reviewer (auto po commit) | `~/.claude/agents/dev-team/critic.md` | "code review", "review tego pliku" |
| **Quill** | QA Engineer (e2e, regression) | `~/.claude/agents/dev-team/quill.md` | "test", "QA", "regression", "e2e", "smoke test" |
| **Eva** | Demo Producer (od Phase 3 worktree) | `~/.claude/agents/dev-team/eva.md` | "demo", "video", "storyboard", "voice-over" |
| **Aria-DAO** | DAO outreach (LOI hunting) | `~/.claude/agents/dev-team/aria-dao.md` | "LOI", "DAO outreach", "Aave contact" |
| **Nina** | Technical Writer (README + FEEDBACK.md) | `~/.claude/agents/dev-team/nina.md` | "dokumentacja", "README", "FEEDBACK.md", "arch diagram" |

### GLOBALNI (15+ agentow, dla cross-domain)

| Agent | Domena | Plik | Triggery |
|-------|--------|------|----------|
| **Maja** | Pioro systemu (copywriting PL+EN dla UI/demo/FEEDBACK.md) | `~/.claude/agents/maja-copywriterka.md` | "napisz", "draft", "tlumacz", "copy", "ton" |
| **Mateusz** | Bezpiecznik (security audit, smart contracts, secrets) | `~/.claude/agents/mateusz-bezpiecznik.md` | "bezpieczenstwo", "security", "tokeny", "audit", "OWASP" |
| **Vera** | Quality mentor (rubric, challenge, ocena) | `~/.claude/agents/vera-mentorka-jakosci.md` | "challenge", "ocen to", "jakosc", "co mozna lepiej" |
| **Szymon** | Sprzedaz B2B (sales lens, juror perspective) | `~/.claude/agents/szymon-sprzedaz-b2b.md` | "sales", "juror", "demo polish", "pitch" |
| **Ada** | Architektura AI / agenci / system | `~/.claude/agents/ada-architektka-ai.md` | "architektura", "nowy modul", "skill design", "system" |
| **Sora** | Research, deep analiza | `~/.claude/agents/sora-analityczka.md` | "zbadaj", "research", "porownaj opcje" |
| **Leonardo** | Kreatywny brainstormer | `~/.claude/agents/leonardo.md` | "pomysly", "synergia", "co gdybysmy" |
| **Nox** | Inspektor systemu / audit struktury | `~/.claude/agents/nox-inspektor-systemu.md` | "audit", "spojnosc", "broken links", "health check" |
| **Vault Explorer** | Search vault | `~/.claude/agents/vault-explorer.md` | "szukaj w vault" |
| **Web Researcher** | External web research | `~/.claude/agents/web-researcher.md` | "external research", "deep web" |

---

## KNOWLEDGE PACK (9 tech docs, READ przed implementacja)

Lokalizacja: `/Users/danergy/Documents/Obsidian/Dan-Vault/Projects/AI-Tech/ETHGlobal-Open-Agents/knowledge-pack/`

| Plik | Kiedy czytac |
|------|--------------|
| `01-crewai-multi-agent.md` | Nova przed CrewAI implementation |
| `02-openzeppelin-governor.md` | Sol przed Governor + Timelock + ERC20Votes |
| `03-rainbowkit-wagmi-viem.md` | Aiko przed wallet connect + on-chain hooks (Phase 1B) |
| `04-0g-storage-sdk.md` | Hugo + Lumen przed 0G Storage upload (Phase 1C) |
| `05-foundry.md` | Sol przed Foundry deploy + tests |
| `06-claude-api-caching.md` | Nova przed prompt caching setup |
| `07-ens-subnames.md` | Sol + Aiko przed Phase 2 ENS subnames |
| `08-coinbase-x402.md` | (cuts ze scope, ale doc istnieje) |
| `09-keeperhub-mcp.md` | (cuts ze scope, ale doc istnieje) |

**Reguła:** ZAWSZE czytaj knowledge-pack przed implementacja, NIE polegaj tylko na training data. Dla nowych wersji bibliotek (CrewAI 0.83, Next.js 16, OZ Contracts v5, viem 2.x) - **plus Context7 query** dla aktualnej dokumentacji.

---

## DEV-TEAM DOCS (vault, czytaj per potrzeba)

Lokalizacja: `/Users/danergy/Documents/Obsidian/Dan-Vault/Projects/AI-Tech/ETHGlobal-Open-Agents/dev-team/`

| Plik | Co | Kiedy |
|------|----|-------|
| `_CHARTER.md` | 8 wartosci org | Przy konflikcie scope/quality/velocity |
| `PLAN-v3.md` | Master plan z 50h timeline | Przy planowaniu Phase X |
| `phase-mapping.md` | SSOT Phase ↔ Etap ↔ Day | Przy konfuzji nazw |
| `risk-register.md` | 19 ryzyk live | Przy nowym risk discovery (Pico update) |
| `escalation-matrix.md` | Eskalacje per severity | Przy blockerze >2h |
| `quality-gates.md` | Quality gates per stage | Przy stage end |
| `daily-cadence.md` | 9:00 standup, 14:00 mid, 21:00 wrap | Codziennie |
| `code-review-checklist.md` | Critic checklist | Auto-invoke po commit |
| `handoff-template.md` | Format handoffu agent->agent | Przy oddawaniu pracy |

---

## EXTERNAL INPUT (kluczowe konteksty)

| Plik | Co |
|------|----|
| `external-input/matthew-mvp-plan.md` | Plan wykonawczy Matthewa (Phase 0-4) |
| `external-input/matthew-audio-transcript.md` | Audio Matthewa - Moat 5 PoW for agents |
| `external-input/trust-research.md` | Sora 5 mechanizmow trust (OBLIGATORYJNE w MVP) |
| `external-input/team-status-and-decisions.md` | Decyzje + NOT-TO-DO list |

---

## STANDARDY (FUNDAMENT - regula globalna)

### Polskie znaki ZAWSZE (regula #69)
KAZDY tekst dla user (UI, komentarze widoczne, dokumenty) ma polskie diakrytyki (a, c, e, l, n, o, s, z). Bez wyjatkow. Kod/JSON keys = ASCII.

### Anti-AI-zmy (regula globalna)
- ZAKAZ em-dashes (-), en-dashes (-), typograficzne cudzyslowy (""''), bullet (-), strzalki (->)
- ASCII interpunkcja: zwykly myslnik (-), proste cudzyslowy ("), 3 kropki (...), tekst "->"
- Zakazane frazy: "Oczywiscie", "Warto podkreslic", "Co wiecej", "Podsumowujac"

### Charter 8 wartosci (egzekutor: Atlas + Vera + Critic)
1. **Quality > velocity > scope** (POSTAVIENIE niezwykle wazne pod presja sprintu)
2. Ownership (DRI) - kazdy agent jest "Directly Responsible Individual"
3. Document as you build (Nina dostaje content na biezaco)
4. Test before merge (Quill + Critic, brak excuses "deadline")
5. Security is not optional (Mateusz veto power)
6. No silent failures (structured logging od Day 1)
7. Honest communication (blocker -> mowimy w standup)
8. Build for sedziów + DAO (kazda decyzja z perspektywy Hayden Uniswap, Kenji 0G, Aave contributor)

### Coding standards
- **Python:** type hints, docstrings publiczne, parametryzowane SQL, NIE bare except, logging > print
- **TypeScript:** strict mode, no `any`, JSDoc publiczne, ESLint clean
- **Solidity:** NatSpec, CEI pattern, ReentrancyGuard, immutable gdzie mozna

---

## DAILY CADENCE (Pia-Sob-Niedz)

Manualne lub przez `/build-day` skill (orchestrator):
- **9:00** `/build-standup` (5 min)
- **14:00** `/build-mid-check` (2 min, RED items only)
- **21:00** `/build-wrap` (5 min, full report)

---

## I18N (Phase 0.5 onwards)

UI MUSI byc dwujezyczny (PL + EN):
- ETHGlobal sedziowie nie znaja PL -> EN MUST
- Dan PL native -> PL fallback
- Implementacja: next-intl z bundles `messages/pl.json` + `messages/en.json`
- Toggle PL/EN w headerze (top right)
- Default locale: navigator.language detect, persisted localStorage
- Tlumaczenia: Maja konsultacja Tier 1 (zachowac crypto-native ton, "Bull"/"Bear" zostaja w EN, polish nazwy w PL)

---

## CLOUD DESIGN (od Phase 1)

Dla zlozonych UX (Phase 1+ debate viewer typewriter, vote/execute UI, source attribution tooltip, timelock countdown, ENS labels, agent activity feed):
- **Dan robi mockup w Cloud Design** (Figma / v0 / Excalidraw / Claude artifacts) - PM-Lead daje duzy prompt do Cloud Design
- Vela = standby konsultant Tier 1 (UX best practices, Sora trust mech alignment, accessibility)
- Mockup + Vela komentarze -> handoff dla Aiko Phase X implementacja 1:1
- Phase 0 (skeleton scaffold) NIE wymagal mockupu - placeholder cards trywialne

---

## REGULA #59g - AGENT REVIEW PO IMPLEMENTACJI

Po kazdym commicie znaczacej zmiany:
1. Critic T3 - code review (auto-invoke po >50 linii lub nowy plik)
2. Vera T3 - rubric scoring (na koniec stage)
3. Mateusz T3 - security audit (smart contracts, secrets)
4. Dopiero PASS -> merge do main

PM-Lead orchestruje. Sesje agentow (Aiko/Hugo/Nova) NIE merguja same do main - oddaja na branchu, PM-Lead audyt + merge.

---

## QUICK REFERENCE - GDY POTRZEBUJESZ

| Potrzeba | Idz do |
|----------|--------|
| "Co mam dzis robic?" | Phase mapping + handoff w `Projects/AI-Tech/ETHGlobal-Open-Agents/handoffs/[date]-[from]-to-[you].md` |
| "Jak to wzdac w Solidity/CrewAI/wagmi?" | Knowledge pack + Context7 query |
| "Czy to bezpieczne?" | Mateusz T1/T3 |
| "Jak to napisac po EN/PL?" | Maja T1 |
| "Czy to dobrze zaprojektowane?" | Vera T1/T3 (rubric) lub Ada (architektura) |
| "Co mowia jurorzy?" | `/panel` skill (9 jurorow + Szymon sales lens) |
| "Co decydujemy MVP vs cuts?" | Maxima T1 |
| "Kto robi co i kiedy?" | `dev-team/PLAN-v3.md` + Pico |

---

## NIE ZAPOMNIJ

- **Konsultuj agentow PROAKTYWNIE** - Dan: "30-70k tokenow to nie jest dla mnie problem", "chce zebymy rzeczywiscie zaczeli z nich korzystac"
- **Polskie znaki ZAWSZE** w UI/komentarzach widocznych dla user
- **Anti-AI-zmy ZERO TOLERANCJI** w generowanych tekstach
- **Quality > velocity > scope** pod presja sprintu
- **Test before merge** - bez excuses "deadline"
- **Knowledge pack PRZED kodem** dla nowych bibliotek (Context7 dla aktualnosci)
- **Branche, NIE bezposredni merge do main** - PM-Lead audytuje + merguje
- **Handoff document dla Tier 2-3 zadan** - format w `dev-team/handoff-template.md`
