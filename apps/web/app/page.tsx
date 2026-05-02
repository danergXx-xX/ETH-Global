"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageToggle } from "@/components/language-toggle";
import { WalletButton } from "@/components/shared/wallet-button";
import { useTranslations } from "@/lib/i18n";
import { LiveDebateViewer } from "@/components/debate";
import { ExecuteFlow } from "@/components/vote";
import { AuditLog } from "@/components/audit";
import { ENSIdentityCard } from "@/components/ens";
import { RulesEditor } from "@/components/rules";

function ConclaveLogo() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" aria-label="Conclave">
      <circle cx={14} cy={6} r={3} fill="oklch(0.82 0.14 75)" />
      <circle cx={21.5} cy={11} r={3} fill="oklch(0.74 0.16 152)" />
      <circle cx={19} cy={20} r={3} fill="oklch(0.70 0.18 22)" />
      <circle cx={9} cy={20} r={3} fill="oklch(0.74 0.15 245)" />
      <circle cx={6.5} cy={11} r={3} fill="oklch(0.74 0.16 305)" />
    </svg>
  );
}

export default function Home() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("debate");

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ConclaveLogo />
            <div>
              <h1 className="text-sm font-bold tracking-wider">
                {t("header.title")}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {t("header.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-secondary/50">
            <TabsTrigger value="debate" className="text-xs">
              {t("nav.debate")}
            </TabsTrigger>
            <TabsTrigger value="vote" className="text-xs">
              {t("nav.vote")}
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs">
              {t("nav.audit")}
            </TabsTrigger>
            <TabsTrigger value="ens" className="text-xs">
              {t("nav.ens")}
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs">
              {t("nav.rules")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="debate">
            <LiveDebateViewer />
          </TabsContent>

          <TabsContent value="vote">
            <ExecuteFlow />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>

          <TabsContent value="ens">
            <ENSIdentityCard />
          </TabsContent>

          <TabsContent value="rules">
            <RulesEditor />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>CONCLAVE v0.1 - Base Sepolia - ETHGlobal Open Agents 2026</span>
          <span>0G Storage - Audit Trail Archived</span>
        </div>
      </footer>
    </div>
  );
}
