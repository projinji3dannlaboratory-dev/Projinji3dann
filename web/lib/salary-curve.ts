// 年収カーブ・シミュレーション (logistic growth model)
// see docs/salary-curve.md

export type CurveType = "seniority" | "balanced" | "performance";

export interface CurveParams {
  base: number;     // 22歳時点の係数
  peak: number;     // ピーク係数
  k: number;        // 成長の急峻さ
  mid: number;      // 中央値となる年齢
}

export const CURVES: Record<CurveType, CurveParams> = {
  seniority:   { base: 0.50, peak: 1.55, k: 0.16, mid: 40 },
  balanced:    { base: 0.55, peak: 1.45, k: 0.18, mid: 38 },
  performance: { base: 0.60, peak: 1.40, k: 0.22, mid: 35 },
};

// 東証33業種コード → カーブタイプ
export const INDUSTRY_TO_CURVE: Record<number, CurveType> = {
  // 年功型: 銀行・電力・建設・公益寄り
  2050: "seniority",  // 建設
  4050: "seniority",  // 電気・ガス
  5050: "seniority",  // 陸運
  5100: "seniority",  // 海運
  5200: "seniority",  // 倉庫・運輸関連
  7050: "seniority",  // 銀行
  7100: "balanced",   // 証券 (実は成果寄りだが安全側)
  7150: "seniority",  // 保険
  // 成果型: 情報通信・コンサル・証券寄り
  5250: "performance", // 情報・通信
  9050: "performance", // サービス業 (コンサル含む)
  6100: "performance", // 小売 (アパレル等は成果型寄り)
  // それ以外はバランス型
};

export function curveOf(industryCode: number | null | undefined): CurveParams {
  if (!industryCode) return CURVES.balanced;
  const t = INDUSTRY_TO_CURVE[industryCode];
  return CURVES[t ?? "balanced"];
}

/**
 * 年齢→年収係数を返す。
 *   f(age) = base + (peak - base) / (1 + exp(-k * (age - mid)))
 */
export function curveCoefficient(age: number, params: CurveParams): number {
  const { base, peak, k, mid } = params;
  return base + (peak - base) / (1 + Math.exp(-k * (age - mid)));
}

/**
 * 平均年齢・平均年収から、業種カーブにフィットするスケール係数を計算。
 *  scale = avgSalary / f(avgAge)
 */
export function calibrate(
  avgAge: number,
  avgSalary: number,
  params: CurveParams,
): number {
  return avgSalary / curveCoefficient(avgAge, params);
}

export interface SimPoint {
  age: number;
  estimatedSalary: number;
}

/**
 * 22-65歳の推定年収カーブを生成。
 */
export function simulateCurve(
  avgAge: number,
  avgSalary: number,
  industryCode: number | null | undefined,
  startAge = 22,
  endAge = 65,
): SimPoint[] {
  const params = curveOf(industryCode);
  const scale = calibrate(avgAge, avgSalary, params);
  const out: SimPoint[] = [];
  for (let age = startAge; age <= endAge; age++) {
    out.push({
      age,
      estimatedSalary: Math.round(scale * curveCoefficient(age, params)),
    });
  }
  return out;
}

export interface SimSummary {
  curve: SimPoint[];
  estimateAt: (age: number) => number;
  past5: number;
  current: number;
  future5: number;
  future10: number;
  lifetime: number;  // 22-65 sum
}

export function summarizeSimulation(
  avgAge: number,
  avgSalary: number,
  industryCode: number | null | undefined,
  inputAge: number,
): SimSummary {
  const params = curveOf(industryCode);
  const scale = calibrate(avgAge, avgSalary, params);
  const estimateAt = (age: number) =>
    Math.max(0, Math.round(scale * curveCoefficient(age, params)));

  const curve = simulateCurve(avgAge, avgSalary, industryCode);
  const lifetime = curve.reduce((s, p) => s + p.estimatedSalary, 0);

  return {
    curve,
    estimateAt,
    past5: estimateAt(inputAge - 5),
    current: estimateAt(inputAge),
    future5: estimateAt(inputAge + 5),
    future10: estimateAt(inputAge + 10),
    lifetime,
  };
}
