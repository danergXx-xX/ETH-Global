# Production Deploy Runbook - AI Treasury Council

**Owner:** Rio (DevOps), wykonawca: Dan
**Status:** Phase 4 production deploy (sędziowie ETHGlobal)
**Cel:** Frontend na Vercel + Backend na Railway, oba live na publicznych URL

---

## TL;DR (5 min happy path - po jednorazowym setup)

```bash
# Frontend redeploy
cd apps/web && vercel --prod

# Backend redeploy
railway up --service aitc-api
```

---

## CZESC 0: Jednorazowy setup (Dan robi RAZ)

### 0.1 Konta + signupy

| Serwis | URL | Po co | Czas |
|---|---|---|---|
| Vercel | https://vercel.com/signup | Frontend hosting (free hobby tier) | 2 min |
| Railway | https://railway.com | Backend hosting ($5 free credit/mo) | 2 min |
| WalletConnect Cloud | https://cloud.reown.com | NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID dla RainbowKit | 3 min |
| Anthropic Console | https://console.anthropic.com | ANTHROPIC_API_KEY (juz masz) | - |

**WalletConnect setup:**
1. Signup -> Create new project -> "AI Treasury Council"
2. Skopiuj **Project ID** (32-znakowy hex)
3. Allowed domains: `aitc.vercel.app`, `localhost:3000`, `*.vercel.app` (preview)

### 0.2 CLI install

```bash
# Vercel CLI (Node)
npm i -g vercel
vercel --version  # >= 32

# Railway CLI (Homebrew)
brew install railway
railway --version  # >= 4
```

### 0.3 CLI login

```bash
vercel login              # otworzy browser
railway login             # otworzy browser
```

---

## CZESC A: Frontend Vercel (apps/web)

### A.1 Pierwszy deploy

```bash
cd /Users/danergy/repos/ai-treasury-council/apps/web

# Link do nowego projektu (interaktywnie)
vercel link --yes
# Wybierz scope: personal Dan
# Project name: aitc  (lub: aicouncil-treasury)
# Link to existing project: NIE (pierwszy raz)

# Output: .vercel/project.json zostanie utworzony (gitignored)
```

### A.2 Env vars produkcyjne (Vercel CLI - bez wchodzenia do dashboardu)

Skopiuj ponizszy blok i wykonaj. Wszystkie sa **PUBLIC** (NEXT_PUBLIC_*) wiec moga byc w bundle - z wyjatkiem WALLETCONNECT_PROJECT_ID ktory podasz interaktywnie:

```bash
# Frontend env vars (production scope)
vercel env add NEXT_PUBLIC_API_URL production <<< "https://aitc-api.up.railway.app"
vercel env add NEXT_PUBLIC_WS_URL production <<< "wss://aitc-api.up.railway.app/ws/debate"
vercel env add NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL production <<< "https://base-sepolia.public.blastapi.io"
vercel env add NEXT_PUBLIC_SEPOLIA_RPC_URL production <<< "https://eth-sepolia.public.blastapi.io"
vercel env add NEXT_PUBLIC_GOVERNOR_ADDRESS production <<< "0x1F95c796C5DC47d08B20cf3220a2AFa995E301f0"
vercel env add NEXT_PUBLIC_TOKEN_ADDRESS production <<< "0x5fe2a5e971D9faaff9cC0b0c9981DA44fEFC4381"
vercel env add NEXT_PUBLIC_TIMELOCK_ADDRESS production <<< "0x76a69bB6AeF69A2E76Fa6C9632FF6Ca101441b0f"
vercel env add NEXT_PUBLIC_USDC_ADDRESS production <<< "0x606EdE7755131e6206a29B67d88761EEbb3Bb59d"
vercel env add NEXT_PUBLIC_AGENT_REPUTATION_ADDRESS production <<< "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44"
vercel env add NEXT_PUBLIC_ENS_DOMAIN production <<< "aicouncil-danergy.eth"
vercel env add NEXT_PUBLIC_DEMO_MODE_ENABLED production <<< "true"

# WALLETCONNECT - interaktywnie (Dan wkleja Project ID z cloud.reown.com)
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID production
# (paste 32-hex Project ID gdy zapyta)
```

