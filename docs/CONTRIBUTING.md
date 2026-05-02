# Contributing

Thanks for your interest in AI Treasury Council. This guide covers how to set up locally, where to find help, and how we organize the codebase.

## Getting started

See [README Setup](../README.md#setup) for the full local install (Node 20+, Python 3.11+, Foundry). Quick path:

```bash
git clone https://github.com/danergXx-xX/ETH-Global ai-treasury-council
cd ai-treasury-council
cp .env.example .env  # fill ANTHROPIC_API_KEY, BASE_SEPOLIA_RPC_URL, DEPLOYER_PRIVATE_KEY
pnpm install
pnpm dev  # frontend :3000
cd apps/api && uvicorn main:app --reload  # backend :8000
```

Verify before opening a PR:

```bash
pnpm test          # frontend + e2e
cd apps/api && python -m pytest  # backend
cd contracts && forge test       # smart contracts
```

## Where to look

| You want to | Look at |
|-------------|---------|
| Understand the architecture | [docs/architecture.md](architecture.md) |
| Evaluate the project quickly | [docs/JUDGES-ONBOARDING.md](JUDGES-ONBOARDING.md) |
| Look up a term | [docs/glossary.md](glossary.md) |
| See what changed when | [docs/CHANGELOG.md](CHANGELOG.md) |
| Report a security issue | [docs/SECURITY.md](SECURITY.md) |
| Read sponsor feedback | [docs/FEEDBACK.md](FEEDBACK.md) |

## Repo layout

```
ai-treasury-council/
  apps/
    web/              Next.js 16 frontend
    api/              FastAPI backend
  contracts/          Foundry smart contracts (OZ v5)
  docs/               This folder
  scripts/            Setup and deploy helpers
  tests/              Cross-stack integration and e2e
  dev-team/           Agent definitions, ADRs, handoffs (build-time)
```

## Branching model

- `main` is protected: requires PR + 1 approval + passing CI (lint, tests, gitleaks).
- Feature branches use `feat/<short-topic>` (e.g. `feat/wagmi-ui`, `feat/agent-reputation`).
- Fix branches use `fix/<short-topic>`.
- One feature per branch. Keep branches under 500 lines diff where possible.

## Commit conventions

Commit messages follow the pattern:

```
<type>(<scope>): <imperative summary>

<optional body explaining why, not what>
```

Types: `feat`, `fix`, `docs`, `test`, `chore`, `security`, `polish`. Examples:

```
feat(api): add WebSocket streaming for /ws/debate
fix(contracts): correct AgentReputation initial score on registration
docs(judges): add honest scope disclaimer for unmerged branches
security: patch lxml HIGH CVE 5.3.0 to 6.1.0
```

## Pull request checklist

Before requesting review:

- [ ] Tests added or updated (happy path plus at least one edge case)
- [ ] All existing tests pass locally
- [ ] No new ESLint or `ruff` warnings
- [ ] No secrets committed (gitleaks scans on commit)
- [ ] Anti-AI-zmy clean: ASCII punctuation only, no em-dashes / smart quotes / Unicode bullets
- [ ] Polish diacritics present in any user-facing PL text
- [ ] CHANGELOG updated under `[Unreleased]` if user-facing change
- [ ] Documentation updated for new public APIs or config

## Code style

- **Python:** type hints on every signature, docstrings on public functions, parameterized SQL only, `logging` over `print`, `pathlib.Path` over string concatenation.
- **TypeScript:** strict mode, no `any`, JSDoc on public exports, ESLint clean.
- **Solidity:** NatSpec on public functions, CEI pattern, `ReentrancyGuard` where applicable, `immutable` for one-time-set state.

See [coding standards in CLAUDE.md](../CLAUDE.md#coding-standards) for the full rules.

## Tests

| Layer | Framework | Run |
|-------|-----------|-----|
| Smart contracts | Foundry | `cd contracts && forge test` |
| Backend | pytest | `cd apps/api && python -m pytest` |
| Frontend e2e | Playwright | `npx playwright test` |

Minimum coverage for new modules: happy path plus one edge case. Smart contracts: minimum five tests per contract (happy + edge + invariants + reverts + access control).

## Build-time agents (dev-team)

This project was built with a 15-agent AI dev-team orchestrated through Claude Code over a 3-day sprint. Agent definitions live in `~/.claude/agents/dev-team/` and the build orchestration patterns live in `dev-team/`. Outside the sprint these agents are archived; this section is for context, not for active contribution.

## Reporting issues

- Bugs and feature requests: [GitHub issues](https://github.com/danergXx-xX/ETH-Global/issues)
- Security findings: see [docs/SECURITY.md](SECURITY.md), do not open a public issue

## Questions

Reach out via the ETHGlobal submission form contact during the hackathon, or open a discussion on GitHub afterwards.

By contributing you agree that your contributions will be licensed under the MIT License.
