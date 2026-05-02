# Playbook - How Dan Executes LOI Outreach

**Owner:** Dan (executes), Aria-DAO (supplies templates + tracking)
**Window:** Sob 2.05 wieczór -> Niedz 3.05 16:00 PL (LOI capture cutoff)
**Goal:** 1-2 LOI signed before submission. Realistic target given window + hackathon mode.

**Filozofia:** Quality > quantity. 5 dobrze targetowanych DM > 50 spam. 3 touches max per kontakt - po tym stop, nie naciskaj.

**Zasada #48 (Dan kontroluje komunikacje):** Aria-DAO przygotowuje templates + tracking. **Dan wysyla osobiscie.** NIE wysyłamy automatycznie z Claude.

---

## Day 1: Sob 2.05 wieczór LUB Niedz 3.05 rano (przed standup 9:00)

### Step 1: Pre-flight (5 min)

- [ ] Otwórz `docs/loi/TARGET-DAOS.md` - read top 5 priority sections
- [ ] Otwórz `docs/loi/DM-TEMPLATES.md` - read 5 wybranych templates (1A, 2A, 3A, 4A, 5A = Twitter DMs)
- [ ] Otwórz `docs/loi/TRACKING.md` - to live update
- [ ] **Sprawdź https://aitc.vercel.app czy live** - jesli **NIE** wstaje, zamien `Demo: https://aitc.vercel.app (live Sun 3.05)` we wszystkich templates na `Repo + README: github.com/danergXx-xX/ETH-Global` (martwy demo link = strzal w stope, kontakt traci zaufanie)
- [ ] **Wypelnij placeholders w `LOI-TEMPLATE.md` linie 22 (Twitter, ENS) + 102 (return email)** - ZANIM ktokolwiek dostanie LOI. Sugerowane: `Twitter: @your_handle`, `ENS: dan.eth lub dotomanski.eth`, return: `dan@yourdomain.com lub Twitter DM @your_handle`. NIE wysylaj LOI z "TBD" - zniszczy credibility.

### Step 2: Wyślij 5 Twitter DM (25 min)

Zalogowany na Twitter / X jako Dan Otomanski (osobiste konto - personal touch dziala lepiej niz brand account).

**Per kontakt (5 min each):**

1. **Marc Zeller (@lemiscate)** - skopiuj template 1A z `DM-TEMPLATES.md`
   - Personalizuj hook (1 zdanie): wspomnij konkretny ACI / forum post który ostatnio czytales
   - Sprawdź czy linki dzialaja (github.com/danergXx-xX/ETH-Global)
   - Wyślij
   - **Update TRACKING.md row #1:** Sent = "2026-05-03 09:15" (lub kiedy wysłane)

2. **Kevin Owocki (@owocki)** - template 2A
   - Personalizuj: jego ostatni tweet o AI/regen
   - Wyślij
   - **Update TRACKING.md row #4**

3. **nick.eth (@nicksdjohnson)** - template 3A
   - Personalizuj: konkretny detail ENS subname implementation (NameStone, text records)
   - Wyślij
   - **Update TRACKING.md row #7**

4. **Lefteris (@LefterisJP)** - template 4A
   - Personalizuj: wspomnij Rotki lub jego ostatni komentarz na OP forum
   - Wyślij
   - **Update TRACKING.md row #10**

5. **getty.eth (@iamgetty)** - template 5A
   - Personalizuj: COMP buyback context
   - Wyślij
   - **Update TRACKING.md row #13**

**Time budget:** 25 min total (5 min each). Hook personalization to wartosc - generic "saw your tweets" jest spotted as AI/spam.

### Step 3: Pierwszy forum post (15 min) - opcjonalne, jesli czas

Wybierz 1 forum z najlepszym fitem (rekomendacja: ENS Meta-Gov - kultura tech-deep, jest miejsce dla feedback request):

- Otwórz https://discuss.ens.domains/
- New topic w Meta-Governance category
- Skopiuj template 3C
- Tytul: "Agent identity via ENS subnames - feedback request from ETHGlobal build"
- Postuj
- **Update TRACKING.md row #9**

**Total Day 1:** ~45 min, 5 DM + 1 forum post.

---

## Day 1 evening: Check responses (5 min)

- [ ] Sprawdź Twitter DM inbox - czy ktos odpisal?
- [ ] Sprawdź forum (jesli postowałeś) - czy ktos zareagowal?
- [ ] **Update TRACKING.md** dla kazdej responsy (nawet "no reply" pomaga w post-mortem)

Jesli **YES response** - skocz do "LOI capture flow" ponizej.

Jesli **objection / question** - skocz do `RESPONSE-PLAYBOOK.md`.

Jesli **no response** - czekaj 12h, then Day 2 follow-up.

---

## Day 2: Niedz 3.05 popołudnie (12:00-15:00 PL)

### Step 1: Follow-up no-responses (20 min)

Per kontakt z Day 1 z brakiem odpowiedzi po 12h (sprawdź TRACKING.md):

- Wyślij 2nd touch via INNY kanal (jesli Twitter -> Discord, lub odwrotnie)
- Templates 1B, 2B, 3B, 4B, 5B (Discord DMs) lub 1C, 2C, 3C, 4C, 5C (forum)
- **Update TRACKING.md** z 2nd touch

**Cap:** 3 touches max. Po 3 stop, nawet jesli no response.

### Step 2: 2nd wave forum posts (30 min)

Postuj na pozostałych forach (jesli nie zrobiłeś wszystkich Day 1):

- governance.aave.com (template 1C)
- gov.gitcoin.co (template 2C)
- gov.optimism.io (template 4C)
- comp.xyz (template 5C)

