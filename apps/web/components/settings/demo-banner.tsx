"use client";

import { Card, CardContent } from "@/components/ui/card";

interface DemoBannerProps {
  message?: string;
}

export function DemoBanner({
  message = "Demo mode: connect your wallet to save changes.",
}: DemoBannerProps) {
  return (
    <Card className="mb-3 border-amber/40 bg-amber/5">
      <CardContent className="p-3">
        <p className="text-xs text-amber">{message}</p>
      </CardContent>
    </Card>
  );
}
