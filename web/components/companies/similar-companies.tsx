import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanyRow } from "@/lib/types";
import { GradeBadge } from "./grade-badge";
import { formatYen } from "@/lib/utils";

interface Props {
  current: CompanyRow;
  pool: CompanyRow[];
  limit?: number;
}

/** Pick "similar" companies by industry + salary band proximity. */
export function SimilarCompanies({ current, pool, limit = 6 }: Props) {
  const targetSalary = current.avg_annual_salary_yen ?? 0;

  const similar = pool
    .filter(
      (c) =>
        c.edinet_code !== current.edinet_code
        && c.industry_code === current.industry_code
        && c.avg_annual_salary_yen != null,
    )
    .map((c) => ({
      c,
      dist: Math.abs((c.avg_annual_salary_yen ?? 0) - targetSalary),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.c);

  if (similar.length === 0) return null;

  return (
    <Card className="p-5">
      <h3 className="text-base font-semibold">類似企業 (年収帯・業種)</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        同じ業種で年収レンジが近い企業
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {similar.map((c) => (
          <li key={c.edinet_code}>
            <Link
              href={`/companies/${c.sec_code ?? c.ticker4 ?? c.edinet_code}`}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/40"
            >
              <GradeBadge grade={c.grade ?? null} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{c.name_ja}</div>
                <div className="text-[11px] text-muted-foreground">
                  {c.market && <Badge variant="muted" className="mr-1">{c.market}</Badge>}
                  {formatYen(c.avg_annual_salary_yen)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
