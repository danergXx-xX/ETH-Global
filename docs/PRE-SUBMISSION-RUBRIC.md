# Pre-Submission Rubric - AI Treasury Council

**Date:** 2026-05-03 (deadline 18:00 PL)
**Auditor:** Vera (Quality Mentor) - VERA-PRE-SUBMISSION-CHALLENGE
**Branch:** main (commit 3adbf87)
**Mode:** READ-ONLY assessment, "czy to wystarczy do finalist"
**Live demo:** https://aitc-pi.vercel.app
**Repo:** https://github.com/danergXx-xX/ETH-Global (public, 196 commits, 0 stars)

---

## TL;DR for PM-Lead

GO-AFTER-FIX. Average 6.9/10. Submission ready PO 2 fixach P0 (1h pracy):
1. VerifiedContractsBadge empty addresses, fill 5 deployed Base Sepolia addresses (Charter #7 violation - tells judges "pending" while README claims deployed)
2. X + Telegram handles do README (0G qual hard requirement)

Everything else (ENS Phase 2 mint, mock-vs-live agent markers w demo, FEEDBACK.md root location) to GO-AFTER-FIX P1, ale nie blokuje submission jezeli czas naprawde napiety.

Najwiekszy unique competitive lift: Source attribution per claim (zero matches w bazie 17,180+) + 5-trust framework structured + native OZ Governor stack. Najwiekszy risk: Ghost in the Machine ENS demo functional; nasz ENS LIVE status submission-day unverified.

---

## A) Originality - 8/10

**Co my mamy unikalnego:**
- Source attribution per claim z confidence weights 0.0-1.0 - **zero direct matches w 17,180+ projektow** (ethglobal-skills validation, Sesja 34)
- 5-trust mechanisms structured framework (source attribution + timelock 48h + 0G audit + ENS reputation + HITL council rules) jako warstwy, nie ad-hoc
- Moat 5 Proof-of-Work for agents (AgentReputation.sol on-chain reputation za alignment z consensus)
- 5+1 personas (5 council + 1 adversarial red-team)
- Native DAO Governance integration (OZ Governor v5 + ERC20Votes + TimelockController 48h) production-grade

**Adjacent ale rozne:**
- Goldman Stacked (Prague) - AI council DAO proposals + quadratic voting. Roznice: nasz source attribution + ENS reputation + 5-trust framework + native OZ stack
- Agentropolis (HackMoney 2026) - gamified personal trading, NIE DAO treasury
- Alpha Dawg (Cannes 2026 0G 2nd) - 10-agent personal trading + TEE. Roznica: my DAO governance, oni personal alpha
- Ghost in the Machine (Cannes 2026 ENS 1st) - 30+ records per agent, autonomous personal. Roznica: my COUNCIL + treasury, oni single agents

**Score 8/10** - solidny unique combo, nie #1 niczego ale unique intersection. NIE ma 1:1 dupliku w bazie.

---

## B) Technical depth - 8/10

**Smart contracts (Base Sepolia, 5 deployed + verified):**
- AICouncilGovernor (60% quorum, 1-day voting)
- TimelockController (48h delay, admin revoked)
- CouncilToken (ERC20Votes, timestamp-based clock)
- MockUSDC (1M treasury)
- AgentReputation (Moat 5 PoW)

**Dowody:** 23/23 Foundry tests PASS, Mateusz pre-deploy audit 0 CRITICAL/0 HIGH, Critic 8.5/10, Vera 8.5/10.

**Backend:**
- Real Anthropic SDK z prompt caching (60-90% redukcja - claim zweryfikowac w prod)
- WebSocket /ws/debate streaming z cap (Hugo Sesja Hugo-Infra)
- Redis + Postgres (production tier)
- Rate limit slowapi 10 req/min/IP
- 88% coverage backend, 97 pytest tests

**Storage:**
- 0G Storage primary + IPFS Pinata fallback (factory pattern, `apps/api/storage/`)
- Honest claim: 0G testnet flaky, fallback wired

**ENS:**
- 5 deterministic agent EOAs (Sesja 37 P0 closure)
- 26 deep text records per agent (Sesja 35, multicall optimization)
- aicouncil-danergy.eth registered Sepolia, owner 0x4872..148a
- Phase 2 ENS direct (Session 25) status submission-day unverified

**Frontend:**
- Next.js 16, Tailwind v4, shadcn/ui, RainbowKit + wagmi v2 + viem
- Custom i18n provider (PL+EN, ADR-002 Turbopack+pnpm+Next16 incompatibility z next-intl)
- 21 Playwright e2e tests

**Slabe punkty:**
- Bear/Risk/Tech/Sentiment - curated mock responses per README ("Bull is fully wired"). 4/5 personas mock = "5-agent debate" claim potrzebuje markerow w demo (mock vs live)
- Brak iNFT (ERC-7857) - 0G nice-to-have, nie blocker
- Brak TEE (Alpha Dawg ma)

**Score 8/10** - production-grade stack, 141 tests total. Tracąc punkty za 4/5 mock personas.

---

## C) Demo quality - 7/10

**Co mamy:**
- SCRIPT.md polished (3 wariacje EN per segment, A/B testy hooka)
- STORYBOARD.md 12 scen × 15s, 3 WOW moments rozplanowane (Typewriter @1:00, Adversarial @1:15, Custom Agent @1:30)
- 5 trust mechanisms wszystkie pokryte
- 5 sponsor jurors maja konkretne momenty (Kenji 0G, Hayden Uniswap, Nick ENS, Luca KeeperHub, Ben Gensyn)
- FAILURE-PLAYBOOK.md z fallbackami per scena
- Bilingual captions (CAPTIONS-EN.srt + PL.srt)
- 60s teaser script ready
- Word count check: 290 slow PL / 180s = 97 wpm comfortable

**Czego brakuje:**
- Video NIE NAGRANE (Session 33 Eva recording z Danem PENDING)
- Custom Agent Test Arena (WOW #3) - implementacja w Settings/Agents nie zweryfikowana live
- Adversarial agent live status (WOW #2) - opt-in, demo ma byc ON
- Smoke test pelnej debaty (Strait of Hormuz proposal end-to-end) PENDING Quill Sesja 31

**Score 7/10** - script-storyboard klasa pierwsza ale wynik koncowy zalezy od wykonania niedz wieczor. Jezeli recording sie uda i scena 5/6/7 dziala live - 8.5/10. Jezeli typewriter freezes lub adversarial fails - fallback na static = 6/10.

---

## D) Sponsor track fit

### D1) 0G Labs ($15k pool) - 6/10

**OK:**
- 0G Storage real usage (`apps/api/storage/zerog.py` factory)
- IPFS fallback resilience
- 5 deployed contracts
- Architecture diagram Mermaid
- Public repo + README + setup
- Live demo URL (https://aitc-pi.vercel.app)

**CRITICAL pending:**
- **Telegram + X handles MISSING z README** (qual hard requirement: "Team member names and contact info Telegram & X")
- "How agents communicate & coordinate" explicit sekcja missing w architecture.md (qual: swarm coordination)
- Demo video pod 180s NIE nagrane

**Brak (acceptable):**
- iNFT ERC-7857 (NIE claim ten track)
- TEE (Alpha Dawg ma, nie nasz angle)

**Score 6/10** - infrastructure solidna, ale 2 hard quality requirements (handles + swarm coord text) blokuja max.

### D2) ENS Identity ($5k) - 8/10 (UPDATED post verify)

**OK:**
- 26 deep text records per agent (rep.score, rep.statements, llm, model, audit_count, etc.)
- Deterministic agent EOAs hardcoded w `apps/web/lib/contracts.ts` (bull/bear/risk/tech/sentiment 0xB058... etc.) - Session 37 P0 closure
- **PR #8 `feat/phase2-ens` merged** (commits ba4f504 mint script + d2dadec 26 deep records + multicall + b955fa2 audit findings + b2c0671 verify-ens-records sanity)
- `scripts/mint-ens-subnames.ts` + `scripts/verify-ens-mint.ts` + `scripts/update-reputation-snapshot.ts` + `scripts/update-prompt-hashes.ts` w repo
- aicouncil-danergy.eth Sepolia, deterministic addresses znane
- Cross-chain reference (ENS Sepolia text record `ai.contract` -> AgentReputation Base Sepolia)

**Pozostale ryzyko (MEDIUM):**
- Submission-day verification PENDING - need run `tsx scripts/verify-ens-mint.ts` to confirm live records present on Sepolia
- Jezeli verify zwroci puste records dla ktorejs persony -> remint przed demo (~5 min)

**Score 8/10** - infrastructure merged, verify pending.

### D3) ENS Creative use ($5k) - 6/10

Cross-chain ENS (Sepolia -> Base Sepolia) jest creative angle ale Ghost in the Machine wygral 1st AI Agents na pelnym text records depth (30+ live). Nasz cross-chain pointer NIE jest "Ghost in the Machine" pattern jako kreatywnosc - to bardziej technical bridge.

**Score 6/10** - mid pack.

### D4) ETHGlobal Finalist (cross-track top) - 7/10

**Pro:**
- Honest scope w README ("What is NOT in the demo")
- 5-trust framework novelty
- Production-grade governance stack
- Pattern E auto-Critic per commit (engineering story dla sedziow)
- 15-agent dev-team workflow meta-differentiator
- 141 tests across 3 layers
- Bilingual UI rare w hackathonie

**Contra:**
- 4/5 agentow mock (jezeli sedzia probe)
- ENS Phase 2 status uncertain
- Adjacent winners (Goldman Stacked, Alpha Dawg, Agentropolis) maja overlapping angles

**Score 7/10** - finalist top 20% wykonalne, top 5 live judging mniej prawdopodobne (35% lift z plan-to-submission). Differentiation per Maja/Eva 1-zdaniowy elevator pitch obowiazkowy.

---

## E) Polish - 6/10

**OK:**
- Anti-AI-zmy: zero em-dashes w README/docs (spot-checked), polskie znaki w UI/komentarzach widocznych
- Demo Mode banner present (`apps/web/components/dashboard/demo-mode-banner.tsx`) - Charter #7 honest marker
- Mobile responsive (mobile tabs overflow fix Sesja P0)
- Multi-RPC fallback frontend
- Loading/empty/error states - per audit, Aiko Wave 1 MEGA dodaje 4 transparency UX gaps

**CRITICAL:**
- **VerifiedContractsBadge empty addresses** (`apps/web/components/landing/verified-contracts-badge.tsx`)
  - 5 contracts marked `address: ""` z fallback "pending deployment"
  - README + JUDGES-ONBOARDING + PHASE4-DEPLOY-SUMMARY pokazuja realne adresy
  - **Charter #7 violation in reverse** - mowimy "pending" gdy LIVE
  - Pierwszy ekran landing pokazuje "5 contracts pending Base Sepolia deployment" (potwierdzone WebFetch landing)
  - Sedzia kliknie i zobaczy disconnect README/UI -> credibility damage

**Score 6/10** - bez tej jednej luki bylo by 8/10. Z fixem (15 min - paste 5 adresow) poprawa do 8/10.

---

## F) Honest mode (Charter #7) - 7/10

**OK:**
- README ma sekcje "MVP scope: Bull is fully wired with live data sources. Bear, Risk, Tech, and Sentiment currently return curated mock responses pending Phase 4 final polish"
- JUDGES-ONBOARDING ma "What is NOT in the demo (honest scope)" sekcja
- Demo Mode banner present
- "5-of-7 multisig mock" explicit (4 mock signatures explicit per Charter #7)
- Cost counter "4 cents per debate" - faktualne, nie "saved hypothetically"
- 0G Storage + IPFS fallback - dokumentowane "fallback when 0G testnet flaky"
- ADR-002 i18n decision documented
- DAO Outreach pipeline section: "We are not claiming signed letters of intent we do not have"

**CRITICAL inconsistency:**
- **Landing UI mowi "pending deployment", README mowi "deployed Base Sepolia 2026-05-02"** - sedzia widzi sprzecznosc, decyduje "ktore prawda?"
- Wewnetrzna sprzecznosc = honest mode failure paradoxically (bo NIE jestesmy nieuczciwi - mamy contracty - tylko UI nie zaktualizowany)

**Mniej krytyczne:**
- ENS Phase 2 NameStone "stub renders mock data so UX is reviewable" - honest, ale ENS qual mowi "no hard-coded values" -> ryzyko jurorskie

**Score 7/10** - intencja honest, wykonanie ma 1 critical gap.

---

## G) Documentation - 8/10

**Compelling:**
- README hero + value prop + try it + sponsor coverage + tech stack + setup + verify-it-works commands
- JUDGES-ONBOARDING.md 5-min walk-through z 60s eval table
- COMPETITIVE-ANALYSIS.md 332 linii (Sora research z ethglobal-skills)
- architecture.md Mermaid diagrams (mainnet flow + reputation update flow)
- glossary.md (DAO governance plain English)
- SECURITY.md + Mateusz red-team audit doc 478 linii
- PHASE4-DEPLOY-SUMMARY.md (production runbook)
- FEEDBACK.md per ENS i 0G (sponsor research detail)
- SUBMISSION-CHECKLIST.md (track requirements scoring)
- JUDGE-QA-PREP.md 359 linii + flashcards
- 4 ADR documented (cut crewai, custom i18n, worktree per agent, Moat 5 PoW)
- 7 Phase2 ENS docs (decisions, deep records, tech debt)

**Slabe punkty:**
- FEEDBACK.md w `docs/FEEDBACK.md`, Uniswap qual chce `/FEEDBACK.md` root (jezeli claim Uniswap)
- Demo URL `demo.aitc.app` wzmiankowane vs realne `aitc-pi.vercel.app` - sprawdzic czy linki spojne wszedzie
- Architecture brak explicit "Agent communication & coordination" sekcji (0G qual)

**Score 8/10** - obfite, dobrze zorganizowane, sedziowski friendly.

---

## H) Live demo readiness - 5/10

**Sprawdzone (WebFetch):**
- Landing aitc-pi.vercel.app: hero + value prop + nav (Home, App, Architecture, Risks, Similar Projects), "Try Live Demo" + GitHub buttons, "5 contracts pending Base Sepolia deployment" (CRITICAL inconsistency)
- /app dashboard: WebFetch zwrocilo tylko CONCLAVE header - JS-rendered SPA, fetch nie ladowal full content. NIEWERYFIKOWANE LIVE: Suggested Proposals dropdown, Strait of Hormuz proposal full debate, Vote+Execute path, ENS card hover, Custom Agent Test Arena

**Za sceny demo (Eva storyboard):**
- Scena 4 (Strait of Hormuz proposal pick): kod istnieje (`live-debate-viewer.tsx`), live status NIEWERYFIKOWANY
- Scena 5 (Typewriter WOW #1): WebSocket /ws/debate scaffolding, Hugo Mega merged - status w prod nieweryfikowany
- Scena 6 (Adversarial WOW #2): opt-in agent, ON dla demo per plan-to-submission, status live nieweryfikowany
- Scena 7 (Custom Agent WOW #3): Settings/Agents page status uncertain (handoff Sesja 31)
- Scena 8 (Vote+Execute path): wymaga Sol Phase 1B wagmi-ui merge - **niezweryfikowane**
- Scena 9 (ENS card 26 records hover): kod istnieje (Sesja 35), live na prod TBC

**Brakujace verifications:**
- Quill Sesja 31 smoke E2E na live URL - PENDING (blocks on Rio deploy)
- Manual click-through scenariusza demo - NIE wykonany
- Dla finalist top 5 live judging - sedzia siada i klika; jezeli cokolwiek z 12 scen nie dziala = drop

**Score 5/10** - infrastructure deployed, full happy-path live verification PENDING. Po Quill Sesja 31 PASS = 7-8/10.

---

## AVERAGE: 7.1/10 (UPDATED)

(8+8+7+(6+8+6+7)/4+6+7+8+5)/8 = 56.75/8 = **7.09/10**

Original 6.94 zaktualizowany do 7.09 po weryfikacji ze PR #8 ENS Phase 2 jest merged i mint scripts sa w repo (Finding 3 zdegradowany z HIGH na MEDIUM).

## VERDICT: GO-AFTER-FIX

Submission technicznie mozliwa. P0 fixy ponizej (60-90 min total) pchaja srednia do 7.5+/10 i eliminuja credibility risk Charter #7.

---

## TOP 5 FINDINGS

### Finding 1 - VerifiedContractsBadge empty addresses (Charter #7 violation)

**Severity:** CRITICAL
**Kryterium:** E (Polish) + F (Honest mode)
**Score:** 6/10 (E), 7/10 (F)
**Problem:** `apps/web/components/landing/verified-contracts-badge.tsx` ma `address: ""` dla wszystkich 5 contracts z fallback "pending deployment" copy. README + JUDGES-ONBOARDING + PHASE4-DEPLOY-SUMMARY pokazuja deployed Basescan addresses dla 5 contracts (verified 2026-05-02). Landing UI mowi "5 contracts pending Base Sepolia deployment" gdy realnie LIVE.
**Why matters dla finalist:** Sedzia kliknie landing -> "pending" -> kliknie README -> "deployed" -> credibility damage. To jest reverse Charter #7 violation - jestesmy LEPSI niz claimujemy. Pierwszy moment kontaktu sedzia-projekt.
**Fix sugestia:** Wklej 5 deployed addresses do `VERIFIED_CONTRACTS` array (skopiuj z README sekcja Smart Contracts). Test live na aitc-pi.vercel.app.
**Effort:** 15 min (paste + test + deploy)
**Owner:** Aiko (frontend) lub Rio (deploy)

### Finding 2 - X + Telegram handles missing z README (0G hard requirement)

**Severity:** CRITICAL
**Kryterium:** D1 (0G Labs sponsor track)
**Score:** 6/10
**Problem:** README sekcja Contact ma "Telegram: @aitc_council (handle reserved post-hackathon)" + "X (Twitter): @aitc_council (handle reserved post-hackathon)". 0G qual hard requirement: "Team member names and contact info (Telegram & X)". "Reserved post-hackathon" = NIE spelnia.
**Why matters dla finalist:** 0G $15k pool wymaga handles ZANIM submission. Bez handles = ryzyko placement spadku albo dyskwalifikacji track.
**Fix sugestia:** Dan + Matthew zalozyc OSOBISTE handles X + Telegram (nie team handles), wkleic do README + ETHGlobal submission form. Albo zarezerwowac team handles realnie (Twitter @aitc_council utworzony, Telegram bot/channel).
**Effort:** 20 min (X signup + Telegram + README update + form)
**Owner:** Dan + Matthew

### Finding 3 - ENS subnames live verification submission-day (UPDATED)

**Severity:** MEDIUM (zdegradowane z HIGH po sprawdzeniu PR #8)
**Kryterium:** D2 (ENS Identity sponsor track)
**Score:** 8/10
**Problem:** PR #8 `feat/phase2-ens` MERGED z mint script + 26 deep records + verify script. Adresy deterministyczne hardcoded w `apps/web/lib/contracts.ts`. ALE submission-day live verification ze faktycznie wszystkie 26 records sa ustawione dla wszystkich 5 person Sepolia - PENDING. ENS qual mowi "Demo must be functional (no hard-coded values)" - "no hard-coded values" odnosi sie do UI fake data, nie do EOA addresses (ktore sa realnie minted).
**Why matters dla finalist:** Ghost in the Machine wygral 1st AI Agents Cannes 2026 z 30+ live records per agent. Nasz angle (26 records, deterministic EOAs, cross-chain pointer) jest competitive ALE jezeli verify zwroci puste records dla nawet jednej persony, sedzia hover -> empty -> credibility hit.
**Fix sugestia:** Sol odpalic `tsx scripts/verify-ens-mint.ts` przed demo recording. Jezeli wszystkie 5 personas zwracaja 26 records non-empty -> commit "ENS Phase 2 verified live 2026-05-03" + link Sepolia explorer. Jezeli ktora pusta -> remint na podstawie mint script (~5 min per persona).
**Effort:** 10 min verify + 5-25 min remint w razie potrzeby
**Owner:** Sol (contracts) - quick verify run

### Finding 4 - 4/5 agents return curated mocks (demo robustness)

**Severity:** HIGH
**Kryterium:** B (Technical depth) + F (Honest mode)
**Score:** 8/10 (B), 7/10 (F)
**Problem:** README sekcja "MVP scope" mowi explicite ze tylko Bull jest fully wired live z RSS+CoinGecko+DefiLlama. Bear/Risk/Tech/Sentiment zwracaja curated mock responses. Demo storyboard (Scena 5 Typewriter WOW) pokazuje 5 agentow rownolegle "live debating" z source citations - jezeli sedzia probe, transparency wymaga markera mock vs live.
**Why matters dla finalist:** Charter #7 honest communication wymaga jasnego markera "Bull live · Bear/Risk/Tech/Sentiment seeded with curated responses (Phase 4 wiring in progress)". Bez markera = sedzia widzi "5-agent debate live" claim, sprawdza, wykrywa mock = trust loss.
**Fix sugestia:** Eva script update Scena 5: voice-over dodaj jedno zdanie "Bull pulls live from RSS, CoinGecko, DefiLlama. The other four agents run on curated reasoning today, full data wiring is the next sprint." Plus UI marker w agent card "live data" vs "curated" badge.
**Effort:** 20 min (script edit + UI badge dodatek + redeploy)
**Owner:** Eva (script) + Aiko (UI badge)

### Finding 5 - FEEDBACK.md location dla Uniswap track + agent communication explicit section dla 0G

**Severity:** MEDIUM
**Kryterium:** D1 (0G) + decyzja Maxima Uniswap claim
**Score:** 6/10 (D1)
**Problem:**
- FEEDBACK.md w `docs/FEEDBACK.md`. Uniswap qual chce `/FEEDBACK.md` w root. Per SUBMISSION-CHECKLIST: "DECYZJA Maxima: czy claim Uniswap track?".
- 0G qual chce "Swarm: how agents communicate/coordinate (explicit explanation)" - architecture.md ma diagram ale brak osobnej sekcji.
**Why matters dla finalist:**
- Uniswap track $XXX pool dostepny jezeli claim + FEEDBACK root + realne Uniswap API usage. Jezeli NIE claim -> skip.
- 0G "swarm coordination" sekcja podnosi placement w 0G track z 2nd-3rd na 1st.
**Fix sugestia:**
- Maxima decision: czy claim Uniswap? Jezeli TAK - `cp docs/FEEDBACK.md FEEDBACK.md` (lub symlink) + zweryfikuj Uniswap API usage realnie. Jezeli NIE - skip.
- Nina dodaj sekcje "## Agent Communication & Coordination" do `docs/architecture.md` (5-7 zdan: WebSocket streaming, source attribution per claim broadcasted, consensus protocol, Adversarial pre-check).
**Effort:** 30 min (Maxima decision 5 min + Nina dodatki 25 min)
**Owner:** Maxima + Nina

---

## PER-CRITERION VERDICT

| Kryterium | Score | Verdict |
|-----------|-------|---------|
| A) Originality | 8/10 | GO |
| B) Technical depth | 8/10 | GO |
| C) Demo quality | 7/10 | GO-AFTER-FIX (Session 33 recording PENDING) |
| D1) 0G Labs | 6/10 | GO-AFTER-FIX (Findings 2, 5) |
| D2) ENS Identity | 8/10 | GO (verify run before recording recommended) |
| D3) ENS Creative | 6/10 | GO |
| D4) ETHGlobal Finalist | 7/10 | GO |
| E) Polish | 6/10 | GO-AFTER-FIX (Finding 1 CRITICAL) |
| F) Honest mode | 7/10 | GO-AFTER-FIX (Finding 1 CRITICAL) |
| G) Documentation | 8/10 | GO |
| H) Live demo readiness | 5/10 | GO-AFTER-FIX (Quill Sesja 31 PENDING) |

