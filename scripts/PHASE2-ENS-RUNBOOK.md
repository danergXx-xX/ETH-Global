# Phase 2 ENS - Runbook (mint subnames + reputation snapshot)

Domena: **aicouncil-danergy.eth** (Sepolia, owner wallet `0x14b97991f681D0b69074B5AD3CcC675765C276F4`).
Strategia: DIRECT przez viem (bez NameStone). Zobacz `docs/PHASE2-ENS-DECISIONS.md`.

## 0. Sanity check

```bash
node --version   # v20+
pnpm --version   # 9+
```

## 1. Instalacja zaleznosci

W root repo (worktree `feat/phase2-ens`):

```bash
cd /Users/danergy/repos/ai-treasury-council-phase2-ens
pnpm install
```

Doinstaluje `viem` + `tsx` (zadeklarowane w `package.json` jako devDependencies).

## 2. Konfiguracja klucza

W `.env` w root repo (`.gitignore` juz pokrywa - NIE commituj):

```
ENS_OWNER_PRIVATE_KEY=0x<64 hex znakow klucza wallet 0x14b9...76F4>
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

Eksport do shell przed uruchomieniem:

```bash
set -a && source .env && set +a
```

Lub jednorazowo:

```bash
ENS_OWNER_PRIVATE_KEY=0x... pnpm mint-ens-subnames
```

## 3. Dry-run

```bash
pnpm mint-ens-subnames
```

Output (sprawdz):
- Parent owner = `0x14b97991f681D0b69074B5AD3CcC675765C276F4`
- 5 subnames z text records
- Gas estimate sensowny (~80-150k per subname + per text record)

## 4. Live broadcast

```bash
pnpm mint-ens-subnames -- --broadcast
```

Spodziewany koszt: **~0.005-0.015 ETH Sepolia** (5 subname * setSubnodeRecord + 5 * 9 text records * setText).

Saldo wallet: `cast balance 0x14b97991f681D0b69074B5AD3CcC675765C276F4 --rpc-url $SEPOLIA_RPC_URL` (wymaga foundry).

Skrypt loguje per-tx etherscan link. Czeka na `waitForTransactionReceipt` po kazdym wpisie - jesli zawiesi sie na rate-limicie publicznego RPC, podaj wlasny (Alchemy/Infura).

## 5. Weryfikacja

ENS Manager:
- https://sepolia.app.ens.domains/bull.aicouncil-danergy.eth
- https://sepolia.app.ens.domains/bear.aicouncil-danergy.eth
- https://sepolia.app.ens.domains/risk.aicouncil-danergy.eth
- https://sepolia.app.ens.domains/tech.aicouncil-danergy.eth
- https://sepolia.app.ens.domains/sentiment.aicouncil-danergy.eth

Sprawdz: kazda strona pokazuje text records (name, description, avatar, ai.persona, ai.reputation, ai.contract, ai.address, com.twitter, url).

Programowo (viem):

```typescript
const value = await publicClient.readContract({
  address: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
  abi: [/* setText/text fragment */],
  functionName: "text",
  args: [namehash("bull.aicouncil-danergy.eth"), "ai.persona"],
});
// "bull"
```

## 6. Snapshot reputation (stretch, raz przed demo)

Po deploy AgentReputation na Base Sepolia (`0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44`):

```bash
pnpm update-reputation-snapshot                 # dry-run, czyta wartosci
pnpm update-reputation-snapshot -- --broadcast  # zapisuje ai.reputation w ENS text
```

UI nadal czyta live z Base Sepolia (`useReadContract` z AgentReputation.getReputation). Snapshot to dodatkowe data dla audytu i ENS profile viewers.

## 7. Frontend (po PR #2 wagmi-ui merge)

`apps/web/lib/hooks/useAgentENS.ts` przelaczony z mock na real (CZESC B sesji). Wymaga env w `apps/web/.env.local`:

```
NEXT_PUBLIC_ENS_DOMAIN=aicouncil-danergy.eth
NEXT_PUBLIC_ENS_NETWORK=sepolia
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

Test: `pnpm dev` -> otworz ENS Identity Card -> sprawdz ze renderuje real text records (nie mock).

## 8. Troubleshooting

| Problem | Co zrobic |
|---|---|
| `Parent ... nie ma ownera` | Domena nie jest na Sepolia ENS Registry. Zarejestruj na app.ens.domains z przelacznikiem na Sepolia. |
| `Wallet ... nie jest ownerem` | Klucz w env nie pasuje do ownera domeny. Sprawdz adres przez `cast wallet address $ENS_OWNER_PRIVATE_KEY`. |
| `insufficient funds` | Wallet ma <0.01 ETH Sepolia. Faucet: https://www.alchemy.com/faucets/ethereum-sepolia. |
| RPC rate limit / hang | Zmien `SEPOLIA_RPC_URL` na Alchemy / Infura. |
| Text record nie pokazuje sie w ENS Manager | Manager cachuje. Po ~1 min refresh. Lub czytaj bezposrednio z PublicResolver. |

## 9. Rollback

ENS subnames sa odwracalne (parent owner moze przepisac owner subnode na 0x0 lub wyczyscic resolver). Skrypt rollback nie jest wbudowany - manualnie przez ENS Manager UI lub `setSubnodeRecord(parentNode, label, 0x0, 0x0, 0)`.
