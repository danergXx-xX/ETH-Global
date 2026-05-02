---
title: AI Treasury Council - Demo Recording Checklist
date: 2026-05-02 (Eva Sesja 22)
target: niedziela 13:00-14:30 nagranie, 14:30-16:00 editing
linked: SCRIPT.md, STORYBOARD.md
---

# Demo Recording Checklist

> **Eva regula:** storyboard ZANIM nagranie. Klatka po klatce. NIE nagrywaj "z dymka".

> **Tool zalecany:** **Screen Studio** (Mac, lepsza jakosc niz Loom, automatic cursor highlight + click animations + zoom). Alternatywa: Loom Pro (jezeli Screen Studio niedostepny).

---

## PRE-RECORDING (przygotowanie 30-45 min)

### Browser setup

- [ ] Chrome / Brave w trybie pelnoekranowym (F11 lub `Cmd+Ctrl+F` na Mac)
- [ ] Brak DevTools otwartych (zamknij `Cmd+Opt+I`)
- [ ] Brak zakladek widocznych (chowaj bookmarks bar `Cmd+Shift+B`)
- [ ] Tylko 1 zakladka aktywna (zamknij wszystkie inne)
- [ ] Drugi browser tab przygotowany dla Basescan (otworzysz w demo)
- [ ] Browser zoom 100% (`Cmd+0`)
- [ ] Dark mode UI (z Settings panelu lub system theme)
- [ ] Disable notifications (macOS: Do Not Disturb mode ON, Focus mode "Recording")

### Apka stan

- [ ] **Local dev server lub Vercel preview** dziala bez bledow (smoke test pelnego flow przed recording)
- [ ] **Test wallet** ma mUSDC funds (~100k) + Base Sepolia ETH (~0.01)
- [ ] Wallet podlaczony, network = Base Sepolia (Chain 84532)
- [ ] **Mock data realistic:** PROP-042 jako ID (nie "lorem ipsum"), real ENS subnames z aicouncil.eth, real Basescan tx hash (z Phase 1A deploy)
- [ ] **Fonts loaded:** Inter, JetBrains Mono, Source Serif 4 (sprawdz Network tab w DevTools przed zamknieciem)
- [ ] **Live debate flow przetestowany 2x** (proposal -> 5 agents typewriter -> verdict -> vote -> execute -> audit log)
- [ ] **Audit Log** ma sample data (~17 events, w tym Phase 1A deploys + Phase 1B votes)
- [ ] **ENS Card** rezolvuje wszystkie 5 subnames (lub mock z latencjami jezeli Phase 2 nie skonczone)

### Aplikacje wylaczone (no notifications, no audio)

- [ ] Slack: zamkniete (Quit, nie minimize)
- [ ] Discord: zamkniete
- [ ] Beeper: zamkniete (WhatsApp/Messenger/Signal sa loud)
- [ ] Telegram: zamkniete
- [ ] Email apki: zamkniete (Outlook, Gmail tabs)
- [ ] Music apki: zamkniete (Spotify, Apple Music)
- [ ] System sounds OFF (Settings -> Sound -> Sound Effects volume 0)
- [ ] Zegar widoczny? Schowaj jezeli pokazuje godzine recordnigu (privacy)

### Audio setup

- [ ] **Mic external** (Blue Yeti, Shure MV7, lub inny dynamic mic) > built-in MacBook mic
- [ ] Test recording 30s: speak normal voice, sprawdz w Audacity:
  - Peak: -6 dB do -3 dB (NIE clipping)
  - Average: -18 dB do -12 dB
  - Background noise: poniżej -50 dB
- [ ] Cisza w pokoju (zamknij okno, wylacz wentylator, AC)
- [ ] Pop filter na micu (jezeli plosives - p, b, t)
- [ ] Headphones zalozone (monitorowanie audio podczas recording)

### Lighting (jezeli camera-on intro/outro - opcjonalnie)

- [ ] Naturalne swiatlo z przodu (NIE z tylu - silhouette)
- [ ] Ring light lub softbox jezeli wieczor
- [ ] Tlo neutralne (nie messy)

### Storyboard + script printout

