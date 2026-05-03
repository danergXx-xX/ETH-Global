import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coming Soon - AI Treasury Council",
  description: "This feature ships in a future phase.",
};

interface PageProps {
  searchParams?: Promise<{ feature?: string; phase?: string }>;
}

export default async function ComingSoonPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const feature = params.feature ?? "This feature";
  const phase = params.phase ?? "an upcoming phase";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4 font-mono">
          Roadmap
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Coming soon</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          <span className="font-semibold text-foreground">{feature}</span> ships in {phase}.{" "}
          See the{" "}
          <Link href="/risks-roadmap" className="underline hover:text-foreground">
            roadmap
          </Link>{" "}
          for the full plan.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/70 transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href="/architecture"
            className="px-4 py-2 rounded-md border border-border hover:bg-secondary/50 transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </div>
    </div>
  );
}
