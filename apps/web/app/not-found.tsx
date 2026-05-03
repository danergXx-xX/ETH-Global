import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4 font-mono">
          404
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The route you tried does not exist. It may have moved, or it may ship in a future phase.
          Start with the dashboard or the architecture overview.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/70 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/architecture"
            className="px-4 py-2 rounded-md border border-border hover:bg-secondary/50 transition-colors"
          >
            Architecture
          </Link>
          <Link
            href="/risks-roadmap"
            className="px-4 py-2 rounded-md border border-border hover:bg-secondary/50 transition-colors"
          >
            Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}
