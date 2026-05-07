"use client";

import { motion } from "framer-motion";
import { gradeColor } from "@/lib/score";
import type { Grade } from "@/lib/types";

interface Props {
  score: number | null | undefined;
  grade: Grade | null | undefined;
  size?: number;
  thickness?: number;
  caption?: string;
}

/** Circular progress ring rendered with SVG. */
export function ScoreRing({
  score,
  grade,
  size = 140,
  thickness = 12,
  caption = "独自スコア",
}: Props) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score == null ? 0 : Math.min(100, Math.max(0, score));
  const offset = circumference - (value / 100) * circumference;
  const color = gradeColor(grade);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold tabular-nums">
          {score == null ? "—" : score.toFixed(1)}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {caption}
        </div>
      </div>
    </div>
  );
}
