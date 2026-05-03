# Submission Checklist - ETHGlobal Open Agents 2026

**Source:** ethglobal-skills sponsor docs (live API, Sesja 34) cross-checked z naszym repo state.
**Deadline:** Niedz 2026-05-03 18:00 PL (target submit 17:00 PL z 1h buforem).

Format: per sponsor track + general ETHGlobal submission. Status: OK / PENDING / NIE CLAIM / CRITICAL.

---

## Tracks ktore CLAIMUJEMY

### 0G - "Best Autonomous Agents, Swarms & iNFT Innovations"

| Wymaganie | Status | Owner | Deadline |
|---|---|---|---|
| Project name + short description | OK | - | - |
| Contract deployment addresses | OK (5 contracts Base Sepolia) | - | - |
| Public GitHub repo (README + setup) | OK | Nina | - |
| Demo video pod 3 min (180s) | PENDING | Eva | Niedz rano |
| Live demo link | PENDING | Rio (deploy demo.aitc.app) | Niedz rano |
| Protocol features/SDKs explained | OK (`apps/api/storage/zerog.py`) | - | - |
| Team contact (Telegram & X) | CRITICAL | Dan (solo founder) | Niedz przed 17:00 |
| Swarm: how agents communicate/coordinate (explicit explanation) | PENDING | Nina | Sob noc |
| iNFT minted (jesli claim track iNFT) | NIE CLAIM | - | - |
| Architecture diagram | OK (Mermaid w architecture.md) | - | - |

### ENS - "Best ENS Integration for AI Agents"

| Wymaganie | Status | Owner | Deadline |
|---|---|---|---|
| ENS robi real work (resolve/metadata/gating) | PARTIAL | Sol | - |
| Functional demo (NO hard-coded values) | **CRITICAL: STUB** | Maxima decision | Sob noc |
| Video / live demo link | PENDING | Eva | Niedz |

**KRYTYCZNE:** mock data w frontend = realne ryzyko dyskwalifikacji. Decyzja:
- A) Manual mint 5 subnames + text records (~30 min) - NAJTANSZE
- B) Honest fallback: NIE claim ENS prize (skip)
- C) Full NameStone integration LIVE (ryzykowne pod presja)

### ETHGlobal Finalist (cross-track top-prize)

Brak osobnego sponsora "Synthesis Finalist" w Open Agents 2026. To top-level ETHGlobal Finalist.

| Wymaganie | Status |
|---|---|
| Wszystkie sponsor track requirements (jesli claim multi) | per track |
| Honest scope w README ("What is NOT in the demo") | OK |
| Architecture quality / novelty | OK (5-trust framework) |
| Live demo + video | PENDING |

---

## Tracks ktore NIE CLAIMUJEMY

| Track | Powod |
|---|---|
| **Uniswap Foundation** ("Best Uniswap API integration") | **DECYZJA Maxima:** czy claim? Wymaga FEEDBACK.md w `/FEEDBACK.md` (root, nie /docs/). Mamy `docs/FEEDBACK.md`. Action: jesli claim - przeniesc/symlink. |
| **Gensyn** (AXL) | NIE integrowalismy AXL P2P |
| **KeeperHub** (main + feedback bounty $250) | NIE integrowalismy KeeperHub MCP/CLI |

**Maxima decision:** czy claim Uniswap track?
- TAK: musimy ruszyc FEEDBACK.md i miec realne use of Uniswap API w agencie. Sprawdzic czy ktos z agentow uzywa Uniswap (Bull?).
- NIE: skip, focus na 0G + ENS + Finalist.

---

## General ETHGlobal submission requirements

| Wymaganie | Status | Owner |
|---|---|---|
| Public GitHub repo | OK | - |
| README with setup | OK | Nina |
| Architecture diagram | OK | - |
| Demo video (3 min max) | PENDING | Eva |
| Live demo URL | PENDING | Rio |
| Team info (names + contacts incl Telegram + X) | CRITICAL pending | Dan |
| Polish language compliance / accessible UX | OK (bilingual) | Aiko |
| All contracts verified on testnet | OK (Base Sepolia 84532) | Sol |
| Test coverage report | OK (141 tests) | Quill |

---

## Action Items priorytet (P0-P2)

### P0 (do submission MUSI byc)
1. Eva final video <180s + caption check
2. Rio deploy demo.aitc.app + smoke test (live demo URL must work)
3. Dan Telegram + X handles do README + ETHGlobal form (solo founder)
4. Maxima decision on ENS demo: A/B/C (z COMPETITIVE-ANALYSIS.md sekcja ENS)
5. Maxima decision on Uniswap track: claim TAK/NIE (-> FEEDBACK.md location)
6. Final smoke test: 0G CID resolves on explorer (jesli down -> dokumentowac IPFS fallback)

### P1 (sterowne, mozna pominac)
1. Nina dodaj sekcje "Agent communication & coordination" w architecture.md (0G qual)
2. Eva dodaj 1-line elevator differentiator w demo voiceover (CQ-1 z COMPETITIVE-ADDENDUM)
3. Maja krotka aktualizacja README z Top 3 differentiators (jesli juz nie ma)

### P2 (nice-to-have)
1. KeeperHub Builder Feedback Bounty $250 - tylko jesli ktos faktycznie probowal integrate (honest feedback)

---

## Reference: ethglobal-skills queries (Sesja 34)

Patrz `COMPETITIVE-ANALYSIS.md` aneks. 13 queries, 0 mock/placeholder. Skill v1.0.0.
