# Post-merge checklist - Sesja 37 P0 closure

**Krytyczny gate przed demo / submission ETHGlobal Open Agents 2026.**

Ten dokument jest blocker - jesli nie wykonasz krokow po merge, ai.system_prompt_hash
+ ai.address na ENS subname'ach beda mialy STARE wartosci (placeholder hash + precompile
addresses) -> juror smell test FAIL -> dyskwalifikacja.

## Sequencja

### Krok 1: Merge PR #20 (feat/ens-deepening)

PR #20 wprowadza initial mint z 26 deep records, w tym:
- ai.system_prompt_hash = `keccak256(label).slice(0,18)` (placeholder)
- ai.address = `0x0000000000000000000000000000000000000001..005` (precompile)

Po merge: scripts/mint-ens-subnames.ts moze byc uruchomiony do mintingu na testnet.

### Krok 2: Merge PR Sesja 37 (feat/real-prompt-hash-eoa)

Wprowadza:
- scripts/update-prompt-hashes.ts (real keccak256(systemPrompt))
- scripts/update-agent-addresses.ts (real deterministic EOA)
- scripts/AGENT-EOAS.md (publiczna dokumentacja)
- update reputation_updater.py + useAgentENS.ts + verify scripts

### Krok 3: Zweryfikuj cross-language hash determinism

```bash
cd ~/repos/ai-treasury-council
python3 scripts/verify-hash-cross-language.py
```

Oczekiwany output: `PASS: wszystkie 5 hashy byte-perfect match cross-language.`
Jesli FAIL -> NIE broadcastuj. Zglos do Sol/Nova.

### Krok 4: (Jesli ENS subnames jeszcze nie zminted) Mint subnames

```bash
cd ~/repos/ai-treasury-council
npx tsx scripts/mint-ens-subnames.ts                # dry-run
ENS_OWNER_PRIVATE_KEY=0x... npx tsx scripts/mint-ens-subnames.ts --broadcast
```

Owner wallet: `0x14b97991f681D0b69074B5AD3CcC675765C276F4` (parent aicouncil-danergy.eth).
Koszt: ~0.005 ETH na 5 subnames + 26 text records.

### Krok 5: Update prompt hashes do REAL values

```bash
cd ~/repos/ai-treasury-council
npx tsx scripts/update-prompt-hashes.ts             # dry-run, pokazuje diff
ENS_OWNER_PRIVATE_KEY=0x... npx tsx scripts/update-prompt-hashes.ts --broadcast
```

5 setText transakcji (per agent). Koszt: ~0.001 ETH (~636k gas total).

### Krok 6: Update agent addresses do REAL EOA

```bash
cd ~/repos/ai-treasury-council
npx tsx scripts/update-agent-addresses.ts           # dry-run, flaguje [PRECOMPILE!]
ENS_OWNER_PRIVATE_KEY=0x... npx tsx scripts/update-agent-addresses.ts --broadcast
```

5 setText transakcji. Koszt: ~0.0003 ETH (~248k gas total).

### Krok 7: Verify on-chain state

```bash
cd ~/repos/ai-treasury-council
npx tsx scripts/verify-ens-mint.ts
```

Oczekiwane wartosci per agent:
- `ai.system_prompt_hash` = pelne 32-byte hash (0x + 64 hex), NIE 18-char placeholder
- `ai.address` = jeden z (bull `0xB058a9B7...`, bear `0x9C399085...`, risk `0x1679a3cf...`,
  tech `0x87648Ab8...`, sentiment `0xbD77e36F...`), NIE precompile

### Krok 8: Smoke test jurora

Otworz w przegladarce:
- https://sepolia.app.ens.domains/bull.aicouncil-danergy.eth
- ... (5 agentow)

Powinno wyswietlic 26 text records, w tym:
- ai.system_prompt_hash z pelnym 64-char hashem
- ai.address z real EOA (NIE 0x...01-05)

Cast call replication test (czas: 2 min):

```bash
cast call 0x8FADE66B79cC9f707aB26799354482EB93a5B7dD \
  "text(bytes32,string)(string)" \
  $(cast namehash bull.aicouncil-danergy.eth) \
  "ai.system_prompt_hash" \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

Porownaj z `python3 scripts/verify-hash-cross-language.py` (Python side, bull).
Musi byc IDENTICAL.

## Rollback procedura (jesli cos pojdzie nie tak)

ENS text records sa nadpisywalne przez parent owner (Dan). Re-run skryptow z
poprawnym `ENS_OWNER_PRIVATE_KEY` przepisze wartosci. NIE ma destrukcyjnej akcji.

## Dependencies

| Krok | Zalezy od | Czas |
|------|-----------|------|
| 1 | PR #20 review approved | - |
| 2 | PR Sesja 37 review + Mateusz/Critic/Vera PASS | - |
| 3 | Krok 2 merged | 30s |
| 4 | Krok 3 PASS + parent owner ETH > 0.01 | 5 min |
| 5 | Krok 4 zakonczony | 3 min |
| 6 | Krok 4 zakonczony (kolejnosc 5/6 nie ma znaczenia) | 2 min |
| 7 | Kroki 5+6 zakonczone | 1 min |
| 8 | Krok 7 PASS | 5 min |

**Total time post-merge: ~16 minut.**

## Owner

Dan jako parent ENS owner. Pre-merge: Sol+Nova maja PR ready. Post-merge: Dan
uruchamia broadcast scripts (ma `ENS_OWNER_PRIVATE_KEY` lokalnie).
