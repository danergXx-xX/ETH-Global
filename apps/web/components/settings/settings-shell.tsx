"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  UserIcon,
  GlobeIcon,
  BellIcon,
  PaletteIcon,
  ScrollIcon,
  CpuIcon,
  SkullIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsTab {
  href: string;
  label: string;
  description: string;
  Icon: typeof UserIcon;
}

const SETTINGS_TABS: SettingsTab[] = [
  {
    href: "/settings/profile",
    label: "Profile",
    description: "Display name, avatar, bio",
    Icon: UserIcon,
  },
  {
    href: "/settings/ens",
    label: "ENS",
    description: "Linked ENS name + records",
    Icon: GlobeIcon,
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    description: "Per-category enable/disable",
    Icon: BellIcon,
  },
  {
    href: "/settings/theme",
    label: "Theme",
    description: "Dark, light, conclave",
    Icon: PaletteIcon,
  },
  {
    href: "/settings/rules",
    label: "Council rules",
    description: "Treasury caps + governance",
    Icon: ScrollIcon,
  },
  {
    href: "/settings/agents",
    label: "Custom agents",
    description: "Personas + multisig",
    Icon: CpuIcon,
  },
  {
    href: "/settings/danger",
    label: "Danger zone",
    description: "Disconnect, delete data",
    Icon: SkullIcon,
  },
];

interface SettingsShellProps {
  children: ReactNode;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = SETTINGS_TABS.find((t) => pathname?.startsWith(t.href)) ??
    SETTINGS_TABS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-base font-bold tracking-wider">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Per-wallet preferences for the AI Treasury Council. Demo mode is read-only.
        </p>
      </div>

      <div className="md:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <activeTab.Icon className="h-4 w-4" />
            {activeTab.label}
          </span>
          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform", mobileOpen && "rotate-180")}
          />
        </button>
        {mobileOpen && (
          <Card className="mt-2">
            <CardContent className="p-2">
              {SETTINGS_TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-xs",
                    pathname?.startsWith(tab.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  )}
                >
                  <tab.Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <nav className="sticky top-20 space-y-1" aria-label="Settings sections">
            {SETTINGS_TABS.map((tab) => {
              const isActive = pathname?.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-start gap-2 rounded-md px-2 py-2 text-xs transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <tab.Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{tab.label}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {tab.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
