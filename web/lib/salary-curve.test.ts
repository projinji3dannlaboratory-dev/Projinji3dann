import { describe, expect, it } from "vitest";
import {
  CURVES,
  curveCoefficient,
  curveOf,
  simulateCurve,
  summarizeSimulation,
} from "./salary-curve";

describe("curveCoefficient", () => {
  it("monotonically increases up to mid age, then plateaus", () => {
    const p = CURVES.balanced;
    const at22 = curveCoefficient(22, p);
    const at38 = curveCoefficient(38, p);
    const at60 = curveCoefficient(60, p);
    expect(at22).toBeLessThan(at38);
    expect(at38).toBeLessThan(at60);
    expect(at60).toBeLessThanOrEqual(p.peak);
  });
});

describe("curveOf", () => {
  it("falls back to balanced when industry unknown", () => {
    expect(curveOf(null)).toEqual(CURVES.balanced);
    expect(curveOf(99999)).toEqual(CURVES.balanced);
  });
  it("maps tech industry to performance curve", () => {
    expect(curveOf(5250)).toEqual(CURVES.performance);
  });
  it("maps banking to seniority curve", () => {
    expect(curveOf(7050)).toEqual(CURVES.seniority);
  });
});

describe("simulateCurve calibration", () => {
  it("estimate at avg age equals avg salary (within 1 yen rounding)", () => {
    const avgAge = 40.0;
    const avgSalary = 7_000_000;
    const points = simulateCurve(avgAge, avgSalary, 5250); // performance
    const at40 = points.find((p) => p.age === 40)!;
    expect(Math.abs(at40.estimatedSalary - avgSalary)).toBeLessThan(2);
  });

  it("covers ages 25-55 inclusive (新卒3年目〜役職定年前)", () => {
    const points = simulateCurve(40, 7_000_000, null);
    expect(points[0].age).toBe(25);
    expect(points[points.length - 1].age).toBe(55);
    expect(points.length).toBe(31);
  });
});

describe("summarizeSimulation", () => {
  it("future estimates exceed past for an under-mid-age employee", () => {
    const sim = summarizeSimulation(40, 7_000_000, 5250, 25);
    expect(sim.future5).toBeGreaterThan(sim.past5);
    expect(sim.future10).toBeGreaterThan(sim.future5);
    expect(sim.lifetime).toBeGreaterThan(0);
  });

  it("estimateAt() outside 22-65 range still returns a non-negative number", () => {
    const sim = summarizeSimulation(40, 7_000_000, 5250, 30);
    expect(sim.estimateAt(18)).toBeGreaterThanOrEqual(0);
    expect(sim.estimateAt(75)).toBeGreaterThanOrEqual(0);
  });
});
