"use client";

import dynamic from "next/dynamic";

// SSR disabled because OnboardingFlow uses wagmi hooks which require
// the WagmiProvider in lib/providers.tsx (mount-gated post hydration).
const OnboardingFlow = dynamic(
  () =>
    import("./onboarding-flow").then((m) => m.OnboardingFlow),
  { ssr: false },
);

export default function OnboardingFlowClient() {
  return <OnboardingFlow />;
}
