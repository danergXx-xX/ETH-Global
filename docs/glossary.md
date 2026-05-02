# Glossary

Terms used in AI Treasury Council, explained for non-technical readers.

## Blockchain and Governance

**DAO (Decentralized Autonomous Organization)**
An organization run by code and community votes instead of a CEO or board. Members hold tokens that give them voting power. DAOs collectively manage shared funds (the "treasury").

**Governor (OpenZeppelin Governor)**
A smart contract that manages proposals and voting. Anyone with enough tokens can submit a proposal ("send 100k USDC to Aave"). Token holders vote FOR, AGAINST, or ABSTAIN. If the vote passes quorum, the action is queued for execution.

**TimelockController**
A safety delay between a vote passing and the action executing. In AI Treasury Council the delay is 48 hours. During this window anyone can review the decision and raise objections before funds actually move.

**Quorum**
The minimum percentage of voting power that must participate for a vote to be valid. AI Treasury Council requires 60% quorum - if fewer than 60% of token holders vote, the proposal fails regardless of the outcome.

**Voting Period**
How long a vote stays open. Set to 1 day in AI Treasury Council. After this window closes, votes are tallied and the result is final.

**ERC20Votes**
A token standard that tracks voting power. CouncilToken (AICT) follows this standard. Holding tokens gives you proportional voting weight. You can also delegate your votes to someone else.

**Base Sepolia**
A test network (testnet) for the Base blockchain. No real money is involved. Developers use it to test smart contracts before deploying to the real network. Base is an Ethereum Layer 2 built by Coinbase.

**MockUSDC (mUSDC)**
A fake stablecoin used for testing. It behaves like real USDC but has no monetary value. 1 million mUSDC sits in the Timelock treasury for demo proposals.

**AgentReputation**
A custom smart contract that tracks each AI agent's reputation on-chain. Each of the 5 agents starts at 100 reputation. After every debate, agents that aligned with the consensus gain reputation, those that dissented lose it. Public read functions: `reputation(agent)`, `debatesParticipated(agent)`, `alignedWithConsensus(agent)`. Deployed at `0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44`.

**Moat 5 - Proof-of-Work for Agents**
The differentiator of AI Treasury Council. Most AI agent products are trust-by-marketing ("our agent is reliable"). Moat 5 makes agent quality cryptographically auditable: every agent's track record is on-chain, immutable, and surfaced via ENS. Originally proposed by Matthew Foyle in the audio transcript that seeded this build.

**PoW for Agents**
Short for Proof-of-Work for Agents. Same concept as AgentReputation - agents earn reputation through verifiable on-chain history of aligned decisions, not marketing claims.

## Identity and Naming

**ENS (Ethereum Name Service)**
A naming system for Ethereum addresses, like DNS for the internet. Instead of `0x1f95C796...`, you get a readable name like `aicouncil.eth`.

**ENS Subname**
A child name under a parent ENS name. Each AI agent has one: `bull.aicouncil.eth`, `bear.aicouncil.eth`, etc. Subnames can carry text records (metadata like role description and accuracy score).

**NameStone**
A service for minting ENS subnames via API. AI Treasury Council uses NameStone to create and manage agent subnames without manual ENS transactions.

## Storage and Verification

**0G Storage**
A decentralized storage network (sponsor partner). AI Treasury Council stores every debate transcript on 0G so it is immutable and publicly verifiable. Think of it as a permanent, tamper-proof filing cabinet.

**IPFS (InterPlanetary File System)**
A peer-to-peer storage network where files are addressed by their content hash. Used as automatic fallback if 0G Storage is unreachable.

**CID (Content Identifier)**
A unique fingerprint for a file stored on IPFS or 0G. If even one character of the file changes, the CID changes. This guarantees that retrieved content matches what was originally stored.

**0G Storage CID**
A CID returned by the 0G Storage network specifically. Recorded on-chain alongside the proposal so anyone can fetch the original debate transcript directly from 0G nodes.

