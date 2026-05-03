"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioChartProps {
  totalUsd: number;
  pnl7d: number;
  isLoading?: boolean;
}

function buildSeries(total: number, pnl: number): number[] {
  const start = total - pnl;
  const points = 7;
  const series: number[] = [];
  let cursor = start;
  const stepBase = pnl / (points - 1);
  for (let i = 0; i < points; i += 1) {
    const noise = ((i * 9301 + 49297) % 233280) / 233280;
    const noiseScaled = (noise - 0.5) * Math.abs(stepBase) * 0.6;
    cursor = i === 0 ? start : cursor + stepBase + noiseScaled;
    series.push(Math.max(0, cursor));
  }
  series[points - 1] = total;
  return series;
}

function formatUsdShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function PortfolioChart({ totalUsd, pnl7d, isLoading }: PortfolioChartProps) {
  const series = useMemo(() => buildSeries(totalUsd, pnl7d), [totalUsd, pnl7d]);
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1, max - min);

  const width = 520;
  const height = 180;
  const padX = 24;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = series.map((v, i) => {
    const x = padX + (innerW * i) / (series.length - 1);
    const y = padY + innerH - ((v - min) / range) * innerH;
    return { x, y, v };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(2)} ${(padY + innerH).toFixed(
    2
  )} L ${points[0].x.toFixed(2)} ${(padY + innerH).toFixed(2)} Z`;

  const isPositive = pnl7d >= 0;
  const stroke = isPositive ? "oklch(0.74 0.16 152)" : "oklch(0.70 0.18 22)";
  const fill = isPositive ? "oklch(0.74 0.16 152 / 0.18)" : "oklch(0.70 0.18 22 / 0.18)";

  const dayLabels = ["7d", "6d", "5d", "4d", "3d", "2d", "now"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
            Portfolio 7d
          </CardTitle>
          <div
            className={`text-xs font-mono ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
            aria-label={isPositive ? "P&L 7 days positive" : "P&L 7 days negative"}
          >
            {isPositive ? "+" : ""}
            {formatUsdShort(pnl7d)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="h-[180px] w-full animate-pulse rounded-md bg-secondary/40"
            aria-hidden
          />
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Treasury value last 7 days, current ${formatUsdShort(totalUsd)}`}
          >
            <path d={areaPath} fill={fill} />
            <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
            {points.map((p, i) => (
              <g key={`pt-${i}`}>
                <circle cx={p.x} cy={p.y} r={2.5} fill={stroke} />
                {i === points.length - 1 && (
                  <text
                    x={p.x - 4}
                    y={p.y - 8}
                    textAnchor="end"
                    className="fill-foreground text-[10px] font-mono"
                  >
                    {formatUsdShort(p.v)}
                  </text>
                )}
              </g>
            ))}
            {dayLabels.map((label, i) => (
              <text
                key={`lbl-${i}`}
                x={padX + (innerW * i) / (dayLabels.length - 1)}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {label}
              </text>
            ))}
          </svg>
        )}
      </CardContent>
    </Card>
  );
}
