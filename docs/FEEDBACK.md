# AI Treasury Council - Sponsor Feedback

ETHGlobal Open Agents 2026 submission by Dan Otomanski.

Honest, specific feedback from building with ENS and 0G Labs technologies over a 3-day hackathon sprint (May 1-3, 2026). Each item includes what we hit, how we worked around it, and a concrete suggestion.

## ENS

### 1. NameStone signup lead time unknown

We planned to use NameStone for gasless offchain subnames (Phase 2, Saturday night). Risk R-015 flagged that signup might require approval or KYC with unknown turnaround. For a 50-hour hackathon, "unknown lead time" on a critical dependency is a blocker.

**Our workaround:** We contacted NameStone Discord on Saturday morning and prepared a fallback path using manual Sepolia ENS registry calls via `ensjs` (estimated +2 hours if needed).

**Suggestion:** A self-serve sandbox mode for hackathons - instant API key with testnet-only access, no approval queue. Even a 24-hour trial key would eliminate this friction entirely.

### 2. Testnet vs mainnet setup not clearly separated in docs

The ENS documentation at docs.ens.domains mixes mainnet and Sepolia testnet instructions. Finding the correct contract addresses, resolver addresses, and chain configuration for Sepolia required cross-referencing multiple pages. The `ensjs` setup examples default to mainnet.

**Our workaround:** We used `addEnsContracts(sepolia)` from `ensjs` which auto-configures contract addresses, but discovering this function required reading the library source rather than the docs.

**Suggestion:** A dedicated "Hackathon Quick Start" page with copy-paste Sepolia setup, pre-filled contract addresses, and a working example that resolves a testnet name end-to-end in under 10 lines.

### 3. Custom text records for AI agents have no standard yet

We stored agent-specific data in ENS text records (`aicouncil.role`, `aicouncil.reputation`, `aicouncil.statements_count`). These are custom keys we invented. ERC-8004 (AI Agent Identity) is referenced in docs but still in draft with no reference implementation.

**Our workaround:** We defined our own namespace (`aicouncil.*`) and documented the schema in README. We also added `erc8004.profile` as a JSON blob for forward compatibility.

**Suggestion:** Publish an ERC-8004 reference implementation with 2-3 example text record schemas (AI agent, bot, automated service). Even a draft spec with concrete key names (`agent-type`, `agent-skills`, `agent-reputation`) would help hackathon teams converge on a standard instead of inventing ad-hoc keys.

### 4. Text record update gas costs opaque on testnet

Updating `reputation` text records after each debate requires on-chain transactions. The gas cost per `setRecords` call on Sepolia was not documented - we had to deploy and measure. For a production system updating reputation after every debate, the cost model matters.

**Our workaround:** We batched text record updates where possible and used a dedicated hot wallet with pre-funded testnet ETH.

**Suggestion:** Add a gas estimation table to the docs showing approximate costs for common operations (set 1 text record, set 5 text records, create subname) on both mainnet and testnet. Even rough estimates help teams budget their faucet ETH.

### 5. Reverse resolution requires separate primary name setup

For the frontend to show `bull.aicouncil.eth` instead of `0x4f8a...`, each agent wallet needs a separate `setPrimaryName` transaction. This is a second transaction per agent on top of subname creation - 10 transactions total for 5 agents (5 create + 5 set primary). The docs describe `setPrimaryName` but do not flag that reverse resolution silently fails without it.

**Our workaround:** We added `setPrimaryName` calls in our setup script after discovering that `getName()` returned null for freshly created subnames.

**Suggestion:** Either make primary name setting part of `createSubname` (opt-in flag), or add a prominent warning in the subname creation docs: "Reverse resolution will not work until you also call setPrimaryName from the subname owner wallet."

### 6. ensjs + viem version alignment

We used `viem` throughout our frontend (RainbowKit + wagmi). The `ensjs` library also depends on `viem` but does not clearly document which `viem` versions are compatible. We hit type mismatches between our app's `viem` 2.x and `ensjs` expectations until we aligned versions.

**Our workaround:** Pinned both `viem` and `ensjs` to versions we confirmed worked together through trial and error.

**Suggestion:** Document the tested `viem` version range in the `ensjs` README and consider a compatibility matrix, or use `peerDependencies` more strictly in package.json.

## 0G Labs

### 1. No Python SDK - only TypeScript

Our backend is Python (FastAPI + Anthropic SDK + web3.py). The 0G Storage SDK (`@0gfoundation/0g-ts-sdk`) is TypeScript-only. There is no Python package on PyPI and no Python examples in the docs. For a Python backend, this means either wrapping a Node subprocess or reimplementing the protocol from scratch.

**Our workaround:** We implemented direct JSON-RPC calls to the 0G indexer in Python using `httpx` (see `storage/zerog.py`). We chose direct JSON-RPC over wrapping a Node subprocess to avoid cross-process communication overhead and keep deployment to a single Python container. We reverse-engineered the `zgs_uploadSegment` and `zgs_getStatus` RPC methods from the TypeScript SDK source code.

**Suggestion:** Ship an official `0g-storage-sdk` package on PyPI with async support (`asyncio` + `httpx`/`aiohttp`). Python is the dominant language for AI/ML backends - for a hackathon focused on AI agents, this is a significant gap. Even a thin wrapper around the JSON-RPC methods would save teams hours.

### 2. Indexer JSON-RPC methods undocumented

