"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AgentPortrait } from "@/components/shared/agent-portrait";
import { SourcePopover } from "@/components/shared/source-popover";
import { AgentDetailModal } from "@/components/agent/agent-detail-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n, useTranslations } from "@/lib/i18n";
import type { AgentMeta, Claim, Decision } from "@/lib/types";
import { MOCK_SOURCES } from "@/lib/mocks/debate";

interface AgentCardProps {
  agent: AgentMeta;
  status: "waiting" | "analyzing" | "done" | "error";
  claims: Claim[];
  decision?: Decision;
  confidence?: number;
}

const DECISION_STYLES: Record<Decision, string> = {
  FOR: "bg-vote-for/15 text-vote-for border-vote-for/30",
  AGAINST: "bg-vote-against/15 text-vote-against border-vote-against/30",
  ABSTAIN: "bg-secondary text-muted-foreground border-border",
};

export function AgentDebateCard({
  agent,
  status,
  claims,
  decision,
  confidence,
}: AgentCardProps) {
  const { locale } = useI18n();
  const t = useTranslations("agentCard");
  const label = agent.label[locale] ?? agent.label.en;
  const bias = agent.bias[locale] ?? agent.bias.en;

  return (
    <Card
      className="overflow-hidden border-border"
      style={{ borderTopColor: agent.color.accent, borderTopWidth: 2 }}
    >
      <AgentDetailModal
        agent={agent}
        trigger={
          <button
            type="button"
            className="flex items-center gap-3 px-4 py-3 w-full text-left cursor-pointer hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            style={{
              background: agent.color.headerBg,
              color: agent.color.headerText,
            }}
            aria-label={`Open ${label} agent profile`}
          >
            <AgentPortrait persona={agent.persona} size={36} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{label}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-current/30 px-1.5 py-0"
                >
                  {bias}
                </Badge>
              </div>
              <TooltipProvider delayDuration={200}>
                <div className="flex items-center gap-3 text-[10px] opacity-70 font-mono">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">Rep {agent.rep}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Reputation score from on-chain AgentReputation contract.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {agent.statements} statements
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Total statements made across all debates.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </button>
        }
      />
      {(status === "analyzing" || (status === "done" && decision)) && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-t border-current/10"
          style={{
            background: agent.color.headerBg,
            color: agent.color.headerText,
          }}
        >
          {status === "analyzing" && (
            <div
              className="h-2 w-2 rounded-full bg-amber animate-pulse-slow"
              aria-label="Analyzing"
            />
          )}
          {status === "done" && decision && (
            <Badge className={`text-[10px] ${DECISION_STYLES[decision]}`}>
              {decision}
            </Badge>
          )}
          {confidence !== undefined && status === "done" && (
            <span className="font-mono text-[10px] opacity-70">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>
      )}

      <CardContent className="px-4 py-3 space-y-2" aria-live="polite">
        {status === "waiting" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            <span>{t("awaiting")}</span>
          </div>
        )}

        {status === "analyzing" && claims.length === 0 && (
          <div className="space-y-2">
            <div className="h-3 w-3/4 rounded bg-secondary animate-shimmer bg-gradient-to-r from-secondary via-muted to-secondary" />
            <div className="h-3 w-1/2 rounded bg-secondary animate-shimmer bg-gradient-to-r from-secondary via-muted to-secondary" />
          </div>
        )}

        {claims.map((claim, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm leading-relaxed text-card-foreground"
          >
            <span>{claim.text}</span>
            {claim.sourceId !== null && status === "analyzing" && i === claims.length - 1 && (
              <span className="animate-cursor inline-block w-0.5 h-3.5 bg-amber ml-0.5 align-middle" />
            )}
            {claim.sourceId !== null && MOCK_SOURCES[claim.sourceId] && (
              <SourcePopover
                source={MOCK_SOURCES[claim.sourceId]}
                index={claim.sourceId}
              />
            )}
          </motion.div>
        ))}

        {status === "error" && (
          <div className="text-sm text-destructive-foreground">
            {t("error") !== "agentCard.error" ? t("error") : "Agent error - retry available"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
