---
title: AI Treasury Council - Demo Video Script
duration: 3:00 (180s hard limit ETHGlobal)
format: 1920x1080 native, 1280x720 export, MP4 H.264
audio: voice-over Dan (mowa, NIE TTS), no background music
captions: open captions burned-in, PL+EN versions
date: 2026-05-02 (Eva Sesja 22)
---

# AI Treasury Council - Demo Script (3:00)

> **Zasada Charter Eva:** hook w 5s, mowa nie TTS, show > tell (80% w aplikacji), 1-2 wow moments celowane (typewriter debate + Basescan tx live).

> **Voice-over filozofia:** spokojny ton, 140 wpm max, pauzy miedzy zdaniami. Dwie wersje per segment (Wariant A bardziej rzeczowy, Wariant B bardziej narracyjny) - Dan wybiera w nagraniu.

---

## Arc + Timing

```
Hook (0:00-0:15) - 15s - problem statement + tease
Live Demo (0:15-1:30) - 75s - submit -> debate -> vote+execute -> audit
Tech (1:30-2:30) - 60s - 5 trust mechanisms + 5 moats + sponsorzy
Close (2:30-3:00) - 30s - CTA + GitHub + names
```

---

## Hook (0:00-0:15) - 15s

**Co widac:**
- 0:00-0:05: Czarny ekran. Wielka biala statystyka pojawia się typewriterem: **"$26B TVL controlled by DAOs"**. Pod nia mniejszym fontem: "yet most decisions made by <1% of token holders". Pulsujacy amber dot pod liczba.
- 0:05-0:10: Cut na 3 quick screenshots side-by-side w grid 3-kolumnowym (każdy 1.5s):
  1. Aave forum thread "Quorum failed - 3.8% turnout"
  2. Compound proposal 289 z 4 komentarzami
  3. Wykres voting participation declining 2022-2026 (DefiLlama style)
- 0:10-0:15: Cut na CONCLAVE logo reveal animation (5 dots wokol centrum, gradient amber-green, fade-in z scale 0.8 -> 1.0 nad 0.5s) + tagline pojawia się pod logo: **"Your treasury, deliberated."**

**Voice-over PL - Wariant A (rzeczowy):**
> "Dwadzieścia sześć miliardów dolarów w skarbcach DAO. Decyduje o nich mniej niż jeden procent posiadaczy tokenów. Apatia. Brak kworum. Koncentracja władzy. DAO governance jest zepsute."

**Voice-over PL - Wariant B (narracyjny):**
> "Skarbiec wart dwadzieścia sześć miliardów dolarów. Garstka głosów decyduje o jego losie. To nie hipoteza, to stan DAO w 2026 roku. Czas dać DAO Radę."

**Voice-over PL - Wariant C (crypto-native, hacker ton):**
> "Dwadzieścia sześć miliardów dolarów. Jeden procent głosujących. Reszta śpi. DAO governance jest zepsute, a apatia kosztuje skarbce więcej niż exploity. Zbudowaliśmy Radę."

**Voice-over EN - Wariant A:**
> "Twenty six billion dollars sit in DAO treasuries. Less than one percent of token holders decide. Voter apathy. Quorum failures. Concentrated power. DAO governance is broken."

**Voice-over EN - Wariant B:**
> "A treasury worth twenty six billion dollars. A handful of votes decides its fate. This is not a hypothesis, this is DAO governance in 2026. Time to give DAOs a Council."

**Voice-over EN - Wariant C (crypto-native, hacker tone):**
> "Twenty six billion dollars. One percent voting. The rest asleep. DAO governance is broken, and apathy costs treasuries more than exploits. We built the Council."

**Cel:** zlapac uwage w 5s liczba + problem, w 10s pokazac konkretne dowody (forum, proposal), w 15s tease rozwiązanie (CONCLAVE brand).

---

## Live Demo (0:15-1:30) - 75s

### Segment A: Submit Proposal (0:15-0:35) - 20s

**Co widac:**
- 0:15-0:18: Cut na live aplikacje. Browser w trybie pelnoekranowym, dark mode, bez DevTools, bez zakladek. Header pokazuje CONCLAVE logo + "Connected: 0x4872...148a" + ENS resolution "dan.aicouncil.eth".
- 0:18-0:25: User klika "Submit Proposal". Modal otwiera się z animacja slide-up. AI parser pole tekstowe: user wpisuje (typewriter, ale szybko - 0.5s) **"Allocate 100k mUSDC to Aave v3 lending pool for 4.2% APY"**. Cursor highlight on, każdy klik podswietlony.
- 0:25-0:32: AI parser wyswietla decoded calldata Safe-style: target `0x606E...USDC.approve(0xAaveV3, 100000)` + gas estimate `~85000 gas`. Submit button amber. User klika.
- 0:32-0:35: Toast notification "Proposal PROP-042 submitted on Base Sepolia" + tx hash truncated. Stage bar przechodzi z "draft" -> "debating".

