"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import type { CustomAgent, TestArenaResult } from "@/lib/hooks/useCustomAgent";

const STANDARD_PERSONAS = [
  { id: "bull", name: "Bull", color: "text-vote-for", decision: "FOR" as const },
  { id: "bear", name: "Bear", color: "text-vote-against", decision: "AGAINST" as const },
  { id: "risk", name: "Risk", color: "text-amber", decision: "ABSTAIN" as const },
  { id: "tech", name: "Tech", color: "text-tech", decision: "FOR" as const },
  { id: "sentiment", name: "Sentiment", color: "text-sentiment", decision: "FOR" as const },
] as const;

const DECISION_LABEL: Record<string, string> = {
  FOR: "FOR",
  AGAINST: "AGAINST",
  ABSTAIN: "ABSTAIN",
  SPLIT: "SPLIT",
};

const DECISION_TONE: Record<string, string> = {
  FOR: "text-vote-for bg-vote-for/10 border-vote-for/20",
  AGAINST: "text-vote-against bg-vote-against/10 border-vote-against/20",
  ABSTAIN: "text-amber bg-amber/10 border-amber/20",
  SPLIT: "text-muted-foreground bg-secondary border-border",
};

interface TestArenaProps {
  /** Display name of the custom agent under test (rendered in 6th seat). */
  customAgentName: string;
  /** Whether a test run is currently in flight. */
  isRunning: boolean;
  /** Test Arena result returned from POST /api/agents/custom. */
  result: TestArenaResult | null;
  /** Sandbox proposal currently being evaluated. */
  proposal: string;
  /** Callback when user clicks "Submit for multisig" after a successful test. */
  onSubmitForMultisig: () => void;
  /** Callback when user wants to discard the result and edit the prompt again. */
  onTryDifferentPrompt: () => void;
  /** Whether the parent is currently submitting the agent for multisig. */
  isSubmitting?: boolean;
  /** The created CustomAgent (after multisig submit) - shows multisig progress. */
  submittedAgent?: CustomAgent | null;
}

export function TestArena({
  customAgentName,
  isRunning,
  result,
  proposal,
  onSubmitForMultisig,
  onTryDifferentPrompt,
  isSubmitting = false,
  submittedAgent = null,
}: TestArenaProps) {
  // Mock 5-of-7 multisig: 4 mock signers auto-sign over ~1s after submit
  // (demo pacing - real production multisig requires real signatures from
  // 5-of-7 elected DAO custodians, see footer note in this card).
  const [signatures, setSignatures] = useState(0);
  useEffect(() => {
    if (!submittedAgent) {
      setSignatures(0);
      return;
    }
    if (submittedAgent.status === "approved") {
      setSignatures(5);
      return;
    }
    setSignatures(1);
    const intervals = [200, 400, 600, 900];
    const timeouts = intervals.map((ms, idx) =>
      window.setTimeout(() => setSignatures(2 + idx), ms)
    );
    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [submittedAgent]);

  const consensusTone = result
    ? DECISION_TONE[result.standard_consensus] ?? DECISION_TONE.SPLIT
    : DECISION_TONE.SPLIT;

  const customTone = result
    ? DECISION_TONE[result.custom_decision] ?? DECISION_TONE.SPLIT
    : DECISION_TONE.SPLIT;

  const headerLabel = useMemo(() => {
    if (isRunning) return "Running sandbox debate";
    if (!result) return "Awaiting test run";
    return result.aligned_with_consensus
      ? "Aligned with standard consensus"
      : "Diverges from standard consensus";
  }, [isRunning, result]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Test Arena (sandbox)
              </p>
              <p className="text-sm font-medium text-foreground">{headerLabel}</p>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              Sandbox
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-wider">Proposal: </span>
            {proposal}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STANDARD_PERSONAS.map((persona) => (
          <Card key={persona.id}>
            <CardContent className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${persona.color}`}>{persona.name}</p>
                {isRunning && !result ? (
                  <Loader2Icon className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${DECISION_TONE[persona.decision]}`}
                  >
                    {DECISION_LABEL[persona.decision]}
                  </Badge>
                )}
              </div>
              {isRunning && !result ? (
                <Skeleton className="h-3 w-4/5" />
              ) : (
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  {persona.id === "bull" &&
                    "ETH at this level offers asymmetric upside vs stables, given supply unlocks."}
                  {persona.id === "bear" &&
                    "100 ETH concentration adds drawdown risk; macro sentiment soft."}
                  {persona.id === "risk" &&
                    "Position size within caps but exceeds single-day variance budget."}
                  {persona.id === "tech" &&
                    "On-chain flows neutral; CEX outflows suggest accumulation phase."}
                  {persona.id === "sentiment" &&
                    "Crypto Twitter sentiment mildly positive (+0.18 weighted)."}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        <Card className="border-amber/40">
          <CardContent className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-amber">{customAgentName} (you)</p>
              {isRunning && !result ? (
                <Loader2Icon className="h-3 w-3 animate-spin text-amber" />
              ) : result ? (
                <Badge variant="outline" className={`text-[10px] ${customTone}`}>
                  {DECISION_LABEL[result.custom_decision]}
                  {" - "}
                  {(result.custom_confidence * 100).toFixed(0)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Pending
                </Badge>
              )}
            </div>
            {result ? (
              <p className="text-[11px] text-foreground line-clamp-3">{result.custom_reasoning}</p>
            ) : (
              <Skeleton className="h-3 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Consensus
              </p>
              <Badge variant="outline" className={`text-[10px] ${consensusTone}`}>
                Standard: {DECISION_LABEL[result.standard_consensus]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sandbox results are not persisted to council history. Submitting for multisig will
              register the agent on-chain after 5-of-7 signatures.
            </p>

            {!submittedAgent ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onSubmitForMultisig}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for multisig"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onTryDifferentPrompt}
                  disabled={isSubmitting}
                >
                  Try a different prompt
                </Button>
                <span className="self-center text-[11px] text-muted-foreground">
                  {result.aligned_with_consensus
                    ? "Looks good - aligned with the standard council."
                    : "Divergence is fine - DAOs often value contrarian voices."}
                </span>
              </div>
            ) : (
              <div className="space-y-2 rounded-md border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  {signatures >= 5 ? (
                    <ShieldCheckIcon className="h-4 w-4 text-vote-for" />
                  ) : (
                    <Loader2Icon className="h-4 w-4 animate-spin text-amber" />
                  )}
                  <p className="text-xs font-medium text-foreground">
                    {signatures >= 5
                      ? `Approved - agent ${submittedAgent.display_name} is live`
                      : `Pending multisig (${signatures}/5 signatures)`}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Demo: 4 mock signatures + your wallet. Production multisig requires real
                  signatures from 5-of-7 elected DAO custodians.
                </p>
                {!signatures || signatures < 5 ? (
                  <div className="flex items-center gap-2 text-[10px] text-amber">
                    <AlertTriangleIcon className="h-3 w-3" />
                    <span>Sandbox demo - on-chain registration is mocked.</span>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
