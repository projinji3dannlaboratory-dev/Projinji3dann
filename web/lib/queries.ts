/**
 * Database queries layer (Node runtime).
 *
 * IMPORTANT: This module imports the snapshot directly. It is fine for the
 * server / Node runtime (where it's bundled into a serverless function with
 * 250MB compressed limit) but MUST NOT be imported from any Edge runtime
 * route — Edge functions have a 1-4MB limit on Hobby and the 3.2MB JSON
 * would blow it. Edge routes (e.g. /api/og) should fetch
 * `/data/snapshot.json` from the CDN-served public asset instead.
 *
 * Resolution order:
 *   1. Supabase (production) when NEXT_PUBLIC_SUPABASE_URL + ANON_KEY are set
 *   2. Real snapshot at web/data/snapshot.json (imported below)
 *   3. Hand-crafted SAMPLE_DATA — when snapshot is empty
 */
import type { CompanyRow } from "./types";
import { supabasePublic } from "./supabase";
import { SAMPLE_DATA } from "@/data/sample";
import snapshot from "@/data/snapshot.json";

const SNAPSHOT_ROWS: CompanyRow[] = (snapshot?.rows as CompanyRow[]) ?? [];

function fallbackData(): CompanyRow[] {
  return SNAPSHOT_ROWS.length > 0 ? SNAPSHOT_ROWS : SAMPLE_DATA;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL
      && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function fetchAllCompanies(): Promise<CompanyRow[]> {
  if (!isSupabaseConfigured()) {
    return fallbackData();
  }
  const { data, error } = await supabasePublic()
    .from("v_company_latest")
    .select("*");
  if (error) {
    console.error("[fetchAllCompanies] supabase error", error);
    return fallbackData();
  }
  return (data ?? []) as CompanyRow[];
}

export async function fetchCompany(secCode: string): Promise<CompanyRow | null> {
  if (!isSupabaseConfigured()) {
    return (
      fallbackData().find(
        (c) => c.sec_code === secCode || c.ticker4 === secCode,
      ) ?? null
    );
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

export async function fetchCompaniesBySecCodes(
  secCodes: string[],
): Promise<CompanyRow[]> {
  if (secCodes.length === 0) return [];
  if (!isSupabaseConfigured()) {
    return fallbackData().filter(
      (c) =>
        secCodes.includes(c.sec_code ?? "") || secCodes.includes(c.ticker4 ?? ""),
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

/** Snapshot metadata for footer / data source attribution */
export function snapshotMeta() {
  return {
    fiscalYear: (snapshot?.fiscal_year as number | undefined) ?? null,
    source: (snapshot?.source as string | undefined) ?? "edinetdb.jp",
    companyCount:
      (snapshot?.company_count as number | undefined)
      ?? SNAPSHOT_ROWS.length
      ?? null,
  };
}
