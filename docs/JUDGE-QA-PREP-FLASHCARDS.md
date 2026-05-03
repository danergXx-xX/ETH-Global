---
title: Judge Q&A Flashcards (one-liner per Q)
date: 2026-05-03 (Sesja 32)
related: docs/JUDGE-QA-PREP.md
use: pre-recording warmup, in-ear prompts during Q&A
---

# Judge Q&A Flashcards

One-line memory hooks. Full answers in JUDGE-QA-PREP.md. Read these 5 minutes before judging.

## Technical depth

- **Anthropic SDK vs CrewAI?** Cut day 2 - 200ms latency, hidden caching, Pydantic friction. ADR-001.
- **Prompt caching savings?** 60-90% on input tokens via cache_control on system+persona. 12 cents -> 4 cents per debate.
- **End-to-end flow?** Form -> FastAPI -> 5 parallel Anthropic streams -> consensus -> 0G upload -> wagmi propose -> 48h timelock -> execute.
- **Agent disagreement?** Weighted majority by confidence. 60% threshold for valid consensus, else NO_CONSENSUS flag.
- **Anthropic 500s mid-debate?** Per-agent try/except, mark ABSTAIN, continue. Honest degradation.
- **Why Base Sepolia?** Hackathon constraint. Chain-agnostic OZ Governor. Production = Base mainnet, deploy script swap.
- **Reputation -> 0G linkage?** Decoupled writes, linked via debate ID. Transcript CID in contract event.
- **Gas cost full flow?** ~730k gas (250k propose + 80k vote + 150k execute + 50k transfer). ~5 cents on Base mainnet.
- **Prompt injection defense?** 3 layers: Pydantic validator, COUNCIL_RULES guard, Mateusz red-team 0/0 critical.
- **Source attribution code?** apps/api/agents/tools.py - fetch_rss, fetch_coingecko, fetch_defillama. Schema enforced.

## Architecture / design

- **Why split FE/BE not on-chain?** AI inference doesn't run on EVM. Compute off-chain, settlement on-chain.
- **Council Rules sync?** JSON loaded into orchestrator, prepended to every persona system prompt as cacheable block.
- **Why 48h timelock?** Trust mech #2 - challenge window. OZ canonical. Admin role revoked.
- **Vs Tally / Snapshot?** Complementary. We sit upstream of vote - generate analysis, they handle voting UI.
- **Moat?** 5 moats - source attribution, ENS reputation per agent, on-chain PoW, Council Rules, Adversarial. Code forkable, on-chain history is not.

## Sponsor track

- **Why 0G vs IPFS?** AI workload throughput, programmable retention, future compute integration.
- **0G CID demo?** Audit log -> click 0G icon -> 0G explorer. Also in Governor event description.
- **ENS text records?** 6 records: ai.persona, ai.description, ai.reputation, ai.debates_participated, ai.consensus_aligned, ai.contract.
- **ENS cross-chain?** ai.contract = "eip155:84532:0xf3BAb..." per ENSIP-9. Periodic snapshot script too.
- **Uniswap v4 hooks?** Honest no - documented future fit (hook gates large treasury swaps on Council verdict).
- **Vs other multi-agent orchestrators?** Schema-enforced source attribution, on-chain reputation PoW, structured Adversarial agent.
- **KeeperHub fit?** Designed for keeper integration (timelock execute, reputation snapshot cron). Not integrated MVP.
- **Vs other Trading Council projects?** Governance not trading. Decision quality + accountability, not PnL.
- **Business model?** DAO subscription, per-debate fee, reputation-as-a-service. Cost: 4 cents/debate.
- **Real product post-hackathon?** 5 LOIs ready. Q3 2026 paid pilot with one DAO.

## Adversarial

- **Just LLM wrappers?** Autonomous = 3 things: own data fetch, schema self-validation, on-chain identity. Not AGI claim.
- **Mock data in audit log?** Honest in JUDGES-ONBOARDING. Bull live, 4 mock. Schema and tooling identical. Marked, not hidden.
- **Reputation 100 baseline?** Diversification snapshot updates to realistic values pre-demo. Real history accumulates post-launch.
- **Trust AI with treasury?** Don't. AI advises, humans decide. Timelock + Council Rules + token vote. AI generates, humans hold keys.
- **Jailbreak one agent?** No system collapse. Mateusz red-team 0/0. Weighted consensus across 5+1. Timelock human window.
