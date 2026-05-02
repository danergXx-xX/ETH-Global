# Response Playbook - Objection Handling per typowych odpowiedzi

**Aria-DAO autonomous improvement (Sesja 23 bonus)**
**Cel:** Dan ma fast lookup per typowy response pattern. NIE myslic 10 min - read response, find pattern, reply.

---

## Decision tree (Dan czyta response)

```
Czy contributor odpisal pozytywnie?
|
+-- TAK -> Czy zgadza sie na LOI?
|   |
|   +-- TAK -> Capture flow (verbal w DM lub signed PDF)
|   |
|   +-- NIE ALE chce dalej rozmawiac -> Scenariusz "Interested but"
|   |
|   +-- TAK ALE z warunkami -> Scenariusz "Conditional yes"
|
+-- NEUTRAL -> Czy pyta pytania?
|   |
|   +-- Tech pytania -> Scenariusz "Tech curiosity"
|   |
|   +-- Trust/governance pytania -> Scenariusz "AI governance concerns"
|   |
|   +-- Process pytania -> Scenariusz "What is LOI exactly"
|
+-- NEGATIVE -> Czy uprzejma odmowa lub agresywny?
    |
    +-- Uprzejmy -> Scenariusz "Polite decline" (akceptuj, podziekuj)
    |
    +-- Agresywny / mod warning -> Scenariusz "Stop signal" (STOP w tym DAO)
```

---

## Scenariusz 1 - "Conditional yes"

**Wzor response:**

> "Sure, but I want to add specific use cases I would actually pilot, not generic ones."

**Reading:** chce ownership, nie boilerplate.

**Twoja response:**

```
Perfect - prefer that approach. What use cases would you actually want to test?

Three I have in mind for [DAO]:
1. [USE CASE 1 specific to DAO]
2. [USE CASE 2 specific to DAO]
3. [USE CASE 3 specific to DAO]

If those land or you want to swap any, the LOI updates accordingly. No template lock-in.

- Dan
```

**Action:** Zaktualizuj LOI per ich use cases. Send revised PDF. Capture quick.

---

## Scenariusz 2 - "Interested but"

**Wzor response:**

> "Interesting work, but cannot commit to LOI - too busy / not authorized / etc."

**Reading:** zainteresowany ale ostrozny.

**Twoja response:**

```
Totally fair. Three lighter alternatives if any work:

1. Quote-able quote: 1-2 sentences saying "interesting approach, would consider exploring once production-ready" - no LOI doc, just a public statement we can cite

2. Repo star + retweet of submission tweet (Sun PM) - public signal without commitment

3. Just feedback on the demo - aitc.vercel.app, anything wrong/right that catches your eye

Any of those help signal to ETHGlobal judges. Or feedback alone is great too.

- Dan
```

**Action:** Akceptuj cokolwiek wybiera. Capture screenshot lub repo activity.

---

## Scenariusz 3 - "Tech curiosity"

**Wzor response:**

> "How does the prompt caching work? What about hallucinations?"

**Reading:** developer-mode, chce technical details.

**Twoja response:**

```
Quick technical:

- Prompt caching: Anthropic SDK with cache_control on system prompts (5-min TTL). Repeat queries on same proposal-context = ~80% token savings. Caching wired in apps/api/agents/.

- Hallucinations: every agent statement requires source URL + confidence weight (0.0-1.0) in structured output schema. If agent cannot cite, output blocked at validation. Reduces hallucination to source-misinterpretation rather than fabrication.

- Trust mechanisms (5 from Sora research):
  1. Source attribution per claim
  2. Timelock 48h with countdown UI
  3. Audit log on 0G Storage (immutable)
  4. ENS reputation badges (Moat 5 PoW)
  5. HITL Council Rules JSON (human override)

Repo: github.com/danergXx-xX/ETH-Global - check apps/api/agents/orchestrator.py for caching, schemas/ for source attribution validation.

Happy to dive deeper if useful.

- Dan
```

**Action:** Jesli pyta dalej tech - rozmowa idzie naturalnie do interest. Nie pushuj LOI od razu, daj rozmowie naturalnie dojrzec.

---

## Scenariusz 4 - "AI governance concerns"

**Wzor response:**

> "I am skeptical of AI in governance - voter sovereignty matters."

**Reading:** legitymny philosophical concern.

**Twoja response:**

```
Shared concern - design explicitly addresses it:

1. Augmentation, not replacement. AI agents debate. Token holders vote on-chain via OZ Governor. AI never holds token, never proposes, never executes.

2. Source attribution per claim - no black-box. Every AI statement cites URL + confidence weight. Verify or reject. Like reading a research report from a delegate, not a verdict from oracle.

3. HITL Council Rules JSON - explicit config for which proposal types require mandatory human review (transfers above threshold, new protocol integrations, governance changes). AI can suggest, humans must override.

4. Immutable audit trail on 0G Storage - every debate retrievable. Accountability for the AI as much as for human delegates.

Voter sovereignty stays unchanged. AI is a research assistant, not a delegate.

If this changes the calculus on LOI, great. If not, totally fair - feedback alone is valuable.

- Dan
```

**Action:** Respect skeptic. NIE pushuj LOI. Czesto skeptics, jesli przekonani, daja **najmocniejszy** LOI.

---

## Scenariusz 5 - "What is LOI exactly"

**Wzor response:**

> "Sorry, what does LOI actually mean? Like a contract?"

**Reading:** legitime confusion.

**Twoja response:**

