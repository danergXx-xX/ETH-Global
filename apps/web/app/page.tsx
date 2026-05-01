"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { AGENTS, type AgentDecision, type Consensus } from "@/lib/types";

export default function Home() {
  const t = useTranslations();
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
      const label = t(`agents.${agent.persona}.label`);
      return {
        persona: agent.persona,
        decision,
        confidence: Math.round((0.5 + Math.random() * 0.5) * 100) / 100,
        reasoning: t("agentCard.mockReasoning", { label }),
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
            {t("header.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("header.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button variant="outline" disabled>
            {t("header.connectWallet")}
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {t("proposal.cardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={t("proposal.placeholder")}
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
            {isDebating ? t("proposal.debating") : t("proposal.submit")}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6 space-y-3">
        {AGENTS.map((agent) => {
          const decision = decisions.find((d) => d.persona === agent.persona);
          const label = t(`agents.${agent.persona}.label`);
          return (
            <AgentCard
              key={agent.persona}
              label={label}
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
          <CardTitle className="text-base">{t("tally.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 text-sm">
            <span className="text-green-400">
              {t("tally.for")}: {tally.for}
            </span>
            <span className="text-red-400">
              {t("tally.against")}: {tally.against}
            </span>
            <span className="text-muted-foreground">
              {t("tally.abstain")}: {tally.abstain}
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
  const t = useTranslations("agentCard");

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
              ? t("analyzing")
              : decision
                ? decision.reasoning
                : t("awaiting")}
          </p>
        </div>
        {decision && <DecisionBadge decision={decision.decision} />}
      </CardContent>
    </Card>
  );
}

function DecisionBadge({ decision }: { decision: AgentDecision["decision"] }) {
  const t = useTranslations("decision");

  const config = {
    FOR: {
      className: "bg-green-900/50 text-green-400 border-green-800",
    },
    AGAINST: {
      className: "bg-red-900/50 text-red-400 border-red-800",
    },
    ABSTAIN: {
      className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    },
  };
  const c = config[decision];
  return <Badge className={c.className}>{t(decision)}</Badge>;
}

function VerdictBanner({ consensus }: { consensus: Consensus | null }) {
  const t = useTranslations("verdict");

  if (!consensus) {
    return (
      <p className="text-center text-sm text-muted-foreground">{t("empty")}</p>
    );
  }

  const colorMap = {
    FOR: "text-green-400",
    AGAINST: "text-red-400",
    ABSTAIN: "text-amber-400",
    SPLIT: "text-amber-400",
  };

  return (
    <p className={`text-center text-lg font-semibold ${colorMap[consensus]}`}>
      {t(consensus)}
    </p>
  );
}
