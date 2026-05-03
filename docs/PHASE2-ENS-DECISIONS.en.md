# ADR Phase 2 ENS - Architecture Decisions

**Date:** 2026-05-02
**Session:** 25 (Sol+Aiko, branch `feat/phase2-ens`)
**Status:** Accepted

> Polish original: `PHASE2-ENS-DECISIONS.md`. English version primary for ETHGlobal partner submission (ENS sponsor track).

## Context

Phase 2 requires ENS subnames for 5 AI agents with text records (reputation, persona, avatar). Domain owner: Dan, wallet `0x14b97991f681D0b69074B5AD3CcC675765C276F4`. Domain `aicouncil-danergy.eth` registered on **Sepolia** (testnet ENS, free). AgentReputation contract lives on **Base Sepolia** (chain 84532).

## Decision 1: SKIP NameStone, mint DIRECT via viem

### Options considered

1. **NameStone API** (offchain L2 subnames, gasless for users)
2. **DIRECT** - own viem 2.x script with `setSubnodeRecord` + `setText` against ENS Registry + PublicResolver
3. **ensjs/wallet** (`createSubname`, `setRecords`) - higher-level wrapper

### Chosen: option 2 (DIRECT)

**Why:**
- NameStone requires signup + API key + web integration - **friction blocker** in a 50h sprint.
- 0.046 ETH testnet balance comfortably covers 5 subnames + ~45 text records (~0.005-0.015 ETH).
- DIRECT gives full control + auditable tx hashes on Etherscan (judges can verify).
- ensjs adds an abstraction layer we do not need - viem 2.x is sufficient.

**Trade-off:**
- We lose: gasless UX for agents (if they wanted to update records themselves).
- We gain: zero external dependencies, everything in repo, idempotent dry-run, single private key to manage.

## Decision 2: Cross-chain - ENS on Sepolia, AgentReputation on Base Sepolia

### Problem

ENS PublicResolver text records are per-chain. Live reputation on Base Sepolia does not automatically update text records on Sepolia.

### Chosen: HYBRID (snapshot + live read)

- **Static text records** (set at mint time): `name`, `description`, `avatar`, `ai.persona`, `com.twitter`, `url`, `ai.contract` (cross-chain pointer `base-sepolia:0x...`), `ai.address`.
- **`ai.reputation` as a SNAPSHOT** initialized to `100` at mint. Refresh via `scripts/update-reputation-snapshot.ts` - run once before demo (reads from Base Sepolia, writes text record on Sepolia).
- **Frontend `useAgentENS`**: reads text records from Sepolia (5 min cache), uses `useReadContract` against Base Sepolia for LIVE reputation. Snapshot visible in ENS Identity Card as "snapshot at block X", live value rendered in Live Debate Viewer.

**Trade-off:**
- We lose: true cross-chain identity with auto-sync. CCIP-Read (offchain resolver) would be cleaner but requires a custom resolver deploy - out of scope.
- We gain: 2 hours of work instead of 2 days. ENS-track judges receive: real Sepolia subnames + text records + a pointer to the cross-chain reputation contract. This aligns with the ERC-8004 pattern (`agent-skills`, `agent-fees`).

## Decision 3: Placeholder owner addresses (0x...01 to 0x...05)

### Problem

Subname minting requires `owner: address`. We do not yet have real wallets per agent (AI agents do not hold keys during the sprint).

### Chosen: deterministic placeholders

`0x0000000000000000000000000000000000000001` through `...0005`. Same values used by `AgentReputation` (assumption from Session 17 Hugo+Nova).

**Future migration:** the parent owner (`aicouncil-danergy.eth`) is allowed to call `setSubnodeRecord` again to overwrite owners. Re-mint is one tx per subname.

## Decision 4: Custom keys `ai.*` instead of `agent.*` (ERC-8004)

ERC-8004 (draft) suggests `agent-type`, `agent-skills`, `agent-fees`. We chose the `ai.` prefix (`ai.persona`, `ai.reputation`, `ai.contract`, `ai.address`):
- Shorter, more readable.
- ERC-8004 is **draft** - it may change. Internal consistency > conformance to a draft.
- Frontend maps to UI regardless of the key - prefix is an implementation detail.

If judges raise the issue: an additional `setText` with ERC-8004 keys per subname is gas-cheap, doable in 5 min.

## Decision 5: No forge tests for the viem script

The script is a one-shot ops tool, not production code. Coverage:
- **Manual dry-run** (gas estimate, plan output).
- **Sanity check** validates parent ownership and collisions before broadcast.
- **viem `encodeFunctionData`** generates deterministic calldata - unit tests for `labelhash`/`namehash` would test viem itself (not our code).

If we revisit this post-sprint, we will add `vitest` with a mocked walletClient and assertions on calldata.

## Consequences

### Positive
- Full control over ENS without external services.
- Zero operational cost (Sepolia is free, key stored locally in `.env`).
- Auditable for judges (Etherscan tx hashes recorded in repo wraps after `--broadcast`).

### Negative / risks
- **Private key in `.env`** - Mateusz security audit MANDATORY before `--broadcast`. Mitigations: `.gitignore` covers `.env`, gitleaks pre-commit hook, `ENS_OWNER_PRIVATE_KEY` never appears in code.
- **Cross-chain text records are a compromise** - ENS-track judges may ask. Answer: live read from Base Sepolia in UI, snapshot in text record as an audit anchor.
- **Placeholder ownerships** - if anyone assumes real agents own these keys and tries to send from those addresses, nothing happens (placeholder = nobody holds the key). NOT a security risk, only optics.

## Links

- ENS docs: https://docs.ens.domains
- Sepolia ENS Manager: https://sepolia.app.ens.domains
- ENS Registry (mainnet/Sepolia): `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- PublicResolver Sepolia: `0x8FADE66B79cC9f707aB26799354482EB93a5B7dD`
- AgentReputation Base Sepolia: `0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44`
- ERC-8004 draft: https://eips.ethereum.org
