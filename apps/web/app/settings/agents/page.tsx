"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCustomAgentModal } from "@/components/agent";
import {
  useMockCustomAgents,
  type CustomAgentStatus,
} from "@/lib/hooks/useCustomAgent";
import { formatDistanceToNow } from "date-fns";

const STATUS_TONE: Record<CustomAgentStatus, string> = {
  approved: "text-vote-for bg-vote-for/10 border-vote-for/30",
  awaiting_multisig: "text-amber bg-amber/10 border-amber/30",
  testing: "text-tech bg-tech/10 border-tech/30",
  rejected: "text-vote-against bg-vote-against/10 border-vote-against/30",
};

export default function CustomAgentsSettingsPage() {
  const { address } = useAccount();
  const readOnly = !address;
  const { agents, addAgent } = useMockCustomAgents();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Custom council agents</h2>
          <p className="text-xs text-muted-foreground">
            Add personas the council should consult on every proposal. Each agent is sandboxed,
            verified by the standard council, and added on-chain via 5-of-7 multisig.
          </p>
        </div>
        <AddCustomAgentModal onAgentRegistered={addAgent} readOnly={readOnly} />
      </div>

      {readOnly && (
        <Card className="border-amber/40 bg-amber/5">
          <CardContent className="p-3">
            <p className="text-xs text-amber">
              Demo mode: connect your wallet to add or remove custom agents. Existing entries are
              read-only sample data.
            </p>
          </CardContent>
        </Card>
      )}

      {agents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-xs text-muted-foreground">
            No custom agents yet. Add your first persona to expand the council.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.agent_id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{agent.display_name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {agent.ens_subname}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[agent.status]}`}>
                    {agent.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono">
                    weight {agent.vote_weight}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono">
                    trust {agent.trust_gate}
                  </span>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono">
                    {agent.llm_model}
                  </span>
                  <span className="ml-auto self-end">
                    {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true })}
                  </span>
                </div>
                {agent.test_arena_result && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    Sandbox: {agent.test_arena_result.custom_decision} (
                    {(agent.test_arena_result.custom_confidence * 100).toFixed(0)}%) -{" "}
                    {agent.test_arena_result.aligned_with_consensus ? "aligned" : "diverged"} from
                    standard consensus.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Looking for the council&apos;s standard 5+1 personas? See the{" "}
        <Link href="/architecture#ens" className="underline hover:text-foreground">
          architecture page
        </Link>
        .
      </p>
    </div>
  );
}
