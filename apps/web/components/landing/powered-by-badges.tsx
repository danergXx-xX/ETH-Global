"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Subtle "Powered by" badges for landing page footer (LUKA 1).
 *
 * Lists the upstream tech stack with hover tooltips that explain the role
 * of each provider. Factual only - no marketing claims (Maja constraint).
 *
 * Plus an "Internal red-team audit passed" badge linking to the tech-debt
 * section of /risks-roadmap so judges can verify the claim.
 */

interface PoweredByEntry {
  label: string;
  detail: string;
  href: string;
  external?: boolean;
}

const PROVIDERS: PoweredByEntry[] = [
  {
    label: "Anthropic Claude",
    detail:
      "Claude Sonnet 4.6 powers the 5 council agents. Custom Adversarial agent runs on Opus 4.7 for deeper reasoning.",
    href: "https://www.anthropic.com/claude",
    external: true,
  },
  {
    label: "0G Storage",
    detail:
      "Decentralised storage for full debate transcripts and audit log. Tamper-proof, content-hashed.",
    href: "/architecture#og-storage",
  },
  {
    label: "ENS",
    detail:
      "Subname per agent with 26 text records: identity, reputation score, audit pointer.",
    href: "/architecture#ens",
  },
  {
    label: "Base Sepolia",
    detail:
      "Testnet deployment. Governor + Timelock + AgentReputation contracts verified on Basescan.",
    href: "https://sepolia.basescan.org/",
    external: true,
  },
  {
    label: "Foundry",
    detail:
      "Solidity test + deploy framework. Smart contracts use OpenZeppelin Contracts v5.",
    href: "https://book.getfoundry.sh/",
    external: true,
  },
];

export function PoweredByBadges() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[10px] font-mono text-muted-foreground">
        <span className="uppercase tracking-wider text-[9px]">Powered by</span>
        {PROVIDERS.map((p, idx) => {
          const inner = (
            <span className="hover:text-foreground transition-colors cursor-help underline-offset-2 hover:underline">
              {p.label}
            </span>
          );
          return (
            <span key={p.label} className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  {p.external ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.label} - ${p.detail}`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link href={p.href} aria-label={`${p.label} - ${p.detail}`}>
                      {inner}
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{p.detail}</p>
                </TooltipContent>
              </Tooltip>
              {idx < PROVIDERS.length - 1 ? (
                <span className="opacity-40">/</span>
              ) : null}
            </span>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

/**
 * Internal red-team audit badge. Separate component so it can be rendered
 * independently in the hero footer area or alongside Powered by badges.
 */
export function RedTeamAuditBadge() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/risks-roadmap#tech-debt"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-mono text-emerald-300/90 hover:bg-emerald-950/50 transition-colors"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
            Internal red-team audit passed
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            Critic + Vera + Mateusz multi-agent audit run pre-submission.
            Findings tracked in /risks-roadmap tech-debt section.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
