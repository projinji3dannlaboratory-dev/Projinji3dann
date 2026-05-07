import { fetchAllCompanies } from "@/lib/queries";
import { FiltersPanel } from "@/components/companies/filters-panel";
import { RankingList } from "@/components/companies/ranking-list";

// Industries (Tokyo SE 33 sectors)
const INDUSTRIES: { code: number; name: string }[] = [
  { code: 50, name: "水産・農林業" },
  { code: 1050, name: "鉱業" },
  { code: 2050, name: "建設業" },
  { code: 3050, name: "食料品" },
  { code: 3100, name: "繊維製品" },
  { code: 3150, name: "パルプ・紙" },
  { code: 3200, name: "化学" },
  { code: 3250, name: "医薬品" },
  { code: 3300, name: "石油・石炭製品" },
  { code: 3350, name: "ゴム製品" },
  { code: 3400, name: "ガラス・土石製品" },
  { code: 3450, name: "鉄鋼" },
  { code: 3500, name: "非鉄金属" },
  { code: 3550, name: "金属製品" },
  { code: 3600, name: "機械" },
  { code: 3650, name: "電気機器" },
  { code: 3700, name: "輸送用機器" },
  { code: 3750, name: "精密機器" },
  { code: 3800, name: "その他製品" },
  { code: 4050, name: "電気・ガス業" },
  { code: 5050, name: "陸運業" },
  { code: 5100, name: "海運業" },
  { code: 5150, name: "空運業" },
  { code: 5200, name: "倉庫・運輸関連業" },
  { code: 5250, name: "情報・通信業" },
  { code: 6050, name: "卸売業" },
  { code: 6100, name: "小売業" },
  { code: 7050, name: "銀行業" },
  { code: 7100, name: "証券、商品先物取引業" },
  { code: 7150, name: "保険業" },
  { code: 7200, name: "その他金融業" },
  { code: 8050, name: "不動産業" },
  { code: 9050, name: "サービス業" },
];

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
