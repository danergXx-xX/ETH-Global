# LOI Outreach - Live Tracking

**Owner:** Dan (live updates as DM sent / response received)
**Window:** Sob 2.05 wieczor -> Niedz 3.05 16:00 PL (LOI capture cutoff = 2h przed deadline)
**Cap:** 3 touches max per kontakt (Aria-DAO regula).

**Legend:**
- **Sent:** YYYY-MM-DD HH:MM (PL time) lub "NO"
- **Response:** "no reply" / "warm" / "cold" / "interested" / "not now" / verbatim quote
- **LOI status:** "-" (not asked yet) / "asked, pending" / "verbal yes" / "signed" / "declined"
- **Notes:** link do thread, screenshot path, follow-up reminder

---

## Top 5 priority - 15 contacts

| # | DAO | Contact | Channel | Sent | Response | LOI status | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Aave | Marc Zeller (@lemiscate) | Twitter DM | NO | - | - | Template 1A. Forum reference: post-ACI delegate framework discussion |
| 2 | Aave | TokenLogic (Matthew Graham) | Discord DM | NO | - | - | Template 1B. Mention recent ARFC thread. Aave Discord. |
| 3 | Aave | Forum reply | Forum (governance.aave.com) | NO | - | - | Template 1C. Reply on TokenLogic ARFC thread (find latest active treasury thread). |
| 4 | Gitcoin | Kevin Owocki (@owocki) | Twitter DM | NO | - | - | Template 2A. Highest hit-rate (Owocki responsive). Reference his AI+regen threads. |
| 5 | Gitcoin | Coleen Chase | Discord DM | NO | - | - | Template 2B. Gitcoin Discord. DAO ops lead. |
| 6 | Gitcoin | Forum post | Forum (gov.gitcoin.co) | NO | - | - | Template 2C. Post in Governance category. Reference 2026 budget context. |
| 7 | ENS | nick.eth (@nicksdjohnson) | Twitter DM | NO | - | - | Template 3A. Lead with ENS subname implementation detail (NameStone, text records reputation). |
| 8 | ENS | Coltron.eth | Discord DM | NO | - | - | Template 3B. ENS Discord. Meta-Gov Working Group. |
| 9 | ENS | Forum post | Forum (discuss.ens.domains) | NO | - | - | Template 3C. Meta-Governance category. |
| 10 | Optimism | Lefteris Karapetsas (@LefterisJP) | Twitter DM | NO | - | - | Template 4A. Sharp critic, fair. Lead with "call BS if it is theater". |
| 11 | Optimism | Karl Floersch (@karl_dot_tech) | Twitter DM | NO | - | - | Template 4B. OP Labs co-founder. RetroPGF angle. |
| 12 | Optimism | Forum post | Forum (gov.optimism.io) | NO | - | - | Template 4C. Governance Tooling category. |
| 13 | Compound | getty.eth (@iamgetty) | Twitter DM | NO | - | - | Template 5A. COMP buyback angle. |
| 14 | Compound | GFX Labs (@gfxlabs) | Discord DM | NO | - | - | Template 5B. Technical depth firm, Compound v3 angle. |
| 15 | Compound | Forum post | Forum (comp.xyz) | NO | - | - | Template 5C. Governance category. |

---

## Stretch (jesli czas po Top 5)

| # | DAO | Contact | Channel | Sent | Response | LOI status | Notes |
|---|---|---|---|---|---|---|---|
| 16 | Arbitrum | L2BEAT delegate / Krzysztof | Forum/Twitter | NO | - | - | STIP/LTIPP grant programs angle |
| 17 | Maker (Sky) | PaperImperium / BA Labs | Forum (forum.sky.money) | NO | - | - | Endgame Allocator decisions angle. Forum-first culture (no Discord DM) |
| 18 | Lido | Steakhouse Financial | Twitter / Forum | NO | - | - | Validator gov + treasury diversification angle |

---

## Day 1 plan (Sob 2.05 wieczor lub Niedz 3.05 rano przed standup)

**Goal:** 5 DM, jeden per priority DAO, najwyzej-priority contact + channel.

Recommended first wave:
1. Marc Zeller - Twitter DM (#1)
2. Kevin Owocki - Twitter DM (#4) [highest hit rate]
3. nick.eth - Twitter DM (#7) [ENS subname concrete angle]
4. Lefteris - Twitter DM (#10) [sharp critic, fair]
5. getty.eth - Twitter DM (#13)

**Time budget:** 30 min (kazdy template juz gotowy, Dan personalizuje hook + wysyla)

---

## Day 2 plan (Niedz 3.05 popoludnie 12:00-15:00 PL)

**Goal:** Follow-up no-response + 2nd wave (forum posts).

For each contact w Day 1 with no response after 12h:
- Wyslij 2nd touch via inny kanal (jesli Twitter -> Discord, lub odwrotnie)
- LUB wyslij forum post (publiczny, lapie szersza publike)

Ostatnie touch: max 16:00 PL (2h przed deadline).

---

## LOI capture flow (jesli kos powie "yes")

1. **Wyslij LOI-TEMPLATE.md** (link do raw GitHub pliku albo paste tekstu)
2. **Daj 3 opcje signature** (text, screenshot, PDF) - whatever lowest friction
3. **Capture w `/docs/loi/signed/[handle]-[dao].md`** (commit do repo)
4. **Update tej tracking table:** LOI status -> "signed"
5. **Wpisz w ETHGlobal submission form** (sekcja "Real-world traction")
6. **Wpisz w demo video script** (jesli czas - Eva sesja)

---

## Response patterns - quick reference (full playbook: RESPONSE-PLAYBOOK.md)

| Response | Action |
|---|---|
| "Looks interesting, send LOI" | Sciezka A: send LOI-TEMPLATE.md, capture <2h |
| "Send me more info" | Sciezka B: 1-pager z linkami (README + arch diagram + demo URL) |
| "Maybe after hackathon" | Sciezka C: ask for soft "would consider piloting" line, capture as semi-LOI |
| "What about [security/cost/etc.]" | Sciezka D: address objection (RESPONSE-PLAYBOOK.md ma 5 typowych) |
| "Not interested / not for us" | Sciezka E: thank + move on. NIE pushuj. |
| No response after 12h | Sciezka F: 2nd touch via inny kanal. Brak po 24h = stop. |

---

## Metrics (post-mortem dla learnings, nie bottleneck)

- Wyslane DM: __ / 15
- Response rate: __%
- LOI signed: __ (target: 1-2)
- Channel best response: ___ (Twitter / Discord / Forum)
- DAO best response: ___ (Aave / Gitcoin / ENS / OP / Compound)
- Time spent total: __ h
