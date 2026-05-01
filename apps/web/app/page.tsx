"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AGENTS, type AgentDecision, type Consensus } from "@/lib/types";

export default function Home() {
  const [proposal, setProposal] = useState("");
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [consensus, setConsensus] = useState<Consensus | null>(null);

  const tally = {
    for: decisions.filter((d) => d.decision === "FOR").length,
    against: decisions.filter((d) => d.decision === "AGAINST").length,
    abstain: decisions.filter((d) => d.decision === "ABSTAIN").length,
  };

  function handleConvene() {
    if (!proposal.trim() || isDebating) return;

    setIsDebating(true);
    setDecisions([]);
    setConsensus(null);

    const mockDecisions: AgentDecision[] = AGENTS.map((agent) => {
      const options = ["FOR", "AGAINST", "ABSTAIN"] as const;
      const decision = options[Math.floor(Math.random() * 3)];
      return {
        persona: agent.persona,
        decision,
        confidence: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
        reasoning: `Analiza propozycji z perspektywy ${agent.label.toLowerCase()}. To jest placeholder - w Phase 1 zostanie zastąpiony prawdziwą odpowiedzią agenta AI.`,
        timestamp: new Date().toISOString(),
      };
    });

    setTimeout(() => {
      setDecisions(mockDecisions);
      const forCount = mockDecisions.filter((d) => d.decision === "FOR").length;
      const againstCount = mockDecisions.filter(
        (d) => d.decision === "AGAINST"
      ).length;

      if (forCount > againstCount) setConsensus("FOR");
      else if (againstCount > forCount) setConsensus("AGAINST");
      else setConsensus("SPLIT");

      setIsDebating(false);
    }, 1500);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI Treasury Council
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wieloagentowa rada zarządzająca skarbcem DAO
          </p>
        </div>
        <Button variant="outline" disabled>
          Połącz portfel
        </Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Nowa propozycja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Opisz propozycję treasury..."
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            rows={4}
            disabled={isDebating}
          />
          <Button
            onClick={handleConvene}
            disabled={!proposal.trim() || isDebating}
            className="w-full"
          >
            {isDebating ? "Debata w toku..." : "Zwołaj Radę"}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6 space-y-3">
        {AGENTS.map((agent) => {
          const decision = decisions.find((d) => d.persona === agent.persona);
          return (
            <AgentCard
              key={agent.persona}
              label={agent.label}
              bias={agent.bias}
              color={agent.color}
              decision={decision}
              isDebating={isDebating}
            />
          );
        })}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Wyniki głosowania</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <span className="text-green-400">Za: {tally.for}</span>
            <span className="text-red-400">Przeciw: {tally.against}</span>
            <span className="text-muted-foreground">
              Wstrzymani: {tally.abstain}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <VerdictBanner consensus={consensus} />
        </CardContent>
      </Card>
    </main>
  );
}

function AgentCard({
  label,
  bias,
  color,
  decision,
  isDebating,
}: {
  label: string;
  bias: string;
  color: string;
  decision?: AgentDecision;
  isDebating: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${color}`}>{label}</span>
            <Badge variant="outline" className="text-xs">
              {bias}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDebating
              ? "Analizuję propozycję..."
              : decision
                ? decision.reasoning
                : "Oczekuje na propozycję"}
          </p>
        </div>
        {decision && <DecisionBadge decision={decision.decision} />}
      </CardContent>
    </Card>
  );
}

function DecisionBadge({ decision }: { decision: AgentDecision["decision"] }) {
  const config = {
    FOR: { label: "Za", className: "bg-green-900/50 text-green-400 border-green-800" },
    AGAINST: { label: "Przeciw", className: "bg-red-900/50 text-red-400 border-red-800" },
    ABSTAIN: { label: "Wstrzymany", className: "bg-zinc-800 text-zinc-400 border-zinc-700" },
  };
  const c = config[decision];
  return <Badge className={c.className}>{c.label}</Badge>;
}

function VerdictBanner({ consensus }: { consensus: Consensus | null }) {
  if (!consensus) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Złóż propozycję, aby rozpocząć debatę
      </p>
    );
  }

  const config = {
    FOR: { label: "Rada rekomenduje: PRZYJĄĆ", className: "text-green-400" },
    AGAINST: { label: "Rada rekomenduje: ODRZUCIĆ", className: "text-red-400" },
    ABSTAIN: { label: "Rada nie osiągnęła konsensusu", className: "text-amber-400" },
    SPLIT: { label: "Rada podzielona - brak konsensusu", className: "text-amber-400" },
  };
  const c = config[consensus];

  return (
    <p className={`text-center text-lg font-semibold ${c.className}`}>
      {c.label}
    </p>
  );
}