Verify: `vercel env ls`

### A.3 Production deploy

```bash
cd apps/web
vercel --prod

# Output: https://aitc.vercel.app (lub similar)
# Trzymaj URL - bedzie potrzebny do CORS w Railway (CZESC B.2)
```

### A.4 Smoke test frontend

```bash
curl -I https://aitc.vercel.app                    # 200 OK
open https://aitc.vercel.app                       # browser - dashboard 5 tab
open "https://aitc.vercel.app/?demo=fast"          # demo mode (skip timelock)
```

### A.5 Redeploy po zmianach

```bash
cd apps/web
vercel --prod                  # rebuild + redeploy z aktualnym main
```

### A.6 Rollback

```bash
vercel ls                      # lista deployments z hash
vercel rollback <deployment-url>
# LUB w dashboardzie: Deployments -> 3 dots -> Promote to Production
```

---

## CZESC B: Backend Railway (apps/api)

### B.1 Pierwszy deploy

```bash
cd /Users/danergy/repos/ai-treasury-council

# Init projekt (interaktywnie)
railway init
# Project name: aitc-api
# Wybierz: Empty project (NIE template)

# Output: .railway/config.json + plik link
```

### B.2 Env vars produkcyjne (Railway CLI)

```bash
# === SECRETS (Dan ma w 1Password / vault) ===
railway variables set ANTHROPIC_API_KEY="sk-ant-api03-..."

# Opcjonalne - bez tego reputation update graceful skip
railway variables set BACKEND_WALLET_PRIVATE_KEY="0x..."

# Opcjonalne - jesli IPFS fallback ma dzialac
railway variables set WEB3_STORAGE_TOKEN="eyJ..."
# LUB ZeroG primary
railway variables set ZEROG_PRIVATE_KEY="0x..."

# === PUBLIC config ===
railway variables set ENV="prod"
railway variables set MODEL_ID="claude-opus-4-7"
railway variables set LOG_LEVEL="INFO"
railway variables set CORS_ORIGINS='["https://aitc.vercel.app"]'

# Web3 / contracts
railway variables set BASE_SEPOLIA_RPC_URL="https://base-sepolia.public.blastapi.io"
railway variables set BASE_SEPOLIA_CHAIN_ID="84532"
railway variables set AGENT_REPUTATION_ADDRESS="0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44"

# Storage (0G primary, IPFS fallback)
railway variables set STORAGE_PROVIDER="0g"
railway variables set ZEROG_INDEXER_URL="https://indexer-storage-testnet-turbo.0g.ai"
railway variables set ZEROG_EVM_RPC_URL="https://evmrpc-testnet.0g.ai"

# WebSocket pacing (demo polish)
railway variables set DEBATE_STREAM_STEP_MS="250"
```

Verify: `railway variables`

### B.3 Generate public URL

```bash
railway domain                 # generuje aitc-api-production.up.railway.app
# Zapamietaj URL - musi pasowac do NEXT_PUBLIC_API_URL w Vercel (CZESC A.2)
```

**WAZNE:** jesli URL jest INNY niz `aitc-api.up.railway.app`, zaktualizuj w Vercel:
```bash
cd apps/web
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production <<< "https://<actual-railway-url>"
vercel env rm NEXT_PUBLIC_WS_URL production
vercel env add NEXT_PUBLIC_WS_URL production <<< "wss://<actual-railway-url>/ws/debate"
vercel --prod    # redeploy frontend z nowymi URL
```

### B.4 Deploy

```bash
cd /Users/danergy/repos/ai-treasury-council
railway up
# Build z apps/api/Dockerfile (skonfigurowany w railway.json)
# Czas: 3-5 min pierwszy build, 1-2 min kolejne (layer cache)
```

### B.5 Smoke test backend

```bash
RAILWAY_URL="https://aitc-api.up.railway.app"

curl -fsS $RAILWAY_URL/health | jq
# {"status":"ok","version":"0.1.0","timestamp":"2026-05-..."}

curl -fsS $RAILWAY_URL/api/agents/reputation/all | jq
# 5 agents z reputation 100

# WebSocket (websocat lub wscat)
brew install websocat
echo '{"text":"test proposal"}' | websocat wss://aitc-api.up.railway.app/ws/debate
```

