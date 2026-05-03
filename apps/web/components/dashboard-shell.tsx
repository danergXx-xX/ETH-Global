"use client";

import dynamic from "next/dynamic";

// SSR disabled because dashboard uses wagmi hooks (useAccount, useReadContract)
// and the WagmiProvider is mount-gated post hydration in lib/providers.tsx.
const DashboardContent = dynamic(
  () => import("./dashboard-content"),
  { ssr: false },
);

const OnboardingGateClient = dynamic(
  () =>
    import("@/components/onboarding/onboarding-gate").then(
      (m) => m.OnboardingGate,
    ),
  { ssr: false },
);

export default function DashboardShell() {
  return (
    <>
      <OnboardingGateClient />
      <DashboardContent />
    </>
  );
}
