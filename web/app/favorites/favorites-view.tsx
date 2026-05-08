"use client";

import * as React from "react";
import Link from "next/link";
import { Star, X, Sparkles } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";
import type { CompanyRow } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/companies/grade-badge";
import { formatNumber, formatYen } from "@/lib/utils";

interface Props {
  all: CompanyRow[];
}

export function FavoritesView({ all }: Props) {
  const codes = useFavorites((s) => s.codes);
  const hydrated = useFavorites((s) => s.hydrated);
  const remove = useFavorites((s) => s.remove);
  const clear = useFavorites((s) => s.clear);

  if (!hydrated) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground">
        読み込み中…
      </Card>
    );
  }

  if (codes.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        <Sparkles className="mx-auto mb-3 size-8 text-amber-400" />
        <p className="text-sm">まだお気に入り企業がありません。</p>
        <p className="mt-1 text-xs">
          各企業ページや一覧ビューの ★ アイコンで追加できます。
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">ランキングを見る</Link>
        </Button>
      </Card>
    );
  }

  const rows = codes
    .map((code) => all.find((c) => c.sec_code === code || c.ticker4 === code))
    .filter(Boolean) as CompanyRow[];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">
            {rows.length}
          </span>{" "}
          社
        </span>
        <Button variant="ghost" size="sm" onClick={() => clear()}>
          全て削除
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((c) => (
          <Card key={c.edinet_code} className="group p-4">
            <div className="flex items-start gap-3">
              <Link
                href={`/companies/${c.sec_code ?? c.ticker4 ?? c.edinet_code}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <GradeBadge grade={c.grade ?? null} size="sm" />
                  <div className="truncate text-sm font-semibold">{c.name_ja}</div>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span className="font-mono">{c.ticker4 ?? "—"}</span>
                  {c.market && <Badge variant="muted">{c.market}</Badge>}
                  <span className="truncate">{c.industry_name}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      平均年収
                    </div>
                    <div className="font-semibold tabular-nums">
                      {formatYen(c.avg_annual_salary_yen)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      平均年齢
                    </div>
                    <div className="font-semibold tabular-nums">
                      {c.avg_age_years != null
                        ? `${formatNumber(c.avg_age_years)}歳`
                        : "—"}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                aria-label="お気に入りから削除"
                onClick={() => remove(c.sec_code ?? c.ticker4 ?? "")}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
      {rows.length >= 2 && (
        <Card className="p-4 text-center">
          <p className="text-sm">
            お気に入り企業を比較してみる？
          </p>
          <Button asChild className="mt-3">
            <Link
              href={`/compare?codes=${rows
                .slice(0, 4)
                .map((c) => c.sec_code ?? c.ticker4 ?? c.edinet_code)
                .join(",")}`}
            >
              レーダーチャートで比較する (最大4社)
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
