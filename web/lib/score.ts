// Mirror of data-pipeline/src/scoring.py — must stay in sync.
// Used for client-side preview, OGP generation, and explainer UI.

import type { Grade } from "./types";

export interface IndustryStats {
  industryCode: number;
  avgSalaryYen: number;
  avgAgeYears: number;
  salaryStddevYen: number;
  ageStddevYears: number;
}

export interface ScoreResult {
  rawScore: number;
  grade: Grade;
  salaryDeviation: number;
  ageDeviation: number;
  industryCorrection: number;
}

export function gradeFromScore(raw: number): Grade {
  if (raw >= 80) return "S";
  if (raw >= 65) return "A";
  if (raw >= 50) return "B";
  if (raw >= 35) return "C";
  return "D";
}

// 絶対年収の anchor: 1,000万円 = 60点 (B/A境界より少し上)
const SALARY_ANCHOR_YEN_PER_POINT = 10_000_000 / 60;  // ≒ 166,667

/**
 * Salary-anchored score (mirrors data-pipeline/src/scoring.py).
 *
 *   absolute_score = clamp(salary_yen / 166_667, 0, 100)
 *     1,000万円 → 60, 1,500万円 → 90, 2,000万円+ → 100
 *
 *   industry_bonus = clamp((salary_ratio - 1) * 20, -15, 25)
 *   age_bonus      = clamp((age_ratio - 1) * 25, -10, 25)
 *
 *   raw_score = absolute_score + industry_bonus + age_bonus  (0..150)
 *
 * High absolute salary always dominates; industry correction is just a tilt.
 */
export function scoreCompany(
  salaryYen: number | null | undefined,
  ageYears: number | null | undefined,
  industry: IndustryStats | null | undefined,
): ScoreResult | null {
  if (
    salaryYen == null
    || ageYears == null
    || ageYears <= 0
    || !industry
    || industry.avgSalaryYen <= 0
    || industry.avgAgeYears <= 0
  ) {
    return null;
  }

  const absoluteScore = clamp(salaryYen / SALARY_ANCHOR_YEN_PER_POINT, 0, 100);
  const salaryRatio = salaryYen / industry.avgSalaryYen;
  const industryBonus = clamp((salaryRatio - 1) * 20, -15, 25);
  const ageRatio = industry.avgAgeYears / ageYears;
  const ageBonus = clamp((ageRatio - 1) * 25, -10, 25);
  const raw = clamp(absoluteScore + industryBonus + ageBonus, 0, 150);

  const salaryDev = clamp(
    50 + (10 * (salaryYen - industry.avgSalaryYen)) / Math.max(industry.salaryStddevYen, 1),
    20,
    80,
  );
  const ageDev = clamp(
    50 + (10 * (industry.avgAgeYears - ageYears)) / Math.max(industry.ageStddevYears, 0.1),
    20,
    80,
  );

  return {
    rawScore: round(raw, 2),
    grade: gradeFromScore(raw),
    salaryDeviation: round(salaryDev, 2),
    ageDeviation: round(ageDev, 2),
    industryCorrection: round(salaryRatio * ageRatio, 3),
  };
}

export function gradeColor(grade: Grade | null | undefined): string {
  switch (grade) {
    case "S": return "var(--color-grade-s)";
    case "A": return "var(--color-grade-a)";
    case "B": return "var(--color-grade-b)";
    case "C": return "var(--color-grade-c)";
    case "D": return "var(--color-grade-d)";
    default: return "var(--muted-foreground)";
  }
}

export function gradeGradientClass(grade: Grade | null | undefined): string {
  switch (grade) {
    case "S": return "grade-gradient-s";
    case "A": return "grade-gradient-a";
    case "B": return "grade-gradient-b";
    case "C": return "grade-gradient-c";
    case "D": return "grade-gradient-d";
    default: return "bg-muted";
  }
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function round(x: number, digits: number): number {
  const k = 10 ** digits;
  return Math.round(x * k) / k;
}
