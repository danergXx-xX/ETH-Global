"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BellIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NotificationsInbox } from "./inbox";
import { cn } from "@/lib/utils";

interface InboxBellProps {
  className?: string;
}

export function InboxBell({ className }: InboxBellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <InboxBellPlaceholder className={className} />;
  }
  return <InboxBellInner className={className} />;
}

function InboxBellPlaceholder({ className }: InboxBellProps) {
  return (
    <button
      type="button"
      aria-label="Open notifications"
      disabled
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground opacity-60",
        className
      )}
    >
      <BellIcon className="h-4 w-4" />
    </button>
  );
}

function InboxBellInner({ className }: InboxBellProps) {
  const { address } = useAccount();
  const { unreadCount } = useNotifications(address);
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Open notifications, ${unreadCount} unread`
              : "Open notifications"
          }
          className={cn(
            "relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            className
          )}
        >
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber px-1 text-[9px] font-mono font-semibold text-background"
              aria-hidden
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full max-w-md flex-col">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-2 flex-1 overflow-hidden">
          <NotificationsInbox />
        </div>
      </SheetContent>
    </Sheet>
  );
}
