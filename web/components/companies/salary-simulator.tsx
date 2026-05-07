"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SalaryCurveChart } from "@/components/charts/salary-curve-chart";
import { summarizeSimulation, INDUSTRY_TO_CURVE } from "@/lib/salary-curve";
import { formatYen } from "@/lib/utils";

interface Props {
  avgAge: number;
  avgSalary: number;
  industryCode: number | null;
}

const CURVE_LABEL: Record<string, string> = {
  seniority: "年功型",
  balanced: "バランス型",
  performance: "成果型",
};

export function SalarySimulator({ avgAge, avgSalary, industryCode }: Props) {
  const [age, setAge] = React.useState(30);

  const sim = React.useMemo(
    () => summarizeSimulation(avgAge, avgSalary, industryCode, age),
    [avgAge, avgSalary, industryCode, age],
  );

  const curveType = (industryCode && INDUSTRY_TO_CURVE[industryCode]) || "balanced";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">年収シミュレーション</h3>
        <Badge variant="outline">{CURVE_LABEL[curveType]}カーブ</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        平均値からの推計です。あくまで目安としてご利用ください。
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="sim-age" className="text-sm text-muted-foreground">
          現在の年齢
        </label>
        <Input
          id="sim-age"
          type="number"
          min={20}
          max={65}
          value={age}
          onChange={(e) => setAge(Math.min(65, Math.max(20, Number(e.target.value) || 30)))}
          className="w-24 tabular-nums"
        />
        <span className="text-sm text-muted-foreground">歳の場合</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="5年前" value={sim.past5} muted />
        <Stat label="現在" value={sim.current} highlight />
        <Stat label="5年後" value={sim.future5} />
        <Stat label="10年後" value={sim.future10} />
      </div>

      <div className="mt-2">
        <Stat label="22→65歳 累計（生涯年収）" value={sim.lifetime} wide />
      </div>

      <div className="mt-4">
        <SalaryCurveChart points={sim.curve} highlightAge={age} avgAge={avgAge} />
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight = false,
  muted = false,
  wide = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  muted?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border p-3 " +
        (highlight ? "border-primary bg-primary/5 " : "") +
        (muted ? "opacity-70 " : "") +
        (wide ? "w-full" : "")
      }
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums">{formatYen(value)}</div>
    </div>
  );
}
