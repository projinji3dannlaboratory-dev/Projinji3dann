"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatYenShort } from "@/lib/utils";
import type { SimPoint } from "@/lib/salary-curve";

interface Props {
  points: SimPoint[];
  highlightAge?: number;
  avgAge?: number;
}

export function SalaryCurveChart({ points, highlightAge, avgAge }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={points} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="salaryFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.18 220)" stopOpacity={0.6} />
            <stop offset="95%" stopColor="oklch(0.65 0.18 220)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="age" tickFormatter={(v) => `${v}歳`} fontSize={11} stroke="var(--muted-foreground)" />
        <YAxis
          tickFormatter={(v) => formatYenShort(v)}
          fontSize={11}
          stroke="var(--muted-foreground)"
          width={64}
        />
        <Tooltip
          formatter={(v) => [formatYenShort(Number(v)), "推定年収"]}
          labelFormatter={(v) => `${v}歳`}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        {avgAge != null && (
          <ReferenceLine
            x={Math.round(avgAge)}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 2"
            label={{ value: "平均年齢", fontSize: 10, fill: "var(--muted-foreground)" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="estimatedSalary"
          stroke="oklch(0.55 0.18 220)"
          strokeWidth={2}
          fill="url(#salaryFill)"
        />
        {highlightAge != null &&
          points.find((p) => p.age === highlightAge) && (
            <ReferenceDot
              x={highlightAge}
              y={points.find((p) => p.age === highlightAge)!.estimatedSalary}
              r={6}
              fill="oklch(0.65 0.22 30)"
              stroke="white"
              strokeWidth={2}
            />
          )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
