"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function WalletButton() {
  const [content, setContent] = useState<ReactNode>(
    <Button variant="outline" size="sm" disabled>
      Connect wallet
    </Button>
  );

  useEffect(() => {
    import("@rainbow-me/rainbowkit").then((mod) => {
      const CB = mod.ConnectButton;
      setContent(
        <CB showBalance={false} chainStatus="icon" accountStatus="avatar" />
      );
    });
  }, []);

  return <>{content}</>;
}
