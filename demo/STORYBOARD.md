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

**Audio cue:** voice-over startuje w 0:00, "Dwadziescia szesc miliardow..." (PL) lub "Twenty six billion..." (EN). Spokojny, autorytatywny ton.

---

## Frame 2 - Problem Evidence (0:08-0:15)

**Scena:** 3-kolumnowy grid screenshots - dowody apatii DAO governance.

**Co na ekranie:**
- Lewa kolumna: Aave forum thread "Quorum failed - 3.8% turnout" (real screenshot)
- Srodek: Compound proposal #289 z 4 komentarzami (real screenshot)
- Prawa: wykres voting participation declining 2022-2026 (DefiLlama style line chart, czerwona linia w dol)
- Bottom overlay: cienki amber pasek z tekstem "Source: DAO governance research, 2024-2026"

**Ruch kamery:** subtle Ken Burns - kazdy screenshot ma slight zoom-in 1.0 -> 1.05 nad 2s.

**Efekty:**
- Cuts miedzy obrazkami: cross-fade 0.3s (no jarring)
- Overlay text fade-in 0:10

**Audio cue:** "...Apatia, brak kworum, koncentracja wladzy. Czas to zmienic." (PL)

---

## Frame 3 - CONCLAVE Reveal (0:15-0:22)

**Scena:** logo brand reveal + tagline. Transition do live app.

**Co na ekranie:**
- Center: CONCLAVE logo - 5 dots wokol centrum, gradient amber-green (oklch palette). Initial scale 0.8, animuje do 1.0 nad 0.5s. Initial opacity 0, fade-in.
- Pod logo: tagline **"Your treasury, deliberated."** (Inter Bold, 32pt, white)
- Background: subtle gradient z czarnego do navy (oklch(0.18 0.025 255))

**Ruch kamery:** static, focus na logo.

**Efekty:**
- Logo dots stagger animation (kazdy dot pojawia sie z 0.1s delay)
- Tagline fade-in po logo (0.3s opoznienie)
- Smooth cross-fade do live app w 0:18

**Audio cue:** "Czas to zmienic." (PL) -> beat -> [transition do Segment A voice-over]

---

## Frame 4 - Submit Proposal (0:22-0:35)

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

**Audio cue:** "Submituje wniosek treasury... AI parser dekoduje calldata. Wnioskodawca widzi DOKLADNIE co podpisuje. Bez black-boxa." (PL)

---

## Frame 5 - WOW MOMENT 1: Live Debate Typewriter (0:35-0:55)

**TO JEST KLUCZOWA KLATKA. Sedziowie pamietaja TEN moment.**

**Scena:** Live Debate Viewer w pelnym widoku. 5 agent cards w grid 5-kolumnowym.

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
- **Typewriter effect** kazdy agent (30 chars/sec) z offsetami 1s (Bull start 0:38, Bear 0:39, Risk 0:40, Tech 0:41, Sentiment 0:42)
- Source footnotes pojawiaja sie po finished claim (highlight 0.5s amber pulse)
- Vote chips wskakuja gdy agent finished (slide-in z gory, bounce easing)
- **Tally bar** u dolu animuje sie na zywo: 0-0-0 -> 1-0-0 -> 2-0-0 -> 2-1-0 -> 3-1-0 -> 3-2-0 -> 3-2-0 final

**Audio cue:** "Piecu wyspecjalizowanych agentow debatuje na zywo... Widac jak mysla. To nie jest czarna skrzynka." (PL)

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
- Signature progress bar animuje przy kazdym sign (0.5s)
- MetaMask popup slide-in z prawej (real browser interaction, NIE mock)
- Po sign: stage transition z "collecting_sigs" do "queued_timelock" (StageStrip dot fill animation)

**Audio cue:** "Pieciu z siedmiu multisig podpisuje. Timelock 48 godzin..." (PL)

---

## Frame 8 - Timelock Countdown (1:15-1:20)

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
- Countdown ticks visible (sekundy zmieniaja sie)
- Ring fill animuje smooth
- Demo cheat: po 2s skip do "Execute" stage (sedziowie rozumieja)

**Audio cue:** "...okno na cofniecie." (PL) [tail]

---

## Frame 9 - Basescan Tx Confirmation (1:20-1:30)

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

**Audio cue:** "...Wykonanie on-chain. Bez posrednikow." (PL) -> "Cala debata zarchiwizowana na 0G Storage..."

---

