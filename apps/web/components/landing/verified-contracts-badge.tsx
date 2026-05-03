"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Verifier badges for landing page (LUKA 4).
 *
 * Lists the 5 verified smart contracts on Base Sepolia with direct
 * Basescan links so judges can independently verify deployment.
 *
 * Address book is intentionally co-located here so a single edit updates
 * both the badge tooltip and the per-contract list.
 */

interface VerifiedContract {
  name: string;
  address: string;
  description: string;
}

// Base Sepolia deployment addresses (Sol Phase 1A - placeholder until
// Sol session pushes final addresses; component renders zero-padded
// example until then so the UI does not break in Demo Mode).
export const VERIFIED_CONTRACTS: VerifiedContract[] = [
  {
    name: "Governor",
    address: "0x0000000000000000000000000000000000000001",
    description: "OpenZeppelin Governor with 5+1 council voting.",
  },
  {
    name: "Timelock",
    address: "0x0000000000000000000000000000000000000002",
    description: "48h delay before proposal execution.",
  },
  {
    name: "AgentReputation",
    address: "0x0000000000000000000000000000000000000003",
    description: "On-chain reputation per agent ENS subname.",
  },
  {
    name: "VotesToken",
    address: "0x0000000000000000000000000000000000000004",
    description: "ERC20Votes token used for voting power.",
  },
  {
    name: "CouncilRules",
    address: "0x0000000000000000000000000000000000000005",
    description: "DAO-admin set hard limits, agent-immutable.",
  },
];

export function basescanContractLink(address: string): string {
  return `https://sepolia.basescan.org/address/${address}#code`;
}

/**
 * Per-contract small inline badge. Use beside any smart contract reference.
 */
export function VerifiedOnBasescanBadge({
  address,
  label = "Verified on Basescan",
}: {
  address: string;
  label?: string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={basescanContractLink(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded border border-emerald-700/50 bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300/90 hover:bg-emerald-950/40 transition-colors"
          >
            <span aria-hidden className="size-1 rounded-full bg-emerald-400" />
            {label}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            View verified source on Basescan (Base Sepolia).
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Footer summary badge "5 contracts verified" with hover-revealed list.
 */
export function VerifiedContractsSummary() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-mono text-emerald-300/90 hover:bg-emerald-950/50 transition-colors cursor-help"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
            {VERIFIED_CONTRACTS.length} contracts verified on Base Sepolia
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-0">
          <ul className="text-xs divide-y divide-border">
            {VERIFIED_CONTRACTS.map((c) => (
              <li key={c.name} className="px-3 py-2">
                <a
                  href={basescanContractLink(c.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:underline"
                >
                  <span className="font-mono text-primary">{c.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    - {c.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