**Voice-over PL:**
> "Składam wniosek treasury: sto tysięcy USDC do Aave v3, cztery przecinek dwa procent APY. Parser dekoduje calldata. Wnioskodawca widzi dokładnie co podpisuje. Bez czarnej skrzynki."

**Voice-over EN - Wariant A (rzeczowy, default):**
> "I submit a treasury proposal: one hundred thousand USDC into Aave v3, four point two percent APY. The parser decodes the calldata. The proposer sees exactly what gets signed. No black box."

**Voice-over EN - Wariant B (developer ton):**
> "Treasury proposal in: 100k USDC into Aave v3, 4.2% APY. The parser pulls the calldata apart. You see the exact bytes you're signing. No abstract, no surprise."

**Voice-over EN - Wariant C (skeptic-friendly, trust-first):**
> "Submitting a treasury proposal: one hundred thousand USDC, Aave v3, four point two percent. Calldata decoded inline. The signer sees what hits the chain, not a wrapper. No black box, no trust me."

### Segment B: Live Debate - Typewriter Agents (0:35-1:00) - 25s

**WOW MOMENT 1.** To jest moment ktorego sedziowie nie zapomnia.

**Co widac:**
- 0:35-0:40: Cut na Live Debate Viewer. 5 agent cards w grid (Bull, Bear, Risk, Tech, Sentiment). Każdy ma circular avatar z procedural SVG (hue per persona) + ENS subname pod avatarem (`bull.aicouncil.eth`, `bear.aicouncil.eth`...). Status pod każdym: "analyzing..." z amber pulsing dot.
- 0:40-0:50: Agenci ZACZYNAJA typewriter. Najpierw Bull (typewriter ~30 chars/sec):

  > **Bull (bull.aicouncil.eth):** "Aave v3 has $11.2B TVL with 99.97% uptime over 18 months. 4.2% APY exceeds our hurdle rate of 3.8%. **Sources: [DefiLlama] [Aave Docs]** Confidence: 87%. **VOTE: FOR**"

  Source linki sa interaktywne - footnote-style [1][2] z amber underline.

- 0:50-0:55: Bear typewriter (rownolegle, ale offset 1s):

  > **Bear (bear.aicouncil.eth):** "Concentration risk: 18% of treasury in single protocol. Smart contract risk despite audits. **Sources: [Aave audit report] [Trail of Bits]** Confidence: 72%. **VOTE: AGAINST**"

- 0:55-1:00: Risk + Tech + Sentiment każdy z 1-zdaniowym argumentem + source + vote chip. Tally pasek u dolu pojawia się animowany: **3 FOR, 2 AGAINST**. Verdict card po prawej rolluje się z animacja: amber border, "PASSED with 3-2 majority, weighted reputation 4.1-2.0".

**Voice-over PL:**
> "Pięciu agentów debatuje na żywo. Bull, Bear, Risk, Tech, Sentiment. Każdy cytuje źródła. Każdy ma wagę głosu opartą o on-chain reputację. Widzisz jak myślą. To nie jest czarna skrzynka, to jest deliberacja."

**Voice-over EN:**
> "Five agents debate live. Bull, Bear, Risk, Tech, Sentiment. Each cites sources. Each has vote weight backed by on-chain reputation. You see them think. This is not a black box, this is deliberation."

### Segment C: Vote + Timelock + Execute (1:00-1:20) - 20s

**Co widac:**
- 1:00-1:05: Cut na Execute Flow. StageStrip 5 dots: collecting_sigs (active amber pulse) -> threshold_reached -> queued_timelock -> executing -> executed. SignersPanel po lewej: 5 of 7 multisig progress bar 71%. ENS subnames per signer (`alice.dao.eth`, `bob.dao.eth`...).
- 1:05-1:10: User klika "Sign multisig". MetaMask popup wyskakuje (real, nie mock), user signuje (1.5s). Progress bar 6 of 7 -> threshold reached. Cut na "Queue in Timelock" button.
- 1:10-1:15: Cut na TimelockCountdown - circular SVG 140x140 z animowanym progress ringiem. **"42h 18m remaining of 48h delay"** + ETA timestamp. To jest Sora trust mechanism #2 (window na cofniecie). Mockup demo skip do "Execute" gdy delay upłynie.
- 1:15-1:20: Cut na "Execute" button - klik. MetaMask popup, user signuje. Tx wysylany. **Cut na Basescan w nowej zakladce (real URL):** `sepolia.basescan.org/tx/0xabc...` - tx confirmed, status green checkmark, gas used 84,521. Pod tym: "Mock USDC transferred: 100,000 to Aave v3 pool".