```
Letter of Intent - 1-paragraph statement, non-binding.

Two options:

1. **Casual** (most common): 2-3 sentences in Discord/Twitter post or forum reply saying "As a [DAO] contributor, would explore piloting AI Treasury Council once mature, subject to community discussion. Non-binding."

2. **Formal** (if preferred): same statement in signed PDF (template: github.com/danergXx-xX/ETH-Global/blob/main/docs/loi/LOI-TEMPLATE.md)

Both are explicitly:
- Non-binding (no contract, no obligation)
- Exploratory (no pilot promise, just interest signal)
- Withdrawable anytime
- Personal/contributor capacity (NOT DAO-level)

Use case: ETHGlobal judges see real DAO contributor interest, not just demo. That's it.

If still feels heavy, drop the LOI - just feedback or repo star also helps.

- Dan
```

**Action:** Edukuj bez pressure. Daj wybor.

---

## Scenariusz 6 - "Polite decline"

**Wzor response:**

> "Cool project but not for me right now."

**Reading:** uprzejmy NIE.

**Twoja response:**

```
Totally fine - thanks for the look.

Repo at github.com/danergXx-xX/ETH-Global if you ever come back to it. No follow-ups from my side.

Good luck with [DAO_NAME] work.

- Dan
```

**Action:** Akceptuj. NIE follow-up. Update TRACKING.md status "pass". Relationship saved dla future, NIE damaged przez pressure.

---

## Scenariusz 7 - "Stop signal"

**Wzor response (mod / admin):**

> "Please do not DM contributors about your project - this is spam by our DAO standards."

**Reading:** crossed line per DAO etiquette. STOP.

**Twoja response:**

```
Understood - apologies for the inconvenience. Will not contact further in [DAO_NAME] community.

- Dan
```

**Action:**
1. STOP wszystkie outreach w tym DAO natychmiast
2. Update TRACKING.md - mark all contacts in tym DAO "DO NOT CONTACT"
3. NIE argue, NIE explain. Akceptuj.
4. Eskalacja do PM-Lead (informacyjna): mod stopped outreach w X DAO

---

## Scenariusz 8 - "Press / journalist contact"

**Wzor response:**

> "I cover crypto for [outlet] - can I get a quote about your LOI campaign?"

**Reading:** poza zakresem twojej decyzji.

**Twoja response:**

```
Thanks for the interest. I would prefer to coordinate any press conversation through our team lead before quoting. Let me get back to you within 24h with the right context.

- Dan
```

**Action:**
1. **NIE odpowiadaj na pytania substantively**
2. Eskalacja do Dana + Atlas (PM-Lead) natychmiast
3. Maja konsultacja Tier 1 dla quote draft jesli press akceptowany
4. Update TRACKING.md "press contact, escalated"

---

## Scenariusz 9 - "Legal request / takedown"

**Wzor response:**

> "Cease and desist - your project name infringes our trademark."

**Reading:** legal territory.

**Twoja response:**

```
Acknowledged - ceasing all outreach activity referencing this concern. Will respond formally through appropriate channels within 48h.

- Dan
```

**Action:**
1. **STOP outreach calkowicie** (wszystkie DAOs, nie tylko sender's)
2. Eskalacja do Dana NATYCHMIAST + Mateusz security agent
3. NIE komunikuj substantively bez konsultacji
4. PM-Lead decyzja jak proceed

---

## Scenariusz 10 - "Want to invest / partner"

**Wzor response:**

> "Cool project - would your team be open to investment / partnership discussion?"

**Reading:** poza scope LOI sprintu, ale pozytywne.

**Twoja response:**

```
Appreciate the interest! Right now full focus is ETHGlobal submission tomorrow. Post-hackathon (Q2 2026), happy to discuss partnership / investment context separately.

In the meantime: 1-paragraph LOI as a [DAO] contributor would already mean a lot for the submission. Non-binding, exploratory.

Then we can pick up partnership thread next week.

- Dan / dan@aitreasurycouncil.eth (placeholder, real channel post-deadline)
```

**Action:**
1. Capture LOI jesli mozliwe (immediate ask)
2. Postpone partnership rozmowa do post-deadline
3. Update TRACKING.md "partnership lead" w Notes
4. Pass to Dana po sprincie

---

## Quick lookup matrix

| Trigger phrase | Scenariusz | Response time |
|---|---|---|
| "Sure but..." | #1 Conditional yes | 1h |
| "Interesting but cannot commit" | #2 Interested but | 4h |
| "How does X work?" | #3 Tech curiosity | 4h |
| "Skeptical of AI in governance" | #4 AI concerns | 4h |
| "What is LOI?" | #5 What is LOI | 1h |
| "Not for me right now" | #6 Polite decline | 24h or skip |
| "Stop DM-ing contributors" | #7 Stop signal | IMMEDIATE STOP |
| "Press inquiry" | #8 Press contact | 24h, via PM-Lead |
| "Legal" | #9 Legal | IMMEDIATE STOP, escalate |
| "Invest / partner" | #10 Investment | 1h, postpone |

---

## Universal rules (apply zawsze)

1. **Reply within 24h** dla pozytywnych. Within 4h dla active rozmowy.
2. **Never argue** w odmowach. Akceptuj, podziekuj, move on.
3. **Never promise features.** Maxima decyduje scope.
4. **Always offer escape.** "If too busy, no worries" - low pressure.
5. **Personalize.** Per contact, NIE copy-paste.
6. **Capture artifact.** Screenshot kazdy DM exchange.
7. **Eskalacja > guess.** Press/legal/mod warning -> PM-Lead, NIE samodzielnie.
8. **Anti-AI-zmy ZERO.** Re-read kazdy reply, eliminuj em-dashes / "trust this finds you".
