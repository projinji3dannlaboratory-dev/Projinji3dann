import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAllCompanies } from "@/lib/queries";
import { INDUSTRIES, industryName } from "@/lib/industries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/companies/grade-badge";
import { InlineAd } from "@/components/ads/ad-slot";
import { formatYen, formatNumber } from "@/lib/utils";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ code: String(i.code) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const name = industryName(Number(code));
  if (!name) return { title: "該当業種なし" };
  return {
    title: `${name} - 業種内年収ランキング`,
    description: `東証33業種「${name}」に分類される上場企業を、平均年収・平均年齢・独自スコアで一覧表示します。`,
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { code: codeStr } = await params;
  const industryCode = Number(codeStr);
  const name = industryName(industryCode);
  if (!name) notFound();

  const all = await fetchAllCompanies();
  const inIndustry = all
    .filter((c) => c.industry_code === industryCode)
    .sort((a, b) => (b.avg_annual_salary_yen ?? 0) - (a.avg_annual_salary_yen ?? 0));

  const salaries = inIndustry
    .map((c) => c.avg_annual_salary_yen)
    .filter((x): x is number => typeof x === "number");
  const ages = inIndustry
    .map((c) => c.avg_age_years)
    .filter((x): x is number => typeof x === "number");
  const avgSalary = salaries.length
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
    : null;
  const avgAge = ages.length
    ? ages.reduce((a, b) => a + b, 0) / ages.length
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/industries" className="inline-flex items-center gap-1">
            <ArrowLeft className="size-4" /> 業種一覧へ戻る
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-xs text-muted-foreground">東証33業種</div>
        <h1 className="text-2xl font-bold md:text-3xl">{name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="所属企業数" value={`${inIndustry.length.toLocaleString()} 社`} />
          <Stat label="業界平均年収" value={formatYen(avgSalary)} />
          <Stat
            label="業界平均年齢"
            value={avgAge != null ? `${formatNumber(avgAge)}歳` : "—"}
          />
          <Stat
            label="トップ年収"
            value={formatYen(salaries.length ? Math.max(...salaries) : null)}
          />
        </div>
      </Card>

      {/* Ad slot: between industry stats and the company list */}
      <InlineAd className="my-6" />

      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_72px_120px_88px_56px] items-center gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <div>順位</div>
          <div>企業</div>
          <div className="text-center">グレード</div>
          <div className="text-right">平均年収</div>
          <div className="text-right">平均年齢</div>
          <div></div>
        </div>
        {inIndustry.map((r, i) => (
          <Link
            key={r.edinet_code}
            href={`/companies/${r.sec_code ?? r.ticker4 ?? r.edinet_code}`}
            className="grid grid-cols-[48px_1fr_72px_120px_88px_56px] items-center gap-2 border-b px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
          >
            <div className="font-mono text-xs text-muted-foreground tabular-nums">
              #{i + 1}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{r.name_ja}</div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono">{r.ticker4 ?? r.sec_code ?? "—"}</span>
                {r.market && <Badge variant="muted">{r.market}</Badge>}
              </div>
            </div>
            <div className="flex justify-center">
              <GradeBadge grade={r.grade ?? null} size="sm" />
            </div>
            <div className="text-right tabular-nums">
              {formatYen(r.avg_annual_salary_yen)}
            </div>
            <div className="text-right tabular-nums">
              {r.avg_age_years != null ? `${formatNumber(r.avg_age_years)}歳` : "—"}
            </div>
            <div className="flex justify-end text-muted-foreground">
              <ArrowUpRight className="size-4" />
            </div>
          </Link>
        ))}
        {inIndustry.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            この業種にはまだデータがありません。
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}
