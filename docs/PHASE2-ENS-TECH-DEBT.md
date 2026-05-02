# Phase 2 ENS - Tech debt (defer post-sprint)

Findings z audytow Mateusz/Critic/Vera ktore nie blokuja `--broadcast`, ale warto adresowac po ETHGlobal.

## HIGH-2 (Critic): Shared agent config module - DRY violation

Duplikacja `AGENT_LABELS` + addresses miedzy:
- `scripts/mint-ens-subnames.ts:112-188`
- `scripts/update-reputation-snapshot.ts:88-94`
- `apps/web/lib/hooks/useAgentENS.ts:29-37` (FALLBACK_ADDRESSES)

Fix: wydziel `scripts/lib/agents.ts` (lub apps/web/lib/agents-config.ts z reexport).

```ts
export const AGENT_LABELS = ["bull", "bear", "risk", "tech", "sentiment"] as const;
export type AgentLabel = typeof AGENT_LABELS[number];
export const AGENT_ADDRESSES: Record<AgentLabel, Address> = { ... };
export const PARENT_ENS = "aicouncil-danergy.eth";
export const PUBLIC_RESOLVER_SEPOLIA: Address = "0x8FADE...";
export const ENS_REGISTRY: Address = "0x00000...";
```

Zen RFC potrzebny: monorepo path resolution scripts/ vs apps/web/lib/. ETA: 30 min.

Eskalacja: Atlas (tech-debt log).

## HIGH-3 (Critic): Retry/backoff + idempotency state file

`mint-ens-subnames.ts` linie 337-384: 5 agentow x 10 tx = 50 sekwencyjnych writeContract bez retry. Pierwszy fail zostawia "half-minted" state.

Fix:
1. Try/catch per agent + zapis `scripts/.mint-state.json` per label.
2. Read text records before setText, SKIP gdy juz ustawione (idempotency).
3. Exponential backoff (3 proby, 2s/4s/8s) per writeContract.

Akceptowalne dla testnet demo (re-run nadpisuje przez parent owner). Wymagane dla mainnet.

## HIGH-4 (Critic): Read-back verify po setText

Po `waitForTransactionReceipt` brak weryfikacji ze value zostalo zapisane. Charter #6 (no silent failures).

Fix: po kazdym setText -> `text(node, key)` read + assert. Tanie (read), wartosc duza.

## MED-1 (Critic): Tests for useAgentENS hook

Hook to production code w UI sedziow. Brak testow dla:
- fallback gdy getEnsAddress rzuca
- merge text records z Promise.allSettled (3/9 padnie)
- resolved flag logic

Fix: vitest + mock viem client (~30 linii). Eskalacja: Quill (regression suite).

## MED-2 (Mateusz): Alchemy Sepolia RPC dla frontendu

PublicNode default ma rate limit ~30 req/s shared. Frontend kazdego usera + 5 agentow x 9 text records = 45+ requestow per page load. Demo z panelem jurorow rownoczesnie -> 429.

Fix: Alchemy Sepolia free tier (300 req/s, 100M req/mies). Klucz w NEXT_PUBLIC_SEPOLIA_RPC_URL z domain whitelist. Fallback: publicNode.

ETA: 15 min (signup + key + env). Wymagane dla live demo.

## MED-4 (Critic): Placeholder agent addresses

`0x0000...0001`-`0x0000...0005` w mint i hook. Sedziowie sprawdza Etherscan, widza vanity placeholders.

Opcja A: deterministic dev wallets (mnemonic-derived).
Opcja B: parent wallet jako owner wszystkich subname (proste, honest).
Opcja C: zostaw + dodaj note w README "placeholder do gdy realne agent wallets".

Decision: Maxima.

## MED-5 (Critic): avgLatency pseudo-metric

`ens-identity-card.tsx:126-131` zawsze zwraca 80ms (fake). Charter #7 honest communication.

Fix: lift state up - aggregate latencyMs z hookow per agent. Wymaga refactor (rules of hooks - useAgentsENS aggregate hook lub render-prop pattern).

## MED-6 (Critic): Structured logging

`useAgentENS.ts:137` `console.warn` - w Next.js production lecisz do browser console, brak Sentry/PostHog.

Fix: Sentry integration (Rio territory). Defer.

## P3 (Vera): English ADR translation

`docs/PHASE2-ENS-DECISIONS.md` po polsku. Sedziowie ETHGlobal w 90%+ non-Polish.

Fix: tlumaczenie ADR na EN (RUNBOOK moze zostac PL - operator note). ETA: 1h. Eskalacja: Maja (copy review po tlumaczeniu).

## LOW-5 (Critic): Hardcoded balance demo data

`ens-identity-card.tsx:107-111` 1,000,000 USDC + 2.4 ETH. Dla demo OK, dodaj TODO + przeniesc do mock fixture po Phase 3.

## LOW-6 (Critic): NatSpec docstring na resolveAgentENS + useAgentENS

5-liniowy JSDoc opisujacy params/return/error behavior. ETA: 5 min.

---

**Operator pre-demo checklist (NIE tech-debt, ale priorytet):**

- [ ] Uruchom `pnpm mint-ens-subnames -- --broadcast` (P1+P2 unblocked)
- [ ] Po deploy AgentReputation z realnym debate flow: `pnpm update-reputation-snapshot -- --broadcast` (P2 Vera - inaczej demo pokazuje 5x "100")
- [ ] Hostuj `apps/web/public/avatars/{bull,bear,risk,tech,sentiment}.png` (5 plikow PNG) - inaczej GitHub raw zwroci 404
- [ ] Verify w ENS Manager: https://sepolia.app.ens.domains/bull.aicouncil-danergy.eth
- [ ] Frontend smoke: `pnpm dev` -> ENS Identity Card renderuje real records
