import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllCompanies } from "@/lib/queries";
import { INDUSTRIES } from "@/lib/industries";
import { Card } from "@/components/ui/card";
import { formatYen, formatNumber } from "@/lib/utils";
import { ArrowUpRight, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "業種別ランキング (東証33業種)",
  description:
    "東証33業種ごとに、平均年収・平均年齢・所属企業数を集計。業種クリックで業種内ランキングを表示。",
};

export const revalidate = 86400;

export default async function IndustriesPage() {
  const all = await fetchAllCompanies();

  const stats = INDUSTRIES.map((i) => {
    const group = all.filter((c) => c.industry_code === i.code);
    const salaries = group
      .map((c) => c.avg_annual_salary_yen)
      .filter((x): x is number => typeof x === "number");
    const ages = group
      .map((c) => c.avg_age_years)
      .filter((x): x is number => typeof x === "number");
    const avgSalary = salaries.length
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : null;
    const avgAge = ages.length
      ? ages.reduce((a, b) => a + b, 0) / ages.length
      : null;
    return {
      code: i.code,
      name: i.name,
      count: group.length,
      avgSalary,
      avgAge,
    };
  }).sort((a, b) => (b.avgSalary ?? 0) - (a.avgSalary ?? 0));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-bold md:text-3xl">業種別ランキング</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        東証33業種の平均年収・平均年齢を集計。業種をクリックすると、その業種内のランキングを表示します。
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, idx) => (
          <Link key={s.code} href={`/industries/${s.code}`}>
            <Card className="group h-full p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground tabular-nums">
                    #{idx + 1}
                  </div>
                  <div className="text-base font-semibold">{s.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Users className="size-3" />
                    {s.count.toLocaleString()} 社
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    平均年収
                  </div>
                  <div className="font-semibold tabular-nums">
                    {formatYen(s.avgSalary)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    平均年齢
                  </div>
                  <div className="font-semibold tabular-nums">
                    {s.avgAge != null ? `${formatNumber(s.avgAge)}歳` : "—"}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
