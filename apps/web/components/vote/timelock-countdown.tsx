"use client";

import { useEffect, useState } from "react";

interface TimelockCountdownProps {
  etaTimestamp: number;
  delaySeconds: number;
  size?: number;
}

export function TimelockCountdown({
  etaTimestamp,
  delaySeconds,
  size = 140,
}: TimelockCountdownProps) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, etaTimestamp - now);
  const progress = delaySeconds > 0 ? 1 - remaining / delaySeconds : 1;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const totalHours = Math.floor(delaySeconds / 3600);

  const r = (size - 12) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - clampedProgress);

  const isDone = remaining === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="oklch(0.25 0.030 255)"
          strokeWidth={8}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isDone ? "oklch(0.74 0.16 152)" : "oklch(0.82 0.14 75)"}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="font-mono text-lg font-bold text-foreground">
          {hours}h {minutes.toString().padStart(2, "0")}m
        </span>
        <span className="text-[10px] text-muted-foreground">
          {isDone ? "Ready to execute" : `remaining of ${totalHours}h delay`}
        </span>
      </div>
      {!isDone && (
        <p className="text-xs text-muted-foreground font-mono">
          ETA {new Date(etaTimestamp * 1000).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
