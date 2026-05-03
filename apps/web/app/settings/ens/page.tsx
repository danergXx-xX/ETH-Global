"use client";

import { useAccount, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBanner } from "@/components/settings";

const PREVIEW_RECORDS: { key: string; value: string }[] = [
  { key: "name", value: "Conclave Voter" },
  { key: "ai.role", value: "DAO contributor" },
  { key: "ai.contract", value: "base-sepolia:0xf3BAb9...6f44" },
  { key: "url", value: "https://aicouncil-danergy.eth.link" },
];

export default function EnsSettingsPage() {
  const { address } = useAccount();
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { enabled: Boolean(address) },
  });

  const readOnly = !address;

  return (
    <div className="space-y-4">
      {readOnly && (
        <DemoBanner message="Demo mode: connect a wallet to preview ENS resolution and records." />
      )}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-foreground">ENS identity</h2>
          <p className="text-xs text-muted-foreground">
            Linked ENS name and the text records the council exposes about you. ENS resolution
            is read-only here; manage records via your ENS manager (ens.domains).
          </p>
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Connected wallet
            </p>
            <p className="text-xs font-mono text-foreground break-all">
              {address ?? "Not connected"}
            </p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              ENS name
            </p>
            <p className="text-xs font-mono text-foreground">
              {readOnly
                ? "(none)"
                : isLoading
                  ? "Resolving..."
                  : ensName ?? "(no primary ENS set)"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Text records (preview)</h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              read-only
            </Badge>
          </div>
          <div className="grid gap-1.5">
            {PREVIEW_RECORDS.map((rec) => (
              <div
                key={rec.key}
                className="flex items-center justify-between rounded-md border border-border px-3 py-1.5"
              >
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {rec.key}
                </span>
                <span className="text-xs font-mono text-foreground truncate">
                  {rec.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
