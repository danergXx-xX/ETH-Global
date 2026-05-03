import type { ReactNode } from "react";

export function LayerDiagram({
  layers,
}: {
  layers: { name: string; stack: string; tone?: "user" | "api" | "ai" | "storage" | "chain" }[];
}) {
  const tones: Record<string, string> = {
    user: "border-blue-500/40 bg-blue-500/5",
    api: "border-emerald-500/40 bg-emerald-500/5",
    ai: "border-violet-500/40 bg-violet-500/5",
    storage: "border-amber-500/40 bg-amber-500/5",
    chain: "border-rose-500/40 bg-rose-500/5",
  };
  return (
    <div className="my-6 space-y-3" role="figure" aria-label="System layer diagram">
      {layers.map((layer, i) => (
        <div key={layer.name} className="flex flex-col items-center">
          <div
            className={`w-full max-w-2xl border-2 rounded-lg px-5 py-3 ${
              tones[layer.tone ?? "user"]
            }`}
          >
            <div className="font-semibold text-sm">{layer.name}</div>
            <div className="text-xs text-muted-foreground mt-1 font-mono">{layer.stack}</div>
          </div>
          {i < layers.length - 1 && (
            <div className="text-muted-foreground/60 text-2xl my-1" aria-hidden>
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function FlowSteps({
  steps,
}: {
  steps: { title: string; detail?: string }[];
}) {
  return (
    <ol className="my-6 space-y-3" role="list">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-mono font-bold">
            {i + 1}
          </div>
          <div className="flex-1 pt-1">
            <div className="font-medium text-sm">{step.title}</div>
            {step.detail && (
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.detail}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CompareTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-secondary/20">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-foreground/90">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
