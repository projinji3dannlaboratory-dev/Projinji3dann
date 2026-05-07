/**
 * Database queries layer. Falls back to local sample fixture when Supabase env
 * is not configured — handy for development before the pipeline has run once.
 */
import type { CompanyRow } from "./types";
import { supabasePublic } from "./supabase";
import { SAMPLE_DATA } from "@/data/sample";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
      && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function fetchAllCompanies(): Promise<CompanyRow[]> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_DATA;
  }
  const { data, error } = await supabasePublic()
    .from("v_company_latest")
    .select("*");
  if (error) {
    console.error("[fetchAllCompanies] supabase error", error);
    return SAMPLE_DATA;
  }
  return (data ?? []) as CompanyRow[];
}

export async function fetchCompany(secCode: string): Promise<CompanyRow | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_DATA.find((c) => c.sec_code === secCode || c.ticker4 === secCode) ?? null;
  }
  const { data, error } = await supabasePublic()
    .from("v_company_latest")
    .select("*")
    .or(`sec_code.eq.${secCode},ticker4.eq.${secCode}`)
    .limit(1)
    .single();
  if (error) {
    console.error("[fetchCompany] supabase error", error);
    return null;
  }
  return data as CompanyRow;
}

export async function fetchCompaniesBySecCodes(secCodes: string[]): Promise<CompanyRow[]> {
  if (secCodes.length === 0) return [];
  if (!isSupabaseConfigured()) {
    return SAMPLE_DATA.filter(
      (c) => secCodes.includes(c.sec_code ?? "") || secCodes.includes(c.ticker4 ?? ""),
    );
  }
  const { data, error } = await supabasePublic()
    .from("v_company_latest")
    .select("*")
    .or(
      [
        `sec_code.in.(${secCodes.join(",")})`,
        `ticker4.in.(${secCodes.join(",")})`,
      ].join(","),
    );
  if (error) {
    console.error("[fetchCompaniesBySecCodes] supabase error", error);
    return [];
  }
  return (data ?? []) as CompanyRow[];
}
