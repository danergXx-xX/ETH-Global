import type { Metadata } from "next";
import { DocsShell, H2, H3, P, UL, OL, Code, Callout } from "@/components/docs/docs-shell";
import { LayerDiagram, FlowSteps, CompareTable } from "@/components/docs/diagram";
import { VerifiedOnBasescanBadge } from "@/components/shared/verified-on-basescan-badge";

export const metadata: Metadata = {
  title: "Architecture - CONCLAVE",
  description: "How AI Treasury Council works under the hood: layers, contracts, ENS, trust mechanisms.",
};

const TOC = [
  { id: "overview", label: "1. System overview" },
  { id: "data-flow", label: "2. Data flow per debate" },
  { id: "contracts", label: "3. Smart contracts" },
  { id: "ens", label: "4. ENS integration" },
  { id: "trust", label: "5. Trust mechanisms" },
  { id: "stack", label: "6. Tech stack" },
  { id: "multisig", label: "7. Multisig + bad actors" },
  { id: "scale", label: "8. Scalability" },
];

export default function ArchitecturePage() {
  return (
    <DocsShell
      title="Architecture"
      subtitle="How AI Treasury Council works under the hood."
      toc={TOC}
      pagePath="apps/web/app/(docs)/architecture/page.tsx"
      currentHref="/architecture"
    >
      <P>
        CONCLAVE is a multi-agent AI council for DAO treasury governance. Five specialized agents
        debate every proposal in parallel, an Adversarial sixth agent attacks the consensus,
        and the full transcript lands on 0G Storage with on-chain reputation updates. The
        DAO votes via OpenZeppelin Governor with a 48-hour timelock before any treasury action
        executes. This page is the implementation reference; for the 60-second pitch see the{" "}
        <a
          href="https://github.com/danergXx-xX/ETH-Global"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          README
        </a>
        .
      </P>

      <H2 id="overview">1. System overview</H2>
      <P>
        Five layers, one direction of trust. The user only authenticates with their wallet; everything
        else is verifiable - either on-chain or via a 0G CID.
      </P>
      <LayerDiagram
        layers={[
          { name: "User layer", stack: "Web wallet (RainbowKit + wagmi v2 + viem)", tone: "user" },
          { name: "API layer", stack: "FastAPI on Railway, Pydantic v2, structlog, slowapi rate limit", tone: "api" },
          { name: "AI agent layer", stack: "Anthropic SDK, 5+1 personas, prompt caching, async streaming", tone: "ai" },
          { name: "Storage layer", stack: "0G Storage primary, IPFS Pinata fallback (factory pattern)", tone: "storage" },
          { name: "Blockchain layer", stack: "Base Sepolia (governance + treasury) + Sepolia (ENS subnames)", tone: "chain" },
        ]}
      />
      <Callout variant="info" title="Why two chains?">
        Governance and treasury live on Base Sepolia (low fees, fast finality, sponsor track). ENS
        subnames live on Sepolia where NameStone is available. Cross-chain pointers tie them
        together via the <Code>ai.contract</Code> text record (see ENS section).
      </Callout>

      <H2 id="data-flow">2. Data flow per debate</H2>
      <P>
        A single debate exercises every layer. The flow below is what happens when a user clicks
        &quot;Submit proposal&quot; in the dashboard.
      </P>
      <FlowSteps
        steps={[
          {
            title: "User submits proposal (frontend)",
            detail: "Proposal text + target action (treasury transfer, swap, etc.) submitted via signed wallet message.",
          },
          {
            title: "Backend validates and prepares context (DataAggregator)",
            detail: "Pulls live RSS (Reuters, CoinDesk), CoinGecko prices, DefiLlama TVL. Each fact is tagged with URL + timestamp + confidence.",
          },
          {
            title: "5+1 agents debate in parallel",
            detail: "asyncio.gather runs Bull / Bear / Risk / Tech / Sentiment + Adversarial (opt-in). Each agent cites sources per claim.",
          },
          {
            title: "Consensus computed (weighted voting)",
            detail: "Agent reputation weights the vote. Adversarial agent forces dissent if consensus is too clean.",
          },
          {
            title: "Audit log uploaded to 0G Storage",
            detail: "Full transcript JSON pinned. CID returned. IPFS Pinata used as fallback if 0G is unreachable.",
          },
          {
            title: "Reputation updated on-chain",
            detail: "AgentReputation contract receives delta per agent: +1 if aligned with consensus, -1 if not. Permissioned writer.",
          },
          {
            title: "Frontend renders verdict + audit trail",
            detail: "Verdict card with 0G CID link. Source tooltips on each claim. ENS reputation badges live-update.",
          },
        ]}
      />

      <H2 id="contracts">3. Smart contracts (Base Sepolia)</H2>
      <P>
        Five contracts, deployed and verified. Total deploy gas: ~10.5M gas (~$0.0001 on Base
        Sepolia). Pre-deploy security audit: 0 CRITICAL, 0 HIGH (Mateusz T3, Sesja 16 + 19).
      </P>
      <CompareTable
        headers={["Contract", "Address", "Role", "Key functions"]}
        rows={[
          [
            <Code key="1">CouncilToken</Code>,
            <span key="1a" className="inline-flex items-center gap-1.5 flex-wrap">
              <a href="https://sepolia.basescan.org/address/0x5fE2a5E971d9FAafF9cC0b0C9981da44fefC4381" className="underline font-mono text-xs" target="_blank" rel="noopener noreferrer">0x5fE2...4381</a>
              <VerifiedOnBasescanBadge address="0x5fE2a5E971d9FAafF9cC0b0C9981da44fefC4381" label="CouncilToken" compact />
            </span>,
            "ERC20Votes governance token, 5 minted, timestamp clock",
            <Code key="1b">delegate, getVotes</Code>,
          ],
          [
            <Code key="2">AICouncilGovernor</Code>,
            <span key="2a" className="inline-flex items-center gap-1.5 flex-wrap">
              <a href="https://sepolia.basescan.org/address/0x1f95C796C5dc47d08B20CF3220a2AFa995e301F0" className="underline font-mono text-xs" target="_blank" rel="noopener noreferrer">0x1f95...01F0</a>
              <VerifiedOnBasescanBadge address="0x1f95C796C5dc47d08B20CF3220a2AFa995e301F0" label="AICouncilGovernor" compact />
            </span>,
            "60% quorum, 1-day voting, 0 threshold",
            <Code key="2b">propose, castVote, execute</Code>,
          ],
          [
            <Code key="3">TimelockController</Code>,
            <span key="3a" className="inline-flex items-center gap-1.5 flex-wrap">
              <a href="https://sepolia.basescan.org/address/0x76A69Bb6aeF69A2E76fA6C9632Ff6Ca101441B0f" className="underline font-mono text-xs" target="_blank" rel="noopener noreferrer">0x76A6...1B0f</a>
              <VerifiedOnBasescanBadge address="0x76A69Bb6aeF69A2E76fA6C9632Ff6Ca101441B0f" label="TimelockController" compact />
            </span>,
            "48-hour delay, admin role revoked",
            <Code key="3b">schedule, execute</Code>,
          ],
          [
            <Code key="4">MockUSDC</Code>,
            <span key="4a" className="inline-flex items-center gap-1.5 flex-wrap">
              <a href="https://sepolia.basescan.org/address/0x606EDE7755131e6206A29B67d88761eEbb3Bb59d" className="underline font-mono text-xs" target="_blank" rel="noopener noreferrer">0x606E...B59d</a>
              <VerifiedOnBasescanBadge address="0x606EDE7755131e6206A29B67d88761eEbb3Bb59d" label="MockUSDC" compact />
            </span>,
            "Treasury asset, 1M mUSDC supply",
            <Code key="4b">transfer, approve</Code>,
          ],
          [
            <Code key="5">AgentReputation</Code>,
            <span key="5a" className="inline-flex items-center gap-1.5 flex-wrap">
              <a href="https://sepolia.basescan.org/address/0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44" className="underline font-mono text-xs" target="_blank" rel="noopener noreferrer">0xf3BA...6f44</a>
              <VerifiedOnBasescanBadge address="0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44" label="AgentReputation" compact />
            </span>,
            "Moat 5: per-agent reputation, permissioned writer",
            <Code key="5b">updateReputation, reputation</Code>,
          ],
        ]}
      />

      <H2 id="ens">4. ENS integration (Sepolia)</H2>
      <P>
        Each agent persona has a NameStone-managed subname under <Code>aicouncil-danergy.eth</Code>.
        Identity is portable, reputation is public, and an off-chain ERC-8004 profile blob is wired
        for forward compatibility.
      </P>
      <UL>
        <li>
          <strong>Parent domain:</strong> <Code>aicouncil-danergy.eth</Code> (Sepolia)
        </li>
        <li>
          <strong>5 subnames:</strong> <Code>bull</Code>, <Code>bear</Code>, <Code>risk</Code>, <Code>tech</Code>, <Code>sentiment</Code>
        </li>
        <li>
          <strong>26 text records per subname</strong> covering identity, persona signature, live
          reputation, tool list, audit trail pointer, and memory references
        </li>
        <li>
          <strong>Cross-chain pointer:</strong> <Code>ai.contract</Code> text record =
          {" "}<Code>base-sepolia:0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44</Code> resolves
          ENS identity to the on-chain reputation contract on Base Sepolia
        </li>
      </UL>

      <H2 id="trust">5. Trust mechanisms (5)</H2>
      <P>
        DAOs do not adopt AI agents because they cannot trust them. CONCLAVE wires five concrete
        trust mechanisms. None of them are post-hackathon promises - all five are live in the demo.
      </P>
      <CompareTable
        headers={["Mechanism", "What it does", "Verifiable by"]}
        rows={[
          ["Source attribution per claim", "Every agent statement cites a URL + timestamp + confidence score", "Frontend tooltips, debate transcript JSON"],
          ["Timelock 48h with countdown UI", "No treasury action executes for 48h after vote passes", "TimelockController on-chain, frontend countdown"],
          ["Audit log on 0G Storage", "Full transcript pinned with permanent CID", "0G CID link in every verdict card"],
          ["ENS reputation badge", "Per-agent reputation history queryable via ENS text records", "viem.getEnsText() against Sepolia"],
          ["HITL Council Rules", "DAO can override any default (multisig threshold, agent enable/disable, etc.) via JSON Editor", "RulesEditor tab + on-chain config hash"],
        ]}
      />

      <H2 id="stack">6. Tech stack</H2>
      <CompareTable
        headers={["Layer", "Stack"]}
        rows={[
          ["Frontend", "Next.js 16, Tailwind v4, shadcn/ui, RainbowKit, wagmi v2, viem"],
          ["Backend", "FastAPI, Pydantic v2, Anthropic SDK, structlog, slowapi"],
          ["Smart contracts", "Solidity 0.8.24, Foundry, OpenZeppelin Contracts v5"],
          ["Storage", "0G Storage (primary), IPFS Pinata (fallback)"],
          ["AI models", "Claude Sonnet 4.6 (production), Opus 4.7 (judge demos)"],
          ["Observability", "structlog JSON to Railway logs, on-chain events for state changes"],
        ]}
      />

      <H2 id="multisig">7. Multisig + bad actor handling</H2>
      <H3 id="multisig-config">Multisig configuration</H3>
      <P>
        Default execution policy is 5-of-7 multisig signatures for any proposal that passes the
        DAO vote. The Council Rules JSON Editor lets the DAO override this per deployment - smaller
        DAOs can run 3-of-5, larger ones can require 7-of-9. The threshold is enforced both off-chain
        (proposal queue) and on-chain (TimelockController role assignments).
      </P>
      <H3 id="bad-actor">Bad actor handling</H3>
      <P>
        Three layers of defense, each independent:
      </P>
      <OL>
        <li>
          <strong>Adversarial agent (6th persona):</strong> opt-in agent that explicitly attacks
          every proposal. Forces dissent when the other 5 agents agree too cleanly. Catches
          groupthink and weak reasoning before vote.
        </li>
        <li>
          <strong>COUNCIL_RULES jailbreak guard:</strong> system prompt isolation per agent. User
          input cannot inject instructions that override agent persona or extract reasoning.
          Verified by red-team audit (Sesja 33 F-01 fix, see{" "}
          <a href="https://github.com/danergXx-xX/ETH-Global/blob/main/docs/SECURITY-AUDIT-REDTEAM-JAILBREAK-2026-05-02.md" className="underline" target="_blank" rel="noopener noreferrer">
            Red-team audit
          </a>
          ).
        </li>
        <li>
          <strong>Source markers sanitization:</strong> agent outputs are normalized before storage
          and display. Prevents prompt injection that uses fake source markers to fabricate
          citations.
        </li>
      </OL>

      <H2 id="scale">8. Scalability</H2>
      <UL>
        <li>
          <strong>Rate limit:</strong> 10 req/min per IP on <Code>/api/debate</Code> via slowapi
        </li>
        <li>
          <strong>WebSocket cap:</strong> 30 concurrent debate streams (back-pressure on connect)
        </li>
        <li>
          <strong>Anthropic budget tracker:</strong> halts new debates at 80% of monthly budget,
          surfaces banner on dashboard
        </li>
        <li>
          <strong>Redis cache:</strong> reputation reads cached with 60s TTL (planned post-hackathon)
        </li>
        <li>
          <strong>Postgres persistence:</strong> debate state, proposal queue, agent metadata
        </li>
      </UL>
      <Callout variant="warn" title="Hackathon limitation">
        Single-instance Railway deploy uses in-memory rate limit storage. Multi-replica production
        deploy would swap to Redis-backed limiter (TD-003 in tech-debt register).
      </Callout>
    </DocsShell>
  );
}