## Frame 10 - Audit Log + 0G CID (1:30-1:50)

**Scena:** Audit Trail w Conclave UI + ENS Card side-by-side (split screen).

**Co na ekranie:**
- Lewa polowa: Audit Log Component (z MOCKUPS.md Komponent 7)
  - Header: "AUDIT TRAIL · 0G STORAGE · LIVE" + pulsing green dot
  - Lista 10 ostatnich eventow scrolluje (auto-scroll)
  - Najnowszy event highlighted: "PROP-042 EXECUTED · 0xabc...tx · CID bafy...latest" + click target
- Prawa polowa: ENS Identity Card (z MOCKUPS.md Komponent 9)
  - Parent: aicouncil.eth + resolver address
  - 5 agent cards: kazdy z ENS subname, address, text records (rep.score, rep.statements, llm)
  - Resolution badge per agent: "Resolved · 84ms"
- Cala kompozycja: dark mode, oklch palette

**Ruch kamery:** static split screen. Subtle pan z lewej na prawa nad 5s zeby pokazac obie sekcje.

**Efekty:**
- Auto-scroll w audit log (smooth, ostatni event highlighted amber)
- ENS resolution badges fade-in z latencjami (84ms, 92ms, 76ms...)
- Click na 0G CID otwiera 0G explorer w nowej zakladce (real link)

**Audio cue:** "Cala debata zarchiwizowana na 0G Storage. Kazdy agent ma swoja tozsamosc ENS. Kazda decyzja audytowalna. Na zawsze." (PL)

---

## Frame 11 - Trust + Moats Infographic (1:50-2:30)

**Scena:** infografika + sponsor tech showcase.

**Co na ekranie:**

**Phase 1 (1:50-2:15):** Trust mechanisms infographic
- Vertical layout, 5 rows
- Per row: ikona (40x40) + label + 1-line description
- Background: subtle gradient navy
- Per row pojawia sie z 0.8s stagger:
  1. Source Attribution (book icon, blue) - "Every claim cited"
  2. Timelock 48h (clock icon, amber) - "Window to revert"
  3. 0G Audit Trail (chain icon, green) - "Immutable record"
  4. ENS Reputation (badge icon, purple) - "On-chain identity"
  5. HITL Council Rules (sliders icon, cyan) - "User-editable thresholds"
- Cuts do faktycznej apki per trust mech (4s kazdy):
  - Source popover hover (close-up)
  - Timelock countdown close-up
  - Audit log scroll
  - ENS resolution table
  - Council Rules JSON edit (live diff)

**Phase 2 (2:15-2:30):** Sponsor tech showcase
- 5 sponsor cards w grid 2-3-2 layout (lub horizontal carousel)
- Per card: sponsor logo + 1-line value + UI cut do faktycznej integracji:
  - **0G Storage** (Kenji): explorer URL z CID + cost "$0.001/transcript"
  - **Uniswap v4** (Hayden): code snippet `CouncilHook.sol`
  - **ENS Subnames** (Nick): NameStone dashboard z 5 subnames
  - **KeeperHub** (Luca): Basescan tx executed by KeeperHub address
  - **Multi-chain ready**: arch diagram (Base Sepolia + mainnet roadmap)

**Ruch kamery:** smooth pan przez infografike (subtle vertical scroll). Sponsor cards: cuts cleanly co 5s.

**Efekty:**
- Stagger animations dla list items
- Cross-fade miedzy sponsor cards
- Highlight pulse na sponsor logos

**Audio cue:** "Piec mechanizmow zaufania, kazdy oparty o akademicki research..." (PL trust segment) -> "Piec moats: swieze dane, debata wieloagentowa..." (PL moats segment)

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

**Audio cue:** "AI Treasury Council. Otwarty kod. Cztery kontrakty zywe... Twoje DAO moze probowac. Linki w opisie." (PL)

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
- **Source footnote pulse**: gdy source attribution pojawia sie

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

Pelna lista w `demo/RECORDING-CHECKLIST.md`. Top items:
- [ ] Browser fullscreen, no tabs, no notifications
- [ ] Test wallet z mUSDC funds + Base Sepolia network
- [ ] Audio test (no echo, -12 LUFS target)
- [ ] Mock data realistic (PROP-042, real ENS subnames, real Basescan tx URL)
- [ ] Fonts loaded (3 Google Fonts: Inter, JetBrains Mono, Source Serif 4)
- [ ] CONCLAVE 3 vary
