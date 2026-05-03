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

// Base Sepolia deployment addresses (deployed 2026-05-02, all verified on Basescan).
// Source of truth: contracts/deployments/base-sepolia.json
export const VERIFIED_CONTRACTS: VerifiedContract[] = [
  {
    name: "AICouncilGovernor",
    address: "0x1f95c796c5dc47d08b20cf3220a2afa995e301f0",
    description: "OpenZeppelin Governor with 5+1 council voting (60% quorum).",
  },
  {
    name: "TimelockController",
    address: "0x76a69bb6aef69a2e76fa6c9632ff6ca101441b0f",
    description: "48h delay before proposal execution.",
  },
  {
    name: "CouncilToken",
    address: "0x5fe2a5e971d9faaff9cc0b0c9981da44fefc4381",
    description: "ERC20Votes token (AICT) used for voting power.",
  },
  {
    name: "AgentReputation",
    address: "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44",
    description: "On-chain reputation per agent (Moat 5 PoW).",
  },
  {
    name: "MockUSDC",
    address: "0x606ede7755131e6206a29b67d88761eebb3bb59d",
    description: "Treasury asset for proposals (testnet stablecoin).",
  },
];

export function isContractDeployed(c: VerifiedContract): boolean {
  return c.address.length > 0 && !/^0x0+$/.test(c.address);
}

export const ANY_CONTRACT_DEPLOYED = VERIFIED_CONTRACTS.some(isContractDeployed);

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
  const deployed = address.length > 0 && !/^0x0+$/.test(address);

  if (!deployed) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-1 rounded border border-amber-700/50 bg-amber-950/20 px-1.5 py-0.5 text-[9px] font-mono text-amber-300/90 cursor-help"
            >
              <span aria-hidden className="size-1 rounded-full bg-amber-400" />
              Pending deployment
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Smart contract address not yet pushed by Sol Phase 1A. Verifier
              link will activate once the contract is deployed and verified on
              Base Sepolia.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

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
  const deployedCount = VERIFIED_CONTRACTS.filter(isContractDeployed).length;
  const total = VERIFIED_CONTRACTS.length;
  const allPending = deployedCount === 0;

  // Honest mode (Charter #7): if no contract is deployed yet, do not claim
  // "verified". Show pending state with neutral amber styling and explain
  // exactly what is happening so judges are not misled.
  const summaryClass = allPending
    ? "border-amber-700/50 bg-amber-950/30 text-amber-300/90 hover:bg-amber-950/50"
    : "border-emerald-700/50 bg-emerald-950/30 text-emerald-300/90 hover:bg-emerald-950/50";
  const dotClass = allPending ? "bg-amber-400" : "bg-emerald-400";
  const summaryLabel = allPending
    ? `${total} contracts pending Base Sepolia deployment`
    : `${deployedCount} of ${total} contracts verified on Base Sepolia`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono transition-colors cursor-help ${summaryClass}`}
          >
            <span aria-hidden className={`size-1.5 rounded-full ${dotClass}`} />
            {summaryLabel}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-0">
          {allPending ? (
            <div className="px-3 py-2 text-xs space-y-1">
              <p className="text-amber-300/90 font-semibold">
                Awaiting Sol Phase 1A deployment
              </p>
              <p className="text-muted-foreground">
                Solidity engineer (Sol) will push final contract addresses to
                this list. Once verified on Basescan, badges flip to green and
                each entry links to its source.
              </p>
              <ul className="pt-1 mt-1 border-t border-border space-y-0.5">
                {VERIFIED_CONTRACTS.map((c) => (
                  <li key={c.name}>
                    <span className="font-mono text-primary">{c.name}</span>
                    <span className="text-muted-foreground"> - {c.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="text-xs divide-y divide-border">
              {VERIFIED_CONTRACTS.map((c) => {
                const deployed = isContractDeployed(c);
                const inner = (
                  <>
                    <span className="font-mono text-primary">{c.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      - {c.description}
                      {deployed ? null : " (pending)"}
                    </span>
                  </>
                );
                return (
                  <li key={c.name} className="px-3 py-2">
                    {deployed ? (
                      <a
                        href={basescanContractLink(c.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:underline"
                      >
                        {inner}
                      </a>
                    ) : (
                      <span className="block opacity-70">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
