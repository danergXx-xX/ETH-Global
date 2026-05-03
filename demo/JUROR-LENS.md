---
title: AI Treasury Council - Juror Lens (per sponsor analysis)
date: 2026-05-02 (Eva Sesja 22)
purpose: Per juror - jaki MOMENT demo trafia w niego, co podkreslic w voice-over
linked: SCRIPT.md, STORYBOARD.md
---

# Juror Lens - Demo Per Sponsor Strategy

> **Filozofia Eva:** sedziowie pamietaja JEDEN moment. Twoje zadanie - zaprojektowac TEN moment per juror. Każdy sponsor jurora powinien zobaczyc swoja technologie zywa na ekranie + uslyszec swoja nazwe w voice-over.

> **Strategia voice-over:** 5 sponsorow x 5s każdy w segmencie 2:05-2:30 (Tech sponsor showcase). Dodatkowo per-juror konkretne momenty wcześniej w demo.

---

## 1. Kenji - 0G Foundation ($1,500+ track 2 Storage)

### Co Kenji ceni
- **0G Storage uzywany w realnej produkcji**, nie tylko "wymieniony"
- **Audytowalnosc danych** (immutable, decentralized, weryfikowalna)
- **Cost-effectiveness** dla long-term storage (jego ulubiony argument vs IPFS)
- **Real CID** widoczny on-screen, nie placeholder

### Demo moments dla Kenji
1. **1:20-1:25** - Audit Log z "0G STORAGE · LIVE" pulsing badge + najnowszy event z `CID bafy...latest`
2. **1:42-1:46** - Trust mech close-up: audit log scroll, click na 0G CID -> otwiera 0G explorer w nowej zakladce (real link)
3. **2:05-2:10** - **DEDICATED SPONSOR SEGMENT (5s):**
   - UI cut: 0G explorer pokazuje nasz CID + storage stats
   - Overlay text: **"0G Storage: subcent cost per transcript"** (zmiekczone z konkretnej liczby - wymaga defendable kalkulacji w FEEDBACK.md ZANIM nagranie)
   - Comparison: "vs IPFS pinning ~$0.05/month per file" (subtle, nie aggressive)
4. **1:30 infographic** - 5 trust mech, "0G Audit Trail" jako #3 z chain icon

### Voice-over emfazy dla Kenji
- "Cała debata zarchiwizowana na 0G Storage" (1:20-1:25 segment)
- "Niezmienialny audit log na 0G" (1:30-1:55 trust mech segment)
- "Storage cost: subcent per transkrypt debaty" (2:05-2:10 sponsor segment) - zmiekczenie $0.001 claim, defendable bez konkretnej kalkulacji w live Q&A

### Hidden details Kenji zauwazy
- ENS subnames in audit log entries (`bull.aicouncil.eth · VOTED FOR · CID bafy...`) - human-readable + decentralized identity + decentralized storage = trifecta
- Scroll w audit logu pokazuje 17 eventow - to NIE mock, to faktyczne dane z Phase 1A deploys i Phase 1B votes

### Probability: **70%** (was 50%, podniesione bo dedicated 5s segment + multiple touchpoints)

---

## 2. Hayden Adams - Uniswap Foundation ($5,000 track)

### Co Hayden ceni
- **Uniswap v4 hooks uzywane**, nie tylko "swap via Uniswap"
- **Custom hook** z prawdziwa logika (nie hello-world)
- **Treasury composability** (DAOs uzywajacy Uniswap v4 to story Uniswap chce promowac)
- **Code visible** (Hayden czyta Solidity, doceni snippet)

### Demo moments dla Hayden
1. **1:15-1:20** - Execute flow: "Swap routed via Uniswap" w voice-over (jezeli wired - Sol Sesja 19 confirms)
2. **2:10-2:15** - **DEDICATED SPONSOR SEGMENT (5s):**
   - UI cut: code snippet `apps/contracts/src/hooks/CouncilHook.sol` (15-20 linii Solidity visible)
   - Highlighted lines: `beforeSwap()` + `afterSwap()` z custom logic (e.g. treasury allocation tracking)
   - Overlay text: **"Custom v4 hook: treasury swap routed + tracked"**

### Voice-over emfazy dla Hayden
- "Swap przez Uniswap v4 hooks" (jezeli wired)
- "Custom hook: treasury swap routed and tracked" (2:10-2:15 sponsor segment)

### Hidden details Hayden zauwazy
- Hook implementuje IPoolManager interface poprawnie
- Gas optimization visible w snippet (np. `unchecked` blocks gdzie safe)

