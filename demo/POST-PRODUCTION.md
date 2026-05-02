---
title: AI Treasury Council - Post-Production Guide
date: 2026-05-02 (Eva Sesja 22)
target: Editor (Dan/Matthew lub agencja) niedziela 14:30-16:30
linked: SCRIPT.md, STORYBOARD.md, RECORDING-CHECKLIST.md
---

# Post-Production Guide

> **Cel:** dostarczyc editorowi pelen recipe od raw recording do final 1280x720 MP4 ready do submission. Bez zgadywania, bez "co teraz?".

> **Tools recommended:** **DaVinci Resolve** (free, professional) lub **Final Cut Pro** (Mac, $300). **iMovie** jako fallback (mniej kontroli ale wystarczy). Screen Studio built-in editor wystarczy dla minimalnych cuts.

---

## Pipeline overview (90 min target)

```
14:30-15:00 Import + organize raw clips (30 min)
15:00-15:45 Cuts + structure + transitions (45 min)
15:45-16:00 Audio cleanup + normalize (15 min)
16:00-16:15 Captions burned-in (15 min)
16:15-16:30 Visual polish + color + export (15 min)
16:30-17:00 Review + re-edits + upload buffer (30 min)
```

---

## STAGE 1: Import + Organize (30 min)

### Folder structure (przed importem)

```
demo/raw/
├── hook/
│   ├── variant-A-take-1.mp4
│   ├── variant-A-take-2.mp4
│   ├── variant-A-take-3.mp4
│   ├── variant-B-take-1.mp4
│   ├── variant-B-take-2.mp4
│   └── variant-B-take-3.mp4
├── demo-A-submit/
│   ├── take-1.mp4
│   ├── take-2.mp4
│   └── take-3.mp4
├── demo-B-debate/
│   ├── take-1.mp4
│   ├── take-2.mp4
│   └── take-3.mp4
├── demo-C-execute/
│   ├── take-1.mp4
│   ├── take-2.mp4
│   └── take-3.mp4
├── demo-D-audit-ens/
│   ├── take-1.mp4
│   ├── take-2.mp4
│   └── take-3.mp4
├── tech-trust-mech/
│   ├── source-popover.mp4
│   ├── timelock-countdown.mp4
│   ├── audit-log.mp4
│   ├── ens-card.mp4
│   └── council-rules.mp4
├── tech-sponsor/
│   ├── 0g-explorer.mp4
│   ├── uniswap-hook.mp4
│   ├── ens-namestone.mp4
│   ├── keeperhub-tx.mp4
│   └── multichain.mp4
└── close/
    ├── hero-shot.mp4
    ├── overlay-cta.mp4
    ├── sponsor-band.mp4
    └── final-card.mp4
```

### Import checklist
- [ ] Wszystkie raw .mp4 zaimportowane
- [ ] Bin/folder structure w editorze odzwierciedla powyzsze
- [ ] Per segment: wybierz BEST take (audio quality + pacing + brak pomylek)
- [ ] Backup: zachowaj wszystkie takes (NIE delete) na wypadek re-edit

---

## STAGE 2: Cuts + Structure (45 min)

### Timeline build

Stworz timeline 1920x1080 30fps. Sekwencja per SCRIPT.md timing:

| Sekcja | Czas | Klipy |
|--------|------|-------|
| Hook | 0:00-0:15 | Najlepszy hook variant (A lub B per A/B test winner z RECORDING-CHECKLIST L99-103) |
| Demo A | 0:15-0:35 | Best take demo-A-submit |
| Demo B | 0:35-1:00 | Best take demo-B-debate |
| Demo C | 1:00-1:20 | Best take demo-C-execute (3 sub-cuts: multisig + timelock + Basescan) |
| Demo D | 1:20-1:30 | Best take demo-D-audit-ens (split-screen audit + ENS) |
| Tech trust | 1:30-1:55 | 5 close-upow z tech-trust-mech/ (5s każdy) |
| Tech sponsor | 1:55-2:30 | 5 sponsor cuts z tech-sponsor/ (7s każdy) |
| Close | 2:30-3:00 | hero-shot + overlay-cta + sponsor-band + final-card |

