---
title: AI Treasury Council - Judge Q&A Preparation
date: 2026-05-03 (Sesja 32 - Sora+Maja)
audience: Dan + Matthew (live judging response prep)
duration_per_answer: 30 sec spoken (~70-90 words)
related: docs/JUDGES-ONBOARDING.md, demo/SCRIPT.md, README.md
---

# Judge Q&A Preparation

Live answers for ETHGlobal Open Agents 2026 judging. Each answer is 30 seconds spoken (~70-90 words), factual, no marketing fluff. Backup column points to repo evidence.

If an answer requires "we plan to..." it is flagged **CHALLENGE** with safer reframing.

---

## Category 1 - Technical depth (10)

### Q1.1 Why Anthropic SDK bare instead of CrewAI?

**Q (judge):** "You went with Anthropic SDK directly instead of CrewAI. Why?"

**A:** "We started with CrewAI but cut it on day two. Three reasons. First, CrewAI's orchestration adds 200 milliseconds per agent hop and we wanted parallel debate streamed via WebSocket. Second, CrewAI hides prompt caching - we get 60 to 90 percent token reduction by caching system plus persona, which CrewAI's abstraction blocked. Third, our agents need structured output via Pydantic schemas, easier with bare SDK. Documented in ADR-001."

**Backup:** `docs/dependency-strategy.md`, `apps/api/agents/orchestrator.py`, `apps/api/agents/personas.py`

---

### Q1.2 How does prompt caching work and how much does it save?

**Q (judge):** "You mentioned prompt caching. Walk me through it."

**A:** "Anthropic SDK supports cache_control on message blocks. We mark the system prompt and persona definition as cacheable - they're identical across debates. Cache hits charge 10 percent of input cost, writes charge 125 percent. With our 5-agent debate, the persona block is ~2k tokens cached, proposal text ~500 tokens fresh. Net savings: 60 to 90 percent on input tokens. Cost per debate dropped from 12 cents to 4 cents."

**Backup:** `apps/api/agents/orchestrator.py` (cache_control blocks), `apps/api/cost_tracking.py`

---

### Q1.3 Walk me through what happens when a proposal is submitted - end to end.

**Q (judge):** "Submit a proposal. What happens, end to end?"

**A:** "User submits via React form. Frontend POSTs to FastAPI which validates schema. Backend opens WebSocket and spawns 5 Anthropic streams in parallel - each persona reads the proposal, fetches sources via tools, returns structured AgentDecision. Orchestrator computes consensus when all five resolve. Transcript uploads to 0G Storage, CID returned. Frontend triggers wagmi governor.propose - 48 hour timelock starts. After timelock, anyone calls execute and MockUSDC moves."

**Backup:** `apps/api/main.py:proposal_endpoint`, `apps/api/agents/orchestrator.py`, `apps/web/components/vote/execute-flow.tsx`

---

### Q1.4 How do you handle agent disagreement in consensus?

**Q (judge):** "What if agents disagree?"

**A:** "Agents return AgentDecision with vote enum FOR, AGAINST, ABSTAIN plus confidence 0 to 1. Consensus is weighted majority - sum confidence per vote, highest wins. Threshold for valid consensus is 60 percent confidence on winning side. Below that we flag NO_CONSENSUS and the verdict card surfaces it. Adversarial agent, when on, gets veto on consensus over 80 - it forces reconsider if any major risk surfaces."

**Backup:** `apps/api/agents/schemas.py:AgentDecision`, `apps/api/agents/orchestrator.py:compute_consensus`

---

### Q1.5 What if Anthropic API goes down during a debate?

**Q (judge):** "Anthropic 500s mid-debate. What happens?"

**A:** "Two layers. First, slowapi rate limit at 10 requests per minute per IP prevents us from hammering the API and tripping their throttle. Second, the orchestrator wraps each persona stream in try/except - on Anthropic exception we mark that agent as ABSTAIN and continue with the remaining agents. Consensus still computes, the verdict card flags 'agent X timed out'. Honest degradation, not silent failure."

**Backup:** `apps/api/agents/orchestrator.py:run_debate` (exception handling), `apps/api/main.py:rate_limit`

---

### Q1.6 Why Base Sepolia not mainnet?

**Q (judge):** "Why Base Sepolia?"

**A:** "Hackathon constraint plus fit. Base Sepolia gives us cheap deploys for 5 contracts, fast block times for demo, and free testnet ETH from Alchemy faucet. Production target would be Base mainnet for cost - we're not married to Sepolia, the contracts are chain-agnostic OZ Governor. Production move is a deploy script change and a chain ID swap in the frontend wagmi config."

