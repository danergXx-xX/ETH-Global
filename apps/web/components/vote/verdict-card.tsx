"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";
import type { Consensus, Decision } from "@/lib/types";
import { getBasescanTxUrl } from "@/lib/contracts";
import { DiscoverabilityPulse } from "@/components/dashboard/discoverability-pulse";

type VerdictState = "pending" | "reveal" | "executed";

interface VoteTally {
  for: number;
  against: number;
  abstain: number;
}

interface VerdictCardProps {
  state: VerdictState;
  consensus: Consensus | null;
  tally: VoteTally;
  txHash?: string;
  onExecute?: () => void;
}

function CountUp({ target, duration = 600 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration]);

  return <>{value}</>;
}

const VERDICT_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  FOR: { color: "text-vote-for", bg: "bg-vote-for/10", border: "border-vote-for/30" },
  AGAINST: { color: "text-vote-against", bg: "bg-vote-against/10", border: "border-vote-against/30" },
  SPLIT: { color: "text-amber", bg: "bg-amber/10", border: "border-amber/30" },
  ABSTAIN: { color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
};

export function VerdictCard({
  state,
  consensus,
  tally,
  txHash,
  onExecute,
}: VerdictCardProps) {
  const t = useTranslations("verdict");
  const total = tally.for + tally.against + tally.abstain;
  const cfg = consensus ? VERDICT_CONFIG[consensus] : VERDICT_CONFIG.ABSTAIN;

  return (
    <Card className={`border-2 ${cfg.border} relative`}>
      <DiscoverabilityPulse hint="verdict-number" className="top-2 right-2" />
      <CardContent className="py-6 space-y-4">
        {/* Pending state */}
        {state === "pending" && (
          <div className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-amber/30 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-amber animate-pulse-slow" />
            </div>
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        )}

        {/* Reveal + Executed state */}
        <AnimatePresence>
          {(state === "reveal" || state === "executed") && consensus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Council verdict
              </p>
              <p className={`text-2xl font-bold ${cfg.color}`}>
                {t(consensus)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote distribution */}
        {total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-vote-for">
                For: <CountUp target={tally.for} />
              </span>
              <span className="text-vote-against">
                Against: <CountUp target={tally.against} />
              </span>
              <span className="text-muted-foreground">
                Abstain: <CountUp target={tally.abstain} />
              </span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
              {tally.for > 0 && (
                <motion.div
                  className="bg-vote-for"
                  initial={{ width: 0 }}
                  animate={{ width: `${(tally.for / total) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
              {tally.against > 0 && (
                <motion.div
                  className="bg-vote-against"
                  initial={{ width: 0 }}
                  animate={{ width: `${(tally.against / total) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              )}
              {tally.abstain > 0 && (
                <motion.div
                  className="bg-vote-abstain"
                  initial={{ width: 0 }}
                  animate={{ width: `${(tally.abstain / total) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              )}
            </div>
          </div>
        )}

        {/* Executed state extras */}
        {state === "executed" && (
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-vote-for/15 text-vote-for border-vote-for/30 text-[10px]">
              EXECUTED
            </Badge>
            {txHash && (
              <a
                href={getBasescanTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber hover:underline"
              >
                View on Basescan
              </a>
            )}
          </div>
        )}

        {/* Execute CTA */}
        {state === "reveal" && consensus === "FOR" && onExecute && (
          <div className="text-center">
            <Button onClick={onExecute} size="sm">
              Queue for execution
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
