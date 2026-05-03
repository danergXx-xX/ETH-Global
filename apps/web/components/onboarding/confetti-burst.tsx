"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
}

const COLORS = [
  "oklch(0.82 0.14 75)",
  "oklch(0.74 0.16 152)",
  "oklch(0.70 0.18 22)",
  "oklch(0.74 0.15 245)",
  "oklch(0.74 0.16 305)",
];

/**
 * CSS-only confetti animation (no canvas-confetti dep).
 * Renders 60 particles falling from top with staggered delays.
 * Auto-cleans after 3.5 seconds.
 */
export function ConfettiBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    const next: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.5 + Math.random() * 1,
      rotate: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
    }));
    setParticles(next);
    const timeout = window.setTimeout(() => setParticles([]), 3_800);
    return () => window.clearTimeout(timeout);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] block h-2.5 w-2.5 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}
