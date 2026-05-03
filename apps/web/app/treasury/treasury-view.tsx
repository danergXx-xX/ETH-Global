"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/shared/wallet-button";
import { InboxBell } from "@/components/notifications";
import {
  PortfolioChart,
  ProtocolAllocations,
  RecentDecisionsImpact,
  TokensTable,
} from "@/components/treasury";
import { useTreasuryPortfolio } from "@/lib/hooks/useTreasuryPortfolio";

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function TreasuryView() {
  const { portfolio, isLoading, isFallback } = useTreasuryPortfolio();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              aria-label="Back to debate"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground shrink-0"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-wider truncate">
                DAO Treasury Dashboard
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Portfolio + protocol allocations + recent decisions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            
            <InboxBell />
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="mb-6 flex flex-wrap items-baseline gap-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Total treasury value
          </h2>
          <span
            className="font-mono text-2xl md:text-3xl font-semibold"
            aria-live="polite"
          >
            {portfolio ? formatUsd(portfolio.total_usd) : "--"}
          </span>
          {isFallback && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-amber-500/40 text-amber-300 bg-amber-500/10"
            >
              demo mode
            </Badge>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioChart
            totalUsd={portfolio?.total_usd ?? 0}
            pnl7d={portfolio?.pnl_7d ?? 0}
            isLoading={isLoading && !portfolio}
          />
          <ProtocolAllocations
            protocols={portfolio?.protocols ?? []}
            isLoading={isLoading && !portfolio}
          />
          <TokensTable
            tokens={portfolio?.tokens ?? []}
            isLoading={isLoading && !portfolio}
          />
          <RecentDecisionsImpact
            decisions={portfolio?.recent_decisions ?? []}
            isLoading={isLoading && !portfolio}
          />
        </div>
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>CONCLAVE v0.1 - Base Sepolia - ETHGlobal Open Agents 2026</span>
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to debate
          </Link>
        </div>
      </footer>
    </div>
  );
}
