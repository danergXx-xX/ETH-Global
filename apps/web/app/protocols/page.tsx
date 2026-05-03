"use client";

import { useEffect, useState } from "react";
import { ProtocolsView } from "./protocols-view";

export default function ProtocolsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
            <h1 className="text-sm font-bold tracking-wider">Protocol Registry</h1>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={`sk-${i}`}
                className="h-44 w-full animate-pulse rounded-lg bg-secondary/40"
                aria-hidden
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return <ProtocolsView />;
}
