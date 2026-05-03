"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DemoBanner } from "@/components/settings";

const STORAGE_KEY = "conclave:profile";

interface ProfileState {
  display_name: string;
  avatar_url: string;
  bio: string;
}

const EMPTY: ProfileState = { display_name: "", avatar_url: "", bio: "" };

export default function ProfileSettingsPage() {
  const { address } = useAccount();
  const readOnly = !address;
  const [profile, setProfile] = useState<ProfileState>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...EMPTY, ...(JSON.parse(raw) as Partial<ProfileState>) });
    } catch {
      // ignore corrupted state
    }
  }, []);

  const handleSave = () => {
    if (readOnly) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      // ignore quota errors
    }
  };

  return (
    <div className="space-y-4">
      {readOnly && <DemoBanner />}
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <p className="text-xs text-muted-foreground">
            Display preferences shown when you submit proposals or sign multisig actions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              Display name
            </Label>
            <Input
              id="display-name"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value.slice(0, 64) })}
              placeholder="dan.eth"
              maxLength={64}
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar-url" className="text-xs uppercase tracking-wider text-muted-foreground">
              Avatar URL
            </Label>
            <Input
              id="avatar-url"
              value={profile.avatar_url}
              onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              placeholder="https://..."
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value.slice(0, 280) })}
              rows={4}
              maxLength={280}
              placeholder="What do you bring to the council?"
              disabled={readOnly}
            />
            <p className="text-[10px] text-muted-foreground">{profile.bio.length}/280</p>
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="button" size="sm" onClick={handleSave} disabled={readOnly}>
              Save
            </Button>
            {saved && (
              <span className="text-[11px] text-vote-for">Saved locally.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
