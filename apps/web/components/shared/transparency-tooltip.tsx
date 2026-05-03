"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Transparency tooltip primitive (B-PATCH).
 *
 * Reusable info icon (i) with consistent styling across the dashboard.
 * Copy is FACTUAL only - no marketing. Tap-friendly on mobile (Radix
 * Tooltip auto-handles touch via aria controls).
 */

interface TransparencyTooltipProps {
  content: ReactNode;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}

export function TransparencyTooltip({
  content,
  ariaLabel,
  className = "",
  size = "sm",
}: TransparencyTooltipProps) {
  const dim = size === "md" ? "size-3.5" : "size-3";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-help ${className}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={dim}
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="6.5" />
              <line x1="8" y1="7" x2="8" y2="11.5" strokeLinecap="round" />
              <circle cx="8" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-xs space-y-1">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Pre-built copy blocks for common transparency tooltips. Single source
 * of truth so agent stack info stays consistent across the UI.
 */
export const TRANSPARENCY_COPY = {
  agentStack: (
    <>
      <p>
        <span className="font-mono">AI:</span> Claude Sonnet 4.6 by Anthropic
      </p>
      <p>
        <span className="font-mono">Reasoning model:</span> Opus 4.7 (Custom
        Adversarial agent only)
      </p>
      <p className="text-muted-foreground">
        Coming Q3: GPT-4o + Gemini support
      </p>
    </>
  ),
  costCounter: (
    <>
      <p>Calculated from Anthropic API usage logs (live).</p>
      <p className="text-muted-foreground">
        Coming Q3: Per-protocol cost breakdown
      </p>
    </>
  ),
  verdictConsensus: (
    <>
      <p>Consensus: 5+1 agent weighted voting (off-chain reputation weight).</p>
      <p>Timelock: 48h delay before execution.</p>
      <p>Signed by: 5-of-7 multisig (demo: mock 4 + your wallet).</p>
    </>
  ),
  auditStorage: (
    <>
      <p>Audit logs stored on 0G Storage (decentralised, tamper-proof).</p>
      <p>Fallback: IPFS Pinata.</p>
    </>
  ),
  ensResolution: (
    <>
      <p>ENS resolution: Sepolia network (live RPC).</p>
      <p>26 text records on-chain.</p>
      <p>Reputation contract: Base Sepolia (cross-chain reference).</p>
    </>
  ),
  submitProposal: (
    <p>
      Triggers a real Anthropic API call. 5 agents debate live (~$0.04 per
      debate).
    </p>
  ),
  sourceCoinGecko: <p>Source: CoinGecko API (live).</p>,
  sourceDefiLlama: <p>Source: DefiLlama (live).</p>,
  sourceCoinDesk: <p>Source: CoinDesk RSS (cached 5 min).</p>,
  sourceReuters: <p>Source: Reuters RSS (cached 5 min).</p>,
  sourceFutureQ3: (
    <p className="text-muted-foreground">
      Coming Q3: Perplexity AI search + audit registries.
    </p>
  ),
} as const;
