# Changelog

All notable changes to AI Treasury Council. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions track the 50-hour ETHGlobal Open Agents 2026 sprint (2026-05-01 to 2026-05-03).

## [0.20.0] - 2026-05-03 (planned)

### Added
- Phase 4 deploy: Vercel (frontend) + Railway (backend) live URLs
- 3-minute demo video with voice-over (Eva Sesja 22)
- ETHGlobal submission form filed
- Deploy URL and demo video links wired into README

## [0.19.0] - 2026-05-02

### Added
- `AgentReputation.sol` deployed on Base Sepolia at `0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44` (Moat 5 Proof-of-Work for agents)
- 5 agents registered with initial reputation 100 each
- `authorizedUpdater` permissioned writer separated from `Ownable` admin
- Pre-deploy audit: Mateusz APPROVE 0 CRITICAL 0 HIGH, Critic 8.5/10, Vera 8.5/10
- Final docs set: README v2, `docs/architecture.md`, `docs/JUDGES-ONBOARDING.md`, `docs/CHANGELOG.md`, expanded `docs/glossary.md` (Sesja 24)

## [0.18.0] - 2026-05-02

### Added
- Phase 1B wagmi UI: CONCLAVE dashboard with tabs, RainbowKit wallet connect, SSR-safe wagmi providers
- 8 production components: Live Debate Viewer with typewriter, Proposal Form, Verdict Card, Vote+Execute Flow with TimelockCountdown, Audit Log, ENS Identity Card, Council Rules Editor
- Custom hooks for proposal lifecycle (`useDebate`, `useTimelockCountdown`, `useEnsAgent`)
- Bilingual i18n PL+EN via custom provider (next-intl incompatible with Turbopack + pnpm + Next 16, see ADR-002)

### Fixed
- Critic + Vera review findings on wagmi UI components (CRITICAL XSS in i18n bundle interpolation, HIGH localStorage safety on language toggle)

## [0.17.0] - 2026-05-02

### Added
- Phase 3 source attribution backend: `apps/api/agents/tools.py` with RSS + CoinGecko + DefiLlama wired into Bull pre-fetch
- Orchestrator global source dedup
- 7 new pytest tests (Vera 8.9/10)
- Source attribution per claim (Sora trust mechanism #1)

### Security
- Pre-submission audit: lxml HIGH CVE patched (5.3.0 -> 6.1.0), pytest tmpdir CVE patched (8.3.0 -> 9.0.3)
- Rate limiting on `/api/debate`: 10 req/min per IP via slowapi 0.1.9
- GitHub branch protection enabled on main: require PR + 1 approval + 4 CI status checks

## [0.16.0] - 2026-05-02

### Added
- Pre-submission security audit (Mateusz Sesja 16): 378-line report
- gitleaks pre-commit hook
- GitHub secret scanning enabled

### Fixed
- HIGH EIP-55 checksum mismatch in `apps/web/lib/contracts.ts`
- MEDIUM unhandled exception in `apps/api/main.py` `run_debate` path

## [0.15.0] - 2026-05-02

### Added
- 23 cross-module integration tests (Quill Sesja 15)
- Regression baseline: 150 tests PASS across contracts + backend + e2e

## [0.14.0] - 2026-05-02

### Added
- Submission-ready README (Nina Sesja 14): 219 lines, badges, Mermaid arch diagram, contract addresses, Quick Start
- `docs/glossary.md`: 20 terms for non-technical judges (DAO, Governor, Timelock, Quorum, ERC20Votes, ENS subname, etc.)

## [0.13.0] - 2026-05-02

### Added
- `docs/FEEDBACK.md` for ENS and 0G Labs sponsors (Maja Sesja 13): 12 items (6 ENS + 6 0G + 3 cross-cutting)

## [0.12.0] - 2026-05-02

### Added
- 14 UX mockup components (Vela Sesja 12): Live Debate Viewer, Proposal Form, Verdict Card, Treasury Dashboard, Protocol Registry, Settings, Audit Log, Vote+Execute Flow, ENS Identity Card, Council Rules Editor, Onboarding, Add Agent, Notifications, Mobile views
- 87 Polish diacritic fixes in i18n bundles via `scripts/fix-pl-i18n.py`

## [0.11.0] - 2026-05-02

### Added
- ABI export pipeline (`scripts/export-abi.sh`)
- 4/4 contracts verified on Basescan after Etherscan API key fix

## [0.10.0] - 2026-05-02

### Fixed
- CRITICAL orchestrator bug discovered in Sesja 9 cross-sessions audit (race condition in agent parallel collection)

## [0.9.0] - 2026-05-02

### Added
- Cross-sessions audit (Atlas Sesja 9): 7.3/10 CONTINUE verdict, 12 findings catalogued

## [0.8.0] - 2026-05-02

### Added
- Phase 3 data tools (Lumen Sesja 8): RSS aggregator (Reuters, CoinDesk), CoinGecko price/volume, DefiLlama TVL, DataAggregator with cache

## [0.7.0] - 2026-05-01

### Added
- Phase 1D execution payload encoder: MockUSDC.transfer calldata for Governor proposals

## [0.6.0] - 2026-05-01

### Added
- 0G Storage integration (Hugo Sesja 6): JSON-RPC upload + IPFS Pinata fallback via factory pattern
- Storage URL persisted in debate transcript

## [0.5.0] - 2026-05-01

### Added
- Phase 1A smart contracts deployed and verified on Base Sepolia (Sol Sesja 5):
  - CouncilToken (ERC20Votes) at `0x5fE2a5E971d9FAafF9cC0b0C9981da44fefC4381`
  - TimelockController (48h delay) at `0x76A69Bb6aeF69A2E76fA6C9632Ff6Ca101441B0f`
  - AICouncilGovernor (60% quorum, 1d voting) at `0x1f95C796C5dc47d08B20CF3220a2AFa995e301F0`
  - MockUSDC (1M mUSDC treasury) at `0x606EDE7755131e6206A29B67d88761eEbb3Bb59d`
- 23/23 Foundry tests pass

## [0.4.0] - 2026-05-01

### Added
- QA suite (Quill Sesja 4): Playwright e2e + integration scaffold, 21 tests across 3 specs

## [0.3.0] - 2026-05-01

### Added
- Bull agent live (Nova Sesja 3) with golden questions test set
- Anthropic SDK with prompt caching
- Structured output schema for agent opinions

## [0.2.0] - 2026-05-01

### Added
- FastAPI scaffold (Hugo Sesja 2): `/health`, `/api/debate`, Pydantic v2 schemas, structlog
- Phase 0.5 R-020 fix: in flight at sprint start

## [0.1.0] - 2026-05-01

### Added
- Initial Next.js 16 frontend scaffold (Aiko Sesja 1) with Tailwind v4, shadcn/ui, custom i18n provider
- Phase 0+0.5 done: bilingual PL+EN, RainbowKit installed, language toggle in header

## [0.0.1] - 2026-04-30

### Added
- Repository created
- Charter v1 (8 values)
- Dev-team agent definitions (15 specialists)
- Knowledge pack (9 tech docs)
- Risk register (15 preloaded risks)
