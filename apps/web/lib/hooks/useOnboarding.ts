"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export type OnboardingStepId =
  | "wallet_connected"
  | "dao_verified"
  | "rules_read"
  | "role_selected"
  | "first_proposal_submitted";

export interface OnboardingStatus {
  completed_steps: OnboardingStepId[];
  current_step: OnboardingStepId | string;
  is_complete: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY_PREFIX = "conclave-onboarding-";

const EMPTY_STATUS: OnboardingStatus = {
  completed_steps: [],
  current_step: "wallet_connected",
  is_complete: false,
};

function readLocal(address: string | undefined): OnboardingStatus | null {
  if (!address || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${STORAGE_KEY_PREFIX}${address}`,
    );
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingStatus;
  } catch {
    return null;
  }
}

function writeLocal(address: string, status: OnboardingStatus): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${address}`,
      JSON.stringify(status),
    );
  } catch {
    // quota / private mode - swallow
  }
}

async function fetchStatus(address: string): Promise<OnboardingStatus> {
  const res = await fetch(
    `${API_URL}/api/user/onboarding?address=${address}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`onboarding ${res.status}`);
  return (await res.json()) as OnboardingStatus;
}

async function postStep(
  address: string,
  step_id: OnboardingStepId,
  metadata?: Record<string, string>,
): Promise<OnboardingStatus> {
  const res = await fetch(`${API_URL}/api/user/onboarding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ address, step_id, metadata }),
  });
  if (!res.ok) throw new Error(`onboarding step ${res.status}`);
  return (await res.json()) as OnboardingStatus;
}

export function useOnboarding() {
  const { address, isConnected } = useAccount();
  const qc = useQueryClient();

  const query = useQuery<OnboardingStatus>({
    queryKey: ["onboarding", address],
    queryFn: async () => {
      try {
        const remote = await fetchStatus(address as string);
        if (address) writeLocal(address, remote);
        return remote;
      } catch (err) {
        const cached = readLocal(address);
        if (cached) return cached;
        throw err;
      }
    },
    enabled: Boolean(isConnected && address),
    staleTime: 30_000,
    retry: 1,
  });

  const mutation = useMutation<
    OnboardingStatus,
    Error,
    { step_id: OnboardingStepId; metadata?: Record<string, string> }
  >({
    mutationFn: async ({ step_id, metadata }) => {
      if (!address) throw new Error("wallet not connected");
      try {
        const result = await postStep(address, step_id, metadata);
        writeLocal(address, result);
        return result;
      } catch (err) {
        // Backend offline -> optimistic localStorage update so flow continues.
        const current = readLocal(address) ?? { ...EMPTY_STATUS };
        const completed = Array.from(
          new Set([...current.completed_steps, step_id]),
        );
        const ORDER: OnboardingStepId[] = [
          "wallet_connected",
          "dao_verified",
          "rules_read",
          "role_selected",
          "first_proposal_submitted",
        ];
        const next = ORDER.find((s) => !completed.includes(s)) ?? ORDER[ORDER.length - 1];
        const fallback: OnboardingStatus = {
          completed_steps: completed,
          current_step: completed.length === ORDER.length ? next : next,
          is_complete: completed.length === ORDER.length,
        };
        writeLocal(address, fallback);
        // Re-throw a flagged error so caller can show "saved offline" toast if needed.
        const wrapped = new Error("offline-saved");
        (wrapped as Error & { offline?: boolean; status?: OnboardingStatus }).offline = true;
        (wrapped as Error & { offline?: boolean; status?: OnboardingStatus }).status = fallback;
        throw wrapped;
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["onboarding", address], data);
      qc.invalidateQueries({ queryKey: ["onboarding-gate", address] });
    },
    onError: (err) => {
      const status = (err as Error & { status?: OnboardingStatus }).status;
      if (status) {
        qc.setQueryData(["onboarding", address], status);
      }
    },
  });

  const status = query.data ?? readLocal(address) ?? EMPTY_STATUS;

  const markStep = useCallback(
    (step_id: OnboardingStepId, metadata?: Record<string, string>) =>
      mutation.mutateAsync({ step_id, metadata }),
    [mutation],
  );

  return {
    status,
    isLoading: query.isLoading,
    markStep,
    isPending: mutation.isPending,
    isComplete: status.is_complete,
  };
}
