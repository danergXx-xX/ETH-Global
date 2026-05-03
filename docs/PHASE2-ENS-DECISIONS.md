# ADR Phase 2 ENS - decyzję architektoniczne

**Data:** 2026-05-02
**Sesja:** 25 (Sol+Aiko, branch `feat/phase2-ens`)
**Status:** Accepted

## Kontekst

Phase 2 wymaga ENS subnames dla 5 agentow z text records (reputation, persona, avatar). Owner domeny: Dan, wallet `0x14b97991f681D0b69074B5AD3CcC675765C276F4`. Domena `aicouncil-danergy.eth` zarejestrowana na **Sepolia** (testnet ENS, free). AgentReputation kontrakt - **Base Sepolia** (chain 84532, zalozenie deploy do Phase 1A wrap).

## Decyzja 1: SKIP NameStone, mintujemy DIRECT przez viem

### Co rozwazaliśmy

1. **NameStone API** (offchain L2 subnames, gasless dla uzytkownikow)
2. **DIRECT** - własny skrypt viem 2.x z `setSubnodeRecord` + `setText` na ENS Registry + PublicResolver
3. **ensjs/wallet** (`createSubname`, `setRecords`) - higher-level wrapper

### Wybrane: opcja 2 (DIRECT)

**Powod:**
- NameStone wymaga signup + API key + integracja webowa - **friction blokujacy** w sprincie 50h.
- Saldo 0.046 ETH Sepolia spokojnie pokryje 5 subname + ~45 text records (~0.005-0.015 ETH).
- DIRECT daje pełna kontrole + auditowalne tx hashes na Etherscan (sedziowie moga sprawdzic).
- ensjs zostal odrzucony bo dodaje warstwe abstrakcji której nie potrzebujemy - viem wystarcza.

**Tradeoff:**
- Tracimy: gasless UX dla agentow (gdyby chcieli sami updatowac).
- Zyskujemy: zero zewnetrznych zaleznosci, wszystko w repo, idempotentny dry-run, jeden klucz prywatny do zarzadzania.

## Decyzja 2: Cross-chain - ENS Sepolia, AgentReputation Base Sepolia

### Problem

ENS Public Resolver text records sa per-chain. Live reputation z Base Sepolia nie zaktualizuje text record na Sepolia automatycznie.

### Wybrane: HYBRID (snapshot + live read)

- **Statyczne text records** (mint czas): `name`, `description`, `avatar`, `ai.persona`, `com.twitter`, `url`, `ai.contract` (cross-chain pointer `base-sepolia:0x...`), `ai.address`.
- **`ai.reputation` jako SNAPSHOT** ustawiony na `100` przy mincie. Aktualizacja: `scripts/update-reputation-snapshot.ts` - jednorazowo przed demo (czyta z Base Sepolia, zapisuje text na Sepolia).
- **Frontend `useAgentENS`**: czyta text records z Sepolia (cache 5 min), `useReadContract` z Base Sepolia dla LIVE reputation. Snapshot widoczny w ENS Identity Card jako "snapshot at block X", live wartość renderowana w Live Debate Viewer.

**Tradeoff:**
- Tracimy: prawdziwa cross-chain identity z auto-sync. CCIP-Read (offchain resolver) byloby czystsze ale wymaga deploy custom resolver - poza scope.
- Zyskujemy: 2 godziny pracy zamiast 2 dni. Sedziowie ETHGlobal track ENS dostaja: realne subnames Sepolia + text records + wskazanie cross-chain reputation contract. To jest zgodne z patternem ERC-8004 (`agent-skills`, `agent-fees`).

## Decyzja 3: Placeholder owner addresses (0x...01 do 0x...05)

### Problem

Mintowanie subname wymaga `owner: address`. Realnych wallets per agent jeszcze nie ma (agenty AI nie posiadaja kluczy w sprincie).

### Wybrane: deterministic placeholders

`0x0000000000000000000000000000000000000001` az `...0005`. Te same wartosci uzywane w `AgentReputation` (zalozenie z Sesji 17 Hugo+Nova).

**Migracja w przyszlosci:** parent owner (`aicouncil-danergy.eth`) ma prawo `setSubnodeRecord` ponownie aby przepisac owner. Re-mint to jeden tx per subname.

## Decyzja 4: Custom keys `ai.*` zamiast `agent.*` z ERC-8004

ERC-8004 (draft) sugeruje `agent-type`, `agent-skills`, `agent-fees`. Wybralismy prefix `ai.` (`ai.persona`, `ai.reputation`, `ai.contract`, `ai.address`):
- Krotsze, czytelniejsze.
- Standard ERC-8004 jest **draft** - może się zmienić. Wewnetrzna spojnosc > zgodnosc z draftem.
- Frontend mapuje na UI bez wzgledu na klucz - prefix to detal.

Jeśli sedziowie zwroca uwage: `setText` z ERC-8004 keys to dodatkowy tx per subname (gas niski, robimy w 5 min).

## Decyzja 5: Bez forge testow dla viem script

Skrypt to one-shot ops tool, nie produkcyjny kod. Testy pokrywamy:
- **Manual dry-run** (gas estimate, plan output).
- **Sanity check sprawdza parent ownership i collision** przed broadcast.
- **viem encodeFunctionData** generuje deterministyczny calldata - testy unit dla `labelhash`/`namehash` to byloby testowanie viem (nie nasz kod).

Jeśli wracamy do tego po sprincie - dodamy `vitest` dla mock walletClient + assertion na calldata.

## Konsekwencje

### Pozytywne
- Pełna kontrola nad ENS bez external service.
- Zero kosztów operacyjnych (Sepolia free, klucz w lokalnym `.env`).
- Auditowalne dla sedziow (Etherscan tx hashes commitowane do repo po `--broadcast` w wraps).

### Negatywne / ryzyka
- **Klucz prywatny w `.env`** - Mateusz audit OBOWIĄZKOWY przed `--broadcast`. Mitigations: `.gitignore` pokrywa `.env`, gitleaks pre-commit hook, `ENS_OWNER_PRIVATE_KEY` nigdy nie w kodzie.
- **Cross-chain text records to compromise** - sedziowie ENS track moga zapytac. Odpowiedz: live read z Base Sepolia w UI, snapshot w text record jako audit anchor.
- **Placeholder ownerships** - jeśli ktos zalozy ze realne agenty maja te klucze i probowac wyslac z tych adresow - nic się nie stanie (placeholder = nikt nie posiada klucza). To NIE security risk, tylko kosmetyka.

## Linki

- ENS docs: https://docs.ens.domains
- Sepolia ENS Manager: https://sepolia.app.ens.domains
- ENS Registry (mainnet/Sepolia): `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- PublicResolver Sepolia: `0x8FADE66B79cC9f707aB26799354482EB93a5B7dD`
- AgentReputation Base Sepolia: `0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44`
- ERC-8004 draft: https://eips.ethereum.org
