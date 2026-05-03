# 1-Pager - "Send me more info" reply template

**Use case:** Contributor odpowiada "Send me more info first" lub "Tell me more" na Day 1 DM.
**Action:** Dan klika copy → paste w response. Zero pisania o 22:00.
**PLAYBOOK reference:** Scenariusz 2 "Send me more info first" (linia 191-204) - zamiast pisac inline draft, uzyj tego.

---

## Wariant A - generyczny (uzyj domyslnie)

```
Quick context (5 min read):

- Repo + README: github.com/danergXx-xX/ETH-Global
- Architecture (Mermaid diagrams): github.com/danergXx-xX/ETH-Global/blob/main/docs/architecture.md
- Live demo: https://aitc.vercel.app
- 5 contracts verified on Base Sepolia: github.com/danergXx-xX/ETH-Global/blob/main/contracts/deployments/base-sepolia.json
- FEEDBACK.md (sponsor track context): github.com/danergXx-xX/ETH-Global/blob/main/docs/FEEDBACK.md

What it does in 30 seconds:
- 5 specialized AI agents (Bull, Bear, Risk, Tech, Sentiment) debate every treasury proposal
- Each claim cites sources (RSS, CoinGecko, DefiLlama) with confidence weights 0.0-1.0
- Full debate transcript stored on 0G Storage (immutable, retrievable by CID)
- On-chain governance: OpenZeppelin Governor + 48h timelock on Base Sepolia
- ENS subnames per agent (NameStone, text records for reputation - Moat 5)

Specifically for [DAO]: [1 sentence specific use case from TARGET-DAOS.md]

If after 5 min it does not feel right, totally fine - just text "no" and we move on. If it does, the 1-paragraph LOI template is at /docs/loi/LOI-TEMPLATE.md (non-binding, exploratory).

Thanks for the time.

- Dan
```

---

## Wariant B - dla skeptics (lead with trust mechanisms)

```
Quick context, focused on the trust angle since that is what tends to come up first:

5 trust mechanisms baked into the design:
1. Source attribution per claim - every AI statement cites URL + confidence weight (no black-box)
2. Timelock 48h - countdown UI between vote pass and execution (challenge window)
3. Immutable audit trail on 0G Storage - past debates retrievable by CID
4. ENS reputation badges - agents lose rep when analysis contradicts on-chain reality post-execution (Moat 5: Proof-of-Work for agents)
5. Human-in-the-Loop Council Rules JSON - explicit config for which proposals require mandatory human override

Augmentation, not replacement: AI debates surface arguments, humans vote on-chain via OZ Governor.

Repo: github.com/danergXx-xX/ETH-Global
Demo: https://aitc.vercel.app

If trust angle resonates, the 1-paragraph LOI ("would explore piloting once mature") helps signal to ETHGlobal judges. Non-binding, withdrawable anytime.

If even trust framing does not land, feedback alone is valuable - what would need to change?

- Dan
```

---

## Wariant C - dla devs (lead with tech depth)

```
Quick technical context:

Architecture:
- Frontend: Next.js 16 + Tailwind v4 + RainbowKit + wagmi v2 + viem
- Backend: FastAPI + Anthropic SDK + prompt caching (cache_control on system prompts, ~80% token savings on repeat queries)
- Smart contracts: Solidity 0.8.24 + Foundry + OZ Contracts v5 (Governor + ERC20Votes + TimelockController)
- Storage: 0G Storage primary + IPFS Pinata fallback (factory pattern)
- Data: RSS (Reuters, CoinDesk) + CoinGecko + DefiLlama with source attribution per claim

Test coverage: 150+ PASS (97 backend pytest + 23 cross-module + 23 contracts Foundry + 7 source attribution).
Security: Mateusz security audit GO (0 CRITICAL, 0 HIGH after lxml patch + slowapi rate limit).

Repo: github.com/danergXx-xX/ETH-Global
Architecture diagram (Mermaid): github.com/danergXx-xX/ETH-Global/blob/main/docs/architecture.md
4 ADR documenting key decisions: github.com/danergXx-xX/ETH-Global/tree/main/dev-team/decisions

Code review welcome - we are open about scope (hackathon MVP, not production).

For [DAO] specifically: [1 sentence specific tech use case]

If tech depth resonates, the 1-paragraph LOI ("would explore piloting once mature") helps. Non-binding.

- Dan
```

---

## Quick decision matrix - ktory wariant uzyc

| Contributor signal | Use wariant |
|---|---|
| Generic "send more info" | A (generyczny) |
| Tone skeptyczny lub "concerns about AI" | B (trust) |
| Pyta tech ("how does X work", developer mode) | C (devs) |
| Mix signals lub niepewny | A (najbezpieczniejszy default) |

---

## Personalizacja - co Dan wypelnia per send

Per kazdy wariant:

1. **`[DAO]`** → nazwa konkretnego DAO (Aave / Gitcoin / ENS / Optimism / Compound)
2. **`[1 sentence specific use case]`** → wybierz z TARGET-DAOS.md "Why our project for [DAO]" sekcja:
   - Aave: GHO treasury management, post-ACI tooling vacuum
   - Gitcoin: grant allocation Bull/Bear/Risk debate per QF round
   - ENS: native ENS subname integration + endowment diversification
   - Optimism: RPGF allocation impact attribution + Token House grant decisions
   - Compound: COMP buyback + reserve management + v3 deployment per chain

3. **Sign-off** → Twoj handle / ENS / Twitter

---

## Anti-patterny (NIE rob)

| Anti-pattern | Why bad | Fix |
|---|---|---|
| Wysłac wszystkie 3 warianty naraz | "Spray and pray" pattern | Wybierz 1 wariant per contact |
| Modyfikowac wariant per send (zmiana tone) | Inconsistent voice | Personalizacja TYLKO `[DAO]` + use case |
| Dodawac salesy CTA ("limited time") | Pressure, anty-DAO etiquette | "Withdrawable anytime" stays |
| Linkowac stare URL-e (broken demo) | Strzal w stope | PLAYBOOK pre-flight check zawsze |
| Pisac wlasny ad-hoc 1-pager | Inconsistent quality, marnuje czas | Uzyj tych 3 wariantow |

---

## Lessons learned (uzupelniaj po kazdym sprincie)

Po LOI sprint zapisz w POST-MORTEM.md:
- Ktory wariant mial najwyzszy response rate?
- Co rewrite dla v2?
- Czy dodać wariant D dla nowego use case ktory pojawil sie?
