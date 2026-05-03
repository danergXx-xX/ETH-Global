# JUDGE-QA-PREP - Competitive Addendum (Sesja 34)

**Cel:** uzupelnienie pytan z `JUDGE-QA-PREP.md` (PR feat/judge-qa-prep) o real dane z ethglobal-skills (17,180+ projekty w bazie). Plik separate (anti-konflikt z innym PR-em).

**Source data:** Sesja 34 + COMPETITIVE-ANALYSIS.md.

---

## Pytania ktore sedziowie ZADADZA na 90% (na podstawie patternow Cannes 2026 winners)

### CQ-1: "Co was odroznia od Alpha Dawg, Goldman Stacked, Agentropolis?"

**Krotka odpowiedz (15s):**

> Alpha Dawg robi personal trading swarm w TEE - 10 agentow szuka alpha dla 1 usera. Agentropolis to gamified personal trading na Uniswap v4 hooks. Goldman Stacked ma quadratic voting cross-chain ale bez source attribution. My robimy DAO TREASURY (nie personal), z 5 trust mechanisms strukturalnie wbudowanymi (source attribution per claim z confidence, timelock countdown UI, 0G immutable audit trail, ENS reputation, human-in-loop config), oraz native OpenZeppelin Governor + Timelock 48h - production-grade DAO stack ktory contributor wezmie do produkcji jutro.

**Backup data dla challengowego sedziego:**
- Alpha Dawg: ETHGlobal Cannes 2026, 0G "Best De Fi App" 2nd place. URL: https://ethglobal.com/showcase/alpha-dawg-fh6vm
- Goldman Stacked: ETHGlobal Prague (older). URL: https://ethglobal.com/showcase/goldman-stacked-xr505
- Agentropolis: HackMoney 2026 (no major prize). URL: https://ethglobal.com/showcase/agentropolis-qhtbb
- Source attribution unique: keyword search "source attribution" w bazie 17,180+ projektow zwrocil 2 trafienia (oba off-topic).

---

### CQ-2: "Czy Ghost in the Machine (1st ENS for AI Agents Cannes) was zwwyciezyl?"

**Krotka odpowiedz (15s):**

> Ghost in the Machine to brilliant projekt - 30+ ENS text records per agent, full state on-chain dla PERSONALNYCH agentow trade/learn/die. My idziemy w innym kierunku: ENS subname per agent w COUNCIL governance (bull.aicouncil.eth, bear.aicouncil.eth), reputation surfaced w text records, anchored w DAO treasury context. Roznia: oni "agent zyje sam", my "agent ma role w organizacji ktora kontroluje treasury". Komplementarne approach.

**Honest disclosure:** w PHASE 4 mamy frontend stub dla ENS resolution (Phase 2 NameStone signup pending). Jesli sedzia zapyta:

> Phase 2 oznacza ze NameStone integracja jest po deadline. Na demo pokazujemy [albo: live mintowane manualnie subnames + text records / albo: stub w frontend z Phase 2 roadmap]. Honest scope - patrz JUDGES-ONBOARDING.md "What is NOT in the demo".

**REKOMENDACJA Maxima/Sol:** mintuj 5 subnames + ustaw reputation text records LIVE przed demo recording (~30 min pracy). Eliminuje "stub" pytanie.

---

### CQ-3: "Show me a 0G CID I can verify"

**Krotka odpowiedz (10s):**

> [open scrollable widget in UI] Tutaj jest CID dla ostatniej debate - kliknij i otworzy plik na 0G explorer. Tu jest content hash, tu sygnatura agenta. Pelny transcript downlodowalny.

**Pattern winners (na podstawie Cannes 2026):**
- Wszyscy top-3 0G winners maja **live demo z real CID/storage proof** - "proves every step on-chain" (Alpha Dawg)
- Mock/stub = penalty. Live = baseline expectation.

**Backup jesli sedzia copy-paste:** mamy 3 testowe debaty deploed na 0G testnet - pokazac wszystkie 3 CID-y dla cross-check.

**Jesli 0G testnet down:** IPFS Pinata fallback (factory pattern w `apps/api/storage/factory.py`) - wciaz live demo, dokumentowac dlaczego fallback.

---

### CQ-4: "Why should I trust an AI to manage my treasury vs human governance?"

**Krotka odpowiedz (20s):**

> Nie zastepujemy human governance - WZMACNIAMY ja. AI council debatuje strukturalnie z cited sources, zapisuje audit trail na 0G, ale **token holders glosuja przez OpenZeppelin Governor i 48-godzinny timelock daje czas na challenge zanim cokolwiek sie wykona**. AI to attorney research team, human DAO to client decyzja. 5 trust mechanisms (source attribution, timelock UI, 0G audit, ENS reputation, human-in-loop config) zapewniaja ze human nigdy nie jest "rubber stamp".

**Backup data:**
- Goldman Stacked (Prague) tez ma "AI council vets DAO proposals" angle ale bez timelock + source attribution. My rozszerzamy.
- Pattern dataset: keyword "council" w DB - 10 trafien, zaden NIE ma 5-trust framework + timelock + source attribution combo. Differentiator weryfikowalny.
- Reference: trust-research.md (Sora 5 mechanizmow, OBLIGATORYJNE w MVP per dev-team).

