"""Export the latest snapshot into web/data/snapshot.json.

The Next.js fallback queries layer reads this when Supabase is not configured,
so the deployed site shows real data even before DB setup.
"""
from __future__ import annotations

import json
from pathlib import Path

from .config import PROCESSED_DIR, REPO_ROOT
from .industry_map import INDUSTRY_NAME_BY_CODE


WEB_DATA = REPO_ROOT / "web" / "data" / "snapshot.json"


def latest_snapshot_path() -> Path | None:
    if not PROCESSED_DIR.exists():
        return None
    files = sorted(PROCESSED_DIR.glob("fy*.json"), reverse=True)
    return files[0] if files else None


def export(snapshot_path: Path | None = None) -> Path:
    snapshot_path = snapshot_path or latest_snapshot_path()
    if not snapshot_path:
        raise SystemExit("No snapshot found. Run `python -m src.cli run-batch` first.")

    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    rows = snapshot["rows"]
    aggs = snapshot["industry_aggregates"]
    scores = {(s["edinet_code"], s["fiscal_year"]): s for s in snapshot["scores"]}

    # Compute rank_in_industry / rank_in_market (market currently null in screener)
    industry_rank: dict[int, dict[str, int]] = {}
    by_industry: dict[int, list[dict]] = {}
    for r in rows:
        ic = r.get("industry_code")
        if ic is not None:
            by_industry.setdefault(ic, []).append(r)
    for ic, group in by_industry.items():
        group_sorted = sorted(
            group,
            key=lambda x: scores.get((x["edinet_code"], x["fiscal_year"]), {}).get(
                "raw_score", -1
            ),
            reverse=True,
        )
        industry_rank[ic] = {
            r["edinet_code"]: i + 1 for i, r in enumerate(group_sorted)
        }

    # Build CompanyRow[] for the web app (matches web/lib/types.ts)
    out: list[dict] = []
    for r in rows:
        sec_code = r.get("sec_code") or ""
        ticker4 = sec_code[:4] if sec_code else None
        s = scores.get((r["edinet_code"], r["fiscal_year"]), {})
        out.append(
            {
                "edinet_code": r["edinet_code"],
                "sec_code": r.get("sec_code"),
                "ticker4": ticker4,
                "name_ja": r["name_ja"],
                "name_en": r.get("name_en"),
                "industry_code": r.get("industry_code"),
                "industry_name": INDUSTRY_NAME_BY_CODE.get(r.get("industry_code") or 0)
                or r.get("industry_name"),
                "market": None,            # screener doesn't expose market
                "headquarters": None,
                "homepage_url": None,
                "fiscal_year": r["fiscal_year"],
                "period_end": r.get("period_end"),
                "avg_age_years": r.get("avg_age_years"),
                "avg_tenure_years": r.get("avg_tenure_years"),
                "avg_annual_salary_yen": r.get("avg_annual_salary_yen"),
                "employee_count": r.get("employee_count"),
                "source_url": r.get("source_url"),
                "raw_score": s.get("raw_score"),
                "grade": s.get("grade"),
                "salary_deviation": s.get("salary_deviation"),
                "age_deviation": s.get("age_deviation"),
                "industry_correction": s.get("industry_correction"),
                "rank_overall": s.get("rank_overall"),
                "rank_in_industry": industry_rank.get(r.get("industry_code") or 0, {}).get(
                    r["edinet_code"]
                ),
                "rank_in_market": None,
            }
        )

    # Sort by raw_score desc, nulls last
    out.sort(key=lambda x: (x["raw_score"] is None, -(x["raw_score"] or 0)))

    payload = {
        "fiscal_year": snapshot["fiscal_year"],
        "source": snapshot.get("source", "edinetdb.jp"),
        "company_count": len(out),
        "industry_aggregates": aggs,
        "rows": out,
    }
    WEB_DATA.parent.mkdir(parents=True, exist_ok=True)
    WEB_DATA.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False),
        encoding="utf-8",
    )
    print(f"[ok] wrote {WEB_DATA} ({len(out)} companies, {WEB_DATA.stat().st_size:,} bytes)")
    return WEB_DATA


if __name__ == "__main__":
    export()
