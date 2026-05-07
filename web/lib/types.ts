// Domain types shared across the app.

export type Market = "プライム" | "スタンダード" | "グロース" | null;
export type Grade = "S" | "A" | "B" | "C" | "D";

export interface Industry {
  code: number;
  name_ja: string;
}

export interface Company {
  edinet_code: string;
  sec_code: string | null;
  ticker4: string | null;
  name_ja: string;
  name_en: string | null;
  industry_code: number | null;
  industry_name: string | null;
  market: Market;
  headquarters: string | null;
  homepage_url: string | null;
}

export interface EmployeeStats {
  fiscal_year: number;
  period_end: string;
  avg_age_years: number | null;
  avg_tenure_years: number | null;
  avg_annual_salary_yen: number | null;
  employee_count: number | null;
  source_url: string | null;
}

export interface CompanyScore {
  raw_score: number | null;
  grade: Grade | null;
  salary_deviation: number | null;
  age_deviation: number | null;
  industry_correction: number | null;
  rank_overall: number | null;
  rank_in_industry: number | null;
  rank_in_market: number | null;
}

export interface CompanyRow extends Company, EmployeeStats, CompanyScore {}

export interface IndustryAggregate {
  industry_code: number;
  fiscal_year: number;
  company_count: number;
  avg_salary_yen: number;
  median_salary_yen: number;
  avg_age_years: number;
  median_age_years: number;
  salary_p25_yen: number;
  salary_p75_yen: number;
  age_p25_years: number;
  age_p75_years: number;
  salary_stddev_yen: number;
  age_stddev_years: number;
}
