---
title: Pre-recorded fallback clips for live demo
date: 2026-05-03 (Eva action batch A4 autonomous improvement)
linked: FAILURE-PLAYBOOK.md
status: placeholders - record Sunday morning before live demo
---

# Pre-recorded Fallback Clips

> **Cel:** zero-panic recovery during live demo. Each clip is unlisted YouTube, ~60-90s, narrated over real UI flow.

## Required clips (record Sun 09:00-11:00 PL)

### Clip 1: Full debate flow (90s)
- **URL placeholder:** `https://youtube.com/watch?v=AITC-DEBATE-FALLBACK-001`
- **Used in:** scenario 2 (Anthropic rate limit), compound failures
- **Content:** proposal submission -> 5 agents typewriter -> verdict card with sources -> vote -> timelock countdown -> execute
- **Recording:** Screen Studio, no voiceover (Dan narrates live), 1080p

### Clip 2: 0G CID verification (45s)
- **URL placeholder:** `https://youtube.com/watch?v=AITC-0G-FALLBACK-001`
- **Used in:** scenario 5 (0G timeout) backup if Pinata also slow
- **Content:** click verdict card -> 0G explorer -> content hash visible -> agent signature -> download transcript JSON
- **Recording:** Screen Studio, 1080p

### Clip 3: Full submission demo (180s = exact submission video)
- **URL placeholder:** `https://youtube.com/watch?v=AITC-FULL-DEMO-001`
- **Used in:** compound failures, ultimate fallback
- **Content:** identical to ETHGlobal submission video (SCRIPT.md -> 3:00)
- **Recording:** same as production submission

## Setup checklist

- [ ] YouTube account: `aitc-council@danergy.pl` (create Sun morning if missing)
- [ ] Visibility: Unlisted (not private - judges can open URL)
- [ ] No ads enabled
- [ ] Description points to GitHub repo + JUDGES-ONBOARDING.md
- [ ] URLs hardcoded in FAILURE-PLAYBOOK.md after upload (replace placeholders)
- [ ] Clipboard manager (Raycast / Maccy) has all 3 URLs as snippets for instant paste

## Why placeholders, not real URLs now

Recording happens Sun morning after final demo polish. URLs replace placeholders in FAILURE-PLAYBOOK.md before live demo (15:00 PL).

If recording skipped (time pressure): the live local-demo + pre-connected wallet fallbacks (scenarios 1, 3, 4, 6) cover most failure modes without needing video.
