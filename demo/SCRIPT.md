---
title: AI Treasury Council - Demo Video Script
duration: 3:00 (180s hard limit ETHGlobal)
format: 1920x1080 native, 1280x720 export, MP4 H.264
audio: voice-over Dan lub Matthew (mowa, NIE TTS), no background music
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
- 0:00-0:05: Czarny ekran. Wielka biala statystyka pojawia sie typewriterem: **"$26B TVL controlled by DAOs"**. Pod nia mniejszym fontem: "yet most decisions made by <1% of token holders". Pulsujacy amber dot pod liczba.
- 0:05-0:10: Cut na 3 quick screenshots side-by-side w grid 3-kolumnowym (kazdy 1.5s):
  1. Aave forum thread "Quorum failed - 3.8% turnout"
  2. Compound proposal 289 z 4 komentarzami
  3. Wykres voting participation declining 2022-2026 (DefiLlama style)
- 0:10-0:15: Cut na CONCLAVE logo reveal animation (5 dots wokol centrum, gradient amber-green, fade-in z scale 0.8 -> 1.0 nad 0.5s) + tagline pojawia sie pod logo: **"Your treasury, deliberated."**

**Voice-over PL - Wariant A (rzeczowy):**
> "Dwadziescia szesc miliardow dolarow w skarbcach DAO. A wiekszosc decyzji podejmuje mniej niz jeden procent posiadaczy tokenow. Apatia, brak kworum, koncentracja wladzy. Czas to zmienic."

**Voice-over PL - Wariant B (narracyjny):**
> "Wyobraz sobie skarbiec wart dwadziescia szesc miliardow dolarow. A teraz wyobraz sobie, ze decyduje o nim garstka ludzi. To nie jest hipoteza. To jest stan DAO w 2026 roku."

**Voice-over EN - Wariant A:**
> "Twenty six billion dollars sit in DAO treasuries. Yet most decisions are made by less than one percent of token holders. Voter apathy. Quorum failures. Concentrated power. We can do better."

**Voice-over EN - Wariant B:**
> "Imagine a treasury worth twenty six billion dollars. Now imagine that fewer than one percent of token holders decide its fate. This is not a hypothesis. This is the state of DAO governance in 2026."

**Cel:** zlapac uwage w 5s liczba + problem, w 10s pokazac konkretne dowody (forum, proposal), w 15s tease rozwiazanie (CONCLAVE brand).

---

## Live Demo (0:15-1:30) - 75s

### Segment A: Submit Proposal (0:15-0:35) - 20s

**Co widac:**
- 0:15-0:18: Cut na live aplikacje. Browser w trybie pelnoekranowym, dark mode, bez DevTools, bez zakladek. Header pokazuje CONCLAVE logo + "Connected: 0x4872...148a" + ENS resolution "dan.aicouncil.eth".
- 0:18-0:25: User klika "Submit Proposal". Modal otwiera sie z animacja slide-up. AI parser pole tekstowe: user wpisuje (typewriter, ale szybko - 0.5s) **"Allocate 100k mUSDC to Aave v3 lending pool for 4.2% APY"**. Cursor highlight on, kazdy klik podswietlony.
- 0:25-0:32: AI parser wyswietla decoded calldata Safe-style: target `0x606E...USDC.approve(0xAaveV3, 100000)` + gas estimate `~85000 gas`. Submit button amber. User klika.
- 0:32-0:35: Toast notification "Proposal PROP-042 submitted on Base Sepolia" + tx hash truncated. Stage bar przechodzi z "draft" -> "debating".

**Voice-over PL:**
> "Submituje wniosek treasury: alokuj sto tysiecy USDC do Aave v3. AI parser dekoduje calldata. Wnioskodawca widzi DOKLADNIE co podpisuje. Bez black-boxa."

**Voice-over EN:**
> "I submit a treasury proposal: allocate one hundred thousand USDC to Aave v3. The AI parser decodes calldata. The proposer sees EXACTLY what gets signed. No black box."

### Segment B: Live Debate - Typewriter Agents (0:35-1:00) - 25s

**WOW MOMENT 1.** To jest moment ktorego sedziowie nie zapomnia.

**Co widac:**
- 0:35-0:40: Cut na Live Debate Viewer. 5 agent cards w grid (Bull, Bear, Risk, Tech, Sentiment). Kazdy ma circular avatar z procedural SVG (hue per persona) + ENS subname pod avatarem (`bull.aicouncil.eth`, `bear.aicouncil.eth`...). Status pod kazdym: "analyzing..." z amber pulsing dot.
- 0:40-0:50: Agenci ZACZYNAJA typewriter. Najpierw Bull (typewriter ~30 chars/sec):

  > **Bull (bull.aicouncil.eth):** "Aave v3 has $11.2B TVL with 99.97% uptime over 18 months. 4.2% APY exceeds our hurdle rate of 3.8%. **Sources: [DefiLlama] [Aave Docs]** Confidence: 87%. **VOTE: FOR**"

  Source linki sa interaktywne - footnote-style [1][2] z amber underline.

