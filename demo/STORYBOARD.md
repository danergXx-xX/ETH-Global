---
title: AI Treasury Council - Demo Storyboard (12 frames)
duration: 3:00
frames: 12 (po jednym per ~15s)
date: 2026-05-02 (Eva Sesja 22)
linked: SCRIPT.md (per segment)
---

# Demo Storyboard - 12 Frames

> **Filozofia Eva:** kazda klatka zaplanowana. Co na ekranie, co user mowi, jakie clicki, jakie efekty. Storyboard JEST samodzielnym dokumentem - Dan + Matthew nagrywaja patrzac TYLKO tutaj + SCRIPT.md.

> **Format opisu per frame:** scena (co kompozycja), co na ekranie (UI elementy), ruch kamery (zoom/pan/static), efekty (highlighty, arrows, callouts), audio cue (jaki voice-over).

---

## Frame 1 - Hero Hook (0:00-0:08)

**Scena:** czarny ekran. Wielka biala statystyka jako focal point.

**Co na ekranie:**
- Center: **"$26B TVL controlled by DAOs"** (font: Source Serif 4 Display, 96pt, white #ffffff)
- Pod: "yet most decisions made by <1% of token holders" (Inter, 24pt, gray #94a3b8)
- Pod tym: pulsujacy amber dot (12px, oklch(0.78 0.14 75), 1.5s pulse)

**Ruch kamery:** static. Zero kamera ruchu.

**Efekty:**
- Tekst typewriter (30 chars/sec, 0:00-0:03)
- Amber dot pulsuje od 0:03

**Audio cue:** voice-over startuje w 0:00, "Dwadzieścia sześć miliardów..." (PL) lub "Twenty six billion..." (EN). Spokojny, autorytatywny ton.

---

## Frame 2 - Problem Evidence (0:08-0:15)

**Scena:** 3-kolumnowy grid screenshots - dowody apatii DAO governance.

**Co na ekranie:**
- Lewa kolumna: Aave forum thread "Quorum failed - 3.8% turnout" (real screenshot)
- Srodek: Compound proposal #289 z 4 komentarzami (real screenshot)
- Prawa: wykres voting participation declining 2022-2026 (DefiLlama style line chart, czerwona linia w dol)
- Bottom overlay: cienki amber pasek z tekstem "Source: DAO governance research, 2024-2026"

**Ruch kamery:** subtle Ken Burns - każdy screenshot ma slight zoom-in 1.0 -> 1.05 nad 2s.

**Efekty:**
- Cuts miedzy obrazkami: cross-fade 0.3s (no jarring)
- Overlay text fade-in 0:10

**Audio cue:** "...Apatia, brak kworum, koncentracja władzy. Czas to zmienić." (PL)

---

## Frame 3 - CONCLAVE Reveal (0:10-0:15)

**Scena:** logo brand reveal + tagline. Transition do live app. **Sync ze SCRIPT.md L37 (reveal w 0:10-0:15 jako tail Hook segmentu).**

**Co na ekranie:**
- Center: CONCLAVE logo - 5 dots wokół centrum, gradient amber-green (oklch palette). Initial scale 0.8, animuje do 1.0 nad 0.5s. Initial opacity 0, fade-in.
- Pod logo: tagline **"Your treasury, deliberated."** (Inter Bold, 32pt, white)
- Background: subtle gradient z czarnego do navy (oklch(0.18 0.025 255))

**Ruch kamery:** static, focus na logo.

**Efekty:**
- Logo dots stagger animation (każdy dot pojawia się z 0.1s delay)
- Tagline fade-in po logo (0.3s opóźnienie)
- Smooth cross-fade do live app w 0:14

**Audio cue:** "Czas to zmienić." (PL Wariant A) lub "...stan DAO w 2026 roku." (Wariant B) -> beat 0:15 -> [transition do Segment A voice-over]

---

## Frame 4 - Submit Proposal (0:15-0:35)

**Scena:** live aplikacja, submission form, AI parser w akcji.

**Co na ekranie:**
- Header: CONCLAVE logo (top-left) + ENS resolution "dan.aicouncil.eth" (top-right) + connected wallet pill
- Modal otwarty: "Submit Proposal" tytul
- Pole tekstowe: user wpisuje "Allocate 100k mUSDC to Aave v3 lending pool for 4.2% APY" (typewriter)
- Pod polem: AI parser decoded panel (Safe-style):
  - Target: `0x606E...USDC` (mono font)
  - Function: `approve(address,uint256)`
  - Args: spender=Aave v3 pool, amount=100000 mUSDC
  - Gas estimate: ~85,000 gas
- Bottom: amber "Submit" button + "Cancel" ghost button

**Ruch kamery:** zoom-in subtle do AI parser panelu w 0:30 (focus na decoded calldata).

**Efekty:**
- Cursor highlight (amber glow okolo cursora)
- Click animation (ripple efekt na buttonie)
- Toast notification slide-in z prawego dolu w 0:34: "PROP-042 submitted on Base Sepolia"

**Audio cue:** "Submituję wniosek treasury... AI parser dekoduje calldata. Wnioskodawca widzi DOKŁADNIE co podpisuje. Bez black-boxa." (PL)

---

## Frame 5 - WOW MOMENT 1: Live Debate Typewriter (0:35-0:55)

**TO JEST KLUCZOWA KLATKA. Sedziowie pamietaja TEN moment.**

**Scena:** Live Debate Viewer w pełnym widoku. 5 agent cards w grid 5-kolumnowym.

**Co na ekranie:**
- Header: CONCLAVE + "PROP-042 · Allocate 100k USDC to Aave v3" + amber "DEBATING" chip + elapsed timer "T+0:18"
- Grid 5 cards horizontal, kazda karta:
  - Top: circular avatar 64x64 z procedural SVG (hue per persona: bull=green, bear=red, risk=amber, tech=blue, sentiment=purple)
  - Pod: ENS subname (`bull.aicouncil.eth` mono font, amber)
  - Pod: status pill ("analyzing..." z pulsing dot, potem zmienia na vote chip "FOR" / "AGAINST")
  - Center body: typewriter text z agent rationale (np. Bull: "Aave v3 has $11.2B TVL...")
  - Source attribution footnotes: [1][2] z amber underline (interactive)
  - Bottom: confidence bar (0-100%) z amber fill

**Ruch kamery:** static (zbyt dużo ruchu zmecza). Zoom subtle do 1.02 dla emfazy.

**Efekty:**
- **Typewriter effect** każdy agent (30 chars/sec) z offsetami 1s (Bull start 0:38, Bear 0:39, Risk 0:40, Tech 0:41, Sentiment 0:42)
- Source footnotes pojawiaja się po finished claim (highlight 0.5s amber pulse)
- Vote chips wskakuja gdy agent finished (slide-in z gory, bounce easing)
- **Tally bar** u dolu animuje się na zywo: 0-0-0 -> 1-0-0 -> 2-0-0 -> 2-1-0 -> 3-1-0 -> 3-2-0 -> 3-2-0 final

**Audio cue:** "Pięciu wyspecjalizowanych agentów debatuje na żywo... Widać jak myślą. To nie jest czarna skrzynka." (PL)

---

## Frame 6 - Verdict Card (0:55-1:00)

**Scena:** Verdict Card po prawej stronie debate.

**Co na ekranie:**
- Card 360x480, amber border (3px), dark background
- Top: "VERDICT" label + tally chip "3-2 PASSED"
- Center: weighted reputation breakdown:
  - FOR: Bull (1.2x), Risk (1.1x), Tech (1.0x) = 3.3 weighted
  - AGAINST: Bear (1.0x), Sentiment (1.0x) = 2.0 weighted
- Pod: "Decision: PASSED with 62% weighted majority"
- Bottom: amber CTA "Proceed to Vote"

**Ruch kamery:** zoom-in 1.0 -> 1.1 nad 2s na verdict.

**Efekty:**
- Card slide-in z prawej (0.4s ease-out)
- Weighted bars animuja od 0 do final values

**Audio cue:** [tail z Frame 5 voice-over, transition]

---

## Frame 7 - Multisig + Timelock Setup (1:00-1:15)

**Scena:** Execute Flow, collecting sigs + queuing.

**Co na ekranie:**
- TopBar: "EXECUTE PROP-042" + StageStrip 5 dots (active = collecting_sigs amber pulse)
- Lewa: SignersPanel - 5 of 7 multisig
  - Per signer row: ENS avatar + name (`alice.dao.eth`) + truncated addr + signed status (green checkmark lub gray pending)
  - Progress bar 71% amber
- Prawa: TxPreviewPanel - decoded calldata Safe-style
  - target, function, args, gas (jak Frame 4 ale w wiekszym widoku)
- Bottom: amber CTA "Sign multisig" -> click -> MetaMask popup (real, screen recording)

**Ruch kamery:** pan z lewej (signers) na prawa (tx preview) przez 3s. Powrot na sigantories przy MetaMask popup.

**Efekty:**
- Signature progress bar animuje przy każdym sign (0.5s)
- MetaMask popup slide-in z prawej (real browser interaction, NIE mock)
- Po sign: stage transition z "collecting_sigs" do "queued_timelock" (StageStrip dot fill animation)

**Audio cue:** "Pięciu z siedmiu multisig podpisuje. Timelock 48 godzin..." (PL)

### Execution recipe Frame 7 (jak technicznie nagrac)

**Setup PRZED nagraniem:**
- 1 prawdziwy wallet Dana z testowym ETH na Base Sepolia (juz mamy: `0x4872F81A0fFeb204D13f17644e26e7345F7d148a`)
- 4 mock signers - **NIE potrzeba prawdziwych walletow** dla 4 z 5. Backend mockuje `multisigState` endpoint zwracajacy 4 signed=true + 1 signed=false (Dan jako 5-ty)
- Mock signers ENS labels (display only): `alice.dao.eth`, `bob.dao.eth`, `carol.dao.eth`, `dave.dao.eth` - NIE rezolvowane przez viem, hardcoded w `apps/web/lib/mocks/signers.ts`

**Sekwencja Dana w nagraniu:**
1. Stage = collecting_sigs, progress 4/7 widoczny (4 mock + 0 real, czeka na Dana)
2. Dan klika "Sign multisig" -> MetaMask popup (real)
3. Dan podpisuje (1.5s) -> backend update progress 5/7 -> threshold reached (5 jako MIN_THRESHOLD)
4. Stage transition automatic -> "queued_timelock" z animacja

**Backend mock endpoint:** `GET /api/multisig/state?proposalId=42` zwraca:
```json
{
  "proposalId": 42,
  "threshold": 5,
  "signers": [
    {"ens": "alice.dao.eth", "signed": true},
    {"ens": "bob.dao.eth", "signed": true},
    {"ens": "carol.dao.eth", "signed": true},
    {"ens": "dave.dao.eth", "signed": true},
    {"ens": "dan.aicouncil.eth", "signed": false}
  ]
}
```
Po `POST /api/multisig/sign?proposalId=42&signature=0x...` -> ostatni signer `signed: true`.

---

## Frame 8 - Timelock Countdown (1:10-1:15)

**Scena:** TimelockCountdown circular SVG - the trust mechanism #2 wow.

**Co na ekranie:**
- Center: SVG circular 200x200, animowany progress ring
  - Outer ring: 48h total (light gray)
  - Inner fill: amber, animuje od 0% do current progress
- Center text: **"42h 18m"** (Source Serif 4, 48pt, white) + pod tym "remaining of 48h delay" (Inter, 14pt, gray)
- Pod: ETA timestamp "Execution available: 2026-05-04 18:00 UTC"
- Side: callout text "Window to revert" (amber, italic)

**Ruch kamery:** zoom-in 1.0 -> 1.15 na countdown nad 3s.

**Efekty:**
- Countdown ticks visible (sekundy zmieniaja się)
- Ring fill animuje smooth
- Demo cheat: po 2s skip do "Execute" stage (sedziowie rozumieja)

### Execution recipe Frame 8 (jak technicznie skipnac countdown)

**Opcja A (preferowana) - URL param "demo mode":**
- URL `/?demo=fast` aktywuje `DEMO_MODE_FAST=true` w localStorage
- TimelockCountdown komponent czyta flag i ustawia `simulatedRemainingSeconds = 2` (zamiast realnej differencji do `executeAfter` timestamp)
- Po 2s `onCountdownComplete()` -> auto-transition na stage "executing"
- Implementacja: `apps/web/components/TimelockCountdown.tsx` `useEffect` z conditional initial state

**Opcja B (fallback) - hardcoded executeAfter w mock:**
- Backend mock `GET /api/proposals/42` zwraca `executeAfter: now() + 2 seconds`
- Frontend liczy realnie countdown - ale od 2s, nie 48h
- Wada: mniej kontroli (jezeli demo zwleka 5s, countdown osiaga 0 zanim Dan dojdzie)

**Decyzja Eva:** Opcja A. Demo controlled by user, nie clock.

**Wizualizacja w demo:** countdown widoczny startuje od "42h 18m" (display only), ale realnie tick co 1s odejmuje 1h (czyli 2s wzrokowo = 2h ubytek na ring). Dan moze zatrzymac na arbitrary value i kliknac "Execute" - ring nie blokuje (disabled state moves po 2s).

**Audio cue:** "...okno na cofnięcie." (PL) [tail]

---

## Frame 9 - Basescan Tx Confirmation (1:15-1:20)

**WOW MOMENT 2.** Live tx, real Basescan.

**Scena:** browser, nowa zakladka, real Basescan URL.

**Co na ekranie:**
- URL bar: `sepolia.basescan.org/tx/0xabc123...` (real, czytelne)
- Page: Basescan tx detail
  - Status: green "Success" badge
  - Block: 12345678
  - Gas used: 84,521
  - From: nasz Governor contract address
  - To: MockUSDC contract
  - Function: `transfer(0xAaveV3Pool, 100000000000)`
  - Value: 100,000 mUSDC
- Overlay text fade-in: "Treasury swap executed on-chain · 2.3s confirmation"

**Ruch kamery:** zoom-in subtle na "Success" badge + tx hash + gas used (highlight key fields).

**Efekty:**
- Highlight pulse na "Success" badge (amber ring 1s)
- Tx hash mono font copy-able

**Audio cue:** "...Wykonanie on-chain. Bez pośredników." (PL) -> "Cała debata zarchiwizowana na 0G Storage..."

---

## Frame 10 - Audit Log + 0G CID + ENS (1:20-1:30)

**Scena:** Audit Trail w Conclave UI + ENS Card side-by-side (split screen).

**Co na ekranie:**
- Lewa polowa: Audit Log Component (z MOCKUPS.md Komponent 7)
  - Header: "AUDIT TRAIL · 0G STORAGE · LIVE" + pulsing green dot
  - Lista 10 ostatnich eventow scrolluje (auto-scroll)
  - Najnowszy event highlighted: "PROP-042 EXECUTED · 0xabc...tx · CID bafy...latest" + click target
- Prawa polowa: ENS Identity Card (z MOCKUPS.md Komponent 9)
  - Parent: aicouncil.eth + resolver address
  - 5 agent cards: każdy z ENS subname, address, text records (rep.score, rep.statements, llm)
  - Resolution badge per agent: "Resolved · 84ms"
- Cala kompozycja: dark mode, oklch palette

**Ruch kamery:** static split screen. Subtle pan z lewej na prawa nad 5s żeby pokazac obie sekcje.

**Efekty:**
- Auto-scroll w audit log (smooth, ostatni event highlighted amber)
- ENS resolution badges fade-in z latencjami (84ms, 92ms, 76ms...)
- Click na 0G CID otwiera 0G explorer w nowej zakladce (real link)

**Audio cue:** "Cała debata zarchiwizowana na 0G Storage. Każdy agent ma swoją tożsamość ENS. Każda decyzja audytowalna. Na zawsze." (PL)

---

## Frame 11 - Trust + Moats App-First Showcase (1:30-2:30)

**Scena:** **REWRITE per Vera #7 (show > tell ratio 67% -> 80%).** Zamiast statycznych infografik z ikonami - app close-ups dominuja. Tytul/label nazw trust mech pojawia sie jako small overlay text na boku, nie jako pelnoekranowa lista. **Sync ze SCRIPT timing 1:30-2:30 (60s pelen Tech segment).**

**Co na ekranie:**

**Phase 1 (1:30-1:55):** Trust mechanisms - app close-ups z overlay labels (25s, 5x5s)
- Per trust mech: 5s close-up faktycznej apki + small overlay (top-right, 20% screen) z nazwa mechanizmu + 1-zdaniowym hookiem
- 5 close-upow w sekwencji:
  - **1:30-1:35:** Source popover hover w Live Debate (close-up na Reuters URL + snippet + weight 0.87). Overlay top-right: "**Source Attribution** · Every claim cited"
  - **1:35-1:40:** Timelock countdown SVG full-screen pulse (close-up zoom 1.0->1.2). Overlay: "**Timelock 48h** · Window to revert"
  - **1:40-1:45:** Audit log scroll z 0G CID expand pop-out (close-up). Overlay: "**0G Audit Trail** · Immutable record"
  - **1:45-1:50:** ENS card resolution log table z latencjami (close-up scroll). Overlay: "**ENS Identity** · On-chain reputation"
  - **1:50-1:55:** Council Rules JSON editor live diff (key change `5` -> `10` highlighted) + multisig sign animation. Overlay: "**HITL Rules** · User-editable thresholds"

**Phase 2 (1:55-2:30):** Sponsor tech - app/code close-ups (35s, 5x7s)
- 5 sponsor moments po 7s kazdy z cross-fade 0.3s miedzy
- **1:55-2:02:** **0G Storage** (Kenji) - real 0G explorer URL w browser bar + nasz CID highlighted + storage stats panel. Overlay logo 0G top-left small + tagline "subcent per transcript". Voice-over emphasis: "0G Storage"
- **2:02-2:09:** **Uniswap v4** (Hayden) - code snippet `apps/contracts/src/hooks/CouncilHook.sol` z highlighted `beforeSwap()` + `afterSwap()` lines (15-20 linii Solidity widoczne). Overlay logo Uniswap + tagline "Custom v4 hook". Voice-over: "Uniswap v4 hooks"
- **2:09-2:16:** **ENS Subnames** (Nick) - NameStone dashboard z 5 mintowanymi subnames pod aicouncil.eth + text records visible. Overlay logo ENS + tagline "5 subnames per agent". Voice-over: "ENS subnames przez NameStone"
- **2:16-2:23:** **KeeperHub** (Luca) - Basescan tx z "From: 0xKeeperHub..." zoomed + arch diagram inset (timelock -> KeeperHub bot -> tx). Overlay logo KeeperHub + tagline "Automated execution". Voice-over: "KeeperHub do automatyzacji"
- **2:23-2:30:** **Multi-chain ready** - small arch diagram (top-right corner) + zoomed Base Sepolia explorer ze statystyka 4 deployments + Mainnet roadmap inset. Overlay: "Multi-chain ready · Q3 2026 mainnet". Voice-over: "Cztery kontrakty na Base Sepolia. Open source. Gotowe do pilotu z DAO."

**Ruch kamery:** per close-up subtle Ken Burns zoom 1.0 -> 1.05 nad 4s. Cross-fade 0.3s miedzy close-upami.

**Efekty:**
- Overlay labels: top-right corner, semi-transparent (70% bg), Inter SemiBold 18pt amber title + 14pt white subtitle
- Highlight pulse na key UI elementach per close-up (e.g. 0G CID amber ring, ENS resolution latency badge)
- Voice-over emphasis word zsynchronizowany z visual cut (np. "0G Storage" przy 2:15 cut)

**Audio cue:** "Pięć mechanizmów zaufania, każdy oparty o akademicki research Mayer-Davis-Schoorman z 1995. Atrybucja źródeł. Czterdziestoośmiogodzinny timelock. Niezmienialny audit log na 0G. Tożsamość ENS per agent. Reguły Rady edytowalne przez DAO. Wszystko zbudowane na Base Sepolia." (PL trust segment 1:50-2:15) -> "Pięć moats: świeże dane, debata wieloagentowa, on-chain wykonanie, atrybucja źródeł, dowód pracy agentów. Zbudowane na 0G Storage, Uniswap v4 hooks, ENS subnames przez NameStone, KeeperHub do automatyzacji. Cztery kontrakty na Base Sepolia. Open source. Gotowe do pilotu z DAO." (PL moats segment 2:15-2:30)

### Show > tell impact (per Vera #7)

| Element | PRZED rewrite | PO rewrite |
|---|---|---|
| Statyczne infografiki | 14s (1:30-1:34 + 1:55-2:05) | 0s (usuniete) |
| App close-ups trust mech | 21s (1:34-1:55) | 25s (1:30-1:55) |
| Sponsor app/code cuts | 25s (2:05-2:30) | 35s (1:55-2:30) |
| **Total app/code time / 180s** | **121s = 67%** | **~144s = 80%** |

Spelnia Charter Eva 80% target.

---

## Frame 12 - Close + CTA (2:30-3:00)

**Scena:** hero shot apki -> overlay text -> sponsor logos -> final card.

**Co na ekranie:**

**2:30-2:35:** Hero shot
- Pelen widok aplikacji (Live Debate w trakcie + Audit Log sidebar + ENS w headerze + Treasury Dashboard tle)
- Subtle slow zoom-out 1.0 -> 0.92 nad 5s

**2:35-2:45:** Overlay text fade-in
- Background: dim apki do 30% opacity
- Center text:
  - **GitHub:** `github.com/danergXx-xX/ETH-Global` (mono, 32pt, amber)
  - **Demo:** `demo.aitc.app` lub Vercel URL (mono, 24pt, white)
  - **Docs:** README + FEEDBACK.md links (smaller)

**2:45-2:55:** Sponsor logos band
- Horizontal row 5 logos: 0G | Uniswap | ENS | KeeperHub | Base
- Kazde logo 1s fade-in z stagger
- Pod logos: "Built at ETHGlobal Open Agents 2026" (Inter, 14pt, gray)

**2:55-3:00:** Final card
- CONCLAVE logo (large, center)
- Pod: tagline **"Your treasury, deliberated."** (Inter Bold, 36pt, white)
- Pod tym: **"Dan Otomanski + Matthew [last name]"** (Inter, 18pt, gray)
- Bottom-right corner: ETHGlobal Open Agents 2026 logo (small)

**Ruch kamery:** subtle zoom-in 1.0 -> 1.08 na CONCLAVE logo nad ostatnich 3s.

**Efekty:**
- Cross-fades smooth miedzy phasami (0.5s)
- Sponsor logos stagger fade-in
- CTA URLs hover-able (jezeli interactive video player)

**Audio cue:** "AI Treasury Council. Otwarty kod. Cztery kontrakty żywe... Twoje DAO może próbować. Linki w opisie." (PL)

---

## Globalne notatki dla Editor

### Pacing rules
- Max static shot: 8s (Eva rule). Wiekszosc 3-5s.
- Cuts: cross-fade 0.3s typowe, hard cut OK na high-energy moments (Frame 5 typewriter start)
- Total cuts: ~24-30 (typowe dla 3 min demo)

### Highlight conventions
- **Amber ring pulse** (1s): kluczowe UI elementy (Submit button, Verdict card, Success badge)
- **Cursor glow** (amber halo): zawsze podczas user interaction
- **Click ripple** (amber): per click animation
- **Source footnote pulse**: gdy source attribution pojawia się

### Color guide (oklch palette z Vela)
- bg dark: `oklch(0.18 0.025 255)`
- text light: `oklch(0.96 0.006 255)`
- amber accent: `oklch(0.78 0.14 75)`
- green vote/success: `oklch(0.74 0.16 152)`
- red against/error: `oklch(0.70 0.18 22)`
- bull: green | bear: red | risk: amber | tech: blue | sentiment: purple

### Typography
- Display: Source Serif 4 (hero numbers, taglines)
- Body: Inter (UI text, voice-over captions)
- Mono: JetBrains Mono (addresses, code, tx hashes)

### Captions burned-in
- Position: bottom 8% of frame
- Background: 70% black overlay (10px padding)
- Font: Inter SemiBold 22pt white
- Wrap: max 2 lines (~80 chars)
- Bilingual versions: PL primary record, EN secondary record. Final: 2 video files (PL captions + EN captions) lub 1 video z dual-track captions (preferowane).

---

## Pre-recording checklist (link to RECORDING-CHECKLIST.md)

Pełna lista w `demo/RECORDING-CHECKLIST.md`. Top items:
- [ ] Browser fullscreen, no tabs, no notifications
- [ ] Test wallet z mUSDC funds + Base Sepolia network
- [ ] Audio test (no echo, -12 LUFS target)
- [ ] Mock data realistic (PROP-042, real ENS subnames, real Basescan tx URL)
- [ ] Fonts loaded (3 Google Fonts: Inter, JetBrains Mono, Source Serif 4)
- [ ] CONCLAVE 3 wariant fonts (Inter Bold dla tagline, Source Serif 4 dla hero numbers, JetBrains Mono dla addresses) wszystkie zaladowane przed nagraniem

---

## Key decisions Eva (autonomous improvement w scope)

1. **12 frames zamiast 10** - kazdy frame ~15s = comfortable cognitive load dla editora (research: video pacing studies). 10 frames = 18s/frame (za duzo info per frame), 15+ frames = za malo info per frame, fragmentacja.
2. **Screen Studio > Loom** - native cursor highlight + zoom + click animations bez post-processing. Loom wymaga manual editing.
3. **Segment-by-segment recording** - 30s takes maja ~80% success rate vs ~5% dla 3:00 ciaglego take. Charter Eva: 3 takes per segment, best wybrac w editing.
4. **Open captions burned-in** - jurorzy ETHGlobal ogladaja w cichych pokojach, hotelach. SRT subtitles wymagaja player support, captions burned-in dzialaja zawsze.
5. **No background music** - Charter Eva ("dystrakcja"). Sedziowie focus na content, nie melodyce.
6. **2 warianty voice-over per segment** - A/B test 3 osob, decyzja oparta o "do you want to keep watching?". Zero ego.
7. **Buffer 10s na edycje overshoot** - target 2:50 zamiast 3:00 (Vera rec). Demo overshoot to typowy bug pierwszego cuts.
