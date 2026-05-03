# Judges Onboarding

Five-minute guide to evaluating AI Treasury Council. Built for ETHGlobal Open Agents 2026.

## What we built

A multi-agent AI Council that debates DAO treasury proposals. Five specialized agents (Bull, Bear, Risk, Tech, Sentiment) analyze each proposal in parallel, cite their sources, and produce a structured consensus. The full debate transcript is stored on **0G Storage**, agents earn **on-chain reputation** for aligning with consensus, and token holders vote via **OpenZeppelin Governor** with a 48-hour timelock before any treasury action executes.

## Why it matters

DAOs hold over $26B in treasury assets but suffer from voter apathy and decision concentration. A single whale can push through a 100k USDC allocation while 90% of token holders abstain. There is no structured analysis, no devil's advocate, and reasoning behind decisions disappears the moment a vote closes. AI Treasury Council adds the missing layer: cited research, structured debate, immutable record, and reputation that agents earn over time.

## How to evaluate in 60 seconds

| What | Where |
|------|-------|
| Live demo | [demo.aitc.app](https://demo.aitc.app) (Phase 4 deploy, Sun 3.05) |
| GitHub repo | [github.com/danergXx-xX/ETH-Global](https://github.com/danergXx-xX/ETH-Global) |
| Architecture | [docs/architecture.md](architecture.md) (Mermaid diagrams) |
| 3-min video | [youtube.com/TBD](https://youtube.com/TBD) (Phase 4) |

### Sponsor track relevance

| Track | Implementation | Where to look |
|-------|---------------|---------------|
| **0G Storage** | Every debate transcript uploaded to 0G with content hash; IPFS Pinata fallback for resilience | `apps/api/storage/zerog.py` and `apps/api/storage/factory.py` |
| **ENS Identity** | Each agent persona has subname under `aicouncil.eth` (Phase 2 NameStone integration); on-chain reputation surfaced via text records | `apps/web/components/ENSIdentityCard.tsx`, `contracts/src/AgentReputation.sol` |
| **ETHGlobal Finalist** | Five trust mechanisms wired end-to-end (see below); 5 contracts deployed and verified; 141 tests pass (23 contracts + 97 backend + 21 e2e); original Moat 5 Proof-of-Work for agents | This whole repo |

## Live on Base Sepolia

All five contracts deployed and verified on Base Sepolia (chainId 84532) on 2026-05-02:

| Contract | Address | Role |
|----------|---------|------|
| CouncilToken | [`0x5fE2...4381`](https://sepolia.basescan.org/address/0x5fE2a5E971d9FAafF9cC0b0C9981da44fefC4381) | ERC20Votes governance token (AICT) |
| TimelockController | [`0x76A6...1B0f`](https://sepolia.basescan.org/address/0x76A69Bb6aeF69A2E76fA6C9632Ff6Ca101441B0f) | 48-hour delay, admin revoked |
| AICouncilGovernor | [`0x1f95...01F0`](https://sepolia.basescan.org/address/0x1f95C796C5dc47d08B20CF3220a2AFa995e301F0) | 60% quorum, 1-day voting |
| MockUSDC | [`0x606E...B59d`](https://sepolia.basescan.org/address/0x606EDE7755131e6206A29B67d88761eEbb3Bb59d) | 1M mUSDC treasury |
| AgentReputation | [`0xf3BA...6f44`](https://sepolia.basescan.org/address/0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44) | Moat 5 Proof-of-Work for agents |

Pre-deploy security audit: 0 CRITICAL, 0 HIGH findings (Mateusz agent T3 review, see [docs/SECURITY.md](SECURITY.md)). 23/23 Foundry tests pass.

## Five trust mechanisms

Sourced from independent research on AI agent trust gaps. Every mechanism is wired into the live system, not aspirational.

1. **Source attribution per claim.** Every agent statement includes URLs (RSS, CoinGecko, DefiLlama) with confidence weights 0.0-1.0. No black-box recommendations. See `apps/api/agents/tools.py`.
2. **Timelock countdown UI.** A live 48-hour countdown gives token holders a window to review and challenge before funds move. See `apps/web/components/TimelockCountdown.tsx`.
3. **Immutable audit trail.** Full transcript on 0G Storage; CID linked from the verdict card so anyone can fetch the original.
4. **ENS reputation badges.** Agents earn or lose reputation per debate via the AgentReputation contract; ENS text records mirror it (Phase 2).
5. **Human-in-the-loop council rules.** A JSON config specifies which proposal types require human override (e.g. transfers above threshold). AI advises, humans decide. See `apps/web/components/CouncilRulesEditor.tsx`.

## Tech stack

- **Frontend** Next.js 16, Tailwind CSS v4, shadcn/ui, RainbowKit, wagmi v2, viem
- **Backend** Python 3.11, FastAPI, Pydantic v2, structlog, slowapi rate limit
- **AI** Anthropic SDK with prompt caching, async generator streaming via WebSocket
- **Smart contracts** Solidity 0.8.24, Foundry, OpenZeppelin Contracts v5
- **Storage** 0G Storage primary, IPFS Pinata fallback (factory pattern)
- **Data** RSS (Reuters, CoinDesk), CoinGecko API, DefiLlama API
- **CI/CD** GitHub Actions with gitleaks + lint + tests, Vercel for frontend, Railway for backend

Bilingual UI (Polish + English) via custom i18n provider (next-intl was incompatible with Turbopack + pnpm + Next 16; documented in ADR-002).

## What is NOT in the demo (honest scope)

- ENS subname minting via NameStone is Phase 2; signup pending. Frontend stub renders mock data so the UX is reviewable.
- Agents 2-5 (Bear, Risk, Tech, Sentiment) currently return curated mock responses. Bull is fully wired with live sources.
- A sixth contract `AdversarialAuditor` (challenger agent challenging consensus) is on the roadmap but cut from MVP.
- Some component paths referenced in this doc (`apps/web/components/TimelockCountdown.tsx`, `ENSIdentityCard.tsx`, `AuditLog.tsx`, `CouncilRulesEditor.tsx`) live on the `feat/wagmi-ui` branch and merge to `main` with the Phase 1B wrap (CHANGELOG 0.18.0). The `AgentReputation.sol` source lives on `feat/agent-reputation`.

## Team

- **Dan Otomanski** ([@danergXx-xX](https://github.com/danergXx-xX)) - Lead, system architecture, AI agent orchestration
- **Matthew Foyle** - MVP plan, demo voice-over, sponsor liaison, FEEDBACK.md research
- **15-agent AI dev-team** orchestrated through Claude Code: PM (Maxima/Pico/Atlas), engineering (Aiko/Hugo/Sol/Nova/Lumen), QA (Quill), security (Mateusz), design (Vela), docs (Nina), demo (Eva). Every commit went through automated code review and security audit before merge.

## Contact

- GitHub issues: [github.com/danergXx-xX/ETH-Global/issues](https://github.com/danergXx-xX/ETH-Global/issues)
- Dan on Signal: see ETHGlobal submission form

Thank you for evaluating. We built this for sędziów and DAO contributors first.
