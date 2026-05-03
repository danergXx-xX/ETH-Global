"use client";

import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/lib/i18n";
import { LiveDebateViewer } from "@/components/debate";
import { ExecuteFlow } from "@/components/vote";
import { AuditLog, HistoricalDebatesPanel } from "@/components/audit";
import { ENSIdentityCard } from "@/components/ens";
import { RulesEditor } from "@/components/rules";
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner";
import { WalletGate } from "@/components/dashboard/wallet-gate";
import {
  TransparencyTooltip,
  TRANSPARENCY_COPY,
} from "@/components/shared/transparency-tooltip";
import {
  PoweredByBadges,
} from "@/components/landing/powered-by-badges";

export default function DashboardContent() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("debate");

  return (
    <>
      <DemoModeBanner />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0">
            <TabsList className="bg-secondary/50 w-max sm:w-fit">
              <TabsTrigger value="debate" className="text-xs whitespace-nowrap">
                {t("nav.debate")}
              </TabsTrigger>
              <TabsTrigger value="vote" className="text-xs whitespace-nowrap">
                {t("nav.vote")}
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs whitespace-nowrap">
                {t("nav.audit")}
              </TabsTrigger>
              <TabsTrigger value="ens" className="text-xs whitespace-nowrap">
                {t("nav.ens")}
              </TabsTrigger>
              <TabsTrigger value="rules" className="text-xs whitespace-nowrap">
                {t("nav.rules")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="debate">
            <LiveDebateViewer />
          </TabsContent>

          <TabsContent value="vote">
            <WalletGate reason="Connect wallet to vote and execute proposals. Demo Mode shows the flow with read-only state.">
              <ExecuteFlow />
            </WalletGate>
          </TabsContent>

          <TabsContent value="audit">
            <HistoricalDebatesPanel />
            <AuditLog />
          </TabsContent>

          <TabsContent value="ens">
            <ENSIdentityCard />
          </TabsContent>

          <TabsContent value="rules">
            <WalletGate reason="Connect wallet to propose rule changes. DAO admins only - changes go through 48h timelock.">
              <RulesEditor />
            </WalletGate>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4 mt-8 space-y-3">
        <div className="mx-auto max-w-6xl px-4">
          <PoweredByBadges />
        </div>
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>CONCLAVE v0.1 - Base Sepolia - ETHGlobal Open Agents 2026</span>
          <div className="flex items-center gap-4">
            <Link
              href="/architecture"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <span className="inline-flex items-center gap-1.5">
              0G Storage - Audit Trail Archived
              <TransparencyTooltip
                ariaLabel="Audit storage details"
                content={TRANSPARENCY_COPY.auditStorage}
              />
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
