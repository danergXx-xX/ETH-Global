"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

/**
 * Demo Mode banner (LUKA 2 - CRITICAL for judges).
 *
 * Shown when no wallet is connected on the dashboard. Persistent at the
 * top of the page so judges always know they are in read-only demo mode.
 *
 * Behaviour:
 * - Always rendered while no wallet connected
 * - Subtle dismiss after 30s (can dismiss earlier via close button)
 * - Re-shows on next session if user clears localStorage
 * - Charter #7 honest communication: explicit "Demo Mode" marker, no
 *   pretending the demo is the production app
 */

const DISMISS_KEY = "conclave-demo-banner-dismissed-v1";
const AUTO_SUBTLE_AFTER_MS = 30_000;

export function DemoModeBanner() {
  const { isConnected } = useAccount();
  const [dismissed, setDismissed] = useState(false);
  const [subtle, setSubtle] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "true") {
      setDismissed(true);
    }
    const t = window.setTimeout(() => setSubtle(true), AUTO_SUBTLE_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (isConnected) return null;
  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "border-b border-amber-700/40 bg-amber-950/30 text-amber-200/90 transition-opacity",
        subtle ? "opacity-60 hover:opacity-100" : "opacity-100",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden className="size-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="truncate">
            <span className="font-semibold">Demo Mode</span>
            <span className="opacity-80"> - read-only. Connect wallet to interact.</span>
          </span>
        </div>
        <button
          type="button"
          aria-label="Dismiss demo mode banner"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(DISMISS_KEY, "true");
            }
            setDismissed(true);
          }}
          className="text-amber-300/70 hover:text-amber-200 px-1 leading-none"
        >
          x
        </button>
      </div>
    </div>
  );
}
