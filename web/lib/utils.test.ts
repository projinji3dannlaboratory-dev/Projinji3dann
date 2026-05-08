import { describe, expect, it } from "vitest";
import { formatYen, formatYenShort, formatNumber, formatPercent } from "./utils";

describe("formatYen", () => {
  it("returns em-dash for null/undefined", () => {
    expect(formatYen(null)).toBe("—");
    expect(formatYen(undefined)).toBe("—");
  });
  it("formats sub-万 amounts as raw 円", () => {
    expect(formatYen(9999)).toBe("9,999円");
  });
  it("formats 万円 range", () => {
    expect(formatYen(8_500_000)).toBe("850万円");
    expect(formatYen(7_500_000)).toBe("750万円");
  });
  it("formats 億円 range", () => {
    expect(formatYen(123_400_000)).toBe("1.23億円");
    expect(formatYen(2_500_000_000)).toBe("25.00億円");
  });
});

describe("formatNumber", () => {
  it("returns em-dash for null", () => {
    expect(formatNumber(null)).toBe("—");
  });
  it("respects digits arg", () => {
    expect(formatNumber(41.234, 1)).toBe("41.2");
    expect(formatNumber(41.234, 2)).toBe("41.23");
  });
});

describe("formatPercent", () => {
  it("formats fraction as %", () => {
    expect(formatPercent(0.123)).toBe("12.3%");
  });
});

describe("formatYenShort", () => {
  it("returns em-dash for null", () => {
    expect(formatYenShort(null)).toBe("—");
  });
  it("formats abbreviated", () => {
    expect(formatYenShort(8_500_000)).toBe("850万");
    expect(formatYenShort(50_000_000)).toBe("5.0千万");
  });
});