**Voice-over PL:**
> "Pięciu z siedmiu multisig podpisuje. Timelock czterdzieści osiem godzin, okno na cofnięcie. Wykonanie on-chain. Bez pośredników."

**Voice-over EN:**
> "Five of seven multisig signers approve. Forty eight hour timelock, the window to revert. On-chain execution. No middlemen."

### Segment D: Audit Trail + 0G + ENS Resolution (1:20-1:30) - 10s

**WOW MOMENT 2.** Proves "verifiable" claim.

**Co widac:**
- 1:20-1:25: Cut na Audit Log. TopBar: "AUDIT TRAIL · 0G STORAGE · LIVE" z pulsing green dot. Lista 17 ostatnich eventow scrolluje (auto-scroll do najnowszego). Najnowszy eventy: "PROP-042 EXECUTED · 0xabc...tx · 0G CID bafy...latest". Klik na 0G CID otwiera 0G explorer w nowej zakladce.
- 1:25-1:30: Cut na ENS Identity Card. 5 subnames pod `aicouncil.eth` z live viem resolution badge "Resolved · 84ms" per name. **`bull.aicouncil.eth` -> 0x1a2b...` z text records: rep.score=87, rep.statements=142, llm=claude-sonnet-4.6**.

**Voice-over PL:**
> "Cała debata zarchiwizowana na 0G Storage. Każdy agent ma swoją tożsamość ENS. Każda decyzja audytowalna on-chain. Permanentnie."

**Voice-over EN:**
> "The full debate archived on 0G Storage. Each agent has an ENS identity. Every decision auditable on-chain. Permanently."

---

## Tech (1:30-2:30) - 60s

> **Cel:** podkreslic 5 trust mech + 5 moats + sponsor coverage. NIE slajdy statyczne - mix krotkich UI cuts + clean tech infographic dla pełnego pokrycia.

### 5 Trust Mechanisms (1:30-1:55) - 25s

**Co widac (REWRITE per Vera #7 show > tell 80%):**
- 1:30-1:55: 5 close-upow faktycznej apki (5s każdy) z overlay top-right (label + 1-zdaniowy hook). NIE statyczna infografika - pelne app cuts:
  - 1:30-1:35: Hover na claim w debate -> source popover [Reuters] + snippet + weight 0.87. Overlay: "**Source Attribution** · Every claim cited"
  - 1:35-1:40: Timelock countdown SVG full-screen pulse zoom 1.0->1.2. Overlay: "**Timelock 48h** · Window to revert"
  - 1:40-1:45: Audit log scroll z 0G CID expand pop-out. Overlay: "**0G Audit Trail** · Immutable record"
  - 1:45-1:50: ENS card resolution log table z latencjami. Overlay: "**ENS Identity** · On-chain reputation"
  - 1:50-1:55: Council Rules JSON editor live diff (key change `5` -> `10` highlighted) + multisig sign. Overlay: "**HITL Rules** · User-editable thresholds"

**Voice-over PL:**
> "Pięć mechanizmów zaufania, każdy oparty o akademicki research Mayera, Davisa i Schoormana z dziewięćdziesiątego piątego. Atrybucja źródeł. Timelock czterdzieści osiem godzin. Niezmienialny audit log na 0G. Tożsamość ENS per agent. Reguły Rady edytowalne przez DAO. Wszystko żywe na Base Sepolia."

**Voice-over EN:**
> "Five trust mechanisms, each grounded in the Mayer Davis Schoorman trust framework from nineteen ninety five. Source attribution. Forty eight hour timelock. Immutable audit log on 0G. ENS identity per agent. Council Rules editable by DAO. All live on Base Sepolia."

### 5 Moats + Sponsor Tech (1:55-2:30) - 35s

**Co widac (REWRITE - sponsor cuts rozszerzone do 7s każdy, infografika 5 moats USUNIETA - moats wymieniane w voice-over, dowody w sponsor cuts):**
- 1:55-2:30: Sponsor tech showcase, każdy 7s z cross-fade 0.3s, prawdziwy UI cut + overlay logo + tagline:
  - 1:55-2:02: **0G Storage** (Kenji) - real 0G explorer URL z naszym CID highlighted + storage stats panel. Overlay logo 0G + tagline "subcent per transcript" (zmiekczone vs $0.001 - wymaga defendable kalkulacji w FEEDBACK.md zanim nagranie)
  - 2:02-2:09: **Uniswap v4** (Hayden) - code snippet `apps/contracts/src/hooks/CouncilHook.sol` z highlighted `beforeSwap()` + `afterSwap()` (15-20 linii Solidity). Overlay logo Uniswap + tagline "Custom v4 hook"
  - 2:09-2:16: **ENS Subnames** (Nick) - NameStone dashboard z 5 mintowanymi subnames pod aicouncil.eth + text records. Overlay logo ENS + tagline "5 subnames per agent"
  - 2:16-2:23: **KeeperHub** (Luca) - Basescan tx z "From: 0xKeeperHub..." zoomed + arch diagram inset (timelock -> KeeperHub -> tx). Overlay logo KeeperHub + tagline "Automated execution"
  - 2:23-2:30: **Multi-chain ready** - small arch diagram + zoomed Base Sepolia explorer ze statystyka 4 deployments + Mainnet roadmap inset. Overlay tagline "Multi-chain ready · Q3 2026 mainnet"

**Voice-over PL:**
> "Pięć fos: świeże dane, debata wieloagentowa, wykonanie on-chain, atrybucja źródeł, dowód pracy agentów. Zbudowane na 0G Storage, hookach Uniswap v4, subnames ENS przez NameStone, automatyzacji KeeperHub. Cztery kontrakty żywe na Base Sepolia. Open source. Gotowe do pilotu."

**Voice-over EN:**
> "Five moats: data freshness, multi-agent debate, on-chain execution, source attribution, proof of work for agents. Built on 0G Storage, Uniswap v4 hooks, ENS subnames via NameStone, KeeperHub automation. Four contracts live on Base Sepolia. Open source. Pilot ready."

---

## Close (2:30-3:00) - 30s

**Co widac:**
- 2:30-2:35: Cut na hero shot - aplikacja w pełnym widoku, Live Debate w trakcie, Audit Log w prawym sidebarze, ENS subnames w headerze. Wszystko zywa, animowana.
- 2:35-2:45: Overlay text fade-in:
  - **GitHub:** `github.com/danergXx-xX/ETH-Global` (big, monospace)
  - **Demo:** `demo.aitc.app` (lub Vercel URL jezeli nie ma)
  - **Docs:** README + FEEDBACK.md links
- 2:45-2:55: Sponsor logos band (5 logos w rzedzie, kazde 1s fade): 0G | Uniswap | ENS | KeeperHub | Base. Pod tym: "Built at ETHGlobal Open Agents 2026".
- 2:55-3:00: Final card - CONCLAVE logo (large) + tagline **"Your treasury, deliberated."** + name: **Dan Otomanski** (solo founder + AI dev-team via Claude Code Opus 4.7) + ETHGlobal Open Agents 2026 logo bottom-right.

**Voice-over PL - Wariant A (rzeczowy):**
> "AI Treasury Council. Open source. Cztery kontrakty żywe na Base Sepolia. Pięciu agentów gotowych. Twoje DAO może pilotować już dziś. GitHub i demo na ekranie."

**Voice-over PL - Wariant B (narracyjny):**
> "Dwadzieścia sześć miliardów dolarów zasługuje na coś więcej niż garstkę głosów. Zasługuje na Radę. AI Treasury Council. Kod otwarty. Pilotuj z nami."

**Voice-over PL - Wariant C (crypto-native CTA):**
> "Cztery kontrakty na Base Sepolia. Pięć agentów. Open source pod adresem na ekranie. Forkuj, deployuj, pilotuj. AI Treasury Council."

**Voice-over EN - Wariant A:**
> "AI Treasury Council. Open source. Four contracts live on Base Sepolia. Five agents ready. Your DAO can pilot today. GitHub and demo on screen."

**Voice-over EN - Wariant B:**
> "Twenty six billion dollars deserves more than a handful of votes. It deserves a Council. AI Treasury Council. Open source. Pilot with us."

**Voice-over EN - Wariant C (crypto-native CTA):**
> "Four contracts on Base Sepolia. Five agents. Open source at the URL on screen. Fork it, deploy it, pilot it. AI Treasury Council."

---

## CHECKLIST - czy script trafia w wszystkie wymagania

### 5 trust mechanisms (Sora research) - WSZYSTKIE wymienione

- [x] **Source attribution** - 0:40-0:55 (debate), 1:34-1:38 (close-up popover), 1:30 (infografika)
- [x] **Timelock 48h** - 1:10-1:15 (countdown live), 1:38-1:42 (close-up), 1:30 (infografika)
- [x] **0G audit trail** - 1:20-1:25 (live), 1:42-1:46 (close-up), 2:05-2:10 (sponsor segment)
- [x] **ENS reputation** - 1:25-1:30 (live), 1:46-1:50 (close-up), 2:15-2:20 (sponsor segment)
- [x] **HITL Council Rules** - 1:50-1:55 (live edit), 1:30 (infografika)

### 5 moats - WSZYSTKIE wymienione

- [x] **Data freshness** - 1:55-2:05 (infografika)
- [x] **Multi-agent debate** - 0:35-1:00 (live + ten WHOLE moment to ten moat)
- [x] **Smart contract execution** - 1:00-1:20 (live tx Basescan)
- [x] **Source attribution** - jak wyzej
- [x] **PoW for agents** (Moat 5) - 1:55-2:05 (infografika), 1:25-1:30 (ENS card text records `rep.score`, `rep.statements`)

### Sponsor jurors - każdy ma konkretny moment

- [x] **Kenji (0G $1.5k+)** - 1:20-1:25 (audit log live), 1:42-1:46 (close-up), 2:05-2:10 (dedicated sponsor segment z explorer URL)
- [x] **Hayden (Uniswap)** - 2:10-2:15 (custom v4 hook code snippet visible)
- [x] **Nick (ENS)** - 1:25-1:30 (live ENS resolution), 1:46-1:50 (close-up), 2:15-2:20 (NameStone dashboard)
- [x] **Luca (KeeperHub)** - 1:15-1:20 (execute tx), 2:20-2:25 (KeeperHub bot address visible)
- [x] **Ben (Gensyn A2A)** - 0:35-1:00 (multi-agent debate jest dokładnie A2A communication)
- [x] **Synthesis (ETHGlobal Finalist)** - 0:35-1:00 (typewriter wow moment = originality), cały demo

### Word count check (140 wpm max)

- Hook PL: ~35 slow / 15s = 140 wpm OK
- Demo PL Segment A: ~30 slow / 20s = 90 wpm (DUŻE pauzy zostawione celowo, demo speaks for itself)
- Demo PL Segment B: ~45 slow / 25s = 108 wpm OK
- Demo PL Segment C: ~25 slow / 20s = 75 wpm OK (timelock countdown speaks)
- Demo PL Segment D: ~25 slow / 10s = 150 wpm - TIGHT, może zwolnij
- Tech PL trust mech: ~50 slow / 25s = 120 wpm OK
- Tech PL moats: ~55 slow / 35s = 94 wpm OK
- Close PL: ~25 slow / 30s = 50 wpm (overlay text speaks)

**Total PL: ~290 slow / 180s = 97 wpm - bardzo komfortowe tempo**

---

## A/B Intro test plan (Eva rule)

Nagrac obie wersje hooka (Wariant A rzeczowy + Wariant B narracyjny). Test:
- 2-3 osoby (Dan + 1-2 third party z hackathonu)
- Pytanie: "Po pierwszych 5 sekundach - chcesz ogladac dalej? Jakie pierwsze wrazenie?"
- Zwyciezca z 2/3 idzie do final cut
- Jezeli tie - Eva decyduje na podstawie pacing/audio quality

---

## Open questions / needs

- [ ] **Dan:** voice-over EN i PL nagrywany przez Dana (solo founder, first-person "I built this"). Zero TTS.
- [ ] **Maja T1 review:** finalizacja EN copy (Eva storyline + Maja precyzyjne slowa)
- [ ] **Aiko / Sol:** czy ENS subnames sa LIVE w niedziele rano (wymaga Phase 2 NameStone)? Jezeli NIE - swap na mock w segmencie D, dodac note "ENS subnames coming in Phase 2"
- [ ] **Quill manual QA:** smoke test apki przed nagraniem (proposal submit -> debate -> vote -> execute -> audit log) - bez błędów visible
- [ ] **Hugo / Lumen:** czy data layer (RSS + CoinGecko) ma swieze dane w niedziele 12:00? (data freshness moat = trzeba dzialac na zywo)
