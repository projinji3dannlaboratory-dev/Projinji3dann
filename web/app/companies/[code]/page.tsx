import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAllCompanies, fetchCompany } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBreakdown } from "@/components/companies/score-breakdown";
import { SalarySimulator } from "@/components/companies/salary-simulator";
import { SimilarCompanies } from "@/components/companies/similar-companies";
import { FavoriteButton } from "@/components/companies/favorite-button";
import { InlineAd } from "@/components/ads/ad-slot";
import { JsonLd, breadcrumbJsonLd, companyJsonLd } from "@/components/seo/json-ld";
import { formatNumber, formatYen } from "@/lib/utils";
import { ExternalLink, ArrowLeft, GitCompareArrows } from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const c = await fetchCompany(code);
  if (!c) return { title: `${code} - 該当なし` };

  const title = `${c.name_ja} の平均年収・平均年齢・スコア`;
  const description = `${c.name_ja}（${c.industry_name ?? "業種未分類"}）の平均年収 ${formatYen(c.avg_annual_salary_yen)}・平均年齢 ${formatNumber(c.avg_age_years)}歳。独自スコア ${c.raw_score?.toFixed(1) ?? "—"}（${c.grade ?? "—"}）。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?code=${code}`],
    },
  };
}

export default async function CompanyPage({ params }: PageProps) {
  const { code } = await params;
  const company = await fetchCompany(code);
  if (!company) notFound();

  const all = await fetchAllCompanies();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <JsonLd
        data={[
          companyJsonLd(company),
          breadcrumbJsonLd([
            { name: "ホーム", url: `${base}/` },
            ...(company.industry_name && company.industry_code
              ? [
                  {
                    name: company.industry_name,
                    url: `${base}/industries/${company.industry_code}`,
                  },
                ]
              : []),
            { name: company.name_ja, url: `${base}/companies/${code}` },
          ]),
        ]}
      />
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="inline-flex items-center gap-1">
            <ArrowLeft className="size-4" /> ランキングへ戻る
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <FavoriteButton
            code={company.sec_code ?? company.ticker4 ?? company.edinet_code}
            showLabel
          />
          <Button variant="outline" size="sm" asChild>
            <Link
              href={`/compare?codes=${company.sec_code ?? company.ticker4 ?? company.edinet_code}`}
              className="inline-flex items-center gap-1"
            >
              <GitCompareArrows className="size-4" /> 比較に追加
            </Link>
          </Button>
        </div>
      </div>

      {/* hero */}
      <Card className="overflow-hidden p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {company.market && <Badge>{company.market}</Badge>}
          {company.industry_name && <Badge variant="secondary">{company.industry_name}</Badge>}
          <span className="font-mono text-muted-foreground">
            {company.ticker4 ?? company.sec_code ?? company.edinet_code}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">{company.name_ja}</h1>
        {company.headquarters && (
          <div className="mt-1 text-sm text-muted-foreground">本社: {company.headquarters}</div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Big
            label="平均年収"
            value={formatYen(company.avg_annual_salary_yen)}
          />
          <Big
            label="平均年齢"
            value={
              company.avg_age_years != null
                ? `${formatNumber(company.avg_age_years)}歳`
                : "—"
            }
          />
          <Big
            label="平均勤続年数"
            value={
              company.avg_tenure_years != null
                ? `${formatNumber(company.avg_tenure_years)}年`
                : "—"
            }
          />
          <Big
            label="従業員数"
            value={
              company.employee_count != null
                ? company.employee_count.toLocaleString()
                : "—"
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {company.fiscal_year && <span>FY{company.fiscal_year}</span>}
          {company.period_end && <span>期末: {company.period_end}</span>}
          {company.source_url && (
            <a
              className="inline-flex items-center gap-1 underline"
              href={company.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              EDINET 原本 <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScoreBreakdown row={company} />
        {company.avg_age_years != null && company.avg_annual_salary_yen != null && (
          <SalarySimulator
            avgAge={company.avg_age_years}
            avgSalary={company.avg_annual_salary_yen}
            industryCode={company.industry_code}
          />
        )}
      </div>

      {/* Ad slot: between the data sections and the recommendations */}
      <InlineAd className="my-8" />

      <div className="mt-6">
        <SimilarCompanies current={company} pool={all} />
      </div>
    </div>
  );
}

function Big({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums md:text-2xl">{value}</div>
    </div>
  );
}
