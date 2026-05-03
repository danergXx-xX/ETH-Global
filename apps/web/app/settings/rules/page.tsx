"use client";

import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { RulesEditor } from "@/components/rules";
import { DemoBanner } from "@/components/settings";

export default function RulesSettingsPage() {
  const { address } = useAccount();
  const readOnly = !address;

  return (
    <div className="space-y-4">
      {readOnly && (
        <DemoBanner message="Demo mode: rules editor is read-only without a connected wallet." />
      )}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-foreground">Council rules (overrides)</h2>
          <p className="text-xs text-muted-foreground">
            Per-wallet overrides on top of the canonical rules.json. Submit changes to the council
            for re-validation - they take effect after a successful debate cycle.
          </p>
        </CardContent>
      </Card>
      <RulesEditor />
    </div>
  );
}
