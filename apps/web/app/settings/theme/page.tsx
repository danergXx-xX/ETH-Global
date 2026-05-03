"use client";

import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DemoBanner } from "@/components/settings";
import { useUserSettings, type ThemeChoice } from "@/lib/hooks/useUserSettings";

const THEME_OPTIONS: { value: ThemeChoice; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Default high-contrast dark mode." },
  { value: "light", label: "Light", description: "Soft light mode for daytime use." },
  { value: "conclave", label: "Conclave", description: "Navy + amber tuned for the dashboard." },
];

export default function ThemeSettingsPage() {
  const { address } = useAccount();
  const { settings, save, isSaving, isDemoMode } = useUserSettings(address);

  return (
    <div className="space-y-4">
      {isDemoMode && <DemoBanner />}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Theme</h2>
            <p className="text-xs text-muted-foreground">
              Theme is persisted per wallet via the user settings API. Visual switch ships in a
              follow-up; for now this updates the saved preference.
            </p>
          </div>
          <RadioGroup
            value={settings.theme}
            onValueChange={(value) => save({ ...settings, theme: value as ThemeChoice })}
            className="grid gap-2 sm:grid-cols-3"
          >
            {THEME_OPTIONS.map((opt) => (
              <Label
                key={opt.value}
                htmlFor={`theme-${opt.value}`}
                className={`flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-xs ${
                  settings.theme === opt.value
                    ? "border-amber bg-amber/5"
                    : "border-border hover:border-amber/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem id={`theme-${opt.value}`} value={opt.value} />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{opt.description}</span>
              </Label>
            ))}
          </RadioGroup>
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
        </CardContent>
      </Card>
    </div>
  );
}
