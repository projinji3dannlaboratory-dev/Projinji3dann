import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYen(yen: number | null | undefined): string {
  if (yen == null) return "—";
  if (yen >= 100_000_000) {
    return `${(yen / 100_000_000).toFixed(2)}億円`;
  }
  if (yen >= 10_000) {
    return `${Math.round(yen / 10_000).toLocaleString()}万円`;
  }
  return `${yen.toLocaleString()}円`;
}

export function formatYenShort(yen: number | null | undefined): string {
  if (yen == null) return "—";
  if (yen >= 10_000_000) {
    return `${(yen / 10_000_000).toFixed(1)}千万`;
  }
  if (yen >= 10_000) {
    return `${Math.round(yen / 10_000).toLocaleString()}万`;
  }
  return `${yen.toLocaleString()}`;
}

export function formatNumber(n: number | null | undefined, digits = 1): string {
  if (n == null) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatPercent(p: number | null | undefined, digits = 1): string {
  if (p == null) return "—";
  return `${(p * 100).toFixed(digits)}%`;
}
