"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentPortrait } from "@/components/shared/agent-portrait";
import { AgentDetailModal } from "@/components/agent/agent-detail-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {title}
        {typeof count === "number" && (
          <span className="ml-1 text-muted-foreground/60">({count})</span>
        )}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  href,
  mono = false,
  tooltip,
}: {
  label: string;
  value: string | undefined;
  href?: string;
  mono?: boolean;
  tooltip?: string;
}) {
  if (!value) return null;
  const display = value.length > 42 ? `${value.slice(0, 39)}...` : value;
  const valueCls = `${mono ? "font-mono" : ""} text-foreground truncate ml-2 max-w-[60%]`;
  return (
    <div className="flex justify-between items-baseline text-[10px]" title={tooltip}>
      <span className="text-muted-foreground shrink-0">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${valueCls} text-primary hover:underline`}
        >
          {display}
        </a>
      ) : (
        <span className={valueCls}>{display}</span>
      )}
    </div>
  );
}

function basescanLink(value: string): string | undefined {
  // Format: "base-sepolia:0x..." -> link do explorer.
  const match = value.match(/^base-sepolia:(0x[0-9a-fA-F]{40})$/);
  if (!match) return undefined;
  return `https://sepolia.basescan.org/address/${match[1]}`;
}

/**
 * MED-3 (Mateusz Sesja 25) + HIGH-1 (Mateusz Sesja 35): walidacja schematu URL.
 * ENS text records sa ustawiane przez ownera subname - jesli kiedykolwiek subname
 * przejdzie do agentow lub DAO, kazdy moze ustawic javascript: / data: w avatar/url.
 * UI MUSI walidowac, NIE polegac na hooku (ktory waliduje tylko 'avatar').
 *
 * Tylko https: i ipfs:// (http blokowany - mixed content w produkcji HTTPS).
 */
function safeHref(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^(https:|ipfs:)\/\//i.test(value)) return undefined;
  return value;
}

function safeGithubHref(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Format owner/repo lub owner - tylko alphanumeric, -, _, ., /
  if (!/^[a-zA-Z0-9._-]+(\/[a-zA-Z0-9._-]+)?$/.test(value)) return undefined;
  return `https://github.com/${value}`;
}

function AgentENSCard({ persona }: { persona: AgentPersona }) {
  const ens = useAgentENS(persona);
  const agent = AGENTS.find((a) => a.persona === persona);
  if (!agent) return null;

  const r = ens.records;
  const recordCount = Object.keys(r).length;
  const contractHref = r["ai.contract"] ? basescanLink(r["ai.contract"]) : undefined;

  return (
    <Card className="border-border">
      <CardContent className="py-3 px-4 space-y-3">
        <AgentDetailModal
          agent={agent}
          trigger={
            <button
              type="button"
              className="flex items-center gap-3 w-full text-left rounded -mx-1 px-1 py-1 hover:bg-secondary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open ${agent.label.en} agent profile`}
            >
              <AgentPortrait persona={persona} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {ens.name}
                  </span>
                  <ResolutionBadge
                    resolved={ens.resolved}
                    latencyMs={ens.latencyMs}
                  />
                </div>
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {truncateAddress(ens.address)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[10px] text-muted-foreground/70 cursor-help">
                          {recordCount} records
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Number of ENS text records resolved for this subname.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            </button>
          }
        />

        {/* Identity */}
        <Section title="Identity" count={5}>
          <Row label="role" value={r["ai.role"]} />
          <Row label="description" value={r.description} />
          <Row label="avatar" value={r.avatar} href={safeHref(r.avatar)} />
          <Row label="url" value={r.url} href={safeHref(r.url)} />
          <Row label="email" value={r.email} mono />
        </Section>

        {/* Persona Metadata */}
        <Section title="Persona Metadata" count={5}>
          <Row label="persona" value={r["ai.persona"]} />
          <Row label="framework" value={r["ai.framework"]} />
          <Row label="consensus_method" value={r["ai.consensus_method"]} />
          <Row
            label="prompt_hash"
            value={r["ai.system_prompt_hash"]}
            mono
            tooltip="keccak256 first 16 chars - placeholder hash, real prompt hash post freeze"
          />
        </Section>

        {/* Reputation + stats */}
        <Section title="Reputation" count={5}>
          <Row label="reputation" value={r["ai.reputation"]} mono />
          <Row label="debates" value={r["ai.debates_participated"]} mono />
          <Row label="consensus_aligned" value={r["ai.consensus_aligned"] ? `${r["ai.consensus_aligned"]}%` : undefined} mono />
          <Row label="last_debate_cid" value={r["ai.last_debate_cid"]} mono />
        </Section>

        {/* Cross-chain */}
        <Section title="Cross-chain Reference" count={1}>
          <Row
            label="reputation_contract"
            value={r["ai.contract"]}
            href={safeHref(contractHref)}
            mono
            tooltip="AgentReputation contract na Base Sepolia (live read)"
          />
        </Section>

        {/* Tools */}
        <Section title="Tools" count={3}>
          <Row label="tools" value={r["ai.tools"]} />
          <Row label="data_sources" value={r["ai.data_sources"]} />
          <Row label="update_frequency" value={r["ai.update_frequency"]} />
        </Section>

        {/* Audit Trail */}
        <Section title="Audit Trail" count={3}>
          <Row label="proof_of_work" value={r["ai.proof_of_work"]} href={safeHref(r["ai.proof_of_work"])} />
          <Row label="audit_log" value={r["ai.audit_log"]} href={safeHref(r["ai.audit_log"])} />
          <Row label="transparency" value={r["ai.transparency_score"]} mono />
        </Section>

        {/* Social */}
        <Section title="Social" count={3}>
          <Row label="twitter" value={r["com.twitter"]} />
          <Row label="github" value={r["com.github"]} href={safeGithubHref(r["com.github"])} />
          <Row label="discord" value={r["com.discord"]} />
        </Section>

        {/* Memory / state */}
        <Section title="Memory" count={2}>
          <Row label="memory_type" value={r["ai.memory_type"]} />
          <Row label="last_active" value={r["ai.last_active"]} mono />
        </Section>
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
                <span className="text-amber">aicouncil-danergy.eth</span>
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

  // Critic MEDIUM-7: poprzednia avgLatency to byl placeholder (zawsze 80ms) - wprowadzal w blad jurorow.
  // Pokazujemy parent ENS latency jako sygnal stanu RPC (jedna prawdziwa liczba zamiast falszywej sredniej).
  const avgLatency = parentENS.latencyMs;

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
            Direct ENS (Sepolia) - {agents.length + 1} subnames mintowane via viem,
            26 text records per agent (Ghost in the Machine pattern, Sesja 35)
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
