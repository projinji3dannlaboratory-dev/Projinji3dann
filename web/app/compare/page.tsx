import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllCompanies, fetchCompaniesBySecCodes } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/companies/grade-badge";
import { CompanyRadarChart } from "@/components/charts/radar-chart";
import { CompareSearch } from "./compare-search";
import { formatYen, formatNumber } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { CompanyRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "企業比較 (最大4社) - レーダーチャートで横並び",
  description: "上場企業を最大4社まで横並び比較。年収・若さ・スコア・規模を多角的にレーダーチャートで可視化。",
};

interface PageProps {
  searchParams: Promise<{ codes?: string }>;
}

export const revalidate = 86400;

export default async function ComparePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const codes = (sp.codes ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const [selected, all] = await Promise.all([
    codes.length ? fetchCompaniesBySecCodes(codes) : Promise.resolve([] as CompanyRow[]),
    fetchAllCompanies(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="inline-flex items-center gap-1">
            <ArrowLeft className="size-4" /> ランキングへ戻る
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold md:text-3xl">企業比較</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        最大4社まで選択して、年収・若さ・スコア・規模をレーダーチャートで比較できます。
      </p>

      <Card className="mt-4 p-4">
        <CompareSearch all={all} selectedCodes={codes} />
      </Card>

      {selected.length === 0 ? (
        <Card className="mt-6 p-10 text-center text-sm text-muted-foreground">
          上の検索ボックスから企業を追加してください。
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="p-4">
            <CompanyRadarChart
              data={buildRadarData(selected)}
              companyNames={selected.map((c) => c.name_ja)}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              各軸は 0-100 の正規化値（年収レンジ・年齢の若さ・スコア・規模・安定性）
            </p>
          </Card>
          <div className="space-y-3">
            {selected.map((c) => (
              <ComparisonCard key={c.edinet_code} c={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface RadarPoint {
  axis: string;
  fullMark: number;
  [name: string]: number | string;
}

function buildRadarData(rows: CompanyRow[]): RadarPoint[] {
  const axes = [
    { axis: "年収", get: (r: CompanyRow) => Math.min(100, ((r.avg_annual_salary_yen ?? 0) / 20_000_000) * 100) },
    { axis: "若さ", get: (r: CompanyRow) => Math.min(100, Math.max(0, 100 - ((r.avg_age_years ?? 50) - 25) * 2.5)) },
    { axis: "独自スコア", get: (r: CompanyRow) => Math.min(100, r.raw_score ?? 0) },
    { axis: "規模", get: (r: CompanyRow) => Math.min(100, Math.log10((r.employee_count ?? 1) + 1) * 18) },
    { axis: "勤続年数", get: (r: CompanyRow) => Math.min(100, (r.avg_tenure_years ?? 0) * 4) },
  ];

  return axes.map(({ axis, get }) => {
    const point: RadarPoint = { axis, fullMark: 100 };
    for (const r of rows) point[r.name_ja] = Math.round(get(r));
    return point;
  });
}

function ComparisonCard({ c }: { c: CompanyRow }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <GradeBadge grade={c.grade ?? null} />
        <div className="min-w-0">
          <div className="truncate font-semibold">{c.name_ja}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="font-mono">{c.ticker4 ?? "—"}</span>
            {c.market && <Badge variant="muted">{c.market}</Badge>}
          </div>
        </div>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <Row label="平均年収" value={formatYen(c.avg_annual_salary_yen)} />
        <Row label="平均年齢" value={c.avg_age_years != null ? `${formatNumber(c.avg_age_years)}歳` : "—"} />
        <Row label="勤続年数" value={c.avg_tenure_years != null ? `${formatNumber(c.avg_tenure_years)}年` : "—"} />
        <Row label="従業員数" value={c.employee_count?.toLocaleString() ?? "—"} />
        <Row label="独自スコア" value={c.raw_score?.toFixed(1) ?? "—"} />
      </dl>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
