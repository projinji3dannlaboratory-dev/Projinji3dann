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

  it("industry-average inputs → ~50", () => {
    const r = scoreCompany(7_000_000, 40, INDUSTRY);
    expect(r).not.toBeNull();
    expect(r!.rawScore).toBeCloseTo(50, 0);
    expect(r!.grade).toBe("B");
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
