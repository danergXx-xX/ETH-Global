import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "App - CONCLAVE",
  description: "Live debate viewer, voting, audit trail, ENS identities, council rules.",
};

export default function AppPage() {
  return <DashboardShell />;
}
