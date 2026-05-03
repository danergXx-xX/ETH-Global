"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentDecision } from "@/lib/hooks/useTreasuryPortfolio";

interface RecentDecisionsImpactProps {
  decisions: RecentDecision[];
  isLoading?: boolean;
}

function formatUsdSigned(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h < 1) return "<1h ago";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const VERDICT_TONE: Record<RecentDecision["verdict"], string> = {
  FOR: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  AGAINST: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  ABSTAIN: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  SPLIT: "bg-sky-500/15 text-sky-300 border-sky-500/40",
};

export function RecentDecisionsImpact({
  decisions,
  isLoading,
}: RecentDecisionsImpactProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
          Recent decisions impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="space-y-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <li
                key={`sk-${i}`}
                className="h-10 w-full animate-pulse rounded-md bg-secondary/40"
              />
            ))}
          </ul>
        ) : decisions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent decisions.</p>
        ) : (
          <ul className="space-y-1.5">
            {decisions.slice(0, 5).map((d) => {
              const isPositive = d.impact_usd > 0;
              const isNegative = d.impact_usd < 0;
              return (
                <li
                  key={d.proposal_id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-secondary/20 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      #{d.proposal_id}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${VERDICT_TONE[d.verdict]}`}
                    >
                      {d.verdict}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {timeAgo(d.executed_at)}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs shrink-0 ${
                      isPositive
                        ? "text-emerald-400"
                        : isNegative
                          ? "text-rose-400"
                          : "text-muted-foreground"
                    }`}
                    aria-label={`Estimated impact ${formatUsdSigned(d.impact_usd)}`}
                  >
                    {formatUsdSigned(d.impact_usd)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
