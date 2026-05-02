"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "@/lib/i18n";
import type { AuditEvent, AuditEventType } from "@/lib/types";
import { MOCK_AUDIT_EVENTS } from "@/lib/mocks/audit";
import { formatDistanceToNow } from "date-fns";

const FILTER_TYPES: { key: AuditEventType | "all"; label: string }[] = [
  { key: "all", label: "All events" },
  { key: "proposal", label: "Proposals" },
  { key: "vote", label: "Agent votes" },
  { key: "verdict", label: "Verdicts" },
  { key: "execution", label: "Executions" },
  { key: "rule_change", label: "Rules" },
  { key: "agent_lifecycle", label: "Agents" },
];

const TYPE_ICONS: Record<AuditEventType, string> = {
  proposal: "P",
  vote: "V",
  verdict: "J",
  execution: "E",
  rule_change: "R",
  agent_lifecycle: "A",
};

const DELTA_COLORS: Record<string, string> = {
  positive: "text-vote-for bg-vote-for/10 border-vote-for/20",
  negative: "text-vote-against bg-vote-against/10 border-vote-against/20",
  neutral: "text-amber bg-amber/10 border-amber/20",
};

function EventRow({ event }: { event: AuditEvent }) {
  const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div
        className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-mono text-muted-foreground shrink-0"
      >
        {TYPE_ICONS[event.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {event.title}
          </span>
          {event.delta && event.deltaKind && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${DELTA_COLORS[event.deltaKind]}`}
            >
              {event.delta}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {event.actor} - {event.summary}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground">
          {timeAgo}
        </span>
        {event.txHash && (
          <span className="text-[9px] text-amber font-mono">tx</span>
        )}
        {event.ogCid && (
          <span className="text-[9px] text-tech font-mono">0G</span>
        )}
      </div>
    </div>
  );
}

export function AuditLog() {
  const t = useTranslations("audit");
  const [activeFilter, setActiveFilter] = useState<AuditEventType | "all">("all");

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return MOCK_AUDIT_EVENTS;
    return MOCK_AUDIT_EVENTS.filter((e) => e.type === activeFilter);
  }, [activeFilter]);

  const stats = {
    total: MOCK_AUDIT_EVENTS.length,
    last24h: MOCK_AUDIT_EVENTS.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 86400000
    ).length,
    proposals: MOCK_AUDIT_EVENTS.filter((e) => e.type === "proposal").length,
    executions: MOCK_AUDIT_EVENTS.filter((e) => e.type === "execution").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <Badge className="bg-vote-for/15 text-vote-for border-vote-for/30 text-[10px]">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-vote-for animate-pulse-slow" />
            {t("live_badge")}
          </Badge>
        </div>
      </div>

      {/* Stats band */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: stats.total },
          { label: "Last 24h", value: stats.last24h },
          { label: "Proposals", value: stats.proposals },
          { label: "Executions", value: stats.executions },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-2 px-3 text-center">
              <span className="text-lg font-bold font-mono text-foreground">
                {s.value}
              </span>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_TYPES.map((f) => (
          <Button
            key={f.key}
            variant={activeFilter === f.key ? "default" : "outline"}
            size="sm"
            className={`text-xs h-7 ${
              activeFilter === f.key ? "bg-amber text-background" : ""
            }`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Event list */}
      <Card>
        <ScrollArea className="h-[400px]">
          <CardContent className="py-1 px-4">
            {filteredEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : (
              filteredEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
        <span>{t("footer")}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-[10px] h-6">
            {t("refresh")}
          </Button>
          <Button variant="ghost" size="sm" className="text-[10px] h-6">
            {t("export_btn")}
          </Button>
          <Button variant="ghost" size="sm" className="text-[10px] h-6">
            {t("verify")}
          </Button>
        </div>
      </div>
    </div>
  );
}
