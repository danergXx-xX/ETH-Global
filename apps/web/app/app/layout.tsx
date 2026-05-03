import type { ReactNode } from "react";
import { SiteHeader } from "@/components/shared/site-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
