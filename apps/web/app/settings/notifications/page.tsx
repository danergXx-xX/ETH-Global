"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DemoBanner } from "@/components/settings";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import type { NotificationCategory } from "@/lib/hooks/useNotifications";

const CATEGORY_PREFS_KEY = "conclave:notification-prefs";

const CATEGORIES: { id: NotificationCategory; label: string; help: string }[] = [
  { id: "verdict", label: "Verdicts", help: "Council reaches a final FOR / AGAINST / SPLIT." },
  { id: "signature", label: "Multisig signatures", help: "Custom agents get signed for go-live." },
  { id: "rule_change", label: "Rule changes", help: "Council rules.json updates after governance vote." },
  { id: "debate_started", label: "New debates", help: "Anyone submits a fresh proposal to the council." },
  { id: "debate_completed", label: "Debate complete", help: "Debate streams finalize and go to vote." },
];

type CategoryFlags = Record<NotificationCategory, boolean>;

const DEFAULT_FLAGS: CategoryFlags = {
  verdict: true,
  signature: true,
  rule_change: true,
  debate_started: true,
  debate_completed: true,
};

export default function NotificationSettingsPage() {
  const { address } = useAccount();
  const { settings, save, isSaving, isDemoMode } = useUserSettings(address);

  const [flags, setFlags] = useState<CategoryFlags>(DEFAULT_FLAGS);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CATEGORY_PREFS_KEY);
      if (raw) setFlags({ ...DEFAULT_FLAGS, ...(JSON.parse(raw) as Partial<CategoryFlags>) });
    } catch {
      // ignore
    }
  }, []);

  const handleToggleAll = (next: boolean) => {
    save({ ...settings, notifications_enabled: next });
  };

  const handleCategory = (cat: NotificationCategory, next: boolean) => {
    const updated = { ...flags, [cat]: next };
    setFlags(updated);
    try {
      window.localStorage.setItem(CATEGORY_PREFS_KEY, JSON.stringify(updated));
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {isDemoMode && <DemoBanner />}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                Per-wallet notification feed for council events.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="notifications-master"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Master
              </Label>
              <Switch
                id="notifications-master"
                checked={settings.notifications_enabled}
                disabled={isDemoMode || isSaving}
                onCheckedChange={handleToggleAll}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-foreground">Per category</h3>
          <p className="text-[11px] text-muted-foreground">
            Category preferences are stored locally so you can mute noisy classes without
            disabling the whole feed.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground">{cat.help}</p>
                </div>
                <Switch
                  aria-label={`Toggle ${cat.label}`}
                  checked={flags[cat.id]}
                  disabled={!settings.notifications_enabled}
                  onCheckedChange={(v) => handleCategory(cat.id, v)}
                />
              </div>
            ))}
          </div>
          {savedAt && (
            <p className="text-[10px] text-vote-for">Preferences saved locally.</p>
          )}
        </CardContent>
      </Card>

      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => save(settings)}
          disabled={isDemoMode || isSaving}
        >
          {isSaving ? "Saving..." : "Resync to server"}
        </Button>
      </div>
    </div>
  );
}
