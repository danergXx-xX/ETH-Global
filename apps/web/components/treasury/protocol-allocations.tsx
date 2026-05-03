"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProtocolAllocation } from "@/lib/hooks/useTreasuryPortfolio";

interface ProtocolAllocationsProps {
  protocols: ProtocolAllocation[];
  isLoading?: boolean;
}

const SLICE_COLORS = [
  "oklch(0.82 0.14 75)",
  "oklch(0.74 0.16 152)",
  "oklch(0.70 0.18 22)",
  "oklch(0.74 0.15 245)",
  "oklch(0.74 0.16 305)",
  "oklch(0.78 0.14 110)",
  "oklch(0.72 0.15 200)",
  "oklch(0.76 0.13 45)",
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number): {
  x: number;
  y: number;
} {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const startPt = polarToCartesian(cx, cy, r, start);
  const endPt = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${startPt.x.toFixed(2)} ${startPt.y.toFixed(
    2
  )} A ${r} ${r} 0 ${largeArc} 1 ${endPt.x.toFixed(2)} ${endPt.y.toFixed(2)} Z`;
}

function formatUsdShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function ProtocolAllocations({ protocols, isLoading }: ProtocolAllocationsProps) {
  const total = protocols.reduce((acc, p) => acc + p.balance_usd, 0);
  const cx = 90;
  const cy = 90;
  const radius = 78;

  let angle = -Math.PI / 2;
  const slices = protocols.map((p, i) => {
    const pct = total > 0 ? p.balance_usd / total : 0;
    const sweep = pct * Math.PI * 2;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      name: p.name,
      pct,
      apy: p.apy,
      usd: p.balance_usd,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      d: arcPath(cx, cy, radius, start, end),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
          Protocol allocations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="h-[200px] w-full animate-pulse rounded-md bg-secondary/40"
            aria-hidden
          />
        ) : protocols.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active protocol positions.</p>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <svg
              viewBox="0 0 180 180"
              className="h-44 w-44 shrink-0"
              role="img"
              aria-label={`Pie chart of ${protocols.length} protocol positions, total ${formatUsdShort(total)}`}
            >
              {slices.map((s, i) => (
                <path
                  key={`slice-${i}`}
                  d={s.d}
                  fill={s.color}
                  stroke="oklch(0.18 0.02 280)"
                  strokeWidth={1}
                />
              ))}
              <circle cx={cx} cy={cy} r={36} fill="oklch(0.16 0.02 280)" />
              <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono uppercase"
              >
                Deployed
              </text>
              <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-mono font-semibold"
              >
                {formatUsdShort(total)}
              </text>
            </svg>
            <ul className="flex-1 space-y-1.5">
              {slices.map((s, i) => (
                <li
                  key={`leg-${i}`}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="truncate font-mono">{s.name}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {(s.pct * 100).toFixed(1)}% / {s.apy.toFixed(2)}% APY
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
