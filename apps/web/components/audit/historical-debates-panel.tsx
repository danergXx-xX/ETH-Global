"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HISTORICAL_DEBATES,
  type HistoricalDebate,
} from "@/lib/mocks/historical_debates";

const VERDICT_COLORS: Record<HistoricalDebate["verdict"], string> = {
  APPROVED: "bg-vote-for/15 text-vote-for border-vote-for/30",
  REJECTED: "bg-vote-against/15 text-vote-against border-vote-against/30",
  ABSTAINED: "bg-amber/15 text-amber border-amber/30",
};

function shortCid(cid: string): string {
  if (cid.length <= 14) return cid;
  return `${cid.slice(0, 8)}...${cid.slice(-4)}`;
}

function shortTx(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function DebateRow({
  debate,
  onClick,
}: {
  debate: HistoricalDebate;
  onClick: () => void;
}) {
  const tally = debate.vote_tally;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-md border border-border hover:border-foreground/30 transition-colors px-3 py-2.5 space-y-1.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {debate.proposal.title.en}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono">
            {debate.proposal.id} - {debate.proposal.amount}
          </div>
        </div>
        <Badge className={`shrink-0 ${VERDICT_COLORS[debate.verdict]}`}>
          {debate.verdict} {tally.FOR}-{tally.AGAINST}
          {tally.ABSTAIN > 0 ? `-${tally.ABSTAIN}` : ""}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
        <span>conf {(debate.confidence * 100).toFixed(0)}%</span>
        <span>cid {shortCid(debate.og_storage_cid)}</span>
        {debate.tx_hash && <span>tx {shortTx(debate.tx_hash)}</span>}
        <span>{(debate.duration_seconds / 60).toFixed(1)}min</span>
      </div>
    </button>
  );
}

function DebateDetail({ debate }: { debate: HistoricalDebate }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-3">
      <div>
        <div className="text-sm font-semibold">{debate.proposal.title.en}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {debate.proposal.description.en}
        </div>
      </div>

      <div className="space-y-2">
        {debate.agent_statements.map((s) => (
          <div
            key={s.persona}
            className="rounded border border-border/50 bg-background/50 p-2 text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[11px]">{s.ens}</span>
              <Badge
                className={`text-[10px] ${
                  s.decision === "FOR"
                    ? "bg-vote-for/15 text-vote-for border-vote-for/30"
                    : s.decision === "AGAINST"
                      ? "bg-vote-against/15 text-vote-against border-vote-against/30"
                      : "bg-amber/15 text-amber border-amber/30"
                }`}
              >
                {s.decision} {(s.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-foreground/80">{s.reasoning_snippet}</p>
            <a
              href={s.primary_source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-[10px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              [{s.primary_source.type}] {s.primary_source.title} (w{" "}
              {s.primary_source.weight.toFixed(2)})
            </a>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-muted-foreground font-mono space-y-0.5 pt-2 border-t border-border/50">
        <div>0G CID: {debate.og_storage_cid}</div>
        {debate.tx_hash && <div>tx: {debate.tx_hash}</div>}
        <div>
          rep deltas:{" "}
          {Object.entries(debate.reputation_deltas)
            .map(
              ([p, d]) =>
                `${p} ${d > 0 ? "+" : ""}${d.toFixed(2)}`,
            )
            .join(", ")}
        </div>
      </div>
    </div>
  );
}

export function HistoricalDebatesPanel() {
  const [openId, setOpenId] = useState<string | null>(
    HISTORICAL_DEBATES[0]?.id ?? null,
  );
  const open = HISTORICAL_DEBATES.find((d) => d.id === openId) ?? null;

  return (
    <Card className="border-border mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Concluded debates (audit trail)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          {HISTORICAL_DEBATES.map((d) => (
            <DebateRow
              key={d.id}
              debate={d}
              onClick={() => setOpenId(openId === d.id ? null : d.id)}
            />
          ))}
        </div>
        {open && <DebateDetail debate={open} />}
      </CardContent>
    </Card>
  );
}