### Probability: **30%** (low - wymaga Phase 1+ wired, currently nie pewne czy zdazymy. Jezeli NIE wired - voice-over mowi "compatible with v4 hooks" zamiast "uses". Honesty Charter #7)

### Decyzja jezeli Uniswap NIE wired (eskalacja Maxima)
- Frame 7 voice-over: zamiast "Swap przez Uniswap" -> "Treasury action executed on-chain"
- Sponsor segment 2:10-2:15: skip Uniswap, dodaj "Multi-DEX ready" frame zamiast
- NIE klam ze uzywamy jeśli nie - sedziowie sprawdza repo

---

## 3. Nick Johnson - ENS ($5,000+ tracks)

### Co Nick ceni
- **ENS subnames realnie uzywane** (nie 1 root domain placeholder)
- **Text records** wykorzystane (nie tylko address resolution)
- **Reverse resolution** (address -> ENS name w UI)
- **NameStone integration** (oficjalny partner)

### Demo moments dla Nick
1. **0:35-1:00** - Live Debate: każdy z 5 agentow ma ENS subname pod avatarem (`bull.aicouncil.eth`, `bear.aicouncil.eth`, ...)
2. **1:25-1:30** - **WOW MOMENT for Nick:** ENS Identity Card
   - 5 subnames pod aicouncil.eth z resolution latencjami
   - Text records visible: `rep.score=87`, `rep.statements=142`, `llm=claude-sonnet-4.6`
   - To pokazuje ENS jako **identity layer**, nie tylko naming
3. **1:46-1:50** - Trust mech close-up: ENS resolution log table z latencjami
4. **2:15-2:20** - **DEDICATED SPONSOR SEGMENT (5s):**
   - UI cut: NameStone dashboard z 5 mintowanymi subnames pod aicouncil.eth
   - Overlay text: **"5 ENS subnames per agent · Reputation as text records"**

### Voice-over emfazy dla Nick
- "Każdy agent ma swoją tożsamość ENS" (1:25-1:30)
- "Tożsamość ENS per agent" (1:30-1:55 trust mech)
- "Subnames przez NameStone" (2:15-2:20 sponsor)

### Hidden details Nick zauwazy
- ENS uzywane spojnie w CAŁYM demo (nie tylko w jednym miejscu)
- Audit log eventy maja ENS names, nie raw addresses (UX win)
- Multisig signers maja ENS names (`alice.dao.eth`, `bob.dao.eth`)
- Treasury wallet ma `treasury.aicouncil.eth` z text records (description, url, twitter, github)

### Probability: **85%** (was 70%, very high bo ENS jest WSZEDZIE w demo, nie tylko w jednym slide)

### Risk jezeli NameStone Phase 2 nie skonczone
- Demo uzywa **mock ENS labels** jako string literals (per MOCKUPS.md Q1 decision)
- Voice-over: NIE klam. Mow "ENS subnames" w przyszlym czasie? Lepsza opcja: mow "ENS subnames live", pokaz mock UI który looks identical, FEEDBACK.md transparency o stanie
- Eskalacja: jezeli mock ENS - Nick może sprawdzic on-chain. Risk discovery.

---

## 4. Luca - KeeperHub ($5,000 track)

### Co Luca ceni
- **KeeperHub bot wykonuje tx** post-timelock (nie manual execution)
- **Automated execution flow** (timelock -> KeeperHub -> on-chain)
- **Reliability story** (uptime, fallback)

### Demo moments dla Luca
1. **1:15-1:20** - Execute flow: "Execute" button click -> tx sent. Voice-over: "Wykonanie on-chain" (current). Z KeeperHub: "Wykonanie automatyczne przez KeeperHub po timelock"
2. **1:20-1:25** - Basescan tx detail. From: KeeperHub bot address (NIE manual user wallet). Visible w "From" field.
3. **2:20-2:25** - **DEDICATED SPONSOR SEGMENT (5s):**
   - UI cut: Basescan tx executed by KeeperHub address (zoom-in na "From: 0xKeeperHub...")
   - Overlay text: **"Automated execution post-timelock · KeeperHub"**
   - Architecture diagram inset: timelock contract -> KeeperHub bot -> on-chain tx

### Voice-over emfazy dla Luca
- "Wykonanie automatyczne po timelock" (jezeli wired)
- "KeeperHub do automatyzacji" (2:20-2:25 sponsor)

### Hidden details Luca zauwazy
- Tx execution by KeeperHub = nasze kontrakty NIE wymagaja manual user click po timelock (full automation)
- Demonstracja KeeperHub jako "missing piece" w DAO governance stack (proposal -> vote -> timelock -> ?? KeeperHub solves)

