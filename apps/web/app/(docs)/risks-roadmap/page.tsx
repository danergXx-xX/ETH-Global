import type { Metadata } from "next";
import { DocsShell, H2, H3, P, UL, Code, Callout } from "@/components/docs/docs-shell";
import { CompareTable } from "@/components/docs/diagram";

export const metadata: Metadata = {
  title: "Risks & Roadmap - CONCLAVE",
  description: "Known risks, mitigations, tech debt, and post-hackathon roadmap.",
};

const TOC = [
  { id: "categories", label: "1. Risk categories" },
  { id: "tech-risks", label: "Technical risks", level: 3 as const },
  { id: "adv-risks", label: "Adversarial risks", level: 3 as const },
  { id: "gov-risks", label: "Governance risks", level: 3 as const },
  { id: "ext-risks", label: "External risks", level: 3 as const },
  { id: "roadmap", label: "2. Roadmap" },
  { id: "tech-debt", label: "3. Tech debt (transparency)" },
];

export default function RisksRoadmapPage() {
  return (
    <DocsShell
      title="Risks & Roadmap"
      subtitle="Honest about what can break and what ships next."
      toc={TOC}
      pagePath="apps/web/app/(docs)/risks-roadmap/page.tsx"
      currentHref="/risks-roadmap"
    >
      <P>
        We treat risk transparency as a trust mechanism. Below is the actual risk register the team
        used during the sprint, plus the post-hackathon roadmap we plan to execute on. Tech debt
        section lists known limitations - none of them block submission, all of them have a fix
        path.
      </P>

      <H2 id="categories">1. Risk categories</H2>

      <H3 id="tech-risks">Technical risks</H3>
      <CompareTable
        headers={["Risk", "Impact", "Mitigation"]}
        rows={[
          [
            "Smart contract bugs",
            "Treasury loss, governance griefing",
            "OpenZeppelin Contracts v5 base, Foundry test coverage on critical paths, pre-deploy security audit (Mateusz T3, 0 CRITICAL / 0 HIGH)",
          ],
          [
            "RPC outages (Base / Sepolia)",
            "Frontend can't read state, votes blocked",
            "Multi-provider failover (Alchemy + public RPCs), graceful UI degradation, retry with backoff",
          ],
          [
            "Anthropic API rate limits",
            "Debates fail mid-flight",
            "Budget tracker halts new debates at 80%, prompt caching reduces token spend ~70%, model fallback (Sonnet -> Haiku)",
          ],
          [
            "0G Storage unavailability",
            "Audit trail incomplete",
            "IPFS Pinata fallback via factory pattern, transcript stored regardless, CID returned to user",
          ],
          [
            "Scalability under load",
            "Multi-replica rate limit gaps",
            "Redis-backed rate limiter (TD-003 fix path), WebSocket back-pressure cap at 30 concurrent",
          ],
        ]}
      />

      <H3 id="adv-risks">Adversarial risks</H3>
      <CompareTable
        headers={["Risk", "Impact", "Mitigation"]}
        rows={[
          [
            "Prompt injection via proposal text",
            "Agents leak system prompt or fabricate citations",
            "COUNCIL_RULES guard, system prompt isolation, source marker sanitization (Sesja 33 F-01 fix verified by red-team audit)",
          ],
          [
            "Jailbreak attempts",
            "Agent persona override",
            "Hardened system prompts, refusal patterns, red-team audit pass (see SECURITY-AUDIT-REDTEAM-JAILBREAK-2026-05-02.md)",
          ],
          [
            "Bad actor proposals (governance attacks)",
            "Treasury drain via malicious vote",
            "Adversarial agent (6th persona) attacks every proposal, 48h timelock for human review, multisig threshold (default 5-of-7)",
          ],
          [
            "Sybil voting",
            "Vote buying / token concentration",
            "ERC20Votes timestamp clock, 60% quorum, Council Rules JSON Editor lets DAO tune threshold",
          ],
          [
            "MEV on treasury swaps",
            "Slippage extraction",
            "Uniswap v4 ProtectedTreasurySwap hook with slippage guards based on AI volatility prediction",
          ],
        ]}
      />

      <H3 id="gov-risks">Governance risks</H3>
      <CompareTable
        headers={["Risk", "Impact", "Mitigation"]}
        rows={[
          [
            "DAO contributor turnover",
            "Council Rules drift, multisig signers leave",
            "Rules versioned on-chain (config hash), signer rotation procedure documented, ENS-based identity (portable across wallets)",
          ],
          [
            "Multisig coordination failure",
            "Proposals stall in execution queue",
            "5-of-7 default (tolerates 2 absences), countdown UI shows urgency, fallback to 3-of-5 via Rules override",
          ],
          [
            "Reputation gaming",
            "Agents collude to align with consensus",
            "Adversarial agent forces dissent, reputation deltas are deterministic and on-chain auditable, manual override via DAO vote",
          ],
        ]}
      />

      <H3 id="ext-risks">External risks</H3>
      <CompareTable
        headers={["Risk", "Impact", "Mitigation"]}
        rows={[
          [
            "Sponsor track requirements change mid-sprint",
            "Submission disqualification",
            "FEEDBACK.md kept current per sponsor, daily check on partner channels, scope cuts pre-approved by PM-Lead",
          ],
          [
            "Mentor / sponsor unavailability",
            "Integration questions blocked",
            "Discord channels monitored, pre-built reference implementations (Uniswap v4 hooks, ENS NameStone, 0G Storage) reduce dependence",
          ],
          [
            "Live demo failure during judging",
            "Judges miss the moat",
            "3-min recorded demo as fallback, local-first demo path (no live API dependency), Eva produces backup video",
          ],
        ]}
      />

      <H2 id="roadmap">2. Roadmap (post-hackathon)</H2>
      <P>
        Submission is not the end - it's a mainnet-ready beachhead. The roadmap below assumes we
        secure at least one DAO pilot in Q3 2026.
      </P>
      <CompareTable
        headers={["Phase", "Timeline", "Deliverables"]}
        rows={[
          [
            <strong key="1">Phase 1 - Mainnet</strong>,
            "Q3 2026",
            "Mainnet deploy on Base + Optimism, professional audit, ENS .eth migration off Sepolia, real iNFT (ERC-7857) for agent identity",
          ],
          [
            <strong key="2">Phase 2 - DAO partnerships</strong>,
            "Q4 2026",
            "3+ pilot DAOs (target: 1 mid-cap DeFi DAO + 2 community DAOs), case study publication, governance template library",
          ],
          [
            <strong key="3">Phase 3 - Agent marketplace</strong>,
            "Q1 2027",
            "Custom agent marketplace (npm-style for AI personas), agent SDK, revenue share model for persona authors, TEE (Trusted Execution Environment) for sensitive personas",
          ],
          [
            <strong key="4">Phase 4 - Governance v2</strong>,
            "Q2 2027",
            "Cross-chain treasury (LayerZero / CCIP), ZK proofs for private debates, agent-to-agent negotiation protocol (ERC-8004 full integration)",
          ],
        ]}
      />

      <H2 id="tech-debt">3. Tech debt (transparency)</H2>
      <P>
        Source: <Code>dev-team/tech-debt.md</Code>. Status legend:{" "}
        <strong>RESOLVED</strong> = fixed and verified, <strong>POST-HACKATHON</strong> = acceptable
        for submission and has a fix path, <strong>DEFERRED</strong> = decision documented with
        trigger condition.
      </P>
      <CompareTable
        headers={["ID", "Issue", "Status", "Fix path"]}
        rows={[
          [<Code key="td3">TD-003</Code>, "WebSocket rate limit uses MemoryStorage (single-process)", "POST-HACKATHON", "Swap to RedisStorage when multi-replica deploy needed"],
          [<Code key="td9">TD-009</Code>, "mypy unused module overrides for sentry_sdk + uvicorn", "DEFERRED", "Re-evaluate after observability stack final (Phase 1)"],
          [<Code key="ph2">PHASE2-ENS</Code>, "ENS subnames on Sepolia (test domain)", "POST-HACKATHON", "Migrate to mainnet .eth in Phase 1"],
          [<Code key="rep">AgentReputation oracle</Code>, "Backend wallet is single point of trust for reputation writes", "POST-HACKATHON", "Move to multisig writer or zk-attested updates in Phase 4"],
          [<Code key="m1">Mock USDC</Code>, "Treasury asset is mock token (1M mUSDC)", "POST-HACKATHON", "Real USDC on mainnet deploy"],
          [<Code key="cid">0G CID indexing</Code>, "No reverse-index from proposal ID to 0G CID (linear scan)", "POST-HACKATHON", "Postgres index table, Phase 1"],
          [<Code key="adv">Adversarial agent</Code>, "Opt-in only, not enabled by default", "POST-HACKATHON", "Make default + add bypass UX for fast-path proposals"],
          [<Code key="rate">Rate limit telemetry</Code>, "No dashboard for budget tracker, banner only", "POST-HACKATHON", "Grafana dashboard + Slack alert at 80%"],
          [<Code key="i18n">i18n coverage</Code>, "EN + PL only, custom provider (no next-intl)", "POST-HACKATHON", "Add languages on demand, ADR-002 documents the trade-off"],
          [<Code key="mob">Mobile audit</Code>, "Basic responsive only, no touch optimization", "POST-HACKATHON", "Full mobile QA pass (Sesja 48b scope)"],
        ]}
      />

      <Callout variant="success" title="Why we publish this">
        Every project has tech debt. Most hide it. We publish ours because: (a) judges deserve to
        evaluate honest engineering, (b) DAOs adopting CONCLAVE can plan their integration
        knowing the limits, (c) it forces us to keep the list short and actionable.
      </Callout>
    </DocsShell>
  );
}