- [ ] **SCRIPT.md** otwarty na drugim monitorze (nie w nagrywanym oknie)
- [ ] **STORYBOARD.md** otwarty obok scriptu
- [ ] Voice-over wybrany (Wariant A vs B per segment) i highlighted
- [ ] Timing reference: telefon z stoperka widoczny w polu widzenia

---

## RECORDING (Screen Studio / Loom settings)

### Recording settings

- [ ] **Resolution:** 1920x1080 native record, export 1280x720 (mniej tokenow w upload, sufficient quality)
- [ ] **Framerate:** 60fps record, 30fps export (smooth scroll/typewriter, smaller file)
- [ ] **Cursor highlight:** ON (Screen Studio domyslnie, Loom: enable w settings)
- [ ] **Click animations:** ON (Screen Studio amber ripple, Loom: enable)
- [ ] **Audio:** 48kHz, 16-bit minimum (24-bit preferred)
- [ ] **Mic input:** external (NIE built-in MacBook)
- [ ] **System audio:** OFF (NIE chcemy notification beeps)

### Recording strategy

**Segment-by-segment, NIE jeden take ciagly.**

Per segment z SCRIPT.md (Hook, Demo A, B, C, D, Tech trust, Tech moats, Close):
- [ ] Recording 3 takes per segment (~15-30s each)
- [ ] Best take wybrac w editing
- [ ] Zostaw 2s ciszy przed/po segmencie (clean cut points)

### A/B intro recording

- [ ] **Wariant A (rzeczowy)** - 1 take Hook 0:00-0:15
- [ ] **Wariant B (narracyjny)** - 1 take Hook 0:00-0:15
- [ ] Test 3 osob "do you want to keep watching?" -> wybrac winner

### Mistakes handling

- [ ] **NIE re-record od poczatku** gdy pomylka w sredku
- [ ] **Klaśnij rece** (audio marker dla cuts) i kontynuuj
- [ ] Editor wytnie pomylki przy klaskach

### Pacing tips

- [ ] **Mowie wolno:** 140 wpm max (~2.3 slow/s). Naturalnie chce mowic szybciej, zwolnij swiadomie.
- [ ] **Pauzy miedzy zdaniami:** 0.5-1s. Pauzy daja sedziom czas na przyswajanie.
- [ ] **Emfaza na key terms:** "trust", "audit trail", "ENS", "0G Storage", "five agents" - wzmacniaj
- [ ] **Hook spokojnie:** NIE krzyczec o "$26B". Mowic spokojnie, autorytatywnie. Liczba mowi sama za siebie.

---

## POST-RECORDING (editing 14:30-16:00)

### Editing tool

- [ ] **Screen Studio** (built-in editor, recommended dla simplicity) lub
- [ ] **Final Cut Pro / DaVinci Resolve** (advanced, jezeli czas pozwala)
- [ ] **iMovie** (fallback, prosty ale wystarczy)

### Cuts + transitions

- [ ] Trim do **3:00 max hard limit** (ETHGlobal rule)
- [ ] Cuts smooth: cross-fade 0.3s typowe, hard cut OK na wow moments
- [ ] Static shots max 8s (Eva rule)
- [ ] Total cuts: 24-30 typowe

### Captions burned-in

- [ ] **PL version** captions burned-in (open captions, NIE subtitles)
  - Position: bottom 8% of frame
  - Background: 70% black overlay, 10px padding
  - Font: Inter SemiBold 22pt white
  - Wrap max 2 lines (~80 chars per line)
- [ ] **EN version** captions burned-in (osobne nagranie LUB dual-track)
- [ ] Sync z mowa (max 0.2s delay tolerable)
- [ ] Auto-generate captions tools: Screen Studio built-in, lub Whisper.cpp local, lub Otter.ai
- [ ] Manual review: kazda caption sprawdzona (typo check, polish chars OK)

### Audio cleanup

- [ ] Normalize loudness: **-12 LUFS** target (ETHGlobal/YouTube standard)
- [ ] No clipping (peaks below -1 dBFS)
- [ ] Remove background noise (Krisp, Adobe Podcast Enhance, lub Audacity Noise Reduction)
- [ ] EQ: cut <80Hz (rumble), boost 3-5kHz subtle (clarity)
- [ ] **NO BACKGROUND MUSIC** (Eva rule: distraction)