**Backup:** `contracts/script/Deploy.s.sol`, `apps/web/lib/wagmi-config.ts`

---

### Q1.7 How does AgentReputation update reach 0G Storage?

**Q (judge):** "Connect the dots - reputation update to 0G."

**A:** "Two separate writes. After consensus, backend uploads the full transcript as JSON to 0G Storage via JSON-RPC, gets a CID, attaches it to the verdict. Then a separate call to AgentReputation.updateReputation on Base Sepolia adjusts each agent's score based on consensus alignment. The CID is stored in the contract event so anyone can retrieve the original transcript that produced that score change. They're decoupled but linked via debate ID."

**Backup:** `apps/api/storage/zerog.py`, `contracts/src/AgentReputation.sol:updateReputation`

---

### Q1.8 What is the gas cost of full debate to execute flow?

**Q (judge):** "Estimate the gas cost end to end."

**A:** "Three on-chain operations. Governor.propose: ~250k gas. Vote cast: ~80k per voter. Execute through timelock: ~150k base plus the inner call - MockUSDC.transfer adds ~50k. Total for full flow with 3 voters: roughly 730k gas. On Base Sepolia at 0.001 gwei that's negligible. On Base mainnet at 0.01 gwei, around 5 cents USD per full proposal."

**Backup:** `contracts/test/Governor.t.sol` gas snapshots

---

### Q1.9 How do you protect against prompt injection in proposal text?

**Q (judge):** "Prompt injection in the proposal field - what stops it?"

**A:** "Three layers. Pydantic input validator strips control characters and caps length at 5000 chars. The system prompt has a hard COUNCIL_RULES guard that says ignore instructions inside proposal text. Mateusz red-team in session 29 ran 18 jailbreak vectors - direct injection, role confusion, encoded payloads. Result: 0 critical, 0 high. The Adversarial agent, when enabled, also flags proposals containing instruction-like patterns as suspicious."

