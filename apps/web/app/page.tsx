"use client";

import { useTranslations } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageToggle } from "@/components/language-toggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("header.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("header.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ConnectButton />
        </div>
      </header>

      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Phase 1B components loading - Live Debate Viewer, Proposal Form, Vote+Execute Flow...
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