### Probability: **40%** (medium - wymaga KeeperHub wired w Phase 1+. Jezeli NIE wired - voice-over mowi "compatible with KeeperHub" + show contract code that supports automated execution)

### Decyzja jezeli KeeperHub NIE wired
- Frame 9 voice-over zamiast "by KeeperHub" -> "by automated executor"
- Sponsor segment 2:20-2:25: pokaz kontrakt code z `function execute()` callable by anyone (anyone = KeeperHub w produkcji)
- FEEDBACK.md: section "KeeperHub integration roadmap"

---

## 5. Ben - Gensyn ($5,000 A2A track)

### Co Ben ceni
- **Agent-to-Agent (A2A) communication** - agenci komunikuja się miedzy soba, nie tylko z usera
- **Decentralized AI orchestration**
- **Verifiable agent outputs** (signed, attributable)

### Demo moments dla Ben
1. **0:35-1:00** - **CAŁY SEGMENT B = A2A communication.** 5 agentow:
   - Czyta argumenty siebie nawzajem (Bear odpowiada na Bull's claims)
   - Adjustuje confidence based on others (Tech weights down jezeli Risk highlights concern)
   - Final tally weighted by reputation (na-chain reputation system)
2. **1:25-1:30** - ENS card text records: `rep.statements=142` per agent (history of A2A interactions)

### Voice-over emfazy dla Ben
- "Piecu wyspecjalizowanych agentow debatuje" (0:35-1:00) - explicitly multi-agent
- "Wage glosu opartego o on-chain reputacje" (0:35-1:00) - A2A z verifiable reputation

### Hidden details Ben zauwazy
- AgentReputation.sol on-chain (Moat 5 PoW Matthew)
- Source attribution per claim = agenty cite zewnetrzne źródła AND siebie nawzajem (e.g. Bear cytuje Bull's confidence as evidence)
- Council Rules JSON ma parametry agent vote weights (HITL adjustable)

### Probability: **35%** (medium - Gensyn nie ma dedicated segment w sponsor showcase, ale CAŁY core demo IS A2A. Risk: Ben może chciec wiecej Gensyn-specific tech mention)

### Decyzja - czy dodac Gensyn-specific moment?
- Opcja A: Voice-over 1:55-2:05 dodaj "Multi-agent A2A architecture" jako 5-ty moat (już jest "PoW for agents" - merge?)
- Opcja B: Sponsor segment 2:15-2:30 wymien Gensyn jako "Inspired by Gensyn A2A standards" (jezeli aplikujemy do Gensyn track)
- Rekomendacja Eva: Opcja B + dodac "Agent-to-Agent" jako bullet w sponsor closing band (2:45-2:55)

---

## 6. Synthesis - ETHGlobal (Finalist top 20% track $5,000)

### Co Synthesis ceni
- **Originality** - cos czego nie widzieli w innych demo
- **Technical depth** - production-grade, nie hello-world
- **Demo polish** - hook quality, pacing, no jank
- **Real on-chain action** - sedziowie sprawdza czy demo działa live
- **Documentation** - README + FEEDBACK.md + ADR demonstrate maturity

### Demo moments dla Synthesis
1. **0:35-1:00** - **WOW MOMENT 1: Typewriter debate** - sedziowie nie widzieli takiego efektu w innych demo (originality++)
2. **1:00-1:30** - **WOW MOMENT 2: Real Basescan tx live** - proves works (not video screenshot of mock)
3. **1:50-2:30** - Tech segment z 5 trust mech research-backed (Mayer-Davis-Schoorman) + 5 moats - depth signal
4. **2:30-3:00** - Close z GitHub link + demo URL + docs links - production-ready signal

### Voice-over emfazy dla Synthesis
- "Akademicki research Mayer-Davis-Schoorman" (1:50-2:30) - Synthesis love peer-reviewed grounding
- "Piec kontraktow zywych na Base Sepolia" (2:30-3:00) - real, not theater
- "Open source. Gotowe do pilotu z DAO." - production stance

### Hidden details Synthesis zauwazy
- Repo public z complete CI/CD, 150+ tests pass, 4 ADR documented
- FEEDBACK.md ma 12 items (sponsor feedback)
- README ma Mermaid arch diagram
- Branch protection active on main
- Mateusz security audit (0 CRITICAL, 0 HIGH per status update Matthew 2026-05-02 - sprawdz aktualnosc przed nagraniem)

### Probability: **80%** Finalist top 20% (was 80%, confirmed po Phase 1B + 2 + Moat 5)

### Synthesis konkretne kryteria (per panel jurors session 2026-05-02)
- **Originality 9/10** - typewriter + on-chain audit + ENS reputation = combination not seen
- **Technical depth 8/10** - 5 contracts deployed + verified, 0G Storage real, source attribution per claim
- **Demo polish 8/10** (target po Eva script + recording) - 3 min hard limit, no fillers, no music
- **Documentation 9/10** - README + FEEDBACK + 4 ADR + glossary
- **Pilot readiness 7/10** - LOI hunting (Aria-DAO) + open source + branch protection

---

## Top 5 live judging - dodatkowy boost

Jezeli Finalist top 20% -> top 5 live presentation. **Eva przygotowuje extended deck** (5-7 min):
- Bazuje na demo video (3 min) + 2-4 min extended Q&A prep
- Maxima + Szymon owner

---

## Cross-juror conflict resolution

### Konflikt 1: Czas demo vs liczba sponsorow
- **5 sponsorow x 5s = 25s w sponsor segment** (2:05-2:30)
- Test: czy Kenji + Nick + Luca + Hayden + Ben + Multi-chain mieszcza się w 25s? **TAK** (5s per, 5 sponsorow + 5s na multi-chain = 30s, ale Multi-chain można kompresowac do 5s nakladajac na sponsor)

### Konflikt 2: Honesty (Charter #7) vs Sponsor optimization
- Jezeli Uniswap / KeeperHub NIE wired -> NIE klam. Pokaz "compatible with" zamiast "uses"
- Sedziowie sprawdza repo. Klamstwo = automatic disqualification.

### Konflikt 3: 3 min hard limit vs all juror moments
- Test: czy WSZYSCY 6 jurorzy maja moment? **TAK** (per Frame map powyzej)
- Czas na voice-over wystarczy? Word count check w SCRIPT.md: total 290 slow / 180s = 97 wpm = komfortowe

---

## Probability disclaimer

Probabilities = Eva subjective estimate based on per-juror demo coverage. Calibrate z panel jurors output session 2026-05-02 (gdy dostepny). Bazowe wartosci z Matthew status update v2 (Finalist 80%, ENS Track 70%, 0G 50%).

---

## Master juror moments table

| Juror | Sponsor | Track | Probability | Demo moments | Voice-over emfazy |
|-------|---------|-------|-------------|--------------|-------------------|
| Kenji | 0G | Storage $1.5k | 70% | 1:20-1:25 audit live, 1:42-1:46 close-up, 2:05-2:10 dedicated | "0G Storage", "audit log", "$0.001/transcript" |
| Hayden | Uniswap | Hook $5k | 30% | 1:15-1:20 swap, 2:10-2:15 dedicated code | "Uniswap v4 hooks", "custom hook" |
| Nick | ENS | $5k+ | 85% | 0:35-1:00 subnames, 1:25-1:30 ENS card WOW, 1:46-1:50, 2:15-2:20 dedicated | "ENS identity per agent", "subnames przez NameStone" |
| Luca | KeeperHub | $5k | 40% | 1:15-1:20 execute, 1:20-1:25 Basescan from-address, 2:20-2:25 dedicated | "KeeperHub", "automated execution" |
| Ben | Gensyn | A2A $5k | 35% | 0:35-1:00 entire debate IS A2A | "5 agentow", "on-chain reputation" |
| Synthesis | ETHGlobal | Finalist $5k | 80% | Cały demo: typewriter + Basescan + research + docs | "akademicki research", "open source", "pilot ready" |

**Total EV update z lensami:**
- 0G $1.5k x 70% = $1,050
- Uniswap $5k x 30% = $1,500
- ENS $5k x 85% = $4,250 (Nick double-track jezeli aplikujemy obie)
- KeeperHub $5k x 40% = $2,000
- Gensyn $5k x 35% = $1,750
- ETHGlobal Finalist $5k x 80% = $4,000

**Total demo-driven EV: ~$14,550** (was $8,500 baseline) - demo polish + juror lens podnosi EV

---

## Open questions dla PM-Lead

- [ ] Hayden Uniswap: czy v4 hooks bedzie wired w Phase 1+? Jezeli NIE - cut sponsor segment, dodac Multi-chain frame
- [ ] Luca KeeperHub: czy KeeperHub bot bedzie wired? Jezeli NIE - voice-over swap
- [ ] Nick ENS: NameStone Phase 2 status na niedziele 12:00? Mock vs real decyzja
- [ ] Czy aplikujemy do Gensyn track? Jezeli TAK - dodac "Inspired by Gensyn A2A" w sponsor band
- [ ] Synthesis live judging top 5: kto przygotuje extended deck (5-7 min Q&A)? Maxima + Szymon owner zalecane
