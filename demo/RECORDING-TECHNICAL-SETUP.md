---
title: Recording Technical Setup
duration: total ~90 min (recording 30 + editing 30 + upload 15 + buffer 15)
date: 2026-05-03 (Eva Sesja EVA-MINI-STORYBOARD)
linked: STORYBOARD.md, SCRIPT.md, RECORDING-CHECKLIST.md, FAILURE-PLAYBOOK.md
output: 1080p MP4, max 100MB, YouTube unlisted
---

# Recording Technical Setup

> **Eva rule:** zero zmiennych w nagraniu. Wszystko przygotowane PRZED kamera-on. Total time od "start recording" do "upload YouTube" = 90 min jezeli wszystko gotowe.

---

## Equipment

### Mac
- **Software A (free, default):** QuickTime Player (built-in macOS)
  - File > New Screen Recording > Options: include audio (built-in mic lub external)
  - Target: 1920x1080 native
- **Software B (paid, lepsze):** Screen Studio ($89, license Eva-Recording-Prep)
  - Native cursor highlight + zoom + click animations bez post-processing
  - Lepsza opcja jezeli budzet pozwala (Eva rec)
- **Software C (free alt):** OBS Studio (advanced users)

### Mic
- **Default:** built-in MacBook mic (acceptable for demo)
- **Recommended:** external USB mic (Blue Yeti, Rode NT-USB) - lepsza jakosc
- **Test:** nagraj 10s test, sprawdz peak -12 LUFS, brak echo, brak background noise

### Resolution / Frame rate / Audio
- Resolution: **1920x1080** (1080p min, ETHGlobal Matthew explicit)
- Frame rate: **30fps** (60fps OK ale wieksza file size)
- Audio: **44.1kHz stereo** (lub mono jezeli mic mono)
- Codec: H.264 MP4 (max 100MB final)

---

## Browser setup

- **Chrome incognito** (czyste, brak extensions w view, brak password autofill popup)
- **Window size:** dokladnie 1920x1080
  - DevTools > Toggle device toolbar > Responsive 1920x1080
  - Lub manual fullscreen + zaslon czarny pasek menu (Hide menu bar w System Settings podczas nagrania)
- **Zoom:** 100% (Cmd+0)
- **Hide bookmarks bar** (Cmd+Shift+B toggle off)
- **Disable notifications** (System Settings > Notifications > Do Not Disturb ON)
- **Close all other tabs/windows** (zero distractions)
- **Wallet:** MetaMask connected na Base Sepolia, test wallet `0x4872F81A0fFeb204D13f17644e26e7345F7d148a` z funds (ETH + mUSDC)
- **Pre-load Basescan tab:** otwarty w drugim oknie ZA browserem nagrywanym, ready do quick switch

---

## Pre-recording checklist (smoke test)

Wykonaj wszystko ZANIM klikniesz "Record":

- [ ] Vercel deploy LIVE: `curl -I https://aitc-pi.vercel.app` -> 200 OK
- [ ] Railway API LIVE: `curl https://api-production-1775.up.railway.app/health` -> {"status":"ok"}
- [ ] Anthropic API key OK: test debate na sandbox proposal (1 pelna runda)
- [ ] WebSocket connection OK: open dashboard, check Network tab (WS frames flowing)
- [ ] ENS subname resolves: open agent, hover, verify text records (26 records widoczne)
- [ ] Adversarial agent LIVE: trigger debate, verify red team attack appears
- [ ] Custom Agent + Test Arena working: settings/agents page, test "ESG Agent" creation
- [ ] Cost counter LIVE i pokazuje "4¢ per debate"
- [ ] Verifier badges visible (4 contracts Verified Basescan)
- [ ] Sponsor logos band loaded
- [ ] FAILURE-PLAYBOOK fallback assets gotowe w `demo/assets/fallback/`
- [ ] STORYBOARD.md + SCRIPT.md otwarte side-by-side w drugim monitorze

---

## Recording flow

1. **Otworz** QuickTime/Screen Studio. Source: Display 1 (browser).
2. **Mic level test** - powiedz "test test test" - sprawdz waveform (peak -12 LUFS).
3. **Klik Record** + poczekaj 3 sek margines (latwiejsze cuts).
4. **Dan czyta SCRIPT.md scena po scenie** patrzac na STORYBOARD.md side-by-side.
5. **Po kazdej scenie - 1 sek pauza** (latwiejsze cuts w editor).
6. **2-3 takes per scena** - bestowy w editing wybrac. Eva Charter: zero ego.
7. **Total time:** 3 min content + 30 sek margines (przed/po + pauzy).

### Tip: Segment-by-segment recording
- Najlepiej nagraj **scena po scenie** (12 osobnych plikow, kazdy 15-20s).
- 30s takes maja ~80% success rate vs ~5% dla 3:00 ciaglego take.
- Editor merguje w post-production.

### Tip: Failure handling
- Jezeli cos sie wywali w trakcie sceny -> STOP, fallback z FAILURE-PLAYBOOK.md.
- NIE udawaj ze nie widac. Sedziowie pamietaja "professional fallback" lepiej niz "panicky retry".

