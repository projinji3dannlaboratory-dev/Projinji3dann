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

  const salaryRatio = salaryYen / industry.avgSalaryYen;
  const ageRatio = industry.avgAgeYears / ageYears;
  const raw = clamp(salaryRatio * ageRatio * 50, 0, 150);

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
