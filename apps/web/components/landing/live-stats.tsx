"use client";

import { useQuery } from "@tanstack/react-query";

interface DebateHistoryEntry {
  debate_id: string;
  consensus?: { decision?: string };
  proposal?: { amount_usd?: number };
}

interface StatsPayload {
  trackedUsd: number;
  proposalsRejected: number;
  debatesResolved: number;
  source: "live" | "fallback";
}

const FALLBACK_STATS: StatsPayload = {
  trackedUsd: 0,
  proposalsRejected: 0,
  debatesResolved: 0,
  source: "fallback",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Fetch real numbers from /api/debates/history (Hugo Sesja 44).
 * Per Szymon constraint: tracked spend, NIE "saved hypothetically".
 * Per Ada constraint: no marketing fiction - if backend offline -> show zeros + "Backend offline" badge.
 */
async function fetchStats(): Promise<StatsPayload> {
  const res = await fetch(`${API_URL}/api/debates/history`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`stats fetch ${res.status}`);
  const json = (await res.json()) as { debates?: DebateHistoryEntry[] };
  const debates = json.debates ?? [];

  let trackedUsd = 0;
  let proposalsRejected = 0;

  for (const d of debates) {
    const amount = d.proposal?.amount_usd ?? 0;
    if (typeof amount === "number" && Number.isFinite(amount)) {
      trackedUsd += amount;
    }
    const verdict = d.consensus?.decision;
    if (verdict === "AGAINST" || verdict === "ABSTAIN") {
      proposalsRejected += 1;
    }
  }

  return {
    trackedUsd: Math.round(trackedUsd),
    proposalsRejected,
    debatesResolved: debates.length,
    source: "live",
  };
}

function formatUsd(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function StatTile({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 px-5 py-4">
      <div
        className="text-2xl sm:text-3xl font-display font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
      {hint ? (
        <div className="text-[10px] text-muted-foreground/70 mt-0.5">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function LiveStats() {
  const { data, isError, isLoading } = useQuery<StatsPayload>({
    queryKey: ["landing-stats"],
    queryFn: fetchStats,
    refetchInterval: 30_000,
    staleTime: 25_000,
    retry: 1,
  });

  const stats = data ?? FALLBACK_STATS;
  const offline = isError || (!isLoading && stats.source === "fallback");

  return (
    <section
      aria-labelledby="live-stats-heading"
      className="mx-auto max-w-5xl px-4 py-10"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id="live-stats-heading"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Live council activity
        </h2>
        <span
          className={`text-[10px] font-mono ${
            offline ? "text-amber" : "text-vote-for"
          }`}
          aria-live="polite"
        >
          {offline ? "Backend offline" : "Live - 30s refresh"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile
          value={formatUsd(stats.trackedUsd)}
          label="Tracked spend across debates"
          hint="Sum of proposal amounts evaluated"
        />
        <StatTile
          value={`${stats.proposalsRejected}`}
          label="Proposals rejected"
          hint="Council voted AGAINST or no consensus"
        />
        <StatTile
          value={`${stats.debatesResolved}`}
          label="Debates resolved"
          hint="Total council sessions completed"
        />
      </div>
    </section>
  );
}