### B.6 Logs / debug

```bash
railway logs                   # streaming z aktywnego deployment
railway logs --deployment <id> # logi historyczne
```

### B.7 Rollback

```bash
railway redeploy <previous-deployment-id>
# LUB dashboard: Deployments -> 3 dots -> Redeploy
```

---

## CZESC C: Po deploy - manual smoke test (Dan klika)

1. **Health backend:** `curl https://<railway>/health` -> 200 OK JSON
2. **Reputation API:** `curl https://<railway>/api/agents/reputation/all` -> 5 agents JSON
3. **Frontend live:** `open https://<vercel>` -> 5 tab dashboard
4. **Wallet connect:** klik "Connect Wallet" -> RainbowKit modal -> MetaMask connect
5. **Submit proposal:** wpisz tekst -> "Start Debate" -> WebSocket streaming 5 agents
6. **ENS Identity Card:** widoczne 5 agent personas (placeholder ENS jesli Phase 2 nie merged)

---

## CZESC D: Operational

### Redeploy po PR merge

GitHub Actions (jesli skonfigurowane) auto-deploy na push do `main`. Manual:

```bash
git checkout main && git pull
cd apps/web && vercel --prod
cd .. && railway up
```

### Monitoring

| Co | Gdzie | Free tier |
|---|---|---|
| Vercel deployment status | https://vercel.com/<scope>/aitc | unlimited |
| Vercel Analytics | wbudowane (Web Vitals) | 2.5k events/mo |
| Railway service status | https://railway.com/project/<id> | $5/mo credit |
| Errors (frontend) | Sentry (opcjonalne, Sesja Eva polish) | 5k errors/mo |
| Errors (backend) | Sentry SDK (juz w requirements.txt) | 5k errors/mo |

**Sentry ENABLE (jesli Dan chce):**
```bash
# Frontend
vercel env add NEXT_PUBLIC_SENTRY_DSN production <<< "https://...@sentry.io/..."
# Backend
railway variables set SENTRY_DSN_BACKEND="https://...@sentry.io/..."
```

### Cost monitoring

```bash
railway whoami              # plan + credit usage
# Vercel: dashboard -> Usage tab
```

---

## CZESC E: Disaster recovery (deploy padl 5 min przed deadlinem)

### Scenariusz 1: Vercel build broken
```bash
# Cofnij do ostatniego dzialajacego deploy
vercel rollback           # interaktywnie wybierz
```

### Scenariusz 2: Railway service crashed
```bash
railway logs | tail -100  # diagnoza
railway redeploy <last-good-deployment-id>
```

### Scenariusz 3: Wszystko padlo - fallback localhost demo
```bash
# Sedziowie: zaproszenie na call zoom + share screen
cd apps/web && pnpm dev      # :3000
cd apps/api && uvicorn main:app --reload --port 8000
# Backup demo z lokalnym MetaMask Sepolia
```

### Kontakt support
- Vercel: https://vercel.com/help (Discord faster - response <1h)
- Railway: https://railway.com/help (Discord https://discord.gg/railway)

---

## Mateusz security baseline (PRE-DEPLOY veto check)

PRZED `vercel --prod` / `railway up` - zweryfikuj:

- [ ] `git grep -i "sk-ant-"` zwraca 0 wynikow (NIGDY ANTHROPIC_API_KEY w repo)
- [ ] `git grep -E "0x[a-fA-F0-9]{64}"` zwraca tylko placeholder/test (NIGDY private key)
- [ ] `.env*` w `.gitignore` (oprocz `.env.example`)
- [ ] CORS_ORIGINS w Railway = exact Vercel URL (NIE `*`)
- [ ] WalletConnect allowed domains = tylko aitc.vercel.app + localhost (NIE `*`)
- [ ] Vercel/Railway env vars set przez CLI (NIE commit, NIE chat)

---

## Status: ready

Po wykonaniu CZESC 0 (jednorazowo) -> CZESC A + B (deploy) -> CZESC C (smoke) - sędziowie ETHGlobal moga przeklikac.