### Cuts rules
- **Cross-fade 0.3s** miedzy segmentami (smooth flow)
- **Hard cut** OK na wow moments (Frame 5 typewriter start, Frame 9 Basescan reveal)
- **Static shot max 8s** (Eva rule). Wiekszosc 3-5s.
- **Total cuts target: 24-30** (typowe dla 3 min demo)

### Trim agresywnie
- Cisza > 1s = wytnij (chyba ze celowa pauza po wow moment)
- "Aaa", "Eee", oddech = wytnij
- Powtorzenia (mowca poprawia sie) = uzyj clap marker (audio spike) jako cut point

### Target duration
- **2:50 target** (10s buffer pod 3:00 hard limit ETHGlobal - chroni przed editing overshoot)
- Jezeli pierwszy cut przekracza 3:05 - wytnij agresywnie (zaczynaj od najdluzszych static shots)

### Transitions
- **Cross-fade 0.3s** - 90% przypadkow (default)
- **Hard cut** - tylko na high-energy (typewriter start, Basescan success badge)
- **NIE uzywac:** dip-to-black, slide, zoom-blur, fancy presets (looks amateurish)

---

## STAGE 3: Audio Cleanup + Normalize (15 min)

### Per clip
1. **Noise reduction** - Krisp / Adobe Podcast Enhance / DaVinci Voice Isolation
2. **EQ:** cut <80Hz (rumble), boost 3-5kHz subtle (clarity, +2dB)
3. **De-ess** jezeli sibilance ("s" ostre)
4. **Compressor:** ratio 3:1, threshold -18dB, makeup gain +6dB (consistent loudness)

### Master bus
1. **Normalize loudness:** **-12 LUFS** target (ETHGlobal/YouTube standard)
2. **Limiter:** ceiling -1 dBFS (no clipping)
3. **Mono check:** sprawdz w mono - czy nie ma phase issues z stereo recording

### NO BACKGROUND MUSIC (Eva rule)
- Music = distraction, sedziowie focus na content
- Wyjatek: cichy ambient w 0:00-0:05 hook (max -30 LUFS, fade out 0:05) - tylko jezeli editor expert level i czas pozwala. Default: NIE.

### Sound effects (subtle, opcjonalne)
- Click sounds podczas user clicks - **NIE dodawac** (Screen Studio juz ma click animations visual)
- Whoosh przy transitions - **NIE** (amateurish)
- Notification ping przy success badge (Frame 9) - **OPCJONALNE** (jezeli editor ma czas + dobry asset)

---

## STAGE 4: Captions Burned-in (15 min)

### Auto-generate baseline
1. **Tool:** Screen Studio built-in caption generator, lub DaVinci Resolve "Audio Transcription" feature, lub Whisper.cpp local (offline, free), lub Otter.ai (online, $)
2. Wygeneruj PL caption draft
3. Wygeneruj EN caption draft

### Manual review (CRITICAL)
- Sprawdz polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż) - auto-generators czesto miss
- Reference: `demo/CAPTIONS-PL.srt` + `demo/CAPTIONS-EN.srt` (Eva pre-built shells z timing)
- Sprawdz typo (np. "AI Treasury" nie "Ay Treshary")

### Burn-in settings
- **Position:** bottom 8% of frame
- **Background:** 70% black overlay (rgba(0,0,0,0.7)), 10px padding
- **Font:** Inter SemiBold 22pt white
- **Wrap:** max 2 lines (~80 chars per line)
- **Sync:** max 0.2s delay tolerable
- **Style:** open captions burned-in (NIE SRT subtitles - sedziowie ETHGlobal ogladaja w cichych pokojach hotelowych)

