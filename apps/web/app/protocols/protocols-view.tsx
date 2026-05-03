"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/shared/wallet-button";
import { InboxBell } from "@/components/notifications";
import { ProtocolCard, ProtocolDetailModal } from "@/components/protocols";
import {
  useProtocols,
  type Protocol,
  type ProtocolStatus,
} from "@/lib/hooks/useProtocols";

type FilterValue = "all" | ProtocolStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Whitelisted" },
  { value: "under_review", label: "Under review" },
  { value: "banned", label: "Banned" },
  { value: "light", label: "Light" },
];

export function ProtocolsView() {
  const { protocols, isLoading, isFallback } = useProtocols();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!protocols) return [];
    if (filter === "all") return protocols;
    return protocols.filter((p) => p.status === filter);
  }, [protocols, filter]);

  function openProtocol(p: Protocol) {
    setSelected(p);
    setModalOpen(true);
  }

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
                Protocol Registry
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                DeFi protocols evaluated by the council
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
        <section className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
            Filter
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={`px-3 py-1 rounded-full border text-[11px] font-mono transition-colors ${
                  active
                    ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                    : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            );
          })}
          {isFallback && (
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-amber-500/40 text-amber-300 bg-amber-500/10 ml-auto"
            >
              demo mode
            </Badge>
          )}
        </section>

        {isLoading && !protocols ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={`sk-${i}`}
                className="h-44 w-full animate-pulse rounded-lg bg-secondary/40"
                aria-hidden
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-secondary/20 px-4 py-8 text-center text-xs text-muted-foreground font-mono">
            No protocols match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProtocolCard key={p.id} protocol={p} onOpen={openProtocol} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <span>CONCLAVE v0.1 - Base Sepolia - ETHGlobal Open Agents 2026</span>
          <Link href="/treasury" className="hover:text-foreground transition-colors">
            Treasury dashboard
          </Link>
        </div>
      </footer>

      <ProtocolDetailModal
        protocol={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