- 0:50-0:55: Bear typewriter (rownolegle, ale offset 1s):

  > **Bear (bear.aicouncil.eth):** "Concentration risk: 18% of treasury in single protocol. Smart contract risk despite audits. **Sources: [Aave audit report] [Trail of Bits]** Confidence: 72%. **VOTE: AGAINST**"

- 0:55-1:00: Risk + Tech + Sentiment kazdy z 1-zdaniowym argumentem + source + vote chip. Tally pasek u dolu pojawia sie animowany: **3 FOR, 2 AGAINST**. Verdict card po prawej rolluje sie z animacja: amber border, "PASSED with 3-2 majority, weighted reputation 4.1-2.0".

**Voice-over PL:**
> "Piecu wyspecjalizowanych agentow debatuje na zywo. Bull, Bear, Risk, Tech, Sentiment. Kazdy cytuje zrodla. Kazdy ma wage glosu opartego o on-chain reputacje. Widac jak mysla. To nie jest czarna skrzynka."

**Voice-over EN:**
> "Five specialized agents debate live. Bull, Bear, Risk, Tech, Sentiment. Each cites sources. Each has vote weight backed by on-chain reputation. You see them think. This is not a black box."

### Segment C: Vote + Timelock + Execute (1:00-1:20) - 20s

**Co widac:**
- 1:00-1:05: Cut na Execute Flow. StageStrip 5 dots: collecting_sigs (active amber pulse) -> threshold_reached -> queued_timelock -> executing -> executed. SignersPanel po lewej: 5 of 7 multisig progress bar 71%. ENS subnames per signer (`alice.dao.eth`, `bob.dao.eth`...).
- 1:05-1:10: User klika "Sign multisig". MetaMask popup wyskakuje (real, nie mock), user signuje (1.5s). Progress bar 6 of 7 -> threshold reached. Cut na "Queue in Timelock" button.
- 1:10-1:15: Cut na TimelockCountdown - circular SVG 140x140 z animowanym progress ringiem. **"42h 18m remaining of 48h delay"** + ETA timestamp. To jest Sora trust mechanism #2 (window na cofniecie). Mockup demo skip do "Execute" gdy delay upłynie.
- 1:15-1:20: Cut na "Execute" button - klik. MetaMask popup, user signuje. Tx wysylany. **Cut na Basescan w nowej zakladce (real URL):** `sepolia.basescan.org/tx/0xabc...` - tx confirmed, status green checkmark, gas used 84,521. Pod tym: "Mock USDC transferred: 100,000 to Aave v3 pool".

**Voice-over PL:**
> "Pieciu z siedmiu multisig podpisuje. Timelock 48 godzin - okno na cofniecie. Wykonanie on-chain. Bez posrednikow."

**Voice-over EN:**
> "Five of seven multisig sign. Forty eight hour timelock - window to revert. On-chain execution. No middlemen."

### Segment D: Audit Trail + 0G + ENS Resolution (1:20-1:30) - 10s

**WOW MOMENT 2.** Proves "verifiable" claim.

