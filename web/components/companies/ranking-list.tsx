"use client";

import * as React from "react";
import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, AnimatePresence } from "framer-motion";
import type { CompanyRow } from "@/lib/types";
import { type FilterState, useFilters } from "@/lib/filter-store";
import { GradeBadge } from "./grade-badge";
import { formatYen, formatNumber } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

interface Props {
  rows: CompanyRow[];
}

function applyFilters(rows: CompanyRow[], f: FilterState): CompanyRow[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((r) => {
    if (q) {
      const hay = `${r.name_ja} ${r.name_en ?? ""} ${r.sec_code ?? ""} ${r.ticker4 ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.market && r.market !== f.market) return false;
    if (f.industryCode !== "" && r.industry_code !== f.industryCode) return false;

    const salaryMan = (r.avg_annual_salary_yen ?? 0) / 10_000;
    if (salaryMan < f.salaryRange[0] || salaryMan > f.salaryRange[1]) return false;

    if (r.avg_age_years != null) {
      if (r.avg_age_years < f.ageRange[0] || r.avg_age_years > f.ageRange[1]) return false;
    }
    if (f.tenureMin > 0 && (r.avg_tenure_years ?? 0) < f.tenureMin) return false;
    if (f.headcountMin > 0 && (r.employee_count ?? 0) < f.headcountMin) return false;
    return true;
  });
}

function applySort(rows: CompanyRow[], sort: FilterState["sort"]): CompanyRow[] {
  const arr = [...rows];
  switch (sort) {
    case "raw_score":
      arr.sort((a, b) => (b.raw_score ?? -1) - (a.raw_score ?? -1));
      break;
    case "salary":
      arr.sort((a, b) => (b.avg_annual_salary_yen ?? 0) - (a.avg_annual_salary_yen ?? 0));
      break;
    case "age_asc":
      arr.sort((a, b) => (a.avg_age_years ?? 99) - (b.avg_age_years ?? 99));
      break;
    case "age_desc":
      arr.sort((a, b) => (b.avg_age_years ?? -1) - (a.avg_age_years ?? -1));
      break;
    case "tenure":
      arr.sort((a, b) => (b.avg_tenure_years ?? 0) - (a.avg_tenure_years ?? 0));
      break;
    case "headcount":
      arr.sort((a, b) => (b.employee_count ?? 0) - (a.employee_count ?? 0));
      break;
    case "name":
      arr.sort((a, b) => a.name_ja.localeCompare(b.name_ja, "ja"));
      break;
  }
  return arr;
}

export function RankingList({ rows }: Props) {
  const filters = useFilters();
  const filtered = React.useMemo(() => applyFilters(rows, filters), [rows, filters]);
  const sorted = React.useMemo(() => applySort(filtered, filters.sort), [filtered, filters.sort]);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{sorted.length.toLocaleString()}</span> 社
        </span>
      </div>
      {filters.view === "table" ? (
        <VirtualizedTable rows={sorted} />
      ) : (
        <CardGrid rows={sorted} />
      )}
    </div>
  );
}

function VirtualizedTable({ rows }: { rows: CompanyRow[] }) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 12,
  });

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[64px_1fr_72px_120px_88px_88px_120px_56px] items-center gap-2 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
        <div>順位</div>
        <div>企業</div>
        <div className="text-center">グレード</div>
        <div className="text-right">平均年収</div>
        <div className="text-right">年齢</div>
        <div className="text-right">勤続</div>
        <div className="text-right">従業員数</div>
        <div></div>
      </div>
      <div ref={parentRef} className="relative max-h-[70vh] overflow-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const r = rows[vi.index];
            return (
              <Link
                key={r.edinet_code}
                href={`/companies/${r.sec_code ?? r.ticker4 ?? r.edinet_code}`}
                className="absolute inset-x-0 grid grid-cols-[64px_1fr_72px_120px_88px_88px_120px_56px] items-center gap-2 border-b px-3 py-2 text-sm hover:bg-accent/40 transition-colors"
                style={{ top: vi.start, height: vi.size }}
              >
                <div className="font-mono text-xs text-muted-foreground tabular-nums">
                  #{vi.index + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{r.name_ja}</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono">{r.ticker4 ?? r.sec_code ?? "—"}</span>
                    {r.market && <Badge variant="muted">{r.market}</Badge>}
                    {r.industry_name && <span className="truncate">{r.industry_name}</span>}
                  </div>
                </div>
                <div className="flex justify-center">
                  <GradeBadge grade={r.grade ?? null} size="sm" />
                </div>
                <div className="text-right tabular-nums">
                  {formatYen(r.avg_annual_salary_yen)}
                </div>
                <div className="text-right tabular-nums">
                  {r.avg_age_years != null ? `${formatNumber(r.avg_age_years)}歳` : "—"}
                </div>
                <div className="text-right tabular-nums text-muted-foreground">
                  {r.avg_tenure_years != null ? `${formatNumber(r.avg_tenure_years)}年` : "—"}
                </div>
                <div className="text-right tabular-nums text-muted-foreground">
                  {r.employee_count != null ? r.employee_count.toLocaleString() : "—"}
                </div>
                <div className="flex justify-end text-muted-foreground">
                  <ArrowUpRight className="size-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function CardGrid({ rows }: { rows: CompanyRow[] }) {
  return (
    <AnimatePresence>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.slice(0, 200).map((r, i) => (
          <motion.div
            key={r.edinet_code}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.01, 0.4) }}
          >
            <Link href={`/companies/${r.sec_code ?? r.ticker4 ?? r.edinet_code}`}>
              <Card className="group h-full p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground tabular-nums">
                      #{i + 1}
                    </div>
                    <div className="truncate text-base font-semibold">{r.name_ja}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{r.ticker4 ?? "—"}</span>
                      {r.market && <Badge variant="muted">{r.market}</Badge>}
                    </div>
                  </div>
                  <GradeBadge grade={r.grade ?? null} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      平均年収
                    </div>
                    <div className="font-semibold tabular-nums">
                      {formatYen(r.avg_annual_salary_yen)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      平均年齢
                    </div>
                    <div className="font-semibold tabular-nums">
                      {r.avg_age_years != null ? `${formatNumber(r.avg_age_years)}歳` : "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 truncate text-xs text-muted-foreground">
                  {r.industry_name ?? ""}
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      {rows.length > 200 && (
        <div className="mt-3 text-center text-sm text-muted-foreground">
          カード表示は先頭200社のみ。全社見るにはテーブル表示に切替
        </div>
      )}
    </AnimatePresence>
  );
}
