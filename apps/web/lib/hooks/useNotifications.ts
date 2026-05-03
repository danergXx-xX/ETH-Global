"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export type NotificationCategory =
  | "verdict"
  | "signature"
  | "rule_change"
  | "debate_started"
  | "debate_completed";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  summary: string;
  metadata: Record<string, string>;
  timestamp: string;
  read: boolean;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "demo_n1",
    category: "verdict",
    title: "Council verdict: FOR (consensus 4-1)",
    summary: "Proposal #142 - Aave deposit 50k mUSDC. Adversarial dissent noted.",
    metadata: { proposal_id: "142" },
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    read: false,
  },
  {
    id: "demo_n2",
    category: "signature",
    title: "Multisig 4/5 signed",
    summary:
      "Custom agent 'Aave Yield Hawk' awaits one more signature before going live on-chain.",
    metadata: { agent_id: "ca_demo_aave_yield" },
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: "demo_n3",
    category: "rule_change",
    title: "Council rules updated",
    summary: "max_per_protocol_pct increased from 5% to 7% after governance vote.",
    metadata: { version: "0.4" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "demo_n4",
    category: "debate_started",
    title: "New debate live",
    summary: "Proposal #143: Swap 25 ETH -> mUSDC via Uniswap v3 (1% slippage).",
    metadata: { proposal_id: "143" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: "demo_n5",
    category: "debate_completed",
    title: "Debate complete",
    summary: "Proposal #141 closed - SPLIT consensus (2 FOR / 2 AGAINST / 1 ABSTAIN).",
    metadata: { proposal_id: "141" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
  },
];

async function fetchNotifications(address: string): Promise<NotificationListResponse> {
  const res = await fetch(
    `${API_BASE}/api/notifications?address=${encodeURIComponent(address)}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as NotificationListResponse;
}

export function useNotifications(address: string | undefined) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const isDemoMode = !address;

  const queryKey = useMemo(() => ["notifications", address ?? "demo"], [address]);

  const query = useQuery<NotificationListResponse>({
    queryKey,
    queryFn: async () => {
      if (isDemoMode) {
        return {
          notifications: MOCK_NOTIFICATIONS,
          unread_count: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,
        };
      }
      return fetchNotifications(address!);
    },
    staleTime: 1000 * 30,
  });

  // Live WS push - skipped in demo mode (no wallet, no per-address fanout).
  useEffect(() => {
    if (isDemoMode || !address || !API_BASE) return;
    const wsBase = API_BASE.replace(/^http/, "ws");
    const url = `${wsBase}/ws/notifications?address=${encodeURIComponent(address)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);
    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data) as { type?: string } & Partial<Notification>;
        if (payload.type !== "notification") return;
        // Strip the envelope's `type` field so we keep only Notification keys.
        const { type: _envelope, ...note } = payload;
        if (!note.id || !note.category || !note.title) return;
        const incoming = note as Notification;
        queryClient.setQueryData<NotificationListResponse>(queryKey, (prev) => {
          const list = prev?.notifications ?? [];
          const next = [incoming, ...list];
          return {
            notifications: next,
            unread_count: next.filter((n) => !n.read).length,
          };
        });
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [address, isDemoMode, queryClient, queryKey]);

  const markRead = useMutation({
    mutationKey: ["notifications", "read", address ?? "demo"],
    mutationFn: async (ids: string[]) => {
      if (isDemoMode) return { updated: ids.length };
      const res = await fetch(`${API_BASE}/api/notifications/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, ids }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as { updated: number };
    },
    onSuccess: (_data, ids) => {
      queryClient.setQueryData<NotificationListResponse>(queryKey, (prev) => {
        if (!prev) return prev;
        const idSet = new Set(ids);
        const next = prev.notifications.map((n) =>
          idSet.has(n.id) ? { ...n, read: true } : n
        );
        return {
          notifications: next,
          unread_count: next.filter((n) => !n.read).length,
        };
      });
    },
  });

  const markAllRead = useCallback(() => {
    const list = query.data?.notifications ?? [];
    const unreadIds = list.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    markRead.mutate(unreadIds);
  }, [query.data, markRead]);

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    isDemoMode,
    wsConnected,
    markRead: (id: string) => markRead.mutate([id]),
    markAllRead,
    refetch: query.refetch,
  };
}
