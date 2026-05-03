"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TokenHolding } from "@/lib/hooks/useTreasuryPortfolio";

interface TokensTableProps {
  tokens: TokenHolding[];
  isLoading?: boolean;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

function formatBalance(symbol: string, balance: number): string {
  if (symbol === "WBTC" || symbol === "ETH") return balance.toFixed(2);
  if (balance >= 10_000) return balance.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return balance.toFixed(2);
}

export function TokensTable({ tokens, isLoading }: TokensTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
          Token holdings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="h-40 w-full animate-pulse rounded-md bg-secondary/40"
            aria-hidden
          />
        ) : tokens.length === 0 ? (
          <p className="text-xs text-muted-foreground">Treasury is empty.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Symbol</th>
                  <th className="py-1.5 px-2 font-medium text-right">Balance</th>
                  <th className="py-1.5 px-2 font-medium text-right">USD</th>
                  <th className="py-1.5 pl-2 font-medium text-right">Alloc</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr
                    key={t.symbol}
                    className="border-t border-border/40 hover:bg-secondary/30"
                  >
                    <td className="py-1.5 pr-2 font-semibold">{t.symbol}</td>
                    <td className="py-1.5 px-2 text-right">
                      {formatBalance(t.symbol, t.balance)}
                    </td>
                    <td className="py-1.5 px-2 text-right">{formatUsd(t.usd_value)}</td>
                    <td className="py-1.5 pl-2 text-right text-muted-foreground">
                      {t.allocation_pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