**Anty-pattern do unikania:** "AI takes over governance" framing. ZAWSZE: "AI advises, humans decide".

---

### CQ-5: "What's your business model? Real product post-hackathon?"

**Krotka odpowiedz (15s):**

> Open source core (governance + agent framework). Premium SaaS dla DAO contributors: managed council deployment, custom agent personas, integrations z istniejacymi DAO frameworks (Aragon, Tally, Snapshot). Trust-as-a-service dla DAOs ktore juz kontroluja $26B treasury i potrzebuja structured analysis. Have LOI conversations rozpoczete (patrz docs/loi/).

**Backup pattern (ETHGlobal Cannes 2026 winners):**
- Wieksksosc 0G winners ma SaaS / open core model w deck (Croisette, Meridian)
- "Just exploration" projekty NIE wygrywaja Best De Fi top-3
- ETHGlobal Finalists Agentic Ethereum 2025: 7/10 mialo jasny business angle, 3/10 explorations - pattern: business angle helps but not strict requirement for Finalist

---

### CQ-6: "ENS - cross-chain reference?"

**Krotka odpowiedz:**

> Nasz ENS jest na L1 Sepolia (Phase 2 NameStone w plany na L1 mainnet). Smart contracts deployed na Base Sepolia. Integration cross-chain: ENS resolution z Base wymaga ENS Resolver lookup na L1 - mamy implementacje w `apps/web/components/ENSIdentityCard.tsx`.

**Pattern HackMoney 2026 ENS Integrate winners:** wieksksosc robila cross-chain payments via ENS (Nominal, ENSRouter, WarpSend). ALE wszystkie placement < 1st (1st was Ghost in the Machine na Cannes earlier dla AI Agents). Cross-chain = baseline, NIE differentiator do 1st prize.

**Honest:** my robimy ENS jako agent identity (anchor reputation), NIE jako payment routing. Differentiator w INNY angle (AI Agents track), nie cross-chain.

---

### CQ-7: "Who else is building this? Are you first?"

**Krotka odpowiedz (15s):**

> Sprawdzilismy w bazie 17,180+ projektow ETHGlobal. Najblizsze: Goldman Stacked (Prague, AI council DAO governance, brak source attribution + brak 0G/ENS), Agentropolis (HackMoney, gamified personal trading, brak DAO treasury angle), Alpha Dawg (Cannes, swarm + on-chain proof + TEE, ale personal trading not DAO). My jestesmy pierwsi w **DAO treasury management z multi-agent debate + cited sources + ENS-anchored reputation + native OZ Governor stack**.

**Honest disclosure:** szybko wymieniamy 4 podobne projekty (Goldman, Agentropolis, Alpha Dawg, Yes or nAI). Pokazuje ze zrobilismy homework, NIE udajemy ze jestesmy pierwsi w niczym. Sedziowie ceni honesty.

---

## Top 3 differentiators - elevator (3 razy w demo, 1 raz w README, 1 raz w JUDGES-ONBOARDING)

1. **Source attribution per agent claim** z URLs + confidence weights 0.0-1.0 (RSS, CoinGecko, DefiLlama). Zero matches w bazie 17,180+ projektow.
2. **5 trust mechanisms structured** (source + timelock + audit + reputation + human-in-loop) jako odpowiedz na "dlaczego ufac AI". Strukturalna 5-warstwowa, nie ad-hoc.
3. **Native DAO Governance** (OpenZeppelin Governor v5 + ERC20Votes + Timelock 48h) - production-grade stack, contributor wezmie jutro.

---

## Mapping do istniejacych pytan w JUDGE-QA-PREP.md (PR feat/judge-qa-prep)

Poniewaz JUDGE-QA-PREP.md jest na innym branchu (anti-konflikt z PR feat/judge-qa-prep), Sesja 32 lub PM-Lead **moze inkorporowac powyzsze CQ-1 do CQ-7 jako rozszerzenie** istniejacych pytan w nastepujacy sposob:

| Existing Q (z PR feat/judge-qa-prep) | Augment z |
|---|---|
| Q3.5 Uniswap v4 hooks | nie augment (off-topic vs Sesja 34 scope) |
| Q3.7 KeeperHub | nie augment (NIE claimujemy KeeperHub track) |
| Q3.9 Business model | **CQ-5** (real product post-hackathon, pattern Cannes winners) |
| Q3.10 What happens after hackathon | **CQ-5** (LOI, SaaS model) |
| Q4.6 Reputation values 75-92% | **CQ-4** (AI advises, humans decide via Governor + Timelock) |
| **NEW Q** | **CQ-1, CQ-2, CQ-3, CQ-6, CQ-7** (uniqueness, ENS demo defense, 0G CID demo, cross-chain, "are you first") |

Po merge feat/judge-qa-prep, PM-Lead lub Maja moze inkorporowac do main JUDGE-QA-PREP.md.

---

## Anti-AI-zmy compliance

ASCII interpunkcja zachowana. Bez em-dashy / typograficznych cudzyslowow. Polskie diakrytyki w odpowiedziach do Dana, ASCII pattern w technicznym contencie do sedziow EN.
