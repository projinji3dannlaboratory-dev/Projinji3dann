import { fetchAllCompanies } from "@/lib/queries";
import { FiltersPanel } from "@/components/companies/filters-panel";
import { RankingList } from "@/components/companies/ranking-list";
import { INDUSTRIES } from "@/lib/industries";

export const revalidate = 86400; // ISR: re-render at most once per day

export default async function HomePage() {
  const rows = await fetchAllCompanies();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <Hero count={rows.length} />
      <div className="my-6">
        <FiltersPanel industries={INDUSTRIES} />
      </div>
      <RankingList rows={rows} />
    </div>
  );
}

function Hero({ count }: { count: number }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-500/10 via-pink-500/5 to-sky-500/10 p-6 md:p-10">
      <div className="absolute -right-12 -top-12 size-64 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-12 size-72 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="relative">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          若くして高年収を実現している<br className="md:hidden" />
          上場企業ランキング
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          有価証券報告書の開示データから、平均年収・平均年齢・独自スコアを業種補正しランキング表示します。
          掲載: <span className="font-semibold tabular-nums text-foreground">{count.toLocaleString()}</span> 社
        </p>
      </div>
    </section>
  );
}
