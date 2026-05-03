"use client";

import { useEffect, useState } from "react";
import { TreasuryView } from "./treasury-view";

export default function TreasuryPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
            <h1 className="text-sm font-bold tracking-wider">DAO Treasury Dashboard</h1>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="h-40 w-full animate-pulse rounded-md bg-secondary/40" />
        </main>
      </div>
    );
  }

  return <TreasuryView />;
}
