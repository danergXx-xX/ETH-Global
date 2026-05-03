"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AGENTS } from "@/lib/types";

interface DebateHistoryEntry {
  debate_id: string;
  proposal?: { title?: string; description?: string; amount_usd?: number };
  consensus?: { decision?: string };
  agent_statements?: Array<{
    agent: string;
    decision: string;
    text?: string;
  }>;
  created_at?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Read-only preview - REST not WS to avoid Ada constraint:
 * "WS rate limit per IP, anti-OOM przy 20 sedziach landing".
 * Anonymous visitors see most recent debate from /api/debates/history.
 * Full live WS only after wallet connect in /app.
 */
async function fetchMostRecent(): Promise<DebateHistoryEntry | null> {
  const res = await fetch(`${API_URL}/api/debates/history`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`recent fetch ${res.status}`);
  const json = (await res.json()) as { debates?: DebateHistoryEntry[] };
  const debates = json.debates ?? [];
  return debates[0] ?? null;
}

function VerdictBadge({ decision }: { decision?: string }) {
  if (!decision) return null;
  const map: Record<string, { label: string; cls: string }> = {
    FOR: { label: "Approved", cls: "text-vote-for border-vote-for/40" },
    AGAINST: { label: "Rejected", cls: "text-vote-against border-vote-against/40" },
    ABSTAIN: { label: "No consensus", cls: "text-amber border-amber/40" },
    SPLIT: { label: "Split", cls: "text-amber border-amber/40" },
  };
  const v = map[decision] ?? map.ABSTAIN;
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

export function LiveDebateWidget() {
  const { data, isLoading, isError } = useQuery<DebateHistoryEntry | null>({
    queryKey: ["landing-recent-debate"],
    queryFn: fetchMostRecent,
    refetchInterval: 60_000,
    staleTime: 50_000,
    retry: 1,
  });

  return (
    <section
      aria-labelledby="recent-debate-heading"
      className="mx-auto max-w-5xl px-4 py-10"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2
          id="recent-debate-heading"
          className="text-xl sm:text-2xl font-display font-semibold"
        >
          Most recent debate
        </h2>
        <Link
          href="/app"
          className="text-xs text-primary hover:underline"
        >
          {"View full debate viewer ->"}
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card/50 p-5">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-2/3 bg-secondary/50 rounded animate-pulse-slow" />
            <div className="h-3 w-full bg-secondary/30 rounded animate-pulse-slow" />
            <div className="grid grid-cols-5 gap-2 mt-4">
              {AGENTS.slice(0, 5).map((a) => (
                <div
                  key={a.persona}
                  className="h-12 bg-secondary/30 rounded animate-pulse-slow"
                />
              ))}
            </div>
          </div>
        ) : isError || !data ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-2">
              No debate history available yet.
            </p>
            <Link
              href="/app"
              className="text-xs text-primary hover:underline"
            >
              Submit the first proposal in /app
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-mono mb-1">
                  {data.debate_id}
                </p>
                <h3 className="text-sm font-semibold truncate">
                  {data.proposal?.title ?? "Treasury proposal"}
                </h3>
                {data.proposal?.description ? (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {data.proposal.description}
                  </p>
                ) : null}
              </div>
              <VerdictBadge decision={data.consensus?.decision} />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {AGENTS.slice(0, 5).map((agent) => {
                const stmt = data.agent_statements?.find(
                  (s) => s.agent === agent.persona,
                );
                const decisionMap: Record<string, string> = {
                  FOR: "text-vote-for",
                  AGAINST: "text-vote-against",
                  ABSTAIN: "text-amber",
                };
                const cls = stmt
                  ? decisionMap[stmt.decision] ?? "text-muted-foreground"
                  : "text-muted-foreground";
                return (
                  <div
                    key={agent.persona}
                    className="rounded border border-border/50 bg-background/30 p-2 text-center"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {agent.persona}
                    </div>
                    <div className={`text-xs font-mono mt-1 ${cls}`}>
                      {stmt?.decision ?? "-"}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground/70 text-center">
              Read-only preview. Connect wallet in /app to interact.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
