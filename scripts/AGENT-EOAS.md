# Agent EOAs - Deterministic Wallets dla AI Treasury Council

Sesja 37 (P0-2 escalation Szymona): zastapienie precompile addresses
(`0x...01-05`) realnymi deterministic EOA per agent. Te addresses sa
publiczne, recoverable i commit-safe.

## 5 publicznych addresses

| Persona   | Address                                      | ENS |
|-----------|----------------------------------------------|-----|
| bull      | `0xB058a9B7Cf900640078E4259bf603d3f0918BEeC` | `bull.aicouncil-danergy.eth` |
| bear      | `0x9C399085A223F35fec0Dae9573D42294bf43b963` | `bear.aicouncil-danergy.eth` |
| risk      | `0x1679a3cf4e167EeeD15a567e5EA33871399a59bC` | `risk.aicouncil-danergy.eth` |
| tech      | `0x87648Ab8e343cDAC4a7439f006f85A8a8f100b3d` | `tech.aicouncil-danergy.eth` |
| sentiment | `0xbD77e36F82Ad0041B021834f308065CFa5b5cB62` | `sentiment.aicouncil-danergy.eth` |

## Schemat seeda (PUBLIC)

```
seed       = "aitc-<persona>-2026-v1"
privateKey = keccak256(toHex(seed))    // 32 bajty -> valid secp256k1 priv
address    = privateKeyToAccount(privateKey).address
```

Komponenty:
- `aitc` - namespace projektu (AI Treasury Council)
- `<persona>` - jeden z `bull`, `bear`, `risk`, `tech`, `sentiment`
- `2026` - rok rotation marker
- `v1` - schema version (zmiana = nowy zestaw addresses)

## Recovery

Kazdy z dostepem do tego pliku + viem (lub equivalent) moze odtworzyc
dowolny private key:

```ts
import { keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const seed = "aitc-bull-2026-v1";          // <- patrz tabela powyzej
const pk = keccak256(toHex(seed));         // 0x... 64 hex
const account = privateKeyToAccount(pk);
console.log(account.address);              // 0xB058...BEeC
```

Reproduction: `tsx scripts/generate-agent-eoas.ts` (zwraca te same addresses).

## SECURITY

**Co JEST publiczne (commit OK):**
- Addresses (powyzej)
- Seed pattern (powyzej)
- Skrypty `scripts/lib/agent-eoas.ts`, `scripts/generate-agent-eoas.ts`
- Logika derywacji w kodzie

**Co NIGDY nie jest commit / log:**
- Raw private keys (32 bajty `0x...`)
- Mnemonic / seed phrase z BIP39 (nie uzywamy BIP39 - prosty seed string)
- `console.log(pk)` lub `structlog.info("pk=", pk)`

**Backend signing (jesli kiedys potrzebne):**
- Klucze prywatne wstrzykiwane przez env vars: `BACKEND_AGENT_BULL_PK`, ...
- Generowane lokalnie przez Dana ze seeda, wpisywane recznie do Railway
  Secrets / Vercel env vars
- Skrypt pomocniczy (do napisania jesli backend bedzie podpisywal):
  `scripts/setup-backend-keys.sh` - czyta seedy, wypisuje export'y do
  ~/.claude/aitc-secrets/ (gitignored), Dan kopiuje do Railway dashboard

**Address override (escape hatch):**
- `BACKEND_AGENT_<PERSONA>_ADDR` env var nadpisze derived address
- Uzywaj gdy zamiast EOA chcesz multisig / smart account
- `scripts/lib/agent-eoas.ts::getAgentAddress()` honoruje override

## Funding (testnet)

Zeby agenci mogli faktycznie wysylac transakcje (Phase 4 stretch -
self-sovereign agent execution), kazdy address potrzebuje testnet ETH:

- Sepolia faucet (do ENS reads): https://sepoliafaucet.com/
- Base Sepolia faucet (do AgentReputation writes): https://www.alchemy.com/faucets/base-sepolia

Rekomendowane: 0.01 ETH per address (wystarczy na ~1000 setText calls).

## Why deterministic, not random?

Random keys = jednorazowe + ryzyko zgubienia (catastrophic loss). Determi-
nistic seed pattern:
1. Pelne **reproducibility** - kazda osoba w teamie odtwarza addresses
2. **Disaster recovery** - jesli wallet pliki zniknije, regeneracja w 1s
3. **Audytowalnosc** - juror moze zweryfikowac ze addresses pochodza z
   konkretnego seeda, nie z secret stash
4. **Brak BIP39 dependency** - lzejsze toolowanie (tylko viem)

Trade-off: jesli seed pattern wycieknie + jest publiczny -> kazdy moze
odtworzyc klucze. Dlatego do PRODUKCJI / mainnet rotation: zmien `v1` na
`v2` + nowy seed string trzymany w sekrecie. Hackathon scope: testnet,
publiczny seed jest akceptowalne ryzyko (Mateusz audit potwierdz).
