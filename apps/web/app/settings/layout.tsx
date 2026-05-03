import type { ReactNode } from "react";
import Link from "next/link";
import { SettingsShell } from "@/components/settings";

// Settings pages depend on wagmi (useAccount) which only renders client-side
// inside <Providers>. Skip prerender so we don't hit WagmiProviderNotFound.
export const dynamic = "force-dynamic";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-wider hover:text-amber">
            CONCLAVE
          </Link>
          <Link
            href="/"
            className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </header>
      <SettingsShell>{children}</SettingsShell>
    </div>
  );
}
