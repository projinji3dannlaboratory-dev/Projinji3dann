// Mirror of data-pipeline/tests/test_scoring.py
// Keeps Python and TS scoring implementations in lockstep.
import { describe, expect, it } from "vitest";
import {
  gradeFromScore,
  scoreCompany,
  type IndustryStats,
} from "./score";

const INDUSTRY: IndustryStats = {
  industryCode: 5250,
  avgSalaryYen: 7_000_000,
  avgAgeYears: 40,
  salaryStddevYen: 1_581_138, // approx stddev of [5,6,7,8,9]M
  ageStddevYears: 1.58,
};

const HIGH_PAYING_INDUSTRY: IndustryStats = {
  industryCode: 6050,
  avgSalaryYen: 15_000_000,
  avgAgeYears: 42,
  salaryStddevYen: 1_500_000,
  ageStddevYears: 1.0,
};

const LOW_PAYING_INDUSTRY: IndustryStats = {
  industryCode: 9050,
  avgSalaryYen: 3_500_000,
  avgAgeYears: 44,
  salaryStddevYen: 200_000,
  ageStddevYears: 1.5,
};

describe("gradeFromScore", () => {
  it("S threshold", () => {
    expect(gradeFromScore(95)).toBe("S");
    expect(gradeFromScore(80)).toBe("S");
    expect(gradeFromScore(79.99)).toBe("A");
  });
  it("A/B/C/D thresholds", () => {
    expect(gradeFromScore(65)).toBe("A");
    expect(gradeFromScore(50)).toBe("B");
    expect(gradeFromScore(35)).toBe("C");
    expect(gradeFromScore(34.99)).toBe("D");
  });
});

describe("scoreCompany", () => {
  it("well-paid + young → S", () => {
    const r = scoreCompany(12_000_000, 32, INDUSTRY);
    expect(r).not.toBeNull();
    expect(r!.rawScore).toBeGreaterThan(80);
    expect(r!.grade).toBe("S");
    expect(r!.salaryDeviation).toBeGreaterThan(65);
    expect(r!.ageDeviation).toBeGreaterThan(65);
  });

  it("low-paid + old → C/D", () => {
    const r = scoreCompany(4_000_000, 50, INDUSTRY);
    expect(r).not.toBeNull();
    expect(r!.rawScore).toBeLessThan(50);
    expect(["C", "D"]).toContain(r!.grade);
  });

  it("industry-average inputs → ~42 (700万円 = 42点 absolute, 0 bonus)", () => {
    const r = scoreCompany(7_000_000, 40, INDUSTRY);
    expect(r).not.toBeNull();
    // 700万 / 166,667 ≒ 42, plus 0 industry/age bonuses
    expect(r!.rawScore).toBeGreaterThan(35);
    expect(r!.rawScore).toBeLessThan(50);
    expect(r!.grade).toBe("C");
  });

  it("absolute salary dominates: 2000万円 reaches S regardless of industry", () => {
    const r = scoreCompany(20_000_000, 42, HIGH_PAYING_INDUSTRY);
    expect(r).not.toBeNull();
    expect(r!.grade).toBe("S");
  });

  it("low absolute salary cannot reach S via industry advantage alone", () => {
    // 400万円 in a 350万円 industry, age 30 (much younger than 44 avg)
    const r = scoreCompany(4_000_000, 30, LOW_PAYING_INDUSTRY);
    expect(r).not.toBeNull();
    expect(r!.grade).not.toBe("S");
    expect(r!.rawScore).toBeLessThan(80);
  });

  it("returns null for missing inputs", () => {
    expect(scoreCompany(null, 35, INDUSTRY)).toBeNull();
    expect(scoreCompany(8_000_000, null, INDUSTRY)).toBeNull();
    expect(scoreCompany(8_000_000, 35, null)).toBeNull();
    expect(scoreCompany(8_000_000, 0, INDUSTRY)).toBeNull();
  });

  it("clamps raw_score to [0, 150]", () => {
    const r = scoreCompany(100_000_000, 22, INDUSTRY);
    expect(r!.rawScore).toBeLessThanOrEqual(150);
  });

  it("clamps deviations to [20, 80]", () => {
    const r = scoreCompany(50_000_000, 22, INDUSTRY);
    expect(r!.salaryDeviation).toBeLessThanOrEqual(80);
    expect(r!.ageDeviation).toBeLessThanOrEqual(80);
    const low = scoreCompany(2_000_000, 60, INDUSTRY);
    expect(low!.salaryDeviation).toBeGreaterThanOrEqual(20);
    expect(low!.ageDeviation).toBeGreaterThanOrEqual(20);
  });
});