The 0G Storage indexer exposes JSON-RPC methods (`zgs_getStatus`, `zgs_uploadSegment`, `zgs_getFileInfo`, etc.) but these are not documented on docs.0g.ai. The only way to discover them is reading the TypeScript SDK source on GitHub or the Go node source code.

**Our workaround:** We read the TypeScript SDK source (`0g-ts-sdk/src/`) to identify the RPC method names, parameter formats, and response shapes. Our `zerog.py` adapter was built by translating TS calls to Python.

**Suggestion:** Add a JSON-RPC API reference page to docs.0g.ai listing every method, its parameters, and response format. This is standard practice for blockchain nodes (Ethereum, Solana all have this). It would make the storage network accessible to any language, not just TypeScript.

### 3. Merkle proof format unclear for custom uploads

When uploading data segments via `zgs_uploadSegment`, the `proof` field format is not specified. The TypeScript SDK handles Merkle tree construction internally, but when calling the RPC directly (as we did in Python), we did not know what proof array format the node expects.

**Our workaround:** We passed an empty proof array (`"proof": []`) for single-segment uploads under 256KB, which the node accepted. We do not know if this is correct behavior or a testnet quirk that would fail in production.

**Suggestion:** Document the Merkle proof format explicitly - the tree construction algorithm, segment size boundaries, and proof array structure. Alternatively, provide a standalone Merkle tree library (not bundled in the TS SDK) that any language can port.

### 4. web3.storage legacy API sunset - Pinata required as fallback

Matthew's original plan referenced `web3.storage` as the IPFS fallback. We discovered during implementation that the web3.storage legacy upload API (`api.web3.storage/upload`) was sunset in January 2024. The new w3up protocol uses UCAN auth, which adds significant complexity for a hackathon.

**Our workaround:** We switched to Pinata as our IPFS fallback (simpler JWT auth model). See `apps/api/storage/ipfs.py`. Our factory pattern (`storage/factory.py`) handles automatic fallback from 0G to IPFS with a single env var.

**Suggestion:** The 0G docs could include a "fallback strategies" section noting that `web3.storage` legacy API is deprecated and suggesting Pinata or Filebase as IPFS alternatives. Teams adopting 0G Storage will want a fallback path during the SDK's early days, and guiding them to a working one reduces frustration.

### 5. No testnet faucet integration in docs workflow

The 0G Storage testnet requires a funded wallet for on-chain flow contract interactions. The faucet (faucet.0g.ai) is mentioned but the docs workflow does not include "Step 0: fund your wallet" in the quick start. We spent time debugging upload failures before realizing our testnet wallet had zero balance for the storage contract call.

**Our workaround:** We pre-funded the wallet via the faucet before attempting uploads.

**Suggestion:** Add wallet funding as Step 1 in the quick start guide, with a direct faucet link and minimum balance requirement. Even better: include a `checkBalance()` helper in the SDK that throws a descriptive error ("Insufficient balance for storage contract - visit faucet.0g.ai") instead of a raw RPC error.

### 6. Gateway URL pattern not documented

After uploading data to 0G Storage, we needed a gateway URL to retrieve the content via HTTP (for frontend display). The gateway URL format (`https://indexer-storage-testnet-turbo.0g.ai/file/{rootHash}`) was not documented - we found it by inspecting the TypeScript starter kit.

**Our workaround:** We hardcoded the gateway URL pattern in our Python adapter (`ZEROG_GATEWAY` constant) after confirming it worked through manual testing.

**Suggestion:** Document the gateway URL format in the SDK docs and include it in the upload response. Ideally the SDK `upload()` return value should include `gatewayUrl` alongside `rootHash`.

## Cross-cutting observations

### CrewAI + 0G + web3 dependency conflict

We originally planned to use CrewAI for agent orchestration (per ETHGlobal brief). However, `crewai==0.83.0` (via `langchain-core`) requires `pydantic>=2.10` while `fastapi==0.115.0` requires `pydantic<2.10`. This made it impossible to run a single Python environment with both CrewAI (agents) and FastAPI (API layer for 0G Storage + Governor contract reads).

**Resolution:** We cut CrewAI entirely and built orchestration with bare Anthropic SDK + `asyncio.gather()`. This actually reduced our attack surface and simplified deployment (see `dev-team/decisions/ADR-002`). The 0G integration worked cleanly once CrewAI was removed.

**Takeaway for 0G:** Teams building AI agents that also interact with your storage layer will likely hit Python dependency conflicts. Testing the SDK alongside popular AI frameworks (CrewAI, LangChain, AutoGen) would surface these early.

### Documentation gaps are the biggest friction

Both ENS and 0G have functional technology. The primary friction was not bugs but missing documentation: undocumented RPC methods, unclear testnet setup, missing version compatibility info, absent gas estimates. In a 50-hour hackathon, every 30 minutes spent reading source code instead of docs is time not spent building the demo.

### What worked well

**ENS:** The `ensjs` library is well-designed once you find the right functions. Live ENS resolution via `viem` is smooth and demo-ready - showing `bull.aicouncil.eth` resolving in real-time is a strong visual moment. The subname + text records model is a natural fit for AI agent identity. We would build on ENS again for any project that needs human-readable agent naming.

**0G Labs:** The storage network itself is reliable on testnet. Upload latency was acceptable for our use case (debate transcripts under 50KB). The root hash as content identifier is a clean model. The automatic fallback architecture we built (`0G primary -> IPFS fallback`) was straightforward thanks to the consistent hash-based retrieval pattern. The core value proposition - verifiable, decentralized storage for AI agent audit trails - is compelling and we see a clear path to production use.
