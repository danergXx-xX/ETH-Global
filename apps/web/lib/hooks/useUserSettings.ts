"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ThemeChoice = "dark" | "light" | "conclave";
export type LanguageChoice = "en" | "pl";

export interface UserSettings {
  notifications_enabled: boolean;
  theme: ThemeChoice;
  preferred_language: LanguageChoice;
  council_rules_overrides: Record<string, string> | null;
  trust_gate_threshold: number;
  agent_weights: Record<string, number>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications_enabled: true,
  theme: "dark",
  preferred_language: "en",
  council_rules_overrides: null,
  trust_gate_threshold: 70,
  agent_weights: {},
};

async function fetchSettings(address: string): Promise<UserSettings> {
  const res = await fetch(
    `${API_BASE}/api/user/settings?address=${encodeURIComponent(address)}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as UserSettings;
}

async function postSettings(
  address: string,
  settings: UserSettings
): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/api/user/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, ...settings }),
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return (await res.json()) as UserSettings;
}

export function useUserSettings(address: string | undefined) {
  const queryClient = useQueryClient();
  const isDemoMode = !address;

  const queryKey = ["user-settings", address ?? "demo"];

  const query = useQuery<UserSettings>({
    queryKey,
    queryFn: async () => {
      if (isDemoMode) return DEFAULT_USER_SETTINGS;
      return fetchSettings(address!);
    },
    staleTime: 1000 * 60,
  });

  const save = useMutation({
    mutationKey: ["user-settings", "save", address ?? "demo"],
    mutationFn: async (next: UserSettings) => {
      if (isDemoMode) {
        // Demo mode write: update only client cache, no server hit.
        queryClient.setQueryData(queryKey, next);
        return next;
      }
      return postSettings(address!, next);
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKey, saved);
    },
  });

  return {
    settings: query.data ?? DEFAULT_USER_SETTINGS,
    isLoading: query.isLoading,
    isError: query.isError,
    isDemoMode,
    save: save.mutate,
    isSaving: save.isPending,
    saveError: save.error?.message ?? null,
  };
}
