"use client";

import { ExternalLinkIcon, ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedOnBasescanBadgeProps {
  /**
   * Full contract address (0x + 40 hex). Component does NOT shorten - it
   * shows verified status and links to Basescan. Caller may render the
   * shortened address separately.
   */
  address: string;
  /** Network slug. Defaults to base-sepolia (Wave 1+ deployments). */
  network?: "base-sepolia" | "sepolia" | "base";
  /**
   * Optional contract label rendered next to the badge for accessibility
   * (e.g., "CouncilToken"). Visually hidden if `compact` is true.
   */
  label?: string;
  /** Compact tag-only style for inline placement next to address links. */
  compact?: boolean;
  className?: string;
}

const NETWORK_BASE: Record<NonNullable<VerifiedOnBasescanBadgeProps["network"]>, string> = {
  "base-sepolia": "https://sepolia.basescan.org",
  sepolia: "https://sepolia.etherscan.io",
  base: "https://basescan.org",
};

const NETWORK_LABEL: Record<NonNullable<VerifiedOnBasescanBadgeProps["network"]>, string> = {
  "base-sepolia": "Basescan",
  sepolia: "Etherscan",
  base: "Basescan",
};

/**
 * Tiny "verified on Basescan" badge for inline placement next to a contract
 * address. Used in /architecture page per smart contract (CZESC D patch).
 *
 * Visual: filled green check icon + small "Verified" label, hover reveals
 * "View on Basescan" tooltip via title attr.
 */
export function VerifiedOnBasescanBadge({
  address,
  network = "base-sepolia",
  label,
  compact = false,
  className,
}: VerifiedOnBasescanBadgeProps) {
  const href = `${NETWORK_BASE[network]}/address/${address}#code`;
  const networkLabel = NETWORK_LABEL[network];
  const a11y = label
    ? `Verified ${label} contract on ${networkLabel} (${address})`
    : `Verified contract on ${networkLabel} (${address})`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={a11y}
      title={`View ${label ?? "contract"} on ${networkLabel}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-vote-for/30 bg-vote-for/10 text-vote-for",
        "transition-colors hover:bg-vote-for/15 hover:border-vote-for/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vote-for/40",
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        "font-mono uppercase tracking-wider",
        className
      )}
      data-testid="verified-on-basescan-badge"
    >
      <ShieldCheckIcon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      <span>Verified</span>
      {!compact && (
        <ExternalLinkIcon className="h-2.5 w-2.5 opacity-60" aria-hidden />
      )}
    </a>
  );
}