**Co widac:**
- 1:20-1:25: Cut na Audit Log. TopBar: "AUDIT TRAIL · 0G STORAGE · LIVE" z pulsing green dot. Lista 17 ostatnich eventow scrolluje (auto-scroll do najnowszego). Najnowszy eventy: "PROP-042 EXECUTED · 0xabc...tx · 0G CID bafy...latest". Klik na 0G CID otwiera 0G explorer w nowej zakladce.
- 1:25-1:30: Cut na ENS Identity Card. 5 subnames pod `aicouncil.eth` z live viem resolution badge "Resolved · 84ms" per name. **`bull.aicouncil.eth` -> 0x1a2b...` z text records: rep.score=87, rep.statements=142, llm=claude-sonnet-4.6**.

**Voice-over PL:**
> "Cala debata zarchiwizowana na 0G Storage. Kazdy agent ma swoja tozsamosc ENS. Kazda decyzja audytowalna. Na zawsze."

**Voice-over EN:**
> "Full debate archived on 0G Storage. Every agent has an ENS identity. Every decision auditable. Forever."

---

## Tech (1:30-2:30) - 60s

> **Cel:** podkreslic 5 trust mech + 5 moats + sponsor coverage. NIE slajdy statyczne - mix krotkich UI cuts + clean tech infographic dla pelnego pokrycia.

### 5 Trust Mechanisms (1:30-1:55) - 25s

**Co widac:**
- 1:30-1:34: Infografika animowana - 5 ikon w rzedzie pojawiajacych sie kolejno, kazda z 0.8s stagger:
  1. **Source Attribution** (book icon, blue) - "Every claim cited"
  2. **Timelock 48h** (clock icon, amber) - "Window to revert"
  3. **0G Audit Trail** (chain icon, green) - "Immutable record"
  4. **ENS Reputation** (badge icon, purple) - "On-chain identity"
  5. **HITL Council Rules** (sliders icon, cyan) - "User-editable thresholds"
- 1:34-1:55: Per trust mech krotki cut do faktycznej apki (4s kazdy):
  - 1:34-1:38: Hover na claim w debate -> source popover z URL [Reuters] + snippet + weight
  - 1:38-1:42: Timelock countdown circular - close-up animacji
  - 1:42-1:46: Audit log scroll z 0G CID linkiem
  - 1:46-1:50: ENS card resolution log table z latencjami
  - 1:50-1:55: Council Rules JSON editor - user zmienia `require_human_approval_above_pct: 5` -> `10`, validate, multisig sign

**Voice-over PL:**
> "Piec mechanizmow zaufania, kazdy oparty o akademicki research Mayer-Davis-Schoorman z 1995. Atrybucja zrodel. Czterdziesto-osmiogodzinny timelock. Niezmienialny audit log na 0G. Tozsamosc ENS per agent. Reguly Rady edytowalne przez DAO. Wszystko w produkcji."

**Voice-over EN:**
> "Five trust mechanisms, each grounded in the Mayer Davis Schoorman ABI model from 1995. Source attribution. Forty eight hour timelock. Immutable audit log on 0G. ENS identity per agent. Council Rules editable by DAO. All in production."

### 5 Moats + Sponsor Tech (1:55-2:30) - 35s

**Co widac:**
- 1:55-2:05: Infografika "5 Moats" - vertical list z checkmarks:
  1. **Data freshness** - RSS + CoinGecko + DefiLlama live (Lumen)
  2. **Multi-agent debate** - 5 personas, prompt caching
  3. **Smart contract execution** - 4 contracts deployed Base Sepolia
  4. **Source attribution** - per claim, weighted
  5. **PoW for agents** - AgentReputation.sol (Moat 5 Matthew)
- 2:05-2:30: Sponsor tech showcase, kazdy 5s, z prawdziwym UI cut:
  - 2:05-2:10: **0G Storage** (Kenji) - cut na 0G explorer URL z naszym CID + text "Storage cost: $0.001 per debate transcript"
  - 2:10-2:15: **Uniswap v4** (Hayden) - cut na nasz custom hook code snippet (apps/contracts/src/hooks/CouncilHook.sol) + "Treasury swap routed via v4 hook"
  - 2:15-2:20: **ENS Subnames** (Nick) - cut na NameStone dashboard z 5 mintowanymi subnames pod aicouncil.eth
  - 2:20-2:25: **KeeperHub** (Luca) - cut na Basescan tx executed by KeeperHub bot address + "Automated execution post-timelock"
  - 2:25-2:30: **Multi-chain ready** - architecture diagram z Base Sepolia (deployed) + Mainnet path (Q3 2026 roadmap)

**Voice-over PL:**
> "Piec moats: swieze dane, debata wieloagentowa, on-chain wykonanie, atrybucja zrodel, dowod pracy agentow. Zbudowane na 0G Storage, Uniswap v4 hooks, ENS subnames przez NameStone, KeeperHub do automatyzacji. Cztery kontrakty na Base Sepolia. Open source. Gotowe do pilotu z DAO."

**Voice-over EN:**
> "Five moats: data freshness, multi-agent debate, on-chain execution, source attribution, proof of work for agents. Built on 0G Storage, Uniswap v4 hooks, ENS subnames via NameStone, KeeperHub for automation. Four contracts deployed on Base Sepolia. Open source. Pilot ready with DAOs."

---

## Close (2:30-3:00) - 30s

**Co widac:**
- 2:30-2:35: Cut na hero shot - aplikacja w pelnym widoku, Live Debate w trakcie, Audit Log w prawym sidebarze, ENS subnames w headerze. Wszystko zywa, animowana.
- 2:35-2:45: Overlay text fade-in:
  - **GitHub:** `github.com/danergXx-xX/ETH-Global` (big, monospace)
  - **Demo:** `demo.aitc.app` (lub Vercel URL jezeli nie ma)
  - **Docs:** README + FEEDBACK.md links
- 2:45-2:55: Sponsor logos band (5 logos w rzedzie, kazde 1s fade): 0G | Uniswap | ENS | KeeperHub | Base. Pod tym: "Built at ETHGlobal Open Agents 2026".
- 2:55-3:00: Final card - CONCLAVE logo (large) + tagline **"Your treasury, deliberated."** + names: **Dan Otomanski + Matthew [last name]** + ETHGlobal Open Agents 2026 logo bottom-right.

**Voice-over PL - Wariant A (rzeczowy):**
> "AI Treasury Council. Otwarty kod. Cztery kontrakty zywe na Base Sepolia. Pieciu agentow gotowych. Twoje DAO moze probowac. Linki w opisie."

**Voice-over PL - Wariant B (narracyjny):**
> "Dwadziescia szesc miliardow dolarow zaslguje na cos lepszego niz garstka glosow. Zaslguje na Rade. AI Treasury Council. Kod otwarty. Linki w opisie."

**Voice-over EN - Wariant A:**
> "AI Treasury Council. Open source. Four contracts live on Base Sepolia. Five agents ready. Your DAO can pilot. Links in description."

**Voice-over EN - Wariant B:**
> "Twenty six billion dollars deserves better than a handful of votes. It deserves a Council. AI Treasury Council. Open source. Links in description."

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
- [x] **PoW for agents** (Moat 5 Matthew) - 1:55-2:05 (infografika), 1:25-1:30 (ENS card text records `rep.score`, `rep.statements`)

### Sponsor jurors - kazdy ma konkretny moment

- [x] **Kenji (0G $1.5k+)** - 1:20-1:25 (audit log live), 1:42-1:46 (close-up), 2:05-2:10 (dedicated sponsor segment z explorer URL)
- [x] **Hayden (Uniswap)** - 2:10-2:15 (custom v4 hook code snippet visible)
- [x] **Nick (ENS)** - 1:25-1:30 (live ENS resolution), 1:46-1:50 (close-up), 2:15-2:20 (NameStone dashboard)
- [x] **Luca (KeeperHub)** - 1:15-1:20 (execute tx), 2:20-2:25 (KeeperHub bot address visible)
- [x] **Ben (Gensyn A2A)** - 0:35-1:00 (multi-agent debate jest dokladnie A2A communication)
- [x] **Synthesis (ETHGlobal Finalist)** - 0:35-1:00 (typewriter wow moment = originality), caly demo

### Word count check (140 wpm max)

- Hook PL: ~35 slow / 15s = 140 wpm OK
- Demo PL Segment A: ~30 slow / 20s = 90 wpm (DUZE pauzy zostawione celowo, demo speaks for itself)
- Demo PL Segment B: ~45 slow / 25s = 108 wpm OK
- Demo PL Segment C: ~25 slow / 20s = 75 wpm OK (timelock countdown speaks)
- Demo PL Segment D: ~25 slow / 10s = 150 wpm - TIGHT, moze zwolnij
- Tech PL trust mech: ~50 slow / 25s = 120 wpm OK
- Tech PL moats: ~55 slow / 35s = 94 wpm OK
- Close PL: ~25 slow / 30s = 50 wpm (overlay text speaks)

**Total PL: ~290 slow / 180s = 97 wpm - bardzo komfortowe tempo**

---

## A/B Intro test plan (Eva rule)

Nagrac obie wersje hooka (Wariant A rzeczowy + Wariant B narracyjny). Test:
- 3 osoby (Dan, Matthew, third party z hackathonu)
- Pytanie: "Po pierwszych 5 sekundach - chcesz ogladac dalej? Jakie pierwsze wrazenie?"
- Zwyciezca z 2/3 idzie do final cut
- Jezeli tie - Eva decyduje na podstawie pacing/audio quality

---

## Open questions / needs

- [ ] **Dan / Matthew:** kto nagrywa voice-over EN? (Matthew native = polecane, Dan PL bo rozumie nuanse storyline)
- [ ] **Maja T1 review:** finalizacja EN copy (Eva storyline + Maja precyzyjne slowa)
- [ ] **Aiko / Sol:** czy ENS subnames sa LIVE w niedziele rano (wymaga Phase 2 NameStone)? Jezeli NIE - swap na mock w segmencie D, dodac note "ENS subnames coming in Phase 2"
- [ ] **Quill manual QA:** smoke test apki przed nagraniem (proposal submit -> debate -> vote -> execute -> audit log) - bez bledow visible
- [ ] **Hugo / Lumen:** czy data layer (RSS + CoinGecko) ma swieze dane w niedziele 12:00? (data freshness moat = trzeba dzialac na zywo)
