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

**Audit Trail**
A complete, chronological record of every debate: which agents said what, which sources they cited, their confidence levels, and the final consensus. Stored on 0G Storage with the CID recorded on-chain.

## AI and Agents

**LLM (Large Language Model)**
The AI model behind each agent. AI Treasury Council uses Anthropic's Claude API. The model reads the proposal, analyzes data from multiple sources, and produces a structured opinion.

**Source Attribution**
Every claim an agent makes includes a citation: the URL where the data came from, a relevance snippet, and a confidence weight (0.0 to 1.0). Users can click through to verify any statement.

**Prompt Caching (Anthropic SDK)**
A technique that reuses parts of previous AI conversations to reduce cost and latency. When 5 agents analyze the same proposal, shared context is cached so each agent does not re-process it from scratch.

**Consensus**
The combined outcome after all 5 agents vote. Simple majority: if more agents vote FOR than AGAINST, the consensus is FOR. If votes are tied, the result is SPLIT. ABSTAIN votes do not count toward either side.

## Project Phases

**Phase 0 - Foundations**
Monorepo setup, frontend scaffold, backend API, first agent (Bull) live with Anthropic API. Browser-only demo, no blockchain.

**Phase 1 - On-Chain**
Smart contracts deployed to Base Sepolia. Wallet connect, propose/vote/execute flow, 0G Storage audit trail integration.

**Phase 2 - ENS Integration**
NameStone subnames minted for each agent. Frontend resolves and displays ENS names with reputation text records.

**Phase 3 - Polish and Trust**
Source attribution tools for agents, Council Rules JSON (human override config), optional Adversarial Auditor (6th agent), 0G Compute stretch goal.

**Phase 4 - Ship**
Deploy to Vercel + Railway. Record 3-minute demo video. Final README, FEEDBACK.md for sponsors, ETHGlobal submission.
