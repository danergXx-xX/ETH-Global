"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

interface OnboardingStatus {
  completed_steps: string[];
  current_step: string;
  is_complete: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY_PREFIX = "conclave-onboarding-";

async function fetchOnboarding(address: string): Promise<OnboardingStatus> {
  const res = await fetch(
    `${API_URL}/api/user/onboarding?address=${address}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`onboarding ${res.status}`);
  return (await res.json()) as OnboardingStatus;
}

/**
 * Redirects users with incomplete onboarding to /onboarding.
 * - No wallet -> no redirect (anonymous read-only mode allowed)
 * - Wallet + complete -> stay on /app
 * - Wallet + incomplete -> redirect to /onboarding (unless already there)
 * - localStorage backup if backend offline
 */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const { data } = useQuery<OnboardingStatus>({
    queryKey: ["onboarding-gate", address],
    queryFn: () => fetchOnboarding(address as string),
    enabled: Boolean(isConnected && address),
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (!isConnected || !address) return;
    if (pathname.startsWith("/onboarding")) return;

    // Backend response wins, fallback to localStorage
    let isComplete = data?.is_complete;
    if (isComplete === undefined && typeof window !== "undefined") {
      const cached = window.localStorage.getItem(
        `${STORAGE_KEY_PREFIX}${address}`,
      );
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Partial<OnboardingStatus>;
          isComplete = parsed.is_complete === true;
        } catch {
          isComplete = false;
        }
      }
    }

    if (isComplete === false) {
      router.push("/onboarding");
    }
  }, [data, isConnected, address, pathname, router]);

  return null;
}
