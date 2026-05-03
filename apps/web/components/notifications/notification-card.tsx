"use client";

import {
  CheckCircle2Icon,
  PenLineIcon,
  BookOpenIcon,
  PlayIcon,
  FlagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Notification, NotificationCategory } from "@/lib/hooks/useNotifications";

const ICON_MAP: Record<NotificationCategory, typeof CheckCircle2Icon> = {
  verdict: CheckCircle2Icon,
  signature: PenLineIcon,
  rule_change: BookOpenIcon,
  debate_started: PlayIcon,
  debate_completed: FlagIcon,
};

const TONE_MAP: Record<NotificationCategory, string> = {
  verdict: "text-vote-for",
  signature: "text-amber",
  rule_change: "text-tech",
  debate_started: "text-sentiment",
  debate_completed: "text-foreground",
};

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onOpen?: (notification: Notification) => void;
}

export function NotificationCard({
  notification,
  onMarkRead,
  onOpen,
}: NotificationCardProps) {
  const Icon = ICON_MAP[notification.category];
  const tone = TONE_MAP[notification.category];
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), {
    addSuffix: true,
  });

  return (
    <div
      data-testid="notification-card"
      className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${
        notification.read
          ? "border-border bg-card"
          : "border-amber/40 bg-amber/5"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary ${tone}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {notification.title}
          </p>
          {!notification.read && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 text-amber border-amber/40"
            >
              new
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.summary}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/80 uppercase tracking-wider">
          {notification.category.replace("_", " ")} - {timeAgo}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {onOpen && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => onOpen(notification)}
          >
            Open
          </Button>
        )}
        {!notification.read && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => onMarkRead(notification.id)}
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