### Bilingual delivery
- **Primary:** 1 video z PL captions + EN voice-over (PL captions for non-EN sedziowie reading along)
- **OR:** 2 osobne video (PL caption + PL VO, EN caption + EN VO)
- **OR:** dual-track captions (preferowane jezeli player support: YouTube tak, Vimeo tak, MP4 download nie)

**Decyzja Eva:** 1 video z EN VO + EN burned-in captions PRIMARY (ETHGlobal jurorzy = international, EN baseline). PL version jako secondary upload.

---

## STAGE 5: Visual Polish + Color (15 min)

### Color grading
- **Match darkness across cuts** - jezeli 1 take ciemniejszy, podnies exposure +0.3
- **Saturation +5%** subtle (oklch palette pop)
- **Sharpness +10%** dla mono fonts (addresses, code)
- **NIE LUT presets** ("teal-orange", "cinematic" itp. - looks fake)

### Highlight overlays sync
Per STORYBOARD per frame, dodaj overlays:
- **Amber ring pulse** (1s) na kluczowych UI elementach (Submit button Frame 4, Verdict Frame 6, Success badge Frame 9)
- **Cursor glow** - Screen Studio juz ma, jezeli Loom: dodac w post (Final Cut "Stylize" effect)
- **Click ripple** - Screen Studio built-in, Loom: post-add
- **Source footnote pulse** - 0.5s amber pulse gdy source attribution pojawia sie w typewriter (Frame 5)
- **Highlight pulse na sponsor logos** Frame 11 sponsor cuts (1s amber per logo)

### Text overlays
- **Frame 1 hero:** "$26B TVL controlled by DAOs" - Source Serif 4 Display 96pt white
- **Frame 11 trust labels:** Inter SemiBold 18pt amber title + 14pt white subtitle, top-right corner
- **Frame 11 sponsor taglines:** Inter SemiBold 16pt amber, top-left corner z logo
- **Frame 12 CTA:** GitHub mono 32pt amber, demo URL mono 24pt white

### Logo intro/outro consistency
- CONCLAVE logo same in 0:10 reveal i 2:55 close (use same SVG, same animation)
- Stagger animation parameters: dot 1 = 0ms, dot 2 = 100ms, dot 3 = 200ms, dot 4 = 300ms, dot 5 = 400ms

### NIE robic
- Watermark (logo widoczny caly czas) - OBNIZA quality
- Background music behind voice-over - distraction
- Slide transitions (cube, page turn, etc.) - amateurish
- Auto-zoom Ken Burns na wszystkim - irritating
- Camera shake / handheld effect - amateur

---

## STAGE 6: Export + Upload (15 min)

### Export settings (final master)
- **Resolution:** 1280x720 (HD, ETHGlobal min, smaller upload size)
- **Codec:** H.264
- **Bitrate:** 8-10 Mbps (sufficient quality, ~150-200 MB final)
- **Framerate:** 30fps (downscale z 60fps record)
- **Audio:** AAC 320kbps stereo (mimo voice mono - stereo widely supported)
- **Container:** MP4

### Filename convention
- **Primary:** `AI-Treasury-Council-3min-EN-captions.mp4`
- **Secondary:** `AI-Treasury-Council-3min-PL-captions.mp4`
- **Teaser (jezeli zrobiony):** `AI-Treasury-Council-60s-teaser.mp4`

### Local backup
```bash
mkdir -p demo/final
cp ~/Desktop/AI-Treasury-Council-3min-EN-captions.mp4 demo/final/
cd /Users/danergy/repos/ai-treasury-council
git add demo/final/ && git commit -m "feat(demo): final video master 3:00 EN captions"
```

