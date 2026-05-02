"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AgentDebateCard } from "./agent-card";
import { useTranslations, useI18n } from "@/lib/i18n";
import { useDebateStream } from "@/lib/hooks";
import { AGENTS, type Consensus } from "@/lib/types";
import { MOCK_PROPOSAL } from "@/lib/mocks/debate";

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sRem = s % 60;
  return `T+${m}:${sRem.toString().padStart(2, "0")}`;
}

function computeConsensus(
  agentStates: ReturnType<typeof useDebateStream>["agentStates"]
): Consensus | null {
  let forCount = 0;
  let againstCount = 0;
  let done = 0;

  for (const [, state] of agentStates) {
    if (state.decision) {
      done++;
      if (state.decision.decision === "FOR") forCount++;
      if (state.decision.decision === "AGAINST") againstCount++;
    }
  }

  if (done < 5) return null;
  if (forCount > againstCount) return "FOR";
  if (againstCount > forCount) return "AGAINST";
  return "SPLIT";
}

export function LiveDebateViewer() {
  const t = useTranslations();
  const { locale } = useI18n();
  const [proposal, setProposal] = useState("");
  const { phase, agentStates, elapsedMs, startDebate, stopDebate } =
    useDebateStream(proposal || null);

  const consensus = phase === "done" ? computeConsensus(agentStates) : null;

  const tally = {
    for: 0,
    against: 0,
    abstain: 0,
  };

  for (const [, state] of agentStates) {
    if (state.decision) {
      if (state.decision.decision === "FOR") tally.for++;
      else if (state.decision.decision === "AGAINST") tally.against++;
      else tally.abstain++;
    }
  }

  const proposalDesc =
    locale === "pl"
      ? MOCK_PROPOSAL.description.pl
      : MOCK_PROPOSAL.description.en;

  function handleConvene() {
    if (!proposal.trim() || phase === "debating") return;
    startDebate();
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("header.title")}
          </h2>
          {phase === "debating" && (
            <Badge className="bg-amber/15 text-amber border-amber/30 animate-pulse-slow">
              DEBATING
            </Badge>
          )}
          {phase === "done" && (
            <Badge className="bg-vote-for/15 text-vote-for border-vote-for/30">
              DONE
            </Badge>
          )}
        </div>
        {phase !== "waiting" && (
          <span className="font-mono text-xs text-muted-foreground">
            {formatElapsed(elapsedMs)}
          </span>
        )}
      </div>

      {/* Proposal input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t("proposal.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={t("proposal.placeholder")}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            rows={3}
            disabled={phase === "debating"}
            className="resize-none"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleConvene}
              disabled={!proposal.trim() || phase === "debating"}
              className="flex-1"
            >
              {phase === "debating"
                ? t("proposal.debating")
                : t("proposal.submit")}
            </Button>
            {phase === "debating" && (
              <Button variant="outline" onClick={stopDebate} size="sm">
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Proposal reference (shown during/after debate) */}
      <AnimatePresence>
        {phase !== "waiting" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-amber/20">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono text-amber border-amber/30"
                  >
                    {MOCK_PROPOSAL.id}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {MOCK_PROPOSAL.amount} - {MOCK_PROPOSAL.target}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{proposalDesc}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent cards grid */}
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((agent) => {
          const agentState = agentStates.get(agent.persona);
          return (
            <AgentDebateCard
              key={agent.persona}
              agent={agent}
              status={agentState?.status ?? "waiting"}
              claims={agentState?.claims ?? []}
              decision={agentState?.decision?.decision}
              confidence={agentState?.decision?.confidence}
            />
          );
        })}
      </div>

      {/* Vote tally */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("tally.cardTitle")}</span>
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-vote-for">
                {t("tally.for")}: {tally.for}
              </span>
              <span className="text-vote-against">
                {t("tally.against")}: {tally.against}
              </span>
              <span className="text-muted-foreground">
                {t("tally.abstain")}: {tally.abstain}
              </span>
            </div>
          </div>

          {/* Vote distribution bar */}
          {(tally.for + tally.against + tally.abstain) > 0 && (
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-secondary">
              {tally.for > 0 && (
                <motion.div
                  className="bg-vote-for"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(tally.for / 5) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {tally.against > 0 && (
                <motion.div
                  className="bg-vote-against"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(tally.against / 5) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {tally.abstain > 0 && (
                <motion.div
                  className="bg-vote-abstain"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(tally.abstain / 5) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verdict */}
      <AnimatePresence>
        {consensus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-amber/30">
              <CardContent className="py-6">
                <p className="text-center text-lg font-semibold">
                  <span className="text-muted-foreground">
                    {t("verdict.label") !== "verdict.label"
                      ? t("verdict.label")
                      : "Council verdict"}{" "}
                  </span>
                  <span
                    className={
                      consensus === "FOR"
                        ? "text-vote-for"
                        : consensus === "AGAINST"
                          ? "text-vote-against"
                          : "text-amber"
                    }
                  >
                    {t(`verdict.${consensus}`)}
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
