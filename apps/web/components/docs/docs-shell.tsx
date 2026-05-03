import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/architecture", label: "Architecture", description: "System overview, contracts, ENS, trust mechanisms" },
  { href: "/risks-roadmap", label: "Risks & Roadmap", description: "Known limitations, tech debt, post-hackathon plan" },
  { href: "/similar-projects", label: "Similar Projects", description: "Honest competitive analysis" },
];

export type TocItem = { id: string; label: string; level?: 2 | 3 };

interface DocsShellProps {
  title: string;
  subtitle?: string;
  toc: TocItem[];
  pagePath: string;
  currentHref: string;
  children: ReactNode;
}

export function DocsShell({ title, subtitle, toc, pagePath, currentHref, children }: DocsShellProps) {
  const githubUrl = `https://github.com/danergXx-xX/ETH-Global/edit/main/${encodeURI(pagePath)}`;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-wider hover:opacity-80">
            <span aria-hidden>←</span>
            <span>AI Treasury Council</span>
            <span className="text-muted-foreground font-normal">/ Docs</span>
          </Link>
          <nav
            className="flex items-center gap-1 text-xs font-mono overflow-x-auto md:overflow-visible -mr-4 pr-4 md:mr-0 md:pr-0"
            aria-label="Documentation sections"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === currentHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[16rem_1fr_14rem] gap-8">
        <aside className="hidden lg:block sticky top-20 self-start">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-mono">
            Documentation
          </div>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === currentHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">
                      {item.description}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="min-w-0">
          <div className="mb-8 pb-6 border-b border-border">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground text-base md:text-lg">{subtitle}</p>
            )}
          </div>
          <article className="prose-docs">{children}</article>
          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Edit on GitHub
            </a>
            <span>ETHGlobal Open Agents 2026</span>
          </div>
        </main>

        <aside className="hidden lg:block sticky top-20 self-start">
          {toc.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-mono">
                On this page
              </div>
              <ul className="space-y-1.5 text-xs">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block transition-colors hover:text-foreground ${
                        item.level === 3
                          ? "pl-3 text-muted-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 mt-12 mb-4 text-2xl font-semibold tracking-tight border-b border-border pb-2">
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 mt-8 mb-3 text-lg font-semibold tracking-tight">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-4 leading-7 text-foreground/90">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="my-4 ml-6 list-disc space-y-2 text-foreground/90 [&_li]:leading-7">{children}</ul>;
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="my-4 ml-6 list-decimal space-y-2 text-foreground/90 [&_li]:leading-7">{children}</ol>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground/90 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warn" | "success";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-l-blue-500/50 bg-blue-500/5",
    warn: "border-l-amber-500/50 bg-amber-500/5",
    success: "border-l-emerald-500/50 bg-emerald-500/5",
  }[variant];
  return (
    <div className={`my-6 border-l-4 ${styles} px-4 py-3 rounded-r-md`}>
      {title && <div className="font-semibold mb-1 text-sm">{title}</div>}
      <div className="text-sm text-foreground/85">{children}</div>
    </div>
  );
}