**IPFS Pinata Fallback**
Pinata is a managed pinning service that keeps IPFS content available. AI Treasury Council uploads to 0G first; if 0G is unreachable, the storage factory automatically falls back to Pinata. Both paths return a CID, so downstream code is agnostic to which storage was used.

**Audit Trail**
A complete, chronological record of every debate: which agents said what, which sources they cited, their confidence levels, and the final consensus. Stored on 0G Storage with the CID recorded on-chain.

## AI and Agents

**LLM (Large Language Model)**
The AI model behind each agent. AI Treasury Council uses Anthropic's Claude API. The model reads the proposal, analyzes data from multiple sources, and produces a structured opinion.

**Source Attribution**
Every claim an agent makes includes a citation: the URL where the data came from, a relevance snippet, and a confidence weight (0.0 to 1.0). Users can click through to verify any statement.

**Prompt Caching (Anthropic SDK)**
A technique that reuses repeated prompt prefixes within API calls to reduce cost and latency. When 5 agents analyze the same proposal, the shared system prompt and proposal text are cached so each agent call does not re-process the identical prefix.

**Consensus**
The combined outcome after all 5 agents vote. Simple majority of agent opinions: if more agents vote FOR than AGAINST, the consensus is FOR. If votes are tied, the result is SPLIT. ABSTAIN votes do not count toward either side. This is the off-chain agent consensus and is independent of the on-chain `Quorum` (60%) used by the Governor.

**WebSocket Streaming**
A persistent connection between the browser and the backend that lets agent reasoning stream token-by-token. Instead of waiting 30 seconds for the full debate, users see each agent type out their analysis live. Implemented as `/ws/debate` endpoint with native WebSocket on the frontend (auto-reconnect with exponential backoff).

**Async Generator**
The Python pattern behind WebSocket streaming. The orchestrator yields tokens as the Anthropic SDK returns them, rather than buffering the full response. Lets the WebSocket layer push chunks to the browser with minimal latency.

## Trust Mechanisms

These are the five mechanisms ensuring AI council decisions are transparent and verifiable. Each has a glossary entry because judges and DAO contributors will reference them by name.

**Trust Mechanism 1 - Source Attribution per Claim**
Every agent statement includes citations: source URL, relevance snippet, and confidence weight 0.0-1.0. Implemented in `apps/api/agents/tools.py`.

**Trust Mechanism 2 - Timelock Countdown UI**
A live 48-hour countdown between vote passing and execution. Token holders use this window to review and challenge before funds move. Implemented in `apps/web/components/TimelockCountdown.tsx`.

**Trust Mechanism 3 - Audit Log Preview**
Past debates retrievable by 0G CID, including all 5 agent opinions with source links. Implemented in `apps/web/components/AuditLog.tsx`.

**Trust Mechanism 4 - ENS Reputation Badges**
Each agent's accuracy and alignment metrics surfaced via ENS text records under their `*.aicouncil.eth` subname. Backed by the AgentReputation contract. Phase 2 NameStone integration.

**Trust Mechanism 5 - Human-in-the-Loop Council Rules**
A JSON config defines proposal types that require human override (e.g. transfers above threshold). AI advises, humans decide. Implemented in `apps/web/components/CouncilRulesEditor.tsx`.

## Project Overview

These are not glossary terms but context for understanding where features fit in the build timeline.

**Phase 0 - Foundations:** Monorepo setup, frontend scaffold, backend API, first agent (Bull) live. Browser-only demo, no blockchain.

**Phase 1 - On-Chain:** Smart contracts deployed to Base Sepolia. Wallet connect, propose/vote/execute flow, 0G Storage audit trail.

**Phase 2 - ENS Integration:** NameStone subnames minted for each agent. Frontend resolves ENS names with reputation text records.

**Phase 3 - Polish and Trust:** Source attribution tools, Council Rules JSON, optional Adversarial Auditor (6th agent).

**Phase 4 - Ship:** Deploy to Vercel + Railway. Record demo video. Final README, FEEDBACK.md, ETHGlobal submission.
