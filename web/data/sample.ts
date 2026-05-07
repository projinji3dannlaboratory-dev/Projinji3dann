/**
 * Hand-crafted sample dataset (50 plausible companies) for local dev / preview.
 * Replaced at runtime by data from Supabase once the pipeline has run.
 *
 * Numbers are approximate / illustrative — DO NOT rely on these as facts.
 */
import type { CompanyRow, Grade, Market } from "@/lib/types";
import { gradeFromScore } from "@/lib/score";

interface Seed {
  sec_code: string;
  name_ja: string;
  industry_code: number;
  industry_name: string;
  market: Market;
  hq: string;
  age: number;
  salary: number;
  tenure: number;
  employees: number;
}

const SEEDS: Seed[] = [
  // 情報・通信
  { sec_code: "47550", name_ja: "楽天グループ (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "プライム", hq: "東京都世田谷区", age: 33.6, salary: 7_550_000, tenure: 5.6, employees: 8200 },
  { sec_code: "92020", name_ja: "ANAホールディングス (サンプル)", industry_code: 5150, industry_name: "空運業", market: "プライム", hq: "東京都港区", age: 41.2, salary: 6_300_000, tenure: 17.5, employees: 4100 },
  { sec_code: "67580", name_ja: "ソニーグループ (サンプル)", industry_code: 3650, industry_name: "電気機器", market: "プライム", hq: "東京都港区", age: 42.6, salary: 11_010_000, tenure: 18.5, employees: 9800 },
  { sec_code: "94320", name_ja: "NTT (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "プライム", hq: "東京都千代田区", age: 39.8, salary: 9_120_000, tenure: 16.0, employees: 2500 },
  { sec_code: "94330", name_ja: "KDDI (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "プライム", hq: "東京都千代田区", age: 41.7, salary: 9_540_000, tenure: 17.8, employees: 9200 },
  { sec_code: "94130", name_ja: "ソフトバンク (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "プライム", hq: "東京都港区", age: 41.0, salary: 8_220_000, tenure: 15.0, employees: 19200 },
  { sec_code: "44780", name_ja: "freee (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "グロース", hq: "東京都品川区", age: 33.0, salary: 7_330_000, tenure: 3.2, employees: 1320 },
  { sec_code: "32000", name_ja: "メルカリ (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "プライム", hq: "東京都港区", age: 35.4, salary: 9_550_000, tenure: 3.8, employees: 2050 },
  { sec_code: "44760", name_ja: "AI inside (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "グロース", hq: "東京都渋谷区", age: 33.6, salary: 7_660_000, tenure: 2.8, employees: 200 },
  { sec_code: "44770", name_ja: "BASE (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "グロース", hq: "東京都港区", age: 32.0, salary: 6_400_000, tenure: 3.0, employees: 480 },

  // 銀行・金融
  { sec_code: "83060", name_ja: "三菱UFJフィナンシャル・グループ (サンプル)", industry_code: 7050, industry_name: "銀行業", market: "プライム", hq: "東京都千代田区", age: 39.4, salary: 7_780_000, tenure: 16.5, employees: 2300 },
  { sec_code: "83160", name_ja: "三井住友フィナンシャルグループ (サンプル)", industry_code: 7050, industry_name: "銀行業", market: "プライム", hq: "東京都千代田区", age: 38.9, salary: 8_360_000, tenure: 15.2, employees: 1980 },
  { sec_code: "84110", name_ja: "みずほフィナンシャルグループ (サンプル)", industry_code: 7050, industry_name: "銀行業", market: "プライム", hq: "東京都千代田区", age: 39.1, salary: 7_220_000, tenure: 16.1, employees: 2150 },
  { sec_code: "85910", name_ja: "オリックス (サンプル)", industry_code: 7200, industry_name: "その他金融業", market: "プライム", hq: "東京都港区", age: 41.0, salary: 9_920_000, tenure: 14.4, employees: 2510 },
  { sec_code: "86040", name_ja: "野村ホールディングス (サンプル)", industry_code: 7100, industry_name: "証券、商品先物取引業", market: "プライム", hq: "東京都中央区", age: 41.9, salary: 11_520_000, tenure: 16.4, employees: 14800 },

  // 商社
  { sec_code: "80580", name_ja: "三菱商事 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "プライム", hq: "東京都千代田区", age: 42.7, salary: 21_320_000, tenure: 18.4, employees: 5800 },
  { sec_code: "80020", name_ja: "丸紅 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "プライム", hq: "東京都千代田区", age: 42.5, salary: 16_870_000, tenure: 18.0, employees: 4400 },
  { sec_code: "80310", name_ja: "三井物産 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "プライム", hq: "東京都千代田区", age: 42.1, salary: 17_540_000, tenure: 18.5, employees: 5500 },
  { sec_code: "80010", name_ja: "伊藤忠商事 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "プライム", hq: "東京都港区", age: 42.0, salary: 17_500_000, tenure: 18.2, employees: 4500 },
  { sec_code: "80530", name_ja: "住友商事 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "プライム", hq: "東京都千代田区", age: 43.0, salary: 16_580_000, tenure: 18.7, employees: 5300 },

  // メーカー
  { sec_code: "72030", name_ja: "トヨタ自動車 (サンプル)", industry_code: 3700, industry_name: "輸送用機器", market: "プライム", hq: "愛知県豊田市", age: 39.6, salary: 8_990_000, tenure: 16.5, employees: 70200 },
  { sec_code: "72670", name_ja: "本田技研工業 (サンプル)", industry_code: 3700, industry_name: "輸送用機器", market: "プライム", hq: "東京都港区", age: 44.2, salary: 8_220_000, tenure: 22.0, employees: 33500 },
  { sec_code: "67520", name_ja: "パナソニック (サンプル)", industry_code: 3650, industry_name: "電気機器", market: "プライム", hq: "大阪府門真市", age: 45.0, salary: 8_080_000, tenure: 21.5, employees: 53800 },
  { sec_code: "65010", name_ja: "日立製作所 (サンプル)", industry_code: 3650, industry_name: "電気機器", market: "プライム", hq: "東京都千代田区", age: 42.4, salary: 9_160_000, tenure: 18.5, employees: 28800 },
  { sec_code: "66020", name_ja: "東芝 (サンプル)", industry_code: 3650, industry_name: "電気機器", market: "プライム", hq: "東京都港区", age: 44.8, salary: 8_500_000, tenure: 20.5, employees: 12000 },
  { sec_code: "63010", name_ja: "コマツ (サンプル)", industry_code: 3600, industry_name: "機械", market: "プライム", hq: "東京都港区", age: 41.0, salary: 9_800_000, tenure: 17.0, employees: 11500 },

  // 医薬品
  { sec_code: "45020", name_ja: "武田薬品工業 (サンプル)", industry_code: 3250, industry_name: "医薬品", market: "プライム", hq: "東京都中央区", age: 42.5, salary: 11_010_000, tenure: 14.0, employees: 5800 },
  { sec_code: "45680", name_ja: "第一三共 (サンプル)", industry_code: 3250, industry_name: "医薬品", market: "プライム", hq: "東京都中央区", age: 42.7, salary: 11_180_000, tenure: 16.4, employees: 6300 },
  { sec_code: "45230", name_ja: "エーザイ (サンプル)", industry_code: 3250, industry_name: "医薬品", market: "プライム", hq: "東京都文京区", age: 44.5, salary: 10_590_000, tenure: 18.4, employees: 3100 },

  // 小売
  { sec_code: "31410", name_ja: "ウエルシアホールディングス (サンプル)", industry_code: 6100, industry_name: "小売業", market: "プライム", hq: "東京都千代田区", age: 38.8, salary: 4_490_000, tenure: 9.0, employees: 6800 },
  { sec_code: "33820", name_ja: "セブン&アイ (サンプル)", industry_code: 6100, industry_name: "小売業", market: "プライム", hq: "東京都千代田区", age: 41.2, salary: 7_680_000, tenure: 16.4, employees: 8400 },
  { sec_code: "92830", name_ja: "ヤマダホールディングス (サンプル)", industry_code: 6100, industry_name: "小売業", market: "プライム", hq: "群馬県高崎市", age: 41.3, salary: 4_870_000, tenure: 13.5, employees: 8600 },
  { sec_code: "98430", name_ja: "ニトリホールディングス (サンプル)", industry_code: 6100, industry_name: "小売業", market: "プライム", hq: "札幌市北区", age: 38.4, salary: 9_210_000, tenure: 13.4, employees: 1080 },
  { sec_code: "99830", name_ja: "ファーストリテイリング (サンプル)", industry_code: 6100, industry_name: "小売業", market: "プライム", hq: "山口県山口市", age: 38.6, salary: 11_060_000, tenure: 6.9, employees: 1620 },

  // 不動産
  { sec_code: "88020", name_ja: "三菱地所 (サンプル)", industry_code: 8050, industry_name: "不動産業", market: "プライム", hq: "東京都千代田区", age: 39.8, salary: 12_460_000, tenure: 13.7, employees: 980 },
  { sec_code: "88010", name_ja: "三井不動産 (サンプル)", industry_code: 8050, industry_name: "不動産業", market: "プライム", hq: "東京都中央区", age: 41.7, salary: 12_780_000, tenure: 14.6, employees: 1860 },
  { sec_code: "30890", name_ja: "テクノプロ・ホールディングス (サンプル)", industry_code: 9050, industry_name: "サービス業", market: "プライム", hq: "東京都港区", age: 35.3, salary: 5_280_000, tenure: 5.9, employees: 21000 },

  // 食品
  { sec_code: "25020", name_ja: "アサヒグループHD (サンプル)", industry_code: 3050, industry_name: "食料品", market: "プライム", hq: "東京都墨田区", age: 41.7, salary: 11_240_000, tenure: 18.4, employees: 1100 },
  { sec_code: "25030", name_ja: "キリンHD (サンプル)", industry_code: 3050, industry_name: "食料品", market: "プライム", hq: "東京都中野区", age: 42.6, salary: 9_320_000, tenure: 18.5, employees: 1100 },
  { sec_code: "23020", name_ja: "カゴメ (サンプル)", industry_code: 3050, industry_name: "食料品", market: "プライム", hq: "名古屋市中区", age: 41.4, salary: 7_780_000, tenure: 18.9, employees: 1900 },

  // 建設・電力
  { sec_code: "18010", name_ja: "大成建設 (サンプル)", industry_code: 2050, industry_name: "建設業", market: "プライム", hq: "東京都新宿区", age: 43.0, salary: 9_980_000, tenure: 17.5, employees: 8500 },
  { sec_code: "18020", name_ja: "鹿島建設 (サンプル)", industry_code: 2050, industry_name: "建設業", market: "プライム", hq: "東京都港区", age: 43.6, salary: 11_390_000, tenure: 19.0, employees: 7800 },
  { sec_code: "95030", name_ja: "関西電力 (サンプル)", industry_code: 4050, industry_name: "電気・ガス業", market: "プライム", hq: "大阪市北区", age: 41.8, salary: 8_120_000, tenure: 19.7, employees: 19500 },
  { sec_code: "95010", name_ja: "東京電力HD (サンプル)", industry_code: 4050, industry_name: "電気・ガス業", market: "プライム", hq: "東京都千代田区", age: 44.5, salary: 8_280_000, tenure: 21.3, employees: 31000 },

  // グロース系
  { sec_code: "70110", name_ja: "三井倉庫HD (サンプル)", industry_code: 5200, industry_name: "倉庫・運輸関連業", market: "プライム", hq: "東京都港区", age: 41.0, salary: 7_290_000, tenure: 17.5, employees: 700 },
  { sec_code: "44760", name_ja: "AI inside Tokyo (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "グロース", hq: "東京都渋谷区", age: 32.0, salary: 7_980_000, tenure: 2.4, employees: 95 },
  { sec_code: "70110", name_ja: "テスト商事 (サンプル)", industry_code: 6050, industry_name: "卸売業", market: "スタンダード", hq: "東京都中央区", age: 38.5, salary: 6_500_000, tenure: 12.5, employees: 850 },
  { sec_code: "75320", name_ja: "ドラッグ薬局 (サンプル)", industry_code: 6100, industry_name: "小売業", market: "スタンダード", hq: "東京都新宿区", age: 33.0, salary: 5_800_000, tenure: 7.0, employees: 1200 },
  { sec_code: "75330", name_ja: "未来通信 (サンプル)", industry_code: 5250, industry_name: "情報・通信業", market: "グロース", hq: "東京都品川区", age: 31.5, salary: 6_900_000, tenure: 2.5, employees: 320 },
  { sec_code: "75340", name_ja: "新興バイオ (サンプル)", industry_code: 3250, industry_name: "医薬品", market: "グロース", hq: "横浜市西区", age: 36.5, salary: 7_400_000, tenure: 4.5, employees: 180 },
];

// 簡易な業種集計を生成して、サンプルデータでもスコア・偏差値・ランクが
// 妥当に表示されるようにする。
function buildIndustryAggs() {
  const groups = new Map<number, Seed[]>();
  for (const s of SEEDS) {
    if (!groups.has(s.industry_code)) groups.set(s.industry_code, []);
    groups.get(s.industry_code)!.push(s);
  }

  const aggs = new Map<number, { avgSalary: number; avgAge: number; sdSalary: number; sdAge: number }>();
  for (const [code, group] of groups) {
    const avgSalary = group.reduce((a, b) => a + b.salary, 0) / group.length;
    const avgAge = group.reduce((a, b) => a + b.age, 0) / group.length;
    const sdSalary = stddev(group.map((g) => g.salary), avgSalary);
    const sdAge = stddev(group.map((g) => g.age), avgAge);
    aggs.set(code, { avgSalary, avgAge, sdSalary: Math.max(sdSalary, 1), sdAge: Math.max(sdAge, 0.1) });
  }
  return aggs;
}

function stddev(xs: number[], mean: number): number {
  if (xs.length < 2) return 1;
  const v = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

const aggs = buildIndustryAggs();

function rawScoreFor(s: Seed): number {
  const a = aggs.get(s.industry_code);
  if (!a) return 50;
  return Math.min(150, Math.max(0, (s.salary / a.avgSalary) * (a.avgAge / s.age) * 50));
}

function deviationFor(s: Seed): { salaryDev: number; ageDev: number } {
  const a = aggs.get(s.industry_code);
  if (!a) return { salaryDev: 50, ageDev: 50 };
  const salaryDev = 50 + (10 * (s.salary - a.avgSalary)) / a.sdSalary;
  const ageDev = 50 + (10 * (a.avgAge - s.age)) / a.sdAge;
  return {
    salaryDev: Math.min(80, Math.max(20, salaryDev)),
    ageDev: Math.min(80, Math.max(20, ageDev)),
  };
}

const enriched: CompanyRow[] = SEEDS.map((s) => {
  const raw = rawScoreFor(s);
  const grade: Grade = gradeFromScore(raw);
  const { salaryDev, ageDev } = deviationFor(s);
  const a = aggs.get(s.industry_code);
  const correction = a ? (s.salary / a.avgSalary) * (a.avgAge / s.age) : 1;
  return {
    edinet_code: `E${s.sec_code}`,
    sec_code: s.sec_code,
    ticker4: s.sec_code.slice(0, 4),
    name_ja: s.name_ja,
    name_en: null,
    industry_code: s.industry_code,
    industry_name: s.industry_name,
    market: s.market,
    headquarters: s.hq,
    homepage_url: null,
    fiscal_year: 2024,
    period_end: "2024-03-31",
    avg_age_years: s.age,
    avg_tenure_years: s.tenure,
    avg_annual_salary_yen: s.salary,
    employee_count: s.employees,
    source_url: null,
    raw_score: Math.round(raw * 100) / 100,
    grade,
    salary_deviation: Math.round(salaryDev * 100) / 100,
    age_deviation: Math.round(ageDev * 100) / 100,
    industry_correction: Math.round(correction * 1000) / 1000,
    rank_overall: null,
    rank_in_industry: null,
    rank_in_market: null,
  };
});

const sorted = [...enriched].sort(
  (a, b) => (b.raw_score ?? 0) - (a.raw_score ?? 0),
);
sorted.forEach((c, i) => {
  c.rank_overall = i + 1;
});

// ranks per industry / market
function fillRanks(key: keyof CompanyRow, target: keyof CompanyRow) {
  const groups = new Map<string, CompanyRow[]>();
  for (const c of sorted) {
    const k = String(c[key] ?? "");
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(c);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => (b.raw_score ?? 0) - (a.raw_score ?? 0));
    list.forEach((c, i) => {
      (c as unknown as Record<string, unknown>)[target] = i + 1;
    });
  }
}
fillRanks("industry_code", "rank_in_industry");
fillRanks("market", "rank_in_market");

export const SAMPLE_DATA: CompanyRow[] = sorted;

export const SAMPLE_FISCAL_YEAR = 2024;
