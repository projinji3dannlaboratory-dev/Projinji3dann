"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CompanyRadarData {
  axis: string;
  fullMark: number;
  [companyName: string]: number | string;
}

interface Props {
  data: CompanyRadarData[];
  companyNames: string[];
}

const COLORS = [
  "oklch(0.65 0.22 30)",
  "oklch(0.7 0.18 145)",
  "oklch(0.65 0.18 220)",
  "oklch(0.65 0.16 300)",
];

export function CompanyRadarChart({ data, companyNames }: Props) {
  return (
    <ResponsiveContainer width="100%" height={420}>
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: "var(--foreground)" }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
        {companyNames.map((name, i) => (
          <Radar
            key={name}
            name={name}
            dataKey={name}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.25}
            isAnimationActive
          />
        ))}
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
