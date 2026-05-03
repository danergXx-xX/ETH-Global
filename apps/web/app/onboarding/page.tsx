import type { Metadata } from "next";
import OnboardingFlowClient from "@/components/onboarding/onboarding-flow-client";

export const metadata: Metadata = {
  title: "Onboarding - AI Treasury Council",
  description:
    "Connect, verify, read rules, choose role, submit first proposal.",
};

export default function OnboardingPage() {
  return <OnboardingFlowClient />;
}
