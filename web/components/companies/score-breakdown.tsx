import { Card } from "@/components/ui/card";
import type { CompanyRow } from "@/lib/types";
import { ScoreRing } from "./score-ring";
import { GradeBadge } from "./grade-badge";
import { formatNumber } from "@/lib/utils";

interface Props {
  row: CompanyRow;
}

export function ScoreBreakdown({ row }: Props) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-6">
        <ScoreRing score={row.raw_score} grade={row.grade} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GradeBadge grade={row.grade ?? null} size="md" />
            <span className="text-sm text-muted-foreground">
              {row.grade
                ? gradeMessage(row.grade)
                : "スコア算出に必要なデータが不足しています"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Bar label="年収偏差値" value={row.salary_deviation ?? 50} />
            <Bar
              label="年齢偏差値 (若さ)"
              value={row.age_deviation ?? 50}
              colorVar="oklch(0.7 0.18 145)"
            />
            <Bar
              label="業界補正"
              value={Math.min(100, (row.industry_correction ?? 1) * 50)}
              raw={`×${formatNumber(row.industry_correction ?? 1, 2)}`}
              colorVar="oklch(0.65 0.22 30)"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
        <Metric
          label="業界内ランク"
          value={
            row.rank_in_industry != null
              ? `#${row.rank_in_industry.toLocaleString()} / ${row.industry_name ?? "-"}`
              : "—"
          }
        />
        <Metric
          label="市場内ランク"
          value={
            row.rank_in_market != null
              ? `#${row.rank_in_market.toLocaleString()} / ${row.market ?? "-"}`
              : "—"
          }
        />
        <Metric
          label="総合ランク"
          value={
            row.rank_overall != null
              ? `#${row.rank_overall.toLocaleString()}`
              : "—"
          }
        />
      </div>
    </Card>
  );
}

function gradeMessage(grade: string): string {
  switch (grade) {
    case "S":
      return "業種内で年収・若さの両軸でトップクラス";
    case "A":
      return "業種内でも上位の若くて年収が高い企業";
    case "B":
      return "業種平均以上の水準";
    case "C":
      return "業種平均をやや下回る水準";
    case "D":
      return "業種内でやや下位";
    default:
      return "";
  }
}

function Bar({
  label,
  value,
  colorVar = "oklch(0.65 0.18 220)",
  raw,
}: {
  label: string;
  value: number;
  colorVar?: string;
  raw?: string;
}) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{raw ?? value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded bg-muted">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${w}%`, background: colorVar }}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
