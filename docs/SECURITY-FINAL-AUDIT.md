# SECURITY FINAL AUDIT — AI Treasury Council

**Auditor:** Mateusz (Bezpiecznik systemu)
**Data:** 2026-05-03
**Sesja:** MATEUSZ-FINAL-SECURITY-AUDIT
**Branch:** main (HEAD up-to-date)
**Scope:** End-to-end pre-submission audit (READ-ONLY, no code changes)
**Model:** Opus 4.7

---

## VERDICT: **GO**

Brak findings na poziomie CRITICAL. 2 HIGH (oba acceptable risk dla hackathon scope, juz w backlog post-sprint), 4 MEDIUM (post-submission), 4 LOW (deferred). System gotowy do submission.

---

## Komponenty audited

| Komponent | Zakres | Wynik |
|---|---|---|
| Smart contracts (4) | CouncilToken, AICouncilGovernor, AgentReputation, MockUSDC + Deploy.s.sol | PASS |
| Backend (FastAPI) | main.py, middleware/ws_cap, services/cache, services/custom_agent_service, agents/_runner, agents/anthropic_client, schemas validation, routers/* | PASS |
| Frontend (Next.js 16) | wagmi-config, i18n, localStorage usage, CSP/headers (vercel.json), XSS surface (grep: zero hits na unsafe HTML render APIs) | PASS |
| Custom agent (Wave 2-A) | sanitize_system_prompt, schemas Pydantic limits, sandbox arena | PASS |
| Sekrety | .env.example placeholders, .gitignore coverage, gitleaks history scan (221 commits, 0 leaks) | PASS |
| CI/CD | .github/workflows/ci.yml + gitleaks-action | PASS |

---

## Findings

### CRITICAL — 0

Brak. System nie wymaga zmiany kodu przed submission.

---

### HIGH — 2

#### H-1 — Deployer EOA holds 100% voting power on CouncilToken
- **Component:** `contracts/src/CouncilToken.sol:16-22` + `contracts/script/Deploy.s.sol:27,33-39`
- **Vulnerability:** `CouncilToken` mints all 5 tokens to `initialHolder` (deployer EOA) and self-delegates. Deployer wallet = 100% governance voting power. Single key compromise = full Governor takeover (queue + execute treasury actions po 48h timelock).
- **Exploit scenario:** Atak na deployer key (phishing, leaked .env, malicious dependency). Po 48h timelock atakujacy moglby drainowac mUSDC z Timelock treasury (1M mUSDC).
- **Mitigation in place:** 48h timelock daje DAO veto window (jesli ktos monitoruje on-chain). Jest mUSDC mock - real fund impact = 0.
- **Recommendation:** Post-submission: rotate deployer key, transfer 5x AICT do dedicated 5-signer multisig (1 per persona) lub do separate per-persona EOA z hardware wallet protection.
- **Severity:** HIGH (centralization), ALE acceptable risk dla hackathon (testnet, mock USDC).
- **Effort:** 30 min (post-sprint task #12 already in backlog)
- **Owner:** Sol / DevOps (post-sprint)
- **Status:** ACCEPTED RISK (do submission), TO FIX (post-sprint, juz w task #12)

#### H-2 — AgentReputation Owner can reassign authorizedUpdater (centralization)
- **Component:** `contracts/src/AgentReputation.sol:11,75,119-126`
- **Vulnerability:** `Ownable(msg.sender)` deployer + `transferAuthorization(newUpdater)` onlyOwner. Owner moze przejac kontrole nad `updateReputation` przepisujac authorizedUpdater na kontrolowany adres -> dowolnie inflate/deflate reputation kazdego agenta.
- **Exploit scenario:** Compromised deployer key -> przejecie reputation oracle -> sztuczna inflacja "trusted" agenta -> potencjalne wprowadzenie agenta z high rep do production council.
- **Mitigation in place:** Modifier `onlyAuthorized`, `ReputationUnderflow` guard, events na kazda zmiane (audit trail). Sama `reputation` mapping nie jest direct-writable nawet przez Ownera.
- **Recommendation:** Post-submission: `renounceOwnership()` po deploy, lub transfer Ownership na multisig. Backend wallet rotation (jak deployer key).
- **Severity:** HIGH (governance), ALE testnet + zaplanowana rotacja kluczy w task #12.
- **Effort:** 15 min (1 transaction `renounceOwnership` lub `transferOwnership` na multisig)
- **Owner:** Sol / DevOps (post-sprint)
- **Status:** ACCEPTED RISK (do submission), TO FIX (post-sprint, task #12)

---

### MEDIUM — 4

#### M-1 — Brak Content-Security-Policy header
- **Component:** `apps/web/vercel.json:11-19`
- **Vulnerability:** Headers ustawione: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy. Brak `Content-Security-Policy` -> w razie XSS injection brak defense-in-depth.
- **Exploit scenario:** Hipotetyczna luka XSS w deps RainbowKit/wagmi/shadcn ladujaca external script. CSP zablokowalby `script-src` poza self/whitelist.
- **Mitigation in place:** Brak unsafe HTML render APIs w kodzie (grep PASS). i18n bundles renderowane przez React `{t(key)}` (auto-escape).
- **Fix sugestia:**
  ```
  { "key": "Content-Security-Policy",
    "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.base.org https://*.publicnode.com https://*.tenderly.co https://1rpc.io wss: https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'" }
  ```
- **Effort:** 10 min (1 plik, test build)
- **Owner:** Aiko / DevOps
- **Status:** TO FIX (post-submission backlog, nie blocker)

#### M-2 — Jailbreak filter regex-based (bypassable encoding/homoglyph)
- **Component:** `apps/api/services/custom_agent_service.py:37-53,60-74`
- **Vulnerability:** Lista regex (`ignore instructions`, `system prompt`, `act as`, `<|...|>`, `base64`, html tags) lapie obvious cases. Bypass: unicode homoglyphs, zero-width chars, base64 obfuscation, multi-language (`zignoruj instrukcje`).
- **Exploit scenario:** Malicious `system_prompt` w POST `/api/agents/custom` -> arena uruchamia mock decision (deterministic hash, BEZ LLM call wg `_run_mock_arena`). Real impact = 0 dopoki arena pozostaje mockiem. Po przejsciu na real LLM (post-hackathon) ryzyko wzrasta.
- **Mitigation in place:** (1) Test Arena sandbox=True nie ma side-effects on-chain ani 0G. (2) `awaiting_multisig` status - human gate przed activation. (3) Server-side `sanitize_system_prompt` + Pydantic `min_length=20, max_length=2000`. (4) `slowapi` rate limit 10/min per IP.
- **Fix sugestia (post-hackathon, gdy arena = real LLM):** dodaj normalizacje NFKC, strip zero-width chars, denylist multilingual terms, plus output-side guard (filtr na wynik LLM). Albo lepsze: embedding-based classifier.
- **Effort:** 60 min (regex hardening) lub 4h (classifier approach)
- **Owner:** Hugo + Nova (post-sprint)
- **Status:** ACCEPTED RISK (mock arena, no live LLM)

#### M-3 — WebSocket budget amplification surface
- **Component:** `apps/api/main.py:184-204,305-392` + `middleware/budget_tracker.py`
- **Vulnerability:** Atakujacy moze wysylac 10 debate/min per IP (slowapi limit), kazdy debate = 5 personas x ~2k tokens output = realny Anthropic spend. Wiele IP = scaled cost. Mitigacja: `BUDGET_USD_DAILY=50` z `BUDGET_HALT_FRACTION=0.80` halts po $40/dzien.
- **Exploit scenario:** Distributed attack rotating IP -> burn dziennego budzetu API. Po halt: kazdy `/api/debate` zwraca 503. Demo blocked.
- **Mitigation in place:** rate limit 10/min/IP, budget halt at 80%, WS_MAX_CONCURRENT=30, schemat input `min_length=10, max_length=2000`.
- **Fix sugestia:** Cloudflare/Vercel edge rate limiting per ASN/country, plus auth gate (signature challenge) dla `/api/debate` endpoint.
- **Effort:** 2h (Vercel rate limit) lub 4h (wallet signature gate)
- **Owner:** Rio (DevOps) + Hugo
- **Status:** TO FIX (post-submission backlog)

#### M-4 — CORS_ORIGINS prod runtime check (deployment hygiene)
- **Component:** `apps/api/config.py:18` + `apps/api/main.py:132-137` + `scripts/PRODUCTION-DEPLOY-RUNBOOK.md:198,359`
- **Vulnerability:** Domyslny `cors_origins=["http://localhost:3000"]`. Jesli Railway env var `CORS_ORIGINS` nie jest ustawiony na produkcji (`["https://aitc-pi.vercel.app"]`), prod backend nie obsluzy frontu z Vercel. Runbook prescribe correct setup, ale nie ma asserta runtime.
- **Exploit scenario:** Brak - to deployment risk (functional break), nie security exploit. Default IS safe (whitelist localhost) - nie ma `*` ani wildcard.
- **Mitigation in place:** Runbook checklist, `numReplicas=1`, `allow_methods=["GET","POST","OPTIONS"]` (no `*`).
- **Fix sugestia:** W `lifespan` startup: `if settings.env == "prod" and "localhost" in str(settings.cors_origins): log.error("PROD_CORS_MISCONFIGURED"); raise SystemExit(1)`.
- **Effort:** 10 min
- **Owner:** Hugo / Rio
- **Status:** TO FIX (post-submission, low urgency - manual runbook check sufficient)

---

### LOW — 4

#### L-1 — gitleaks finds in apps/web/.next/ build artifacts (NOT git-tracked)
- **Component:** `apps/web/.next/static/chunks/*.js` (20 findings)
- **Analysis:** `.gitignore` linia 1: `.next/` -> nie tracked. `git ls-files apps/web/.next` zwraca 0 plikow. `gitleaks detect --source .` (z .git) na 221 commits = **0 leaks**. False positives w build artifact (RainbowKit default project ID + library bundles).
- **Exploit scenario:** Brak (artifact tylko lokalnie / w Vercel build, nie w GitHub repo).
- **Recommendation:** Po przelaczeniu repo na PUBLIC: weryfikacja `git ls-files | grep -E ".next/|\.env$"` = puste. Jest.
- **Effort:** 0 (juz OK)
- **Status:** FALSE POSITIVE

#### L-2 — MockUSDC public mint (by design, testnet only)
- **Component:** `contracts/src/MockUSDC.sol:18-20`
- **Vulnerability:** `mint(to, amount)` external bez access control. Anyone can mint dowolne kwoty mUSDC.
- **Exploit scenario:** Brak - intentional dla testnet faucet behavior. Token nazywa sie "Mock USDC" i jest na Base Sepolia.
- **Recommendation:** Dodac w README: "MockUSDC is a TESTNET ONLY mock with public mint. Never deploy to mainnet."
- **Effort:** 5 min (Nina)
- **Owner:** Nina (docs)
- **Status:** ACCEPTED RISK (by design)

#### L-3 — Anthropic API key in env, never logged (verification PASS)
- **Component:** `apps/api/agents/anthropic_client.py:68-70,134-143`
- **Analysis:** Klucz `os.environ.get("ANTHROPIC_API_KEY")` - nie wystepuje w logach (sprawdzono `log.info("anthropic_call",...)` -> tylko model, tokens, cost, latency). Schemas error responses zwracaja "Debate orchestration unavailable" (main.py:211) - brak trace exposure.
- **Status:** PASS (verification confirmation, no action needed)

#### L-4 — Pydantic validation strict everywhere (verification PASS)
- **Component:** `apps/api/schemas.py` (lines 26,35,46,47,61,95,201,234,246,255,268,302,311,456-463)
- **Analysis:** `min_length`, `max_length`, `pattern=^0x[a-fA-F0-9]{40}$` na addresach, `pattern=^\d+$` na uint256 strings, `ge/le` na floats. `proposal_text` 10..2000 chars, `system_prompt` 20..2000 chars. WebSocket `_validate_proposal_id` dodatkowo bound length 128, alphanum+`-_`.
- **Status:** PASS

---

## Postsprint backlog (juz zatwierdzone)

| ID | Action | Owner | Priority |
|---|---|---|---|
| #12 | Rotate ANTHROPIC_API_KEY + deployer wallet (transfer ownership AgentReputation, redistribute CouncilToken) | DevOps + Sol | P1 |
| M-1 | Add CSP header w vercel.json | Aiko | P2 |
| M-2 | Hardening jailbreak filter (NFKC, multilang, classifier) | Hugo + Nova | P2 |
| M-3 | Edge rate limiting + auth gate na /api/debate | Rio | P2 |
| M-4 | Runtime assert prod CORS configured | Hugo | P3 |

---

## Submission checklist (security)

- [x] Brak hardcoded secrets w `.env.example` (placeholders only)
- [x] `.gitignore` pokrywa `.env`, `.env.*`, `*.key`, `keystore/`, `**/deployer.key`, `secrets/`, `.next/`, `venv/`
- [x] gitleaks history scan: 221 commits, **0 leaks**
- [x] CI workflow uses `secrets.GITHUB_TOKEN` (not committed)
- [x] gitleaks-action active na PR/push
- [x] Smart contracts: deployer revokes Timelock DEFAULT_ADMIN_ROLE post-deploy (Deploy.s.sol:57)
- [x] Smart contracts: Governor + Timelock 48h delay (Deploy.s.sol:14)
- [x] Smart contracts: brak `selfdestruct`, `delegatecall`, `tx.origin`, custom `mint` w prod tokens
- [x] Backend: parametryzowane query (SQLAlchemy 2.0 async, repos w db/repositories/)
- [x] Backend: brak SQL string interpolation, brak `eval/exec`, brak `subprocess` na user input
- [x] Backend: rate limit slowapi 10/min na `/api/debate` + `/api/agents/custom`
- [x] Backend: WS rate limit 10/min/IP + WS_MAX_CONCURRENT=30
- [x] Backend: budget halt 80% utilization
- [x] Backend: COUNCIL_RULES treats proposal+sources as untrusted DATA (prompt injection guard)
- [x] Backend: Pydantic v2 strict validation z bounds na wszystkich publicznych endpointach
- [x] Backend: error messages nie ujawniaja paths/internals
- [x] Backend: structured logging (structlog) bez secret values
- [x] Frontend: brak unsafe HTML render APIs (zero matches w grep)
- [x] Frontend: `localStorage` zawiera tylko `locale` + `onboarding`/`demo-banner` flagi (no PII, no keys)
- [x] Frontend: WalletConnect projectId public (by design)
- [x] Frontend: RPC URLs - tylko publiczne endpointy (`sepolia.base.org`, publicnode, tenderly, 1rpc), brak embedded API keys
- [x] Frontend: vercel.json security headers (X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) - **brak CSP** (M-1, post-submission)
- [x] Custom agent: server-side `sanitize_system_prompt`, max 2000 chars, jailbreak regex blocklist
- [x] Custom agent: Test Arena = sandbox=True, deterministic mock (no LLM call), no on-chain side effects
- [x] Submission readiness: contracts addresses w deployments artifact, README/docs bez API keys

---

**Verdict: GO. Submission cleared from security perspective.**
