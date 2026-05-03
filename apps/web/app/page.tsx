import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/shared/site-header";
import { ClientOnly } from "@/components/shared/client-only";
import { LiveStats } from "@/components/landing/live-stats";
import { LiveDebateWidget } from "@/components/landing/live-debate-widget";
import {
  PoweredByBadges,
  RedTeamAuditBadge,
} from "@/components/landing/powered-by-badges";
import { VerifiedContractsSummary } from "@/components/landing/verified-contracts-badge";

export const metadata: Metadata = {
  title: "AI Treasury Council - Multi-agent governance for DAOs",
  description:
    "Five AI agents debate treasury proposals with on-chain proof-of-work, ENS reputation, and 48h timelock. Built for ETHGlobal Open Agents 2026.",
};

interface Step {
  n: string;
  title: string;
  body: string;
}

const HOW_IT_WORKS: Step[] = [
  {
    n: "1",
    title: "Submit proposal",
    body: "Anyone with a wallet can submit a treasury proposal - swap, deploy, allocate, rebalance.",
  },
  {
    n: "2",
    title: "Five agents debate",
    body: "Bull, Bear, Risk, Tech and Sentiment agents read live data, cite sources, and vote FOR / AGAINST / ABSTAIN.",
  },
  {
    n: "3",
    title: "On-chain execute",
    body: "Multisig signs, 48h timelock runs, audit log lands on 0G Storage. Council Rules guard the perimeter.",
  },
];

interface TrustMech {
  icon: string;
  title: string;
  body: string;
}

const TRUST_MECHANISMS: TrustMech[] = [
  {
    icon: "[src]",
    title: "Source attribution",
    body: "Every agent claim is footnoted with the source it cites - CoinGecko, DefiLlama, RSS, on-chain reads.",
  },
  {
    icon: "[48h]",
    title: "Timelock 48h",
    body: "Approved proposals queue for 48 hours before execution. Humans can cancel; councils can re-debate.",
  },
  {
    icon: "[log]",
    title: "Audit log",
    body: "Full debate transcripts archived to 0G Storage with content hash. Anyone can verify.",
  },
  {
    icon: "[rep]",
    title: "ENS reputation",
    body: "Each agent owns an ENS subname with on-chain reputation score. Past performance is verifiable.",
  },
  {
    icon: "[hitl]",
    title: "HITL Council Rules",
    body: "DAO admins set hard limits: max spend, blocked protocols, required quorum. Agents cannot override.",
  },
];

interface Sponsor {
  name: string;
  tagline: string;
  href: string;
}

