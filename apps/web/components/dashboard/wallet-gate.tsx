"use client";

import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Wallet-gated wrapper for write actions (LUKA 2).
 *
 * When a wallet is connected, renders children unchanged.
 * When no wallet connected, overlays a disabled visual state with a
 * tooltip "Connect wallet to interact" and intercepts pointer events
 * via a transparent overlay so accidental clicks do not fire mutations.
 *
 * Read actions remain interactive (do not wrap them).
 */

interface WalletGateProps {
  children: ReactNode;
  reason?: string;
  className?: string;
}

export function WalletGate({
  children,
  reason = "Connect wallet to interact",
  className = "",
}: WalletGateProps) {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <div className={className}>{children}</div>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative ${className}`}
            aria-disabled="true"
            data-wallet-gated="true"
          >
            <div className="opacity-50 pointer-events-none select-none">
              {children}
            </div>
            <div
              className="absolute inset-0 cursor-not-allowed"
              role="presentation"
              aria-hidden="true"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