### Visuals enhancements

- [ ] Logo intro/outro consistent (CONCLAVE logo same in 0:15 reveal i 2:55 close)
- [ ] Sponsor logos band 2:45-2:55 - hold 3s minimum, no flash
- [ ] Demo URL + GitHub readable (overlay text, big enough - min 24pt)
- [ ] Highlight overlays (amber rings, callouts) sync z voice-over
- [ ] **NO BROWSER NOTIFICATIONS visible** (sprawdz frame-by-frame ostatnich 30s!)
- [ ] **NO PERSONAL INFO visible** (wallet shows test addresses 0x4872..., NIE main wallet, NIE real funds)

### Final review (Vera + Maxima + Critic - 16:00-16:30)

- [ ] Vera T3 rubric quality scoring (target >=8/10)
- [ ] Maxima scope check (czy 5 trust mech + 5 moats wszystkie pokazane?)
- [ ] Critic factual accuracy (czy claims 100% true? np. "$26B TVL" - sprawdz aktualna liczba)
- [ ] Hook test: 3 osoby ogladaja pierwsze 5s -> "chcesz dalej?" 2/3 yes -> ACCEPT
- [ ] Quill manual QA: czy demo aplikacja w video pokazuje real apke bez bedow?

### Re-edits jezeli potrzeba (16:30-17:00)

- [ ] Fix findings z review
- [ ] Re-render export
- [ ] Final smoke test playback (oglodaj caly 3 min raz)

### Upload + backup

- [ ] **Primary: YouTube unlisted** (ETHGlobal preferowany)
- [ ] **Backup: Vimeo unlisted** (jezeli YouTube down)
- [ ] **Local file:** zachowaj MP4 H.264 1280x720 w `demo/final/AI-Treasury-Council-3min.mp4`
- [ ] Thumbnail custom (CONCLAVE logo + tagline)
- [ ] Description: link do GitHub + demo URL + docs

### Submission integration

- [ ] Embed link do video w README.md ETHGlobal submission
- [ ] Embed w FEEDBACK.md jezeli wymagane
- [ ] Test linka raz przed submission deadline

---

## Ostateczny smoke test (17:00 - 1h przed deadline)

- [ ] Otworz video w incognito browser tab (czysty cache)
- [ ] Audio dziala?
- [ ] Captions widoczne?
- [ ] Pierwsze 5s lapie uwage?
- [ ] Czy 3:00 mieci sie w hard limit? (sprawdz exact duration)
- [ ] Czy wszystkie 5 trust mech widoczne?
- [ ] Czy wszystkie sponsorzy maja moment?
- [ ] Czy CTA + GitHub na koncu czytelne?

**Jezeli wszystko OK -> SUBMISSION 18:00 deadline.**

---

## Backup plan (jezeli nagranie sie nie uda)

### Plan B: minimal viable demo (1 godzina)

Jezeli nagranie main 3 min nie wyjdzie:
- 60s teaser version (Hook 15s + Demo highlights 30s + Close 15s)
- Acceptable jezeli main 3 min absolutnie nieudane
- Jurorzy preferuja krotsze + dobre niz dluzsze + slabe

### Plan C: voice-over re-record only (30 min)

Jezeli wizualy OK ale audio zle:
- Re-record voice-over na ciszej, lepszym micu
- Nalozyc na istniejace recording (sync z visuals)
- Tool: DaVinci Resolve audio replace

---

## Open questions / blockers

- [ ] **Dan + Matthew:** kto nagrywa voice-over? Decyzja przed sobota wieczor.
  - Rekomendacja Eva: Dan PL (rozumie nuanse storyline), Matthew EN (native speaker, lepszy accent)
  - Alternatywa: Matthew nagrywa obie wersje (1 person consistency)
- [ ] **Aiko:** czy Phase 1B wagmi UI gotowy do recording w niedziele 12:00? (wymagane dla Frame 7 i 8)
- [ ] **Sol + Aiko:** czy Phase 2 ENS subnames live (NameStone)? Jezeli NIE - Frame 10 swap na mock + voice-over note
- [ ] **Lumen:** czy data freshness (RSS + CoinGecko) dziala live w niedziele 12:00? (Trust mech #1 wymaga real data)