### Upload primary: YouTube unlisted
1. Upload na konto YouTube Dana/Matthew
2. **Visibility: Unlisted** (NIE public - hackathon judging only)
3. **Title:** "AI Treasury Council - ETHGlobal Open Agents 2026 Demo"
4. **Description:**
   ```
   AI Treasury Council demo (3 min) - ETHGlobal Open Agents 2026 submission.
   
   Multi-agent AI Council debates DAO treasury decisions on-chain.
   - 4 contracts deployed Base Sepolia
   - 0G Storage audit trail
   - ENS subnames per agent
   - 5 trust mechanisms (Mayer-Davis-Schoorman ABI model)
   
   GitHub: https://github.com/danergXx-xX/ETH-Global
   Demo app: [Vercel URL]
   FEEDBACK: docs/FEEDBACK.md
   
   Built by Dan Otomanski + Matthew [last name].
   ```
5. **Custom thumbnail:** CONCLAVE logo + tagline "Your treasury, deliberated." (Inter Bold 32pt)
6. **Captions:** YouTube ma własne caption layer - upload SRT jako backup (CAPTIONS-EN.srt + CAPTIONS-PL.srt)

### Upload backup: Vimeo unlisted
- Same settings, Vimeo Pro account
- URL backup w razie YouTube down podczas judging

### Submission integration
- [ ] Embed link YouTube w README.md ETHGlobal submission
- [ ] Embed w FEEDBACK.md jezeli wymagane
- [ ] Test linka raz w incognito browser przed deadline 18:00

---

## TROUBLESHOOTING

### "Final video > 3:00"
- Identyfikuj najdluzsze static shots (DaVinci/Final Cut "Inspector" pokazuje per clip duration)
- Wytnij infografiki jezeli zostaly (powinno byc 0 po Frame 11 rewrite)
- Skroc Frame 12 close 30s -> 25s (overlay text shorter hold)
- Speed-up subtle (1.05x) na slow-talkujacych segmentach (audio pitch correction ON)

### "Audio quality bad"
- Re-record voice-over only (RECORDING-CHECKLIST Plan C, 30 min)
- Place new audio nad istniejace visuals (sync z punktow click)

### "Caption sync off"
- Manual nudge w editorze (DaVinci: drag caption block na timeline)
- Tolerable: max 0.2s delay
- Jezeli > 0.5s: re-generate captions z lepszym audio source

### "Color inconsistent miedzy clips"
- DaVinci "Match Color" feature (right-click clip -> Match)
- Manual: kazdy clip dostaje same exposure +/- 0.3 EV adjustment

### "Klient (juror) ma blokade na background music"
- Zostaw video bez music (Eva default) - nie problem

---

## QUALITY CHECKLIST PRE-UPLOAD

- [ ] Duration <= 3:00 (target 2:50 z 10s buffer)
- [ ] Audio normalize -12 LUFS
- [ ] No clipping (peaks <-1 dBFS)
- [ ] No background music
- [ ] Captions burned-in PL+EN versions
- [ ] Captions sync max 0.2s delay
- [ ] No browser notifications visible
- [ ] No personal info (real wallet, real funds)
- [ ] Logo intro/outro consistent
- [ ] Sponsor logos visible 1:55-2:30 (per STORYBOARD Frame 11)
- [ ] Demo URL + GitHub readable Frame 12 (min 24pt)
- [ ] WOW Moment 1 (Frame 5 typewriter) preserved + impactful
- [ ] WOW Moment 2 (Frame 9 Basescan) preserved + impactful
- [ ] Color grading consistent across cuts
- [ ] Final smoke test playback (oglodaj caly 3 min raz, end-to-end)

---

## DELIVERABLES

Po STAGE 6:
- [ ] `demo/final/AI-Treasury-Council-3min-EN-captions.mp4` (primary)
- [ ] `demo/final/AI-Treasury-Council-3min-PL-captions.mp4` (secondary, opcjonalne)
- [ ] `demo/final/AI-Treasury-Council-60s-teaser.mp4` (jezeli czas, dla Twitter/Farcaster)
- [ ] YouTube unlisted URL
- [ ] Vimeo unlisted URL (backup)
- [ ] README.md submission updated z embed link
