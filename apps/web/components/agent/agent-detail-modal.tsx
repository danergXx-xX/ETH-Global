"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentPortrait } from "@/components/shared/agent-portrait";
import { AGENTS, type AgentPersona, type AgentMeta } from "@/lib/types";
import { useAgentENS } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { PERSONA_DISPLAY } from "@/lib/agent-personas-content";
import {
  TransparencyTooltip,
  TRANSPARENCY_COPY,
} from "@/components/shared/transparency-tooltip";

const PROMPT_PREVIEW_CHARS = 500;

interface AgentDetailModalProps {
  agent: AgentMeta;
  trigger: React.ReactNode;
}

function reputationToWeight(rep: number): string {
  // OFF-CHAIN ONLY display calculation. Backend voting service will
  // compute the real weight via AgentReputation.read(agentId) at vote time
  // (Sesja 50.5 follow-up). Governor.sol voting weight is NOT modified.
  const weight = (rep / 100).toFixed(2);
  return `${weight}x`;
}

function basescanLink(address: string): string {
  return `https://sepolia.basescan.org/address/${address}`;
}

function ensAppLink(name: string): string {
  return `https://app.ens.domains/${name}`;
}

export function AgentDetailModal({ agent, trigger }: AgentDetailModalProps) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const ens = useAgentENS(agent.persona);
  const persona = PERSONA_DISPLAY[agent.persona];
  const label = agent.label[locale] ?? agent.label.en;

  const repScore = ens.records["ai.reputation"]
    ? Number.parseInt(ens.records["ai.reputation"], 10)
    : agent.rep;
  const debatesCount = ens.records["ai.debates_participated"]
    ? Number.parseInt(ens.records["ai.debates_participated"], 10)
    : null;
  const consensusAligned = ens.records["ai.consensus_aligned"]
    ? Number.parseInt(ens.records["ai.consensus_aligned"], 10)
    : null;

  const promptPreview = showFullPrompt
    ? persona.systemPromptPreview
    : persona.systemPromptPreview.slice(0, PROMPT_PREVIEW_CHARS);
  const hasMore =
    persona.systemPromptPreview.length > PROMPT_PREVIEW_CHARS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AgentPortrait persona={agent.persona} size={48} />
            <div className="min-w-0">
              <DialogTitle className="text-lg">{label}</DialogTitle>
              <DialogDescription className="text-xs font-mono">
                <a
                  href={ensAppLink(ens.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {ens.name}
                </a>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Role + description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Role
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                AI stack
                <TransparencyTooltip
                  ariaLabel="AI model stack details"
                  content={TRANSPARENCY_COPY.agentStack}
                />
              </span>
            </div>
            <p className="text-sm font-medium">{persona.role}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {persona.description}
            </p>
          </div>

          {/* Reputation stats + voting weight tooltip */}
          <TooltipProvider delayDuration={200}>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  On-chain reputation
                </h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-[10px] cursor-help border-amber/40 text-amber"
                    >
                      OFF-CHAIN preview
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Voting weight shown here is calculated off-chain for
                      preview. The on-chain Governor.sol uses 1 token = 1 vote.
                      Reputation-weighted voting is enforced by the backend
                      voting service reading the AgentReputation contract.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="font-mono text-lg">{repScore}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Rep score
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Reputation score from on-chain AgentReputation contract.
                        Range 0-100 based on consensus alignment and outcome
                        accuracy.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="font-mono text-lg">
                          {debatesCount ?? agent.statements}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Debates
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Total debates this agent has participated in across all
                        treasury proposals.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="font-mono text-lg">
                          {consensusAligned !== null
                            ? `${consensusAligned}%`
                            : "-"}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Consensus
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Percentage of past votes that aligned with the final
                        council consensus.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono cursor-help">
                      {label} (Rep {repScore}) -{" "}
                      <span className="text-primary">
                        {reputationToWeight(repScore)}
                      </span>{" "}
                      weight
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Off-chain preview: agent vote influence scales with
                      reputation. Calculated as rep/100. Backend voting service
                      enforces this at tally time. Governor.sol on-chain logic
                      is unchanged.
                    </p>
                  </TooltipContent>
                </Tooltip>
                <a
                  href={basescanLink(ens.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {"View on chain ->"}
                </a>
              </div>
            </div>
          </TooltipProvider>

          {/* System prompt preview */}
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              System prompt preview
            </h3>
            <div className="rounded border border-border bg-background/40 p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground max-h-64 overflow-y-auto">
              {promptPreview}
              {!showFullPrompt && hasMore ? "..." : null}
            </div>
            {hasMore ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullPrompt((s) => !s)}
                className="mt-2 text-xs h-7"
              >
                {showFullPrompt ? "Show less" : "Show more"}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper: wrap any agent card in a clickable button that opens the modal.
 */
export function AgentCardClickable({
  persona,
  children,
}: {
  persona: AgentPersona;
  children: React.ReactNode;
}) {
  const agent = AGENTS.find((a) => a.persona === persona);
  if (!agent) return <>{children}</>;
  return (
    <AgentDetailModal
      agent={agent}
      trigger={
        <button
          type="button"
          className="w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label={`Open ${agent.label.en} agent profile`}
        >
          {children}
        </button>
      }
    />
  );
}
