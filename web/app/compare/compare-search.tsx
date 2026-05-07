"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Search, Plus } from "lucide-react";
import type { CompanyRow } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  all: CompanyRow[];
  selectedCodes: string[];
}

export function CompareSearch({ all, selectedCodes }: Props) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const candidates = React.useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return all
      .filter((c) => {
        if (selectedCodes.includes(c.sec_code ?? "") || selectedCodes.includes(c.ticker4 ?? "")) return false;
        const hay = `${c.name_ja} ${c.ticker4 ?? ""} ${c.sec_code ?? ""}`.toLowerCase();
        return hay.includes(needle);
      })
      .slice(0, 8);
  }, [all, q, selectedCodes]);

  const updateUrl = (codes: string[]) => {
    if (codes.length === 0) {
      router.push("/compare");
    } else {
      router.push(`/compare?codes=${codes.join(",")}`);
    }
  };

  const add = (code: string) => {
    if (selectedCodes.length >= 4) return;
    updateUrl([...selectedCodes, code]);
    setQ("");
  };

  const remove = (code: string) => {
    updateUrl(selectedCodes.filter((c) => c !== code));
  };

  const selectedRows = selectedCodes
    .map((code) => all.find((c) => c.sec_code === code || c.ticker4 === code))
    .filter(Boolean) as CompanyRow[];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selectedRows.map((r) => (
          <Badge key={r.edinet_code} variant="secondary" className="gap-1 px-2 py-1">
            <Link className="hover:underline" href={`/companies/${r.sec_code ?? r.ticker4 ?? r.edinet_code}`}>
              {r.name_ja}
            </Link>
            <button
              aria-label={`${r.name_ja}を削除`}
              onClick={() => remove(r.sec_code ?? r.ticker4 ?? "")}
              className="ml-1 rounded-full hover:bg-background"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        {selectedRows.length === 0 && (
          <span className="text-xs text-muted-foreground">
            まだ企業が選択されていません。下のボックスから検索してください。
          </span>
        )}
      </div>

      {selectedCodes.length < 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="企業名・証券コードで検索（あと最大 ${4 - selectedCodes.length} 社まで）"
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {candidates.length > 0 && (
            <div className="mt-2 grid gap-1">
              {candidates.map((c) => (
                <Button
                  key={c.edinet_code}
                  variant="outline"
                  size="sm"
                  className="justify-between"
                  onClick={() => add(c.sec_code ?? c.ticker4 ?? "")}
                >
                  <span className="truncate">
                    {c.name_ja}
                    <span className="ml-2 text-xs font-mono text-muted-foreground">
                      {c.ticker4 ?? "—"}
                    </span>
                  </span>
                  <Plus className="size-4" />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
