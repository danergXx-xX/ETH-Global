"use client";

import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, ShieldCheckIcon, AlertTriangleIcon } from "lucide-react";
import { RiskFlags } from "./risk-flags";
import type { Protocol, ProtocolStatus } from "@/lib/hooks/useProtocols";

interface ProtocolDetailModalProps {
  protocol: Protocol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function ProtocolDetailModal({
  protocol,
  open,
  onOpenChange,
}: ProtocolDetailModalProps) {
  const { address, isConnected } = useAccount();
  const isDemoMode = !isConnected || !address;

  if (!protocol) return null;

  const showWhitelist = protocol.status !== "approved";
  const showBan = protocol.status !== "banned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2 pr-6">
            <DialogTitle className="font-mono">{protocol.name}</DialogTitle>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono ${STATUS_TONE[protocol.status]}`}
            >
              {STATUS_LABEL[protocol.status]}
            </Badge>
          </div>
          <DialogDescription className="font-mono text-xs">
            {protocol.category} on {protocol.chain} - TVL {formatTvl(protocol.tvl_usd)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              Risk flags
            </h4>
            <RiskFlags flags={protocol.risk_flags} max={20} />
          </section>

          <section>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="h-3 w-3" />
              Audit history
            </h4>
            {protocol.audit_history.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-mono">
                <AlertTriangleIcon className="h-3 w-3" />
                No public audits on file.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {protocol.audit_history.map((audit, i) => (
                  <li
                    key={`${audit.firm}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-secondary/20 px-3 py-2 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold truncate">{audit.firm}</span>
                      <span className="text-muted-foreground shrink-0">
                        {audit.date}
                      </span>
                    </div>
                    <a
                      href={audit.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 shrink-0"
                      aria-label={`Open ${audit.firm} report`}
                    >
                      report
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
              DAO governance actions
            </h4>
            {isDemoMode ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200 font-mono">
                Connect wallet to vote on protocol whitelist or ban.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {showWhitelist && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled
                      title="Available in v0.2 - Governor proposal flow"
                      className="text-xs font-mono border-emerald-500/40 text-emerald-300/70 hover:bg-emerald-500/10"
                    >
                      Vote to whitelist
                    </Button>
                  )}
                  {showBan && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled
                      title="Available in v0.2 - Governor proposal flow"
                      className="text-xs font-mono border-rose-500/40 text-rose-300/70 hover:bg-rose-500/10"
                    >
                      Vote to ban
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Whitelist proposals route through Governor in v0.2.
                </p>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
