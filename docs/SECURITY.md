# Security

AI Treasury Council handles on-chain governance of test treasury funds and stores debate transcripts on decentralized storage. We take security seriously and welcome responsible disclosure.

## Scope

In scope for security review:

- Smart contracts deployed on Base Sepolia (see [README contracts table](../README.md#smart-contracts))
- Backend API (`apps/api/`) including `/api/debate`, `/ws/debate`, and storage layer
- Frontend (`apps/web/`) wallet integration, signature flows, localStorage handling
- CI/CD pipeline (GitHub Actions, secrets handling, branch protection)
- Dependencies (lockfile integrity, known CVEs)

Out of scope:

- Testnet faucet abuse (Base Sepolia ETH has no monetary value)
- MockUSDC token economics (test asset, no real value)
- Rate-limit bypass on local dev environments

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security findings. Instead:

1. Email Dan Otomanski via the address listed in the ETHGlobal submission form
2. Or open a private security advisory on GitHub: [security/advisories/new](https://github.com/danergXx-xX/ETH-Global/security/advisories/new)
3. Include: a description of the issue, steps to reproduce, and your assessment of severity

We aim to acknowledge reports within 48 hours during the hackathon and within 7 days after submission. We will credit reporters in the CHANGELOG unless you request anonymity.

## Pre-deploy security audit

Pre-submission audits performed by the **Mateusz** security agent (see [`dev-team/`](../dev-team/) for agent definitions):

- **Sesja 16 audit** (2026-05-02): 378-line report covering OWASP Top 10 for backend, smart contract reentrancy + access control, secrets handling, dependency CVEs. Findings: HIGH lxml CVE patched (5.3.0 to 6.1.0), HIGH pytest tmpdir CVE patched (8.3.0 to 9.0.3), MEDIUM unhandled exception in `apps/api/main.py` patched, gitleaks pre-commit + GitHub secret scanning + branch protection enabled.
- **Sesja 19 contract audit** (2026-05-02): pre-deploy review of `AgentReputation.sol`. Findings: 0 CRITICAL, 0 HIGH. Verdict: APPROVE for Base Sepolia deploy.

Audit reports archived under `dev-team/audits/`.

## Security posture

| Area | Control |
|------|---------|
| Smart contracts | OpenZeppelin Contracts v5 via Wizard, no custom Solidity beyond `AgentReputation`. CEI pattern, ReentrancyGuard where applicable, immutable state variables. |
| Backend secrets | `.env` in `.gitignore`, gitleaks pre-commit hook, GitHub secret scanning enabled |
| Backend input | Pydantic v2 validation on all POST endpoints, slowapi rate limit (10 req/min per IP on `/api/debate`) |
| Frontend | EIP-55 checksum verification on contract addresses (fixed Sesja 16), no `eval`, raw HTML sanitization at boundary |
| CI/CD | gitleaks scan on every PR, branch protection on `main` (require PR + 1 approval + 4 status checks), no force-push allowed |
| Deployer wallet | Fresh testnet-only wallet, separated from any personal wallet, private key in CI secrets only |
| Authorized writers | `AgentReputation.authorizedUpdater` separated from `Ownable` admin (dual-key model) |

## Known limitations

Honest disclosure of what is **not** hardened in the MVP:

- The frontend currently runs against a **single backend instance**; no multi-region failover.
- No rate limit on the `/ws/debate` WebSocket; relies on the upstream HTTP rate limit at handshake.
- Source attribution data fetched from RSS / CoinGecko / DefiLlama is **not signed** by source providers; we trust their TLS only.
- No formal verification of smart contracts (e.g. Certora, Foundry invariants beyond unit tests).

These are documented as Phase 5 hardening items in the post-hackathon roadmap.

## Coordinated disclosure

For findings that affect deployed contracts, we will:

1. Acknowledge within 48 hours
2. Coordinate a fix and disclosure timeline (default 90 days)
3. Credit the reporter (with permission)
4. Document the issue and resolution in CHANGELOG under `### Security`

Smart contracts on Base Sepolia hold only test funds, but we treat findings with the same diligence as mainnet because the same patterns will deploy to mainnet post-hackathon.

## Contact

- ETHGlobal submission form contact (preferred during hackathon)
- GitHub security advisory: [security/advisories/new](https://github.com/danergXx-xX/ETH-Global/security/advisories/new)

Thank you for helping keep AI Treasury Council secure.
