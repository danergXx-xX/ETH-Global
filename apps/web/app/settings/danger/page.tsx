"use client";

import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

const PROFILE_KEYS = [
  "conclave:profile",
  "conclave:notification-prefs",
];

export default function DangerSettingsPage() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [confirmStep, setConfirmStep] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }
    try {
      PROFILE_KEYS.forEach((key) => window.localStorage.removeItem(key));
      setCleared(true);
      setConfirmStep(false);
      window.setTimeout(() => setCleared(false), 2200);
    } catch {
      // ignore quota / disabled storage
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-vote-against/40 bg-vote-against/5">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangleIcon className="h-4 w-4 mt-0.5 text-vote-against" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Danger zone</h2>
              <p className="text-xs text-muted-foreground">
                Destructive actions. Demo only - no on-chain state is removed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-foreground">Disconnect wallet</h3>
          <p className="text-xs text-muted-foreground">
            Drops the local wagmi session. You can reconnect at any time.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            disabled={!address}
          >
            {address ? "Disconnect" : "No wallet connected"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="text-sm font-semibold text-foreground">Clear local profile data</h3>
          <p className="text-xs text-muted-foreground">
            Removes locally-stored profile, notification preferences, and onboarding state.
            Server-side settings are not touched here.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={confirmStep ? "destructive" : "outline"}
              size="sm"
              onClick={handleClear}
            >
              {confirmStep ? "Confirm clear" : "Clear local data"}
            </Button>
            {confirmStep && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmStep(false)}
              >
                Cancel
              </Button>
            )}
            {cleared && <span className="text-[11px] text-vote-for">Local data cleared.</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
