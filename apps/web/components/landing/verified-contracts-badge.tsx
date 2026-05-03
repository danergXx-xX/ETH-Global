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

// Base Sepolia deployment addresses. Until Sol Phase 1A session pushes real
// addresses, `address` stays empty string and the UI falls back to an honest
// "pending deployment" copy (Charter #7 - no fake "verified" claims).
export const VERIFIED_CONTRACTS: VerifiedContract[] = [
  {
    name: "Governor",
    address: "",
    description: "OpenZeppelin Governor with 5+1 council voting.",
  },
  {
    name: "Timelock",
    address: "",
    description: "48h delay before proposal execution.",
  },
  {
    name: "AgentReputation",
    address: "",
    description: "On-chain reputation per agent ENS subname.",
  },
  {
    name: "VotesToken",
    address: "",
    description: "ERC20Votes token used for voting power.",
  },
  {
    name: "CouncilRules",
    address: "",
    description: "DAO-admin set hard limits, agent-immutable.",
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
