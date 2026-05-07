"use client";

import { Search, X, LayoutGrid, Table2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RangeSlider } from "@/components/ui/slider";
import {
  AGE_MAX,
  AGE_MIN,
  SALARY_MAX,
  SALARY_MIN,
  useFilters,
} from "@/lib/filter-store";

interface Props {
  industries: { code: number; name: string }[];
}

export function FiltersPanel({ industries }: Props) {
  const f = useFilters();

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="企業名・証券コードで検索 (例: トヨタ / 7203)"
            className="pl-9"
            value={f.query}
            onChange={(e) => f.setQuery(e.target.value)}
          />
        </div>

        <Select value={f.market} onChange={(e) => f.setMarket(e.target.value)} className="w-[140px]">
          <option value="">市場: 全て</option>
          <option value="プライム">プライム</option>
          <option value="スタンダード">スタンダード</option>
          <option value="グロース">グロース</option>
        </Select>

        <Select
          value={f.industryCode === "" ? "" : String(f.industryCode)}
          onChange={(e) => f.setIndustryCode(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-[180px]"
        >
          <option value="">業種: 全て</option>
          {industries.map((i) => (
            <option key={i.code} value={i.code}>
              {i.name}
            </option>
          ))}
        </Select>

        <Select
          value={f.sort}
          onChange={(e) => f.setSort(e.target.value as typeof f.sort)}
          className="w-[180px]"
        >
          <option value="raw_score">並び: 独自スコア</option>
          <option value="salary">並び: 年収</option>
          <option value="age_asc">並び: 平均年齢が若い順</option>
          <option value="age_desc">並び: 平均年齢が高い順</option>
          <option value="tenure">並び: 勤続年数</option>
          <option value="headcount">並び: 従業員数</option>
          <option value="name">並び: 企業名</option>
        </Select>

        <div className="flex rounded-md border bg-background">
          <Button
            variant={f.view === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => f.setView("table")}
            aria-label="テーブル表示"
            className="rounded-r-none"
          >
            <Table2 />
          </Button>
          <Button
            variant={f.view === "card" ? "default" : "ghost"}
            size="sm"
            onClick={() => f.setView("card")}
            aria-label="カード表示"
            className="rounded-l-none"
          >
            <LayoutGrid />
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={f.reset} aria-label="リセット">
          <X /> リセット
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            年収レンジ (万円)
          </div>
          <RangeSlider
            min={SALARY_MIN}
            max={SALARY_MAX}
            step={50}
            value={f.salaryRange}
            onChange={f.setSalaryRange}
            formatLabel={(n) => `${n.toLocaleString()}万`}
          />
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            平均年齢レンジ
          </div>
          <RangeSlider
            min={AGE_MIN}
            max={AGE_MAX}
            value={f.ageRange}
            onChange={f.setAgeRange}
            formatLabel={(n) => `${n}歳`}
          />
        </div>
      </div>
    </div>
  );
}