**Average:** 6.94/10
**Overall verdict:** GO-AFTER-FIX (P0 fixy 1, 2 - 35 min - przesuwaja na 7.5+/10 + eliminuja Charter #7 risk)

---

## SUGESTIE DLA PM-LEAD

### Czy spawn jeszcze cos przed submission?

**TAK, dwie szybkie sesje (60 min total):**
1. **Aiko-Quick-Fix-Badge** (15 min) - Finding 1 - paste 5 deployed addresses do VerifiedContractsBadge, redeploy. CRITICAL Charter #7.
2. **Dan-Matthew-Handles** (20 min) - Finding 2 - X + Telegram handles. CRITICAL 0G track.

**OPCJONALNIE (jezeli czas):**
3. **Eva-Script-Mock-Marker** (20 min) - Finding 4 - update voice-over Scena 5 z honest mock marker.
4. **Sol-Confirm-Phase2-ENS** (10 min check + 30 min manual mint jezeli Session 25 NIE wraps) - Finding 3.

### Czy mozna pominac jakies stretch goals i submitowac sooner?

**TAK, bezpiecznie cuts:**
- Custom Agent Test Arena (Scena 7 WOW #3) - jezeli implementacja Settings/Agents niegotowa do recording, **swap na pre-recorded clip z fallback** (FAILURE-PLAYBOOK Scena 7). Submission nie traci - WOW #3 juz #1+#2 wystarcza.
- ENS Cross-chain creative track (D3) - mozna NIE claim explicit jezeli ENS Identity (D2) wymaga vakat zasob. Skupic na D2 = wiecej shotu.
- Uniswap track (per Finding 5) - skip jezeli FEEDBACK.md realnie nie ma sponsor-relevant Uniswap usage. Saving time, focus na 0G + ENS + Finalist.

**NIE cuts:**
- Adversarial agent (Scena 6 WOW #2) - rozni nas od Goldman Stacked, kosztuje $0.008 per debate
- Demo Mode banner - Charter #7 transparency
- Source attribution - to jest unique differentiator #1 (zero matches w 17,180+)

### Czy demo quality wystarczy na finalist?

**Conditional YES.** Finalist top 20% (probability lift 80% per plan-to-submission) wykonalny po fixach P0. Top 5 live judging (35% probability) wymaga:
1. Quill Sesja 31 smoke E2E PASS na live URL
2. Eva recording bez retake hell (storyboard solid, talenty Dana wystarczajace)
3. Adversarial agent działa live podczas demo recording (NIE pre-recorded fallback)
4. Brak Anthropic rate limit hit podczas live judging

**Najwiekszy risk dla finalist:** Ghost in the Machine ENS przewaga + Alpha Dawg full 0G stack. Nasz unique differentiator (source attribution + 5-trust framework + DAO native) musi byc CRYSTAL CLEAR w pierwszych 30s demo + JUDGES-ONBOARDING.

**Prawdopodobienstwo finalist top 20%:** 75% z fixami P0, 50% bez fixow.
**Prawdopodobienstwo top 5 live:** 30% z fixami P0 + Quill PASS + recording quality, 15% bez.

---

**Vera signing off.**
"Zespol ma solidna baze i unique combo. Po fixach P0 (1h pracy) submission credibility-clean. Top 5 live mozliwe ale wymaga Quill PASS + recording bez retake. Zycze powodzenia."
