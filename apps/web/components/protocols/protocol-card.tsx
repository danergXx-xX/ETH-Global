"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskFlags } from "./risk-flags";
import type { Protocol, ProtocolStatus } from "@/lib/hooks/useProtocols";

interface ProtocolCardProps {
  protocol: Protocol;
  onOpen: (protocol: Protocol) => void;
}

const STATUS_TONE: Record<ProtocolStatus, string> = {
  approved: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  under_review: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  banned: "border-rose-500/40 bg-rose-500/15 text-rose-300",
  light: "border-border bg-secondary/40 text-muted-foreground",
};

const STATUS_LABEL: Record<ProtocolStatus, string> = {
  approved: "WHITELISTED",
  under_review: "UNDER REVIEW",
  banned: "BANNED",
  light: "LIGHT",
};

function formatTvl(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function logoChar(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function ProtocolCard({ protocol, onOpen }: ProtocolCardProps) {
  const auditCount = protocol.audit_history.length;
  return (
    <button
      type="button"
      onClick={() => onOpen(protocol)}
      className="text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
      aria-label={`Open details for ${protocol.name}`}
    >
      <Card className="hover:border-amber-500/50 transition-colors h-full">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                aria-hidden
                className="h-9 w-9 shrink-0 rounded-md bg-secondary flex items-center justify-center font-mono font-semibold text-amber-400"
              >
                {logoChar(protocol.name)}
              </div>
              <div className="min-w-0">
                <h3 className="font-mono font-semibold text-sm truncate">
                  {protocol.name}
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  {protocol.category} - {protocol.chain}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] font-mono shrink-0 ${STATUS_TONE[protocol.status]}`}
            >
              {STATUS_LABEL[protocol.status]}
            </Badge>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
            <div>
              <dt className="text-[9px] uppercase text-muted-foreground">TVL</dt>
              <dd className="font-semibold">{formatTvl(protocol.tvl_usd)}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase text-muted-foreground">Audits</dt>
              <dd
                className={
                  auditCount === 0 ? "text-rose-400" : "font-semibold"
                }
              >
                {auditCount === 0 ? "none" : `${auditCount}x`}
              </dd>
            </div>
          </dl>

          <RiskFlags flags={protocol.risk_flags} max={3} />
        </CardContent>
      </Card>
    </button>
  );
}
