"use client";

import type { AgentPersona } from "@/lib/types";
import { AGENTS } from "@/lib/types";

interface AgentPortraitProps {
  persona: AgentPersona;
  size?: number;
}

export function AgentPortrait({ persona, size = 40 }: AgentPortraitProps) {
  const agent = AGENTS.find((a) => a.persona === persona);
  const hue = agent?.color.hue ?? 0;
  const r = size / 2;
  const initial = persona.charAt(0).toUpperCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={persona}
    >
      <circle
        cx={r}
        cy={r}
        r={r}
        fill={`oklch(0.28 0.10 ${hue})`}
      />
      <circle
        cx={r}
        cy={r}
        r={r - 2}
        fill="none"
        stroke={`oklch(0.55 0.12 ${hue})`}
        strokeWidth={1.5}
      />
      <text
        x={r}
        y={r}
        textAnchor="middle"
        dominantBaseline="central"
        fill={`oklch(0.90 0.08 ${hue})`}
        fontSize={size * 0.42}
        fontFamily="var(--font-sans)"
        fontWeight={600}
      >
        {initial}
      </text>
    </svg>
  );
}
