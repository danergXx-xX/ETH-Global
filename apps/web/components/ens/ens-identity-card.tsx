"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentPortrait } from "@/components/shared/agent-portrait";
import { useTranslations } from "@/lib/i18n";
import { useAgentENS } from "@/lib/hooks";
import { AGENTS, type AgentPersona } from "@/lib/types";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function ResolutionBadge({ resolved, latencyMs }: { resolved: boolean; latencyMs: number }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${
        resolved
          ? "text-vote-for border-vote-for/30"
          : "text-amber border-amber/30 animate-pulse-slow"
      }`}
    >
      {resolved ? `Resolved - ${latencyMs}ms` : "Resolving..."}
    </Badge>
  );
}

function AgentENSCard({ persona }: { persona: AgentPersona }) {
  const ens = useAgentENS(persona);
  const agent = AGENTS.find((a) => a.persona === persona);
  if (!agent) return null;

  return (
    <Card className="border-border">
      <CardContent className="py-3 px-4 space-y-2">
        <div className="flex items-center gap-3">
          <AgentPortrait persona={persona} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
                {ens.name}
              </span>
              <ResolutionBadge resolved={ens.resolved} latencyMs={ens.latencyMs} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {truncateAddress(ens.address)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          {Object.entries(ens.records).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground font-mono truncate ml-2">{val}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TreasuryENSCard() {
  const t = useTranslations("ens.treasury");
  const ens = useAgentENS("treasury");

  return (
    <Card className="border-vote-for/20">
      <CardContent className="py-4 px-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="h-[52px] w-[52px] rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: "oklch(0.30 0.08 152)", color: "oklch(0.90 0.08 152)" }}
          >
            T
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{ens.name}</span>
              <ResolutionBadge resolved={ens.resolved} latencyMs={ens.latencyMs} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">
              {truncateAddress(ens.address)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">{t("records")}</p>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">description</span>
                <span className="text-foreground">DAO treasury wallet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">url</span>
                <span className="text-amber">aicouncil.eth.limo</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">{t("balance")}</p>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USDC</span>
                <span className="text-foreground font-mono">1,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ETH</span>
                <span className="text-foreground font-mono">2.4</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ENSIdentityCard() {
  const tRoot = useTranslations("ens");
  const parentENS = useAgentENS("parent");
  const agents: AgentPersona[] = ["bull", "bear", "risk", "tech", "sentiment"];

  const avgLatency = Math.round(
    agents.reduce((sum, a) => {
      const ens = AGENTS.find((ag) => ag.persona === a);
      return sum + (ens ? 80 : 0);
    }, 0) / agents.length
  );

  return (
    <div className="space-y-4">
      {/* Parent banner */}
      <Card className="border-amber/20">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{parentENS.name}</span>
              <span className="ml-2 text-[10px] font-mono text-muted-foreground">
                {truncateAddress(parentENS.address)}
              </span>
            </div>
            <ResolutionBadge resolved={parentENS.resolved} latencyMs={parentENS.latencyMs} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            NameStone registrar - {agents.length + 1} subnames registered
          </p>
        </CardContent>
      </Card>

      {/* Treasury card */}
      <TreasuryENSCard />

      {/* Agents grid */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {tRoot("agents.label", { count: String(agents.length) })}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {tRoot("agents.avgLatency", { ms: String(avgLatency) })}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((persona) => (
          <AgentENSCard key={persona} persona={persona} />
        ))}
      </div>
    </div>
  );
}
