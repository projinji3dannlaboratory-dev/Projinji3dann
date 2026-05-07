"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  formatLabel?: (n: number) => string;
  className?: string;
}

/**
 * Simple two-thumb range slider built on two native inputs.
 * Avoids extra deps; good enough for our filter UX.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (n) => String(n),
  className,
}: RangeSliderProps) {
  const [lo, hi] = value;
  const onLo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), hi - step);
    onChange([v, hi]);
  };
  const onHi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), lo + step);
    onChange([lo, v]);
  };

  const trackPct = ((lo - min) / (max - min)) * 100;
  const fillPct = ((hi - lo) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-7">
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded bg-muted" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-primary"
          style={{ left: `${trackPct}%`, width: `${fillPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={onLo}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={onHi}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatLabel(lo)}</span>
        <span>{formatLabel(hi)}</span>
      </div>
    </div>
  );
}
