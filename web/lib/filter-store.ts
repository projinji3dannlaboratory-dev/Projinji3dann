"use client";

import { create } from "zustand";

export type SortKey =
  | "raw_score"
  | "salary"
  | "age_asc"
  | "age_desc"
  | "tenure"
  | "headcount"
  | "name";

export type ViewMode = "table" | "card";

export interface FilterState {
  query: string;
  market: string;            // "" for all, or 'プライム' | 'スタンダード' | 'グロース'
  industryCode: number | "";  // "" for all
  salaryRange: [number, number];   // 万円
  ageRange: [number, number];       // 年
  tenureMin: number;                // 年
  headcountMin: number;
  sort: SortKey;
  view: ViewMode;
  setQuery: (q: string) => void;
  setMarket: (m: string) => void;
  setIndustryCode: (c: number | "") => void;
  setSalaryRange: (r: [number, number]) => void;
  setAgeRange: (r: [number, number]) => void;
  setTenureMin: (n: number) => void;
  setHeadcountMin: (n: number) => void;
  setSort: (s: SortKey) => void;
  setView: (v: ViewMode) => void;
  reset: () => void;
}

export const SALARY_MIN = 200;     // 万円
export const SALARY_MAX = 3000;    // 万円
export const AGE_MIN = 20;
export const AGE_MAX = 60;

export const initial = {
  query: "",
  market: "",
  industryCode: "" as number | "",
  salaryRange: [SALARY_MIN, SALARY_MAX] as [number, number],
  ageRange: [AGE_MIN, AGE_MAX] as [number, number],
  tenureMin: 0,
  headcountMin: 0,
  sort: "raw_score" as SortKey,
  view: "table" as ViewMode,
};

export const useFilters = create<FilterState>((set) => ({
  ...initial,
  setQuery: (q) => set({ query: q }),
  setMarket: (m) => set({ market: m }),
  setIndustryCode: (c) => set({ industryCode: c }),
  setSalaryRange: (r) => set({ salaryRange: r }),
  setAgeRange: (r) => set({ ageRange: r }),
  setTenureMin: (n) => set({ tenureMin: n }),
  setHeadcountMin: (n) => set({ headcountMin: n }),
  setSort: (s) => set({ sort: s }),
  setView: (v) => set({ view: v }),
  reset: () => set({ ...initial }),
}));
