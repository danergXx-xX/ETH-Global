"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Discoverability pulse hints (LUKA 3).
 *
 * Subtle pulsing dot beside clickable elements that judges might miss
 * during the first 30 seconds on the dashboard. Auto-dismisses on:
 *   - first click anywhere on the page
 *   - 30s timeout
 *   - localStorage flag set on previous visit
 *
 * Tooltip content describes WHAT clicking will do - factual, no marketing.
 * Designed to be ignorable for power users.
 */

const DISMISS_KEY = "conclave-tour-dismissed-v1";
const AUTO_DISMISS_MS = 30_000;

export type PulseHint =
  | "agent-card"
  | "verdict-number"
  | "ens-subname"
  | "audit-entry"
  | "architecture-link";

const HINT_COPY: Record<PulseHint, string> = {
  "agent-card": "Click for full bio, system prompt, on-chain reputation",
  "verdict-number": "Click for source attribution per agent",
  "ens-subname": "Click for full ENS resolution (26 text records)",
  "audit-entry": "Click for 0G CID and Basescan transaction",
  "architecture-link": "How the council works end-to-end",
};

let listenerInstalled = false;
let globalDismissed = false;
const subscribers = new Set<(v: boolean) => void>();

function notify(value: boolean) {
  globalDismissed = value;
  for (const sub of subscribers) sub(value);
}

function installGlobalDismissOnce() {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;
  const handler = () => {
    if (globalDismissed) return;
    window.localStorage.setItem(DISMISS_KEY, "true");
    notify(true);
  };
  window.addEventListener("click", handler, { once: true });
  window.setTimeout(() => {
    if (!globalDismissed) {
      window.localStorage.setItem(DISMISS_KEY, "true");
      notify(true);
    }
  }, AUTO_DISMISS_MS);
}

function useDismissed(): boolean {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(DISMISS_KEY) === "true";
    if (cached) {
      setDismissed(true);
      globalDismissed = true;
      return;
    }
    setDismissed(false);
    subscribers.add(setDismissed);
    installGlobalDismissOnce();
    return () => {
      subscribers.delete(setDismissed);
    };
  }, []);

  return dismissed;
}

interface DiscoverabilityPulseProps {
  hint: PulseHint;
  className?: string;
}

/**
 * Renders an absolutely-positioned pulse marker. Parent must be position:relative.
 */
export function DiscoverabilityPulse({
  hint,
  className = "",
}: DiscoverabilityPulseProps) {
  const dismissed = useDismissed();
  if (dismissed) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute z-10 ${className}`}
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{HINT_COPY[hint]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