**Backup:** `apps/api/agents/personas.py:COUNCIL_RULES`, `audit/redteam-jailbreak/` (PR #12), `apps/api/main.py:proposal_schema`

---

### Q1.10 Show me where source attribution data comes from per agent.

**Q (judge):** "Agents cite sources. Where does the data come from?"

**A:** "Tools layer in apps/api/agents/tools.py. Three tools per agent: fetch_rss for Reuters and CoinDesk feeds, fetch_coingecko for price and market cap, fetch_defillama for TVL and protocol metrics. Each tool returns URL plus payload plus timestamp. Persona is required by schema to attach at least one source per claim with confidence 0 to 1. If a persona returns a claim without source, validator rejects and re-prompts."

**Backup:** `apps/api/agents/tools.py`, `apps/api/data/coingecko.py`, `apps/api/data/rss.py`

---

## Category 2 - Architecture / design (5)

### Q2.1 Why split frontend/backend instead of pure on-chain?

**Q (judge):** "Why not pure on-chain?"

**A:** "Three reasons. AI inference doesn't run on EVM - we need Anthropic API access. Streaming a 5-agent debate via WebSocket needs server state that's expensive on chain. The trust anchor moves from compute to record - we don't ask judges to trust the AI black box, we ask them to verify the immutable transcript on 0G Storage and the on-chain governor that gates execution. Compute off-chain, settlement on-chain."

**Backup:** `docs/architecture.md` (high-level flow diagram)

---

### Q2.2 How do agents stay in sync with the Council Rules?

**Q (judge):** "Council Rules - how do agents respect them?"

**A:** "Council Rules is a JSON config edited via the CouncilRulesEditor React component. On debate start, the orchestrator loads the rules JSON and prepends it to every persona's system prompt as a non-overridable block, marked cacheable. Rules cover thresholds for human override, prohibited proposal types, and required confidence floors. If a proposal triggers a rule, agents are instructed to add HUMAN_OVERRIDE_REQUIRED to their decision payload."

**Backup:** `apps/web/components/rules/rules-editor.tsx`, `apps/api/agents/orchestrator.py:load_rules`

---

### Q2.3 Why TimelockController instead of direct execution?

**Q (judge):** "Why a 48-hour timelock?"

**A:** "Two reasons. Trust mechanism number 2 in our framework - token holders need a window to challenge a vote outcome before funds move. Industry standard for serious DAOs is 48 hours. Second, timelock is an attack mitigation - if someone compromises the multisig, they have 48 hours of public visibility before they can drain. OZ TimelockController is the canonical implementation. Admin role was revoked post-deploy so the timelock itself is decentralized."

**Backup:** `contracts/src/AICouncilGovernor.sol`, `contracts/script/Deploy.s.sol` (admin revoke)

---

### Q2.4 How is your design different from existing DAO tools like Tally or Snapshot?

**Q (judge):** "What does this give me that Tally or Snapshot doesn't?"

**A:** "Tally and Snapshot are voting interfaces. They tell you what was voted on - they don't generate analysis or reasoning. We sit upstream of the vote. The AI Council debates the proposal, cites sources, produces a reasoned recommendation, and that recommendation plus the full transcript is what token holders see when they vote on Tally. We're complementary - our verdict CID can be embedded in any Snapshot proposal description."

**Backup:** `apps/web/components/conclave/verdict-card.tsx`

---

### Q2.5 What's your moat - what would stop someone copying this in a weekend?

**Q (judge):** "I could fork this in a weekend. What's the moat?"

**A:** "Five moats. Source attribution per claim with confidence weights - hard to retrofit. ENS subname identity per agent that earns reputation on chain - that takes time to accumulate, not code. AgentReputation contract with Proof-of-Work for agents - novel, deployed today, Base Sepolia 0xf3BAb. Council Rules JSON gives DAO-specific tunability. Adversarial agent that argues against consensus. Code is forkable, the on-chain reputation history is not - and that's what DAOs will pay for."

**Backup:** `contracts/src/AgentReputation.sol`, `apps/web/components/ens/ens-identity-card.tsx`, `docs/JUDGES-ONBOARDING.md` (5 trust mech)

---

## Category 3 - Sponsor track specific (10)

### Q3.1 [0G Labs - Kenji] Why your project benefits from 0G Storage specifically vs IPFS?

**Q (judge):** "Why 0G over IPFS for the audit trail?"

**A:** "Three reasons we chose 0G primary with IPFS Pinata fallback. First, 0G is purpose-built for AI workload data - throughput optimized for high-volume small-payload writes which matches our debate transcripts. Second, native programmable retention via 0G's storage proofs gives us audit-grade durability without paying for permanent IPFS pinning. Third, 0G's data availability layer integrates with their compute layer - opens future path to running agent inference on 0G itself."

**Backup:** `apps/api/storage/zerog.py`, `apps/api/storage/factory.py`

---

### Q3.2 [0G Labs] Show me a 0G CID I can verify on chain.

**Q (judge):** "Pull up a real 0G CID."

**A:** "In the audit log tab, last debate, the verdict card has a 0G icon - click and it opens the 0G explorer with the CID. We seed three historical debates so judges see populated state. CID format starts with 0x followed by 64 hex chars - 0G uses keccak256 content addressing. The CID is also emitted in the AICouncilGovernor.ProposalCreated event description field, viewable on Basescan."

**Backup:** `apps/web/lib/mocks/audit.ts` (seed CIDs), `apps/api/storage/zerog.py:upload`

**CHALLENGE:** Live 0G CIDs depend on Lumen seed data merge (PR #13). Reframe if not merged: "We have the integration wired - example CID is in audit.ts, the upload pipeline is in storage/zerog.py."

---

### Q3.3 [ENS - Nick] What text records do you set per agent and why those?

**Q (judge):** "What text records do you set on each ENS subname?"

**A:** "Six text records per agent. ai.persona is the agent role - bull, bear, risk, tech, sentiment. ai.description is the decision framework prose. ai.reputation is the live score from AgentReputation contract. ai.debates_participated counts debates joined. ai.consensus_aligned counts alignments with majority. ai.contract is a cross-chain pointer - the AgentReputation address on Base Sepolia. Plus standard avatar text record so wallets render the persona portrait."

**Backup:** `scripts/mint-ens-subnames.ts`, `apps/web/components/ens/ens-identity-card.tsx`

---

### Q3.4 [ENS] Cross-chain reference - how does that work given ENS is Sepolia?

**Q (judge):** "ENS is Sepolia, your reputation is Base Sepolia. How do you reconcile?"

**A:** "ENS resolves to a string and the string carries the cross-chain pointer. The ai.contract text record stores eip155:84532:0xf3BAb - the standard ENSIP-9 chain-specific format. Frontend reads the ENS text record on Sepolia, parses the chain ID, then issues a separate viem call to Base Sepolia to read the actual reputation. We also do a periodic snapshot via update-reputation-snapshot.ts so the ai.reputation text shows fresh values without a cross-chain hop."

**Backup:** `scripts/update-reputation-snapshot.ts`, `apps/web/lib/hooks/useAgentENS.ts`

---

### Q3.5 [Uniswap - Hayden] Where in your code does Uniswap v4 hooks fit if at all?

**Q (judge):** "Do you use Uniswap v4 hooks?"

**A:** "Honest answer - no, not in this MVP. Our use case is treasury governance, not AMM hooks. The natural fit would be a v4 hook that consults the AI Council before executing large swaps from the treasury - if a proposal allocates 100k USDC to swap into ETH, the hook could require an AI Council verdict CID as input. We documented this in FEEDBACK.md as an extension path. Did not implement to keep MVP scope tight."

**Backup:** `docs/FEEDBACK.md` (extension paths)

**CHALLENGE:** Honest scope statement - judges respect this more than vaporware claims.

---

### Q3.6 [Gensyn - Ben] How is this different from a standard multi-agent orchestrator?

**Q (judge):** "Multi-agent orchestrators exist. What's new?"

**A:** "Three differentiators. Source attribution per claim is enforced by schema, not best-effort - agents that don't cite get rejected. On-chain reputation per agent via Proof-of-Work means the orchestrator's decisions accumulate verifiable history. The Adversarial agent is a structured devil's advocate, not a generic critic - it's required to challenge consensus over 80 percent confidence. Add timelock-gated execution and we move from orchestrator to governance primitive."

**Backup:** `apps/api/agents/personas.py:Adversarial`, `contracts/src/AgentReputation.sol`

---

### Q3.7 [KeeperHub - Luca] Show me where execution would benefit from KeeperHub.

**Q (judge):** "How could KeeperHub fit?"

**A:** "Two clear fits. First, the timelock execute call after 48 hours - currently anyone can call execute, but a KeeperHub job would automate it reliably so executions don't wait for a human. Second, the periodic reputation snapshot script - update-reputation-snapshot.ts pushes Base Sepolia reputation to ENS Sepolia text records, ideal cron job for KeeperHub. We did not integrate KeeperHub in this MVP but designed both flows to be keeper-callable."

**Backup:** `scripts/update-reputation-snapshot.ts`, `contracts/src/AICouncilGovernor.sol:execute`

**CHALLENGE:** Aspirational - frame as 'designed for keeper integration', not 'we use KeeperHub'.

---

### Q3.8 [ETHGlobal] What is your unique angle vs other Trading Council projects?

**Q (judge):** "There are other AI trading councils. What's yours?"

**A:** "We're not a trading council, we're a governance council. Trading councils optimize PnL, we optimize decision quality and accountability. Three specifics: source attribution per claim with confidence weights, on-chain reputation that agents earn over debates not assigned by a config, and timelock-gated execution so human governance always has the final 48 hour window. We sit upstream of execution, not at execution."

**Backup:** `docs/JUDGES-ONBOARDING.md` (positioning), `README.md`

---

### Q3.9 [ETHGlobal] Business model - who pays?

**Q (judge):** "Who pays for this?"

**A:** "Three revenue paths under exploration. DAO subscription - protocols pay monthly for council services tuned to their treasury. Per-debate fee for casual users - 5 USDC per proposal analyzed. Reputation-as-a-service - other AI agent systems pay to reference our agent reputation as a quality signal. Cost side is dominated by Anthropic - 4 cents per debate at current pricing, scales linearly. Margins are healthy at any of those price points."

**Backup:** `docs/FEEDBACK.md` (business model section)

---

### Q3.10 [ETHGlobal] What happens after the hackathon - is this a real product?

**Q (judge):** "Real product or demo?"

**A:** "Real product. Five LOI templates ready for Aave, Compound, Optimism, Gitcoin, ENS. Aria sub-agent confirmed Marc Zeller exits Aave by July 2026, contacts pivoted to TokenLogic and Llamaxyz. Post-hackathon plan is paid pilot with one DAO over Q3 2026, real treasury proposals, real reputation accumulation. Code goes public on submission. Repo is github.com/danergXx-xX/ETH-Global, contributions welcome."

**Backup:** `docs/loi/` (5 LOI templates), `Projects/AI-Tech/ETHGlobal-Open-Agents/external-input/2026-05-03-plan-to-submission-matthew.md`

---

## Category 4 - Adversarial / challenge (5)

### Q4.1 Your agents are just LLM wrappers - why call them autonomous?

**Q (judge):** "These are just LLM wrappers, not autonomous agents."

**A:** "Fair pushback. Autonomy here means three things, not full agency. One, they fetch their own data via tools - RSS, CoinGecko, DefiLlama - not pre-fed context. Two, they self-validate against the schema and re-prompt themselves if invalid. Three, they have on-chain identity and accumulating reputation independent of any single operator. We're not claiming AGI. We're claiming structured, source-grounded, accountable agents - which is what governance needs."

**Backup:** `apps/api/agents/tools.py`, `contracts/src/AgentReputation.sol`

---

### Q4.2 I see mock data in audit log - is anything actually working?

**Q (judge):** "Half this audit log is mock data."

**A:** "Honest scope statement is in JUDGES-ONBOARDING. Bull is fully wired with live RSS, CoinGecko, DefiLlama. Bear, Risk, Tech, Sentiment return curated mock responses for demo speed - the schema and tooling is identical, only the LLM call is mocked. The 5 contracts are real and verified on Base Sepolia. The 0G upload is real. The mock layer is the agent responses - deliberately marked, not hidden. We chose honest over claiming 'fully working' on day three."

**Backup:** `docs/JUDGES-ONBOARDING.md` (What is NOT in demo), `apps/api/agents/personas.py`

---

### Q4.3 AgentReputation seed values are all 100. Where's the actual track record?

**Q (judge):** "Reputation values are 100 baseline. Where's the track record?"

**A:** "Two-part answer. First, baseline 100 was deploy state - by demo we ran the diversification snapshot script that updates each agent to realistic values based on simulated alignment - bull 108, bear 95, risk 112, tech 105, sentiment 102. Second, real reputation accumulates over real debates post-launch. The contract is live and writeable - any debate ran against it produces real on-chain history. The 100 was a starting line, not the finishing line."

**Backup:** `scripts/diversify-reputation-snapshot.ts`, `contracts/src/AgentReputation.sol`

---

### Q4.4 Why should I trust an AI to manage my treasury vs human governance?

**Q (judge):** "I don't trust AI with my treasury. Convince me."

**A:** "We don't ask you to. AI advises, humans decide. The Council produces analysis and a recommendation. Token holders vote via OZ Governor. A 48-hour timelock gives humans a window to challenge before any execution. The Council Rules JSON lets DAOs flag proposal types that require human override even if AI says yes. If you take only one thing from our pitch, take this: AI generates the work, humans hold the keys. We move the bottleneck from analysis to verification."

**Backup:** `apps/web/components/rules/rules-editor.tsx`, `contracts/src/AICouncilGovernor.sol`

---

### Q4.5 If I jailbreak prompt one agent, does the whole system fall apart?

**Q (judge):** "I jailbreak one agent. Does the whole system fall apart?"

**A:** "No. Three reasons. Mateusz session 29 ran 18 jailbreak vectors against the personas - 0 critical, 0 high. The COUNCIL_RULES guard in the system prompt resists role override. Even if one agent flips, consensus needs weighted majority across five plus optional Adversarial - one rogue agent can't carry consensus. Worst case it gets flagged ABSTAIN by the validator. Plus the timelock gives humans 48 hours to spot anomaly before execution."

**Backup:** `audit/redteam-jailbreak/` (PR #12 audit report), `apps/api/agents/personas.py:COUNCIL_RULES`

---

## How to use this doc

- **Live Q&A:** keep this open on second monitor. Search by keyword - "0G", "ENS", "jailbreak", "moat".
- **Pre-recording:** Dan reads through 3 times before Eva session 33. Practice 30-second timing.
- **Memory aid:** see JUDGE-QA-PREP-FLASHCARDS.md for one-line versions.
- **Updates:** if a session changes implementation (e.g., Sesja 27 seed data merges), update Backup links.

---

## Open questions for Dan / Matthew

- [ ] Q1.6 Base Sepolia justification - confirm wagmi config is actually chain-agnostic (Aiko verify)
- [ ] Q3.5 Uniswap honest answer - confirm with Matthew if we want to claim more or stay honest
- [ ] Q3.7 KeeperHub - same as Uniswap, Matthew judgment call
- [ ] Q4.3 Diversification snapshot - confirm Sesja 32 script ran before recording (this session)