Forum posts = publiczne = widoczne dla calej społeczności, nie tylko 1 osoby. Wyzsza szansa na "kogos" co odpisze.

### Step 3: Stretch DAOs jesli czas (30 min)

Jesli wszystkie Top 5 wysłane i jest energia:
- Arbitrum (#16) - forum L2BEAT thread
- Maker / Sky (#17) - forum.sky.money post (forum-first culture)
- Lido (#18) - Steakhouse Financial Twitter

---

## LOI capture flow (when someone says yes)

**Trigger:** ktos odpowiada "looks interesting, send LOI" lub "happy to give a paragraph".

### Step 1: Wyślij LOI template (5 min)

Wyślij link do raw GitHub:
```
https://github.com/danergXx-xX/ETH-Global/blob/main/docs/loi/LOI-TEMPLATE.md
```

LUB paste tekst LOI inline (jesli na Twitter/Discord nie dzialaja markdown links dobrze).

Powiedz: "Lowest friction option - text reply with the body filled in is enough. PDF / signed copy mile widziane ale nie wymagane."

### Step 2: Wybor formatu signature

Daj 3 opcje:
- **Text reply** (najlatwiej): they paste filled-in LOI text in DM/email reply
- **Screenshot** typed-out LOI w Notion/Doc/anywhere
- **PDF z signature** (jesli chcą formal)

Jakikolwiek format akceptujemy. NIE blokuj na format.

### Step 3: Capture commit do repo

Stworz `/docs/loi/signed/[handle]-[dao].md`:

```markdown
# LOI - [Name/Handle], [DAO]

**Received:** [date]
**Channel:** [Twitter DM / Email / Forum]
**Anonymization:** [option chosen from LOI-TEMPLATE.md]

## Statement (verbatim)

[paste LOI text exactly as received]

## Verification

- Original message screenshot: [path lub URL]
- Sender handle: [@handle]
- Public verification: [forum post / Twitter / ENS]
```

Commit + push:
```bash
cd ~/repos/ai-treasury-council-loi
git add docs/loi/signed/[handle]-[dao].md
git commit -m "feat(loi): capture LOI from [handle] ([DAO])"
git push origin feat/loi-outreach
```

### Step 4: Update tracking + submission

- **TRACKING.md:** LOI status -> "signed"
- **ETHGlobal submission form:** w sekcji "Real-world traction" lub "Validation" wpisz:
  ```
  Letter of Intent received from [handle/anonymized] ([DAO] contributor) confirming interest in piloting AI Treasury Council for [DAO] treasury operations once mature. Full LOI: [github link]
  ```
- **Demo video (Eva)** - opcjonalnie, jesli czas: pokazujemy LOI quote na slide

---

## 5 typowych scenariuszy responsy + co odpowiadac

(Pelne objection handling: `RESPONSE-PLAYBOOK.md`)

### Scenariusz 1: "Looks interesting, send LOI"

→ Ścieżka LOI capture (powyzej). Cel: signed LOI w <2h.

### Scenariusz 2: "Send me more info first"

→ Uzyj `docs/loi/ONE-PAGER.md` (3 warianty: A generyczny, B trust-focused, C dev-focused). Wybierz wariant per contributor signal (matrix w ONE-PAGER.md), spersonalizuj `[DAO]` + use case, paste w response.

### Scenariusz 3: "Maybe post-hackathon"

→ Reply asking for soft commitment NOW:
```
Totally fair. For ETHGlobal Sun 3.05, even a soft "I would consider evaluating this for [DAO] post-hackathon when more mature" works as the LOI. Non-binding. Two sentences in DM is enough - no template required.

Either way thanks for the read.
```

Capture verbatim DM as semi-LOI (`docs/loi/signed/[handle]-[dao]-soft.md`).

### Scenariusz 4: Specific objection (security/cost/legitimacy)

→ Address WITHOUT defensiveness. Per `RESPONSE-PLAYBOOK.md` (5 objections covered). Example:

Objection: "AI making treasury decisions sounds like a bad idea."

Reply:
```
Agree 100% - AI should not make treasury decisions. Project is positioned as augmenting (not replacing) human delegates: AI debates surface arguments, source-cited claims become auditable, transcript stored immutably. Final vote stays on-chain via OZ Governor, executed by Timelock. Humans always decide.

If "augmenting human delegate analysis" is closer to useful, the 1-paragraph LOI ("would consider piloting once mature") still works. If even that framing does not land, totally fine to say so.
```

### Scenariusz 5: "Not interested / not for us"

→ Thank + move on. NIE pushuj. Reply:
```
Got it, thanks for the read. Good luck with [DAO]'s gov work.
```

Update TRACKING.md: LOI status -> "declined". Move to next contact.

---

## Stop conditions

**Stop outreach when:**
- 1 LOI signed (target met, can stop or do 1 more for safety)
- 2 LOI signed (above target, definitely stop)
- 16:00 PL Niedz 3.05 reached (2h before deadline, need to switch to submission prep)
- All 15 contacts at 3 touches each (cap reached)

**Never violate:**
- 3 touches max per kontakt
- Dan wysyla osobiscie (zasada #48)
- LOI = niezobowiązujący (no contracts, no financial promises)
- Anonymization respected (per signer's choice in LOI-TEMPLATE.md)
- Maja review for any new template not already in DM-TEMPLATES.md

---

## Post-mortem (after submission)

Wpisz do `docs/loi/POST-MORTEM.md`:
- Final metrics (sent, response, signed)
- Best channel / DAO
- What worked, what did not
- Templates to keep / rewrite for future use
- Long-tail: even no-LOI contacts may convert post-hackathon (keep tracker live for 30 days)
