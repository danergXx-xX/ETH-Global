"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationCard } from "./notification-card";
import { useNotifications } from "@/lib/hooks/useNotifications";

type FilterKey = "all" | "unread" | "verdict" | "signature" | "rule_change" | "debate";

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "verdict", label: "Verdicts" },
  { key: "signature", label: "Sigs" },
  { key: "rule_change", label: "Rules" },
  { key: "debate", label: "Debates" },
];

export function NotificationsInbox() {
  const { address } = useAccount();
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isDemoMode,
    wsConnected,
    markRead,
    markAllRead,
  } = useNotifications(address);

  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "debate")
      return notifications.filter(
        (n) => n.category === "debate_started" || n.category === "debate_completed"
      );
    return notifications.filter((n) => n.category === filter);
  }, [filter, notifications]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-[10px] text-muted-foreground">
              {isDemoMode
                ? "Demo mode - sample feed"
                : wsConnected
                  ? "Live updates connected"
                  : "Live updates offline"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-[11px]"
          >
            Mark all read
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_LABELS.map((opt) => {
            const isActive = filter === opt.key;
            const count =
              opt.key === "unread"
                ? unreadCount
                : opt.key === "all"
                  ? notifications.length
                  : opt.key === "debate"
                    ? notifications.filter(
                        (n) =>
                          n.category === "debate_started" ||
                          n.category === "debate_completed"
                      ).length
                    : notifications.filter((n) => n.category === opt.key).length;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-amber bg-amber/10 text-amber"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
                <Badge
                  variant="outline"
                  className="border-transparent bg-secondary px-1 py-0 text-[9px] text-foreground"
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 py-3 pr-2">
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full" />
              ))}
            </div>
          )}
          {isError && (
            <p className="text-xs text-vote-against">
              Could not load notifications. Try refreshing.
            </p>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center">
              <p className="text-xs text-muted-foreground">No notifications match this filter.</p>
              {isDemoMode && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Connect your wallet to receive live council updates.
                </p>
              )}
            </div>
          )}
          {filtered.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
