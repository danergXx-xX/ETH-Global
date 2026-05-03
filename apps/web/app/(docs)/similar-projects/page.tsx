import type { Metadata } from "next";
import { DocsShell, H2, H3, P, UL, Code, Callout } from "@/components/docs/docs-shell";
import { CompareTable } from "@/components/docs/diagram";

export const metadata: Metadata = {
  title: "Similar Projects - AI Treasury Council",
  description: "Honest comparison with other ETHGlobal AI agent projects.",
};

const TOC = [
  { id: "tldr", label: "1. Why we are different (TL;DR)" },
  { id: "competitors", label: "2. Direct competitors" },
  { id: "wins", label: "3. Where we win" },
  { id: "losses", label: "4. Where they win" },
  { id: "positioning", label: "5. Our positioning" },
];

export default function SimilarProjectsPage() {
  return (
    <DocsShell
      title="Similar Projects"
      subtitle="Honest competitive analysis - what others built and where we differ."
      toc={TOC}
      pagePath="apps/web/app/(docs)/similar-projects/page.tsx"
      currentHref="/similar-projects"
    >
      <P>
        We searched ETHGlobal showcases for projects in the AI-agent + governance space. Four
        direct competitors emerged. This page is honest about what they built well and where
        AI Treasury Council goes further. Source: internal competitive analysis (Sesja 34) plus public
        ETHGlobal showcase data.
      </P>

      <H2 id="tldr">1. Why we are different (TL;DR)</H2>
      <P>Three differentiators that no direct competitor matches:</P>
      <UL>
        <li>
          <strong>Source attribution per claim.</strong> Every agent statement cites a URL,
          timestamp, and confidence score. Most competitors output prose with no citations.
        </li>
        <li>
          <strong>Five trust mechanisms wired in the demo.</strong> Source attribution + 48h
          timelock + 0G audit + ENS reputation + HITL Council Rules. Competitors typically wire
          one or two.
        </li>
        <li>
          <strong>Native DAO governance integration.</strong> OpenZeppelin Governor + Timelock,
          5 contracts deployed and verified on Base Sepolia. Competitors mostly mock this layer.
        </li>
      </UL>

      <H2 id="competitors">2. Direct competitors</H2>
      <P>
        These are the four projects most adjacent to AI Treasury Council. We evaluated them on what they
        built, what they did well, and where our approach differs.
      </P>

      <H3 id="goldman-stacked">Goldman Stacked</H3>
      <CompareTable
        headers={["Aspect", "Detail"]}
        rows={[
          ["What they built", "AI-driven trading desk simulation with multiple agent personas executing trades"],
          ["What they did well", "Polished UI, clear narrative around AI-as-trader, strong visual debate panels"],
          ["What we do differently", "We target DAO governance (not retail trading), publish reasoning per claim with sources, write to on-chain audit trail (0G), enforce 48h timelock before any treasury action"],
          ["Our positioning vs them", "They optimize speed for retail; we optimize trust for treasuries. Different markets, no overlap."],
        ]}
      />

      <H3 id="agentropolis">Agentropolis</H3>
      <CompareTable
        headers={["Aspect", "Detail"]}
        rows={[
          ["What they built", "City-simulation game where AI agents act as autonomous citizens with economic agency"],
          ["What they did well", "Compelling demo of emergent agent behavior, strong storytelling, agent-to-agent interaction patterns"],
          ["What we do differently", "Real on-chain treasury actions vs simulation. Audit trail required. DAO governance integration vs game mechanics."],
          ["Our positioning vs them", "Agentropolis explores 'what if agents had economy'; we ship 'what DAOs need today'. Different time horizons."],
        ]}
      />

      <H3 id="alpha-dawg">Alpha Dawg</H3>
      <CompareTable
        headers={["Aspect", "Detail"]}
        rows={[
          ["What they built", "AI alpha-discovery agent for crypto research with sentiment + on-chain signals"],
          ["What they did well", "Strong data integration (multiple sources), good signal fusion, real iNFT (ERC-7857) for agent identity"],
          ["What we do differently", "Group debate (5+1) vs single agent. Source attribution per claim vs aggregated alpha score. Governance execution layer vs research-only output."],
          ["Our positioning vs them", "They give an alpha researcher a tool; we give a DAO a council. Complementary - their output could be a AI Treasury Council agent's input."],
        ]}
      />

      <H3 id="ghost-machine">Ghost in the Machine</H3>
      <CompareTable
        headers={["Aspect", "Detail"]}
        rows={[
          ["What they built", "Privacy-focused AI agent execution in TEE (Trusted Execution Environment) with verifiable outputs"],
          ["What they did well", "TEE integration is genuinely advanced, hardware-attested execution is rare in hackathons, strong privacy story"],
          ["What we do differently", "Public-by-default for governance transparency vs private execution. Multi-agent debate vs single agent. Live deployed on testnet vs concept-heavy."],
          ["Our positioning vs them", "Their TEE story is something we plan for Phase 4 (sensitive personas). For DAO governance, transparency beats privacy at the agent layer - the timelock provides the privacy window."],
        ]}
      />

      <H2 id="wins">3. Where we win</H2>
      <P>
        Feature-by-feature comparison. <Code>YES</Code> means shipped in the demo,{" "}
        <Code>partial</Code> means working but limited, <Code>no</Code> means not present.
      </P>
      <CompareTable
        headers={["Feature", "AI Treasury Council", "Competitors (typical)"]}
        rows={[
          ["DAO governance integration (Governor + Timelock)", <strong key="g1">YES</strong>, "no (mocked)"],
          ["0G Storage audit trail", <strong key="g2">YES</strong>, "rare"],
          ["ENS deep records (26 text records per subname)", <strong key="g3">YES</strong>, "rare / shallow"],
          ["Adversarial agent (forces dissent)", <strong key="g4">YES (opt-in)</strong>, "no"],
          ["Source attribution per claim", <strong key="g5">YES</strong>, "no"],
          ["Real on-chain demo (5 contracts deployed + verified)", <strong key="g6">YES</strong>, "mock-heavy"],
          ["48h timelock with countdown UI", <strong key="g7">YES</strong>, "rare"],
          ["Multi-agent debate (5+1 personas)", <strong key="g8">YES</strong>, "1-3 typical"],
          ["HITL Council Rules JSON Editor", <strong key="g9">YES</strong>, "no"],
          ["AgentReputation on-chain (Moat 5)", <strong key="g10">YES</strong>, "no"],
        ]}
      />

      <H2 id="losses">4. Where they win (honest)</H2>
      <P>
        Things competitors do that we explicitly don&apos;t - either because we cut scope or
        because the trade-off didn&apos;t serve our use case.
      </P>
      <UL>
        <li>
          <strong>Real iNFT (ERC-7857):</strong> Alpha Dawg ships this today. We have ENS
          subnames + on-chain reputation but not iNFT yet. Planned for Phase 1 mainnet deploy
          (Q3 2026).
        </li>
        <li>
          <strong>TEE (Trusted Execution Environment):</strong> Ghost in the Machine has hardware-attested
          execution. We run in a standard FastAPI process. TEE is on the Phase 4 roadmap for
          sensitive agent personas where privacy beats transparency.
        </li>
        <li>
          <strong>Full multi-chain:</strong> Some competitors deploy across multiple L2s. We ship
          on Base Sepolia (governance + treasury) and Sepolia (ENS only) for the hackathon. Phase 1
          adds Optimism mainnet.
        </li>
        <li>
          <strong>Polished animations / 3D UI:</strong> Goldman Stacked has more eye-candy. We
          prioritized correctness, audit verifiability, and judge-readable docs over visual polish.
          Vela &amp; Aiko have a Phase 1 design pass scheduled.
        </li>
      </UL>

      <H2 id="positioning">5. Our positioning</H2>
      <Callout variant="info" title="One-line positioning">
        AI Treasury Council is the first multi-agent AI council with five wired trust mechanisms designed
        specifically for DAO treasury governance. Others target trading, simulation, research, or
        privacy - we target the $26B sitting in DAO treasuries with broken governance.
      </Callout>
      <P>
        Alpha Dawg targets research, Goldman Stacked targets trading. Long-term, we
        compete with non-AI governance tools (Snapshot, Tally, Aragon) by giving
        DAOs a verifiable AI layer that makes their existing governance smarter without
        replacing the human vote. The 48h timelock and 5-of-7 multisig keep humans in the loop
        on every action.
      </P>
      <P>
        For judges: the differentiator that matters most is{" "}
        <strong>source attribution per claim</strong>. It&apos;s the foundation that makes the
        other four trust mechanisms credible. Without it, you have an opinion engine. With it,
        you have a council you can audit.
      </P>
    </DocsShell>
  );
}
