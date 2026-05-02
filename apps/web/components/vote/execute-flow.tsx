"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TimelockCountdown } from "./timelock-countdown";
import { useTranslations } from "@/lib/i18n";
import type { ExecuteStage, SignerInfo, TxPreview } from "@/lib/types";
import { getBasescanTxUrl } from "@/lib/contracts";

interface ExecuteFlowProps {
  initialStage?: ExecuteStage;
}

const STAGES: ExecuteStage[] = [
  "collecting_sigs",
  "threshold_reached",
  "queued_timelock",
  "executing",
  "executed",
];

const STAGE_LABELS: Record<ExecuteStage, string> = {
  collecting_sigs: "Collecting signatures",
  threshold_reached: "Threshold reached",
  queued_timelock: "Queued in Timelock",
  executing: "Executing",
  executed: "Executed",
};

const MOCK_SIGNERS: SignerInfo[] = [
  { address: "0xA001...0001", ens: "bull.aicouncil.eth", signed: true, timestamp: "2026-05-02T14:20:00Z" },
  { address: "0xA002...0002", ens: "bear.aicouncil.eth", signed: true, timestamp: "2026-05-02T14:21:00Z" },
  { address: "0xA003...0003", ens: "risk.aicouncil.eth", signed: true, timestamp: "2026-05-02T14:22:00Z" },
  { address: "0xA004...0004", ens: "tech.aicouncil.eth", signed: true, timestamp: "2026-05-02T14:23:00Z" },
  { address: "0xA005...0005", ens: "sentiment.aicouncil.eth", signed: true, timestamp: "2026-05-02T14:24:00Z" },
  { address: "0x4872...148a", ens: "deployer.eth", signed: false },
  { address: "0x7B2C...3D4E", signed: false },
];

const MOCK_TX: TxPreview = {
  target: "0x606EdE7755131e6206a29B67d88761EEbb3Bb59d",
  functionName: "approve(address,uint256)",
  args: { spender: "0x794a...AavePool", amount: "100,000 USDC" },
  gasEstimate: 184000,
};

function stageIndex(stage: ExecuteStage): number {
  return STAGES.indexOf(stage);
}

export function ExecuteFlow({ initialStage = "collecting_sigs" }: ExecuteFlowProps) {
  const t = useTranslations("execute");
  const [stage, setStage] = useState<ExecuteStage>(initialStage);
  const currentIdx = stageIndex(stage);
  const signedCount = MOCK_SIGNERS.filter((s) => s.signed).length;
  const requiredSigs = 5;

  const [mockEta] = useState(() => Math.floor(Date.now() / 1000) + 42 * 3600 + 18 * 60);
  const mockTxHash = "0xabc123def456789...";

  function advanceStage() {
    const next = STAGES[currentIdx + 1];
    if (next) setStage(next);
  }

  return (
    <div className="space-y-4">
      {/* Stage strip */}
      <div className="flex items-center gap-1">
        {STAGES.map((s, i) => {
          const isCurrent = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`h-3 w-3 rounded-full ${
                    isDone
                      ? "bg-vote-for"
                      : isCurrent
                        ? "bg-amber animate-pulse-slow"
                        : "bg-secondary"
                  }`}
                  layout
                />
                <span className={`mt-1 text-[9px] text-center ${
                  isCurrent ? "text-amber font-medium" : "text-muted-foreground"
                }`}>
                  {STAGE_LABELS[s]}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 ${
                    i < currentIdx ? "bg-vote-for" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Main content area */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Signers panel */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("signers")}</span>
              <Badge
                variant="outline"
                className={
                  signedCount >= requiredSigs
                    ? "text-vote-for border-vote-for/30"
                    : "text-amber border-amber/30"
                }
              >
                {signedCount} / 7
              </Badge>
            </div>
            <Progress value={(signedCount / 7) * 100} className="h-1.5" />
            <div className="space-y-1.5">
              {MOCK_SIGNERS.map((signer) => (
                <div
                  key={signer.address}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        signer.signed ? "bg-vote-for" : "bg-secondary"
                      }`}
                    />
                    <span className="font-mono text-muted-foreground">
                      {signer.ens ?? signer.address}
                    </span>
                  </div>
                  {signer.signed && (
                    <span className="text-vote-for text-[10px]">Signed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tx preview panel */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <span className="text-sm font-medium">{t("tx_preview")}</span>
            <div className="rounded-md bg-secondary/50 p-3 font-mono text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Target: </span>
                <span className="text-foreground">{MOCK_TX.target}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Function: </span>
                <span className="text-amber">{MOCK_TX.functionName}</span>
              </div>
              {Object.entries(MOCK_TX.args).map(([key, val]) => (
                <div key={key} className="pl-4">
                  <span className="text-tech">{key}</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-foreground">{val}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-border">
                <span className="text-muted-foreground">Gas estimate: </span>
                <span className="text-foreground">
                  {MOCK_TX.gasEstimate.toLocaleString()} (~$0.04)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timelock countdown (only in queued_timelock stage) */}
      {stage === "queued_timelock" && (
        <Card>
          <CardContent className="py-6 flex justify-center">
            <div className="relative">
              <TimelockCountdown
                etaTimestamp={mockEta}
                delaySeconds={172800}
                size={140}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executed receipt */}
      {stage === "executed" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-vote-for/30">
            <CardContent className="py-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-vote-for/15 text-vote-for border-vote-for/30">
                  EXECUTED
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Block #12345678 - Gas: 184,291
                </span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Tx: {mockTxHash}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {stage === "collecting_sigs" && (
          <Button onClick={advanceStage}>
            {t("buttons.sign")}
          </Button>
        )}
        {stage === "threshold_reached" && (
          <Button onClick={advanceStage}>
            {t("buttons.queue")}
          </Button>
        )}
        {stage === "queued_timelock" && (
          <Button disabled variant="outline">
            {t("buttons.execute_disabled")}
          </Button>
        )}
        {stage === "executing" && (
          <Button disabled>{t("buttons.pending")}</Button>
        )}
        {stage === "executed" && (
          <Button variant="outline" asChild>
            <a
              href={getBasescanTxUrl(mockTxHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("buttons.view_basescan")}
            </a>
          </Button>
        )}
        {/* Demo advance button */}
        {stage !== "executed" && (
          <Button variant="ghost" size="sm" onClick={advanceStage}>
            Demo: next stage
          </Button>
        )}
      </div>
    </div>
  );
}
