"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/shared/wallet-button";
import { InboxBell } from "@/components/notifications";

function ConclaveLogo() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" aria-label="AI Treasury Council logo">
      <circle cx={14} cy={6} r={3} fill="oklch(0.82 0.14 75)" />
      <circle cx={21.5} cy={11} r={3} fill="oklch(0.74 0.16 152)" />
      <circle cx={19} cy={20} r={3} fill="oklch(0.70 0.18 22)" />
      <circle cx={9} cy={20} r={3} fill="oklch(0.74 0.15 245)" />
      <circle cx={6.5} cy={11} r={3} fill="oklch(0.74 0.16 305)" />
    </svg>
  );
}

interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/app", label: "App" },
  { href: "/architecture", label: "Architecture" },
  { href: "/risks-roadmap", label: "Risks" },
  { href: "/similar-projects", label: "Similar Projects" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3 gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <ConclaveLogo />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-wider">AI Treasury Council</h1>
            <p className="text-[10px] text-muted-foreground">
              Multi-agent DAO governance
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-xs">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <InboxBell />
          <WalletButton />
        </div>
      </div>

      {/* Mobile nav - horizontal scroll */}
      <nav
        className="md:hidden border-t border-border/50 overflow-x-auto"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center gap-1 px-4 py-2 text-xs w-max">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
