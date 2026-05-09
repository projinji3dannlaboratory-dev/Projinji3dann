"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SalaryCurveChart } from "@/components/charts/salary-curve-chart";
import {
  summarizeSimulation,
  INDUSTRY_TO_CURVE,
  SIM_START_AGE,
  SIM_END_AGE,
} from "@/lib/salary-curve";
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
        {SIM_START_AGE}〜{SIM_END_AGE}歳の範囲で推計します。
        新卒採用 ({SIM_START_AGE}歳未満) と役職定年後 ({SIM_END_AGE}歳超) は
        平均値からの予測精度が落ちるため除外しています。
      </p>

      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="sim-age" className="text-sm text-muted-foreground">
          現在の年齢
        </label>
        <Input
          id="sim-age"
          type="number"
          min={SIM_START_AGE}
          max={SIM_END_AGE}
          value={age}
          onChange={(e) =>
            setAge(
              Math.min(
                SIM_END_AGE,
                Math.max(SIM_START_AGE, Number(e.target.value) || SIM_START_AGE + 5),
              ),
            )
          }
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
        <Stat
          label={`${SIM_START_AGE}→${SIM_END_AGE}歳 累計（生涯年収）`}
          value={sim.lifetime}
          wide
        />
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
