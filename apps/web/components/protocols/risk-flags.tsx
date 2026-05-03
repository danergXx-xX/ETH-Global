"use client";

import { Badge } from "@/components/ui/badge";

interface RiskFlagsProps {
  flags: string[];
  max?: number;
  className?: string;
}

const HIGH_SEVERITY = new Set([
  "depeg_history",
  "operational_collapse",
  "active_exploit",
  "centralization_risk",
  "historical_exploit",
]);

const MED_SEVERITY = new Set([
  "validator_concentration",
  "complex_strategies",
  "dependency_risk",
  "new_protocol",
  "unaudited",
]);

function severityFor(flag: string): "high" | "med" | "low" {
  if (HIGH_SEVERITY.has(flag)) return "high";
  if (MED_SEVERITY.has(flag)) return "med";
  return "low";
}

function toneFor(sev: "high" | "med" | "low"): string {
  if (sev === "high") return "border-rose-500/40 bg-rose-500/15 text-rose-300";
  if (sev === "med") return "border-amber-500/40 bg-amber-500/15 text-amber-300";
  return "border-sky-500/40 bg-sky-500/15 text-sky-300";
}

function humanize(flag: string): string {
  return flag.replace(/_/g, " ");
}

export function RiskFlags({ flags, max = 3, className }: RiskFlagsProps) {
  if (flags.length === 0) {
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-mono border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      >
        no flags
      </Badge>
    );
  }

  const visible = flags.slice(0, max);
  const overflow = flags.length - visible.length;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className ?? ""}`}>
      {visible.map((flag) => {
        const sev = severityFor(flag);
        return (
          <Badge
            key={flag}
            variant="outline"
            className={`text-[10px] font-mono ${toneFor(sev)}`}
            title={`Severity: ${sev}`}
          >
            {humanize(flag)}
          </Badge>
        );
      })}
      {overflow > 0 && (
        <Badge
          variant="outline"
          className="text-[10px] font-mono border-border text-muted-foreground"
        >
          +{overflow}
        </Badge>
      )}
    </div>
  );
}