const SPONSORS: Sponsor[] = [
  {
    name: "0G Labs",
    tagline: "Decentralised storage for full debate transcripts and audit log.",
    href: "/architecture#og-storage",
  },
  {
    name: "ENS",
    tagline:
      "Subname per agent with 26 text records - identity, reputation, audit pointer.",
    href: "/architecture#ens",
  },
  {
    name: "Synthesis Finalist",
    tagline:
      "Multi-agent council combines on-chain governance, decentralised storage, and verifiable identity.",
    href: "/architecture#synthesis",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
            ETHGlobal Open Agents 2026 - Base Sepolia
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold leading-tight tracking-tight">
            AI Treasury Council
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-agent AI governance with on-chain proof-of-work for autonomous
            treasury decisions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Live Demo
            </Link>
            <a
              href="https://github.com/danergXx-xX/ETH-Global"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded border border-border px-6 py-3 text-sm font-medium hover:bg-secondary/50 transition-colors"
            >
              View on GitHub
            </a>
          </div>

          {/* Trust badges (LUKA 1 + LUKA 4) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <RedTeamAuditBadge />
            <VerifiedContractsSummary />
          </div>

          {/* Static SVG: 5 agents debating */}
          <div className="mt-12 max-w-2xl mx-auto">
            <svg
              viewBox="0 0 480 240"
              className="w-full h-auto"
              role="img"
              aria-label="Five AI agents arranged in a council circle"
            >
              {/* Center: treasury */}
              <circle
                cx={240}
                cy={120}
                r={28}
                fill="oklch(0.18 0.02 240)"
                stroke="oklch(0.45 0.05 240)"
                strokeWidth={1}
              />
              <text
                x={240}
                y={124}
                textAnchor="middle"
                fontSize={10}
                fill="oklch(0.7 0.05 240)"
                fontFamily="monospace"
              >
                TREASURY
              </text>

              {/* 5 agents in circle */}
              {[
                { x: 240, y: 30, fill: "oklch(0.82 0.14 75)", label: "BULL" },
                { x: 380, y: 95, fill: "oklch(0.74 0.16 152)", label: "BEAR" },
                { x: 340, y: 200, fill: "oklch(0.70 0.18 22)", label: "RISK" },
                { x: 140, y: 200, fill: "oklch(0.74 0.15 245)", label: "TECH" },
                { x: 100, y: 95, fill: "oklch(0.74 0.16 305)", label: "SENT" },
              ].map((a) => (
                <g key={a.label}>
                  <line
                    x1={240}
                    y1={120}
                    x2={a.x}
                    y2={a.y}
                    stroke="oklch(0.3 0.02 240)"
                    strokeWidth={0.5}
                    strokeDasharray="2 3"
                  />
                  <circle cx={a.x} cy={a.y} r={20} fill={a.fill} opacity={0.85} />
                  <text
                    x={a.x}
                    y={a.y + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="oklch(0.12 0.02 240)"
                    fontFamily="monospace"
                    fontWeight={600}
                  >
                    {a.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Live Stats */}
        <ClientOnly>
          <LiveStats />
        </ClientOnly>

        {/* How It Works */}
        <section
          aria-labelledby="how-heading"
          className="mx-auto max-w-5xl px-4 py-12"
        >
          <h2
            id="how-heading"
            className="text-2xl sm:text-3xl font-display font-semibold mb-8 text-center"
          >
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.n}
                className="rounded-lg border border-border bg-card/50 p-5"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  Step {step.n}
                </div>
                <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Debate Widget */}
        <ClientOnly>
          <LiveDebateWidget />
        </ClientOnly>

        {/* Trust Mechanisms */}
        <section
          aria-labelledby="trust-heading"
          className="mx-auto max-w-5xl px-4 py-12"
        >
          <h2
            id="trust-heading"
            className="text-2xl sm:text-3xl font-display font-semibold mb-2 text-center"
          >
            Five trust mechanisms
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Verifiability over vibes. Each layer is independently auditable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TRUST_MECHANISMS.map((mech) => (
              <div
                key={mech.title}
                className="rounded-lg border border-border bg-card/50 p-5"
              >
                <div className="text-[10px] font-mono text-primary mb-2">
                  {mech.icon}
                </div>
                <h3 className="text-sm font-semibold">{mech.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {mech.body}
                </p>
                <Link
                  href="/architecture"
                  className="mt-3 inline-block text-[11px] text-primary hover:underline"
                >
                  {"Learn more ->"}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Sponsor Tracks */}
        <section
          aria-labelledby="sponsors-heading"
          className="mx-auto max-w-5xl px-4 py-12"
        >
          <h2
            id="sponsors-heading"
            className="text-2xl sm:text-3xl font-display font-semibold mb-8 text-center"
          >
            Sponsor tracks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SPONSORS.map((sp) => (
              <Link
                key={sp.name}
                href={sp.href}
                className="rounded-lg border border-border bg-card/50 p-5 hover:bg-secondary/30 transition-colors block"
              >
                <h3 className="text-sm font-semibold">{sp.name}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{sp.tagline}</p>
                <span className="mt-3 inline-block text-[11px] text-primary">
                  {"Architecture details ->"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold">
            Ready to convene the council?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Live demo runs on Base Sepolia. No funds at risk.
          </p>
          <Link
            href="/app"
            className="mt-6 inline-flex items-center justify-center rounded bg-primary text-primary-foreground px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Try Live Demo
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-4 space-y-4">
        {/* Powered by + verified contracts row (LUKA 1 + LUKA 4) */}
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-3">
          <PoweredByBadges />
          <VerifiedContractsSummary />
        </div>
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground font-mono">
          <span>CONCLAVE v0.1 - Base Sepolia - ETHGlobal Open Agents 2026</span>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="https://github.com/danergXx-xX/ETH-Global"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/architecture"
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </Link>
            <Link
              href="/risks-roadmap"
              className="hover:text-foreground transition-colors"
            >
              Risks
            </Link>
            <Link
              href="/similar-projects"
              className="hover:text-foreground transition-colors"
            >
              Similar projects
            </Link>
            <a
              href="https://t.me/danergy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