---

## Post-recording editing

### Software
- **iMovie** (free, built-in) - basic cuts, OK dla demo
- **Screen Studio** (recommended) - lepsze cuts + native effects
- **DaVinci Resolve** (free, advanced) - jezeli editor doswiadczony

### Editing checklist
- [ ] Cut intro/outro pauses (3s margines)
- [ ] Cross-fade 0.3s miedzy scenami
- [ ] Hard cut na high-energy moments (Scena 5 typewriter, Scena 6 adversarial)
- [ ] Add captions burned-in (CAPTIONS-EN.srt z Sesji 28)
- [ ] Audio normalize -12 LUFS, -1 dB true peak
- [ ] **NO background music** (Eva Charter - "dystrakcja", sedziowie focus na content)
- [ ] Color grade: subtle, NIE crush blacks (oklch palette zachowac)
- [ ] Final length check: target 2:50, max 3:00 hard limit

### Export settings
- Format: **MP4 H.264**
- Resolution: **1920x1080** (1080p)
- Frame rate: 30fps lub 60fps
- Bitrate: ~8 Mbps (CBR lub VBR 2-pass)
- Audio: AAC 256kbps stereo
- Final size: **max 100MB** (YouTube friendly + ETHGlobal upload limit)

---

## YouTube upload

### Account
- Twoj YouTube account (sprawdz limit upload - default 15 min OK dla 3 min)
- Verify account jezeli pierwszy upload (sms code)

### Privacy
- **Unlisted** (link only) - NIE Public, NIE Private
- ETHGlobal sedziowie dostana link, NIE szukaja na YouTube

### Title
> AI Treasury Council - ETHGlobal Open Agents 2026 Demo

### Description
```
AI Treasury Council - 5 AI agents debate DAO treasury decisions in real-time, with on-chain proof-of-work.

Built at ETHGlobal Open Agents 2026 by Dan Otomanski + Matthew.

Live demo: https://aitc-pi.vercel.app
GitHub: https://github.com/danergXx-xX/ETH-Global
Docs: README + FEEDBACK.md

Tracks:
- 0G Storage (immutable audit trail)
- ENS Identity (5 agent subnames + 26 text records)
- ENS Creative (custom agent extensibility)
- Finalist (multi-agent A2A debate)

Powered by: Anthropic, 0G Storage, ENS, Base, Foundry, NameStone, KeeperHub, Uniswap v4 hooks.

Open source. Pilot ready.
```

### Tags
```
ethglobal, ai-agents, dao, treasury, ens, 0g, anthropic, base, multi-agent, governance
```

### Thumbnail
- Screenshot landing page (high contrast)
- Lub composite: CONCLAVE logo + "5 Agents Debate Your Treasury" + amber accent
- 1280x720 minimum, JPG/PNG <2MB

### Categorization
- Category: Science & Technology
- Language: English
- Captions: Upload CAPTIONS-EN.srt (auto-detect on)

---

## ETHGlobal submission integration

Po YouTube upload:
1. Skopiuj YouTube unlisted URL
2. Wklej do ETHGlobal submission form (`Demo video URL`)
3. Sprawdz preview (URL embed dziala)
4. Submit final

---

## Backup plan

- **Backup 1:** Po recording - skopiuj raw .mov files na external SSD
- **Backup 2:** Po editing - upload final MP4 na Google Drive (Dan personal) jako secondary
- **Backup 3:** Po YouTube upload - skopiuj URL + thumbnail do `demo/RECORDING-LOG.md` z timestamp
- **Disaster recovery:** jezeli YouTube takes down (unlikely, unlisted) -> Drive backup link w submission

---

## Total ETA

| Krok | Czas | Cumulative |
|------|------|------------|
| Setup + smoke test | 10 min | 0:10 |
| Recording (12 scen, 2-3 takes) | 30 min | 0:40 |
| Editing (cuts + captions + audio) | 30 min | 1:10 |
| Upload YouTube (process + metadata) | 15 min | 1:25 |
| Buffer (unexpected) | 15 min | 1:40 |
| **TOTAL** | **90 min** | **1:30** |

---

## Eva ready-state dla EVA-RECORDING

Sesja EVA-RECORDING (final z Danem) wymaga:
- [x] STORYBOARD.md (ten dokument linkuje)
- [x] SCRIPT.md (Sesja 28 polished EN)
- [x] RECORDING-CHECKLIST.md (Sesja 28+36 smoke test)
- [x] FAILURE-PLAYBOOK.md (Sesja 36 6 scenariuszy)
- [x] CAPTIONS-EN.srt (Sesja 28)
- [x] RECORDING-TECHNICAL-SETUP.md (ten plik)
- [ ] Quill smoke test green (sequential prerequisite - sprawdz przed uruchomieniem EVA-RECORDING)
- [ ] FAILURE-PLAYBOOK fallback assets gotowe w `demo/assets/fallback/`

Po Quill green -> EVA-RECORDING sequential session z Danem (90 min ETA).
