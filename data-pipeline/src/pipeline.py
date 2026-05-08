"""End-to-end annual batch using edinetdb.jp as the data source.

Strategy:
  1. Hit /v1/screener with multi-condition JSON ~8 times to retrieve all
     ~3,800 listed companies' avg-age and avg-annual-salary.
  2. Map JP industry names to JPX 33 sector codes.
  3. Compute industry aggregates and per-company score.
  4. Upsert into Postgres (companies / employee_stats / industry_aggregates /
     company_scores) and refresh ranks.

The original 金融庁 EDINET + XBRL parser path is preserved in
`xbrl_parser.py` and `edinet_client.py` for future activation; see README.
"""
from __future__ import annotations

import logging
from dataclasses import asdict, dataclass

from rich.console import Console

from .edinetdb_client import CompanySnapshot, EdinetdbClient
from .industry_map import INDUSTRY_NAME_BY_CODE, industry_name_to_code
from .scoring import IndustryStats, aggregate_industry, score_company


logger = logging.getLogger(__name__)
console = Console()


@dataclass
class CompanyRow:
    """Normalized row ready to be persisted to Postgres."""

    edinet_code: str
    sec_code: str | None
    name_ja: str
    name_en: str | None
    industry_code: int | None
    industry_name: str | None
    fiscal_year: int
    period_end: str | None
    avg_age_years: float | None
    avg_tenure_years: float | None        # not in screener; left None for now
    avg_annual_salary_yen: int | None     # 円単位
    employee_count: int | None            # not in screener
    accounting_standard: str | None
    business_tags: list[str]
    source: str = "edinetdb.jp"
    source_url: str | None = None

    def as_dict(self) -> dict:
        return asdict(self)


def _to_company_row(s: CompanySnapshot) -> CompanyRow | None:
    """Filter / normalize a screener row into CompanyRow."""
    if not s.edinet_code or s.fiscal_year is None:
        return None
    if s.avg_age_years is None and s.avg_annual_salary_man_yen is None:
        return None

    industry_code = industry_name_to_code(s.industry_name)
    salary_yen: int | None = None
    if s.avg_annual_salary_man_yen is not None:
        salary_yen = int(round(s.avg_annual_salary_man_yen * 10_000))

    period_end = f"{s.fiscal_year}-12-31"  # placeholder; refined per company in detail call
    return CompanyRow(
        edinet_code=s.edinet_code,
        sec_code=s.sec_code,
        name_ja=s.name_ja,
        name_en=s.name_en,
        industry_code=industry_code,
        industry_name=INDUSTRY_NAME_BY_CODE.get(industry_code) if industry_code else s.industry_name or None,
        fiscal_year=s.fiscal_year,
        period_end=period_end,
        avg_age_years=s.avg_age_years,
        avg_tenure_years=s.avg_tenure_years,
        avg_annual_salary_yen=salary_yen,
        employee_count=s.num_employees,
        accounting_standard=s.accounting_standard,
        business_tags=s.business_tags,
        source_url=f"https://edinetdb.jp/company/{s.edinet_code}",
    )


def collect_snapshots(client: EdinetdbClient | None = None) -> list[CompanyRow]:
    """Fetch every company from edinetdb.jp screener and normalize."""
    own = client is None
    if own:
        client = EdinetdbClient()
    try:
        snaps = client.fetch_all_company_snapshots()
    finally:
        if own:
            client.__exit__(None, None, None)

    rows: list[CompanyRow] = []
    skipped = 0
    for s in snaps:
        r = _to_company_row(s)
        if r is None:
            skipped += 1
            continue
        rows.append(r)
    console.print(
        f"[bold]normalized {len(rows)} companies[/bold] "
        f"(skipped {skipped} rows missing data)"
    )
    return rows


def compute_industry_aggregates(rows: list[CompanyRow]) -> dict[int, dict]:
    by_industry: dict[int, list[CompanyRow]] = {}
    for r in rows:
        if r.industry_code is None:
            continue
        by_industry.setdefault(r.industry_code, []).append(r)

    out: dict[int, dict] = {}
    for code, group in by_industry.items():
        agg = aggregate_industry(
            [r.avg_annual_salary_yen for r in group],
            [r.avg_age_years for r in group],
            code,
        )
        if agg:
            out[code] = asdict(agg)
    return out


def compute_scores(
    rows: list[CompanyRow], industry_aggs: dict[int, dict]
) -> list[dict]:
    scored: list[dict] = []
    for r in rows:
        if r.industry_code is None:
            continue
        agg_dict = industry_aggs.get(r.industry_code)
        if not agg_dict:
            continue
        agg = IndustryStats(**agg_dict)
        s = score_company(r.avg_annual_salary_yen, r.avg_age_years, agg)
        if s is None:
            continue
        scored.append(
            {
                "edinet_code": r.edinet_code,
                "fiscal_year": r.fiscal_year,
                "raw_score": s.raw_score,
                "grade": s.grade,
                "salary_deviation": s.salary_deviation,
                "age_deviation": s.age_deviation,
                "industry_correction": s.industry_correction,
            }
        )
    scored.sort(key=lambda x: x["raw_score"], reverse=True)
    for i, s in enumerate(scored, start=1):
        s["rank_overall"] = i
    return scored


def predominant_fiscal_year(rows: list[CompanyRow]) -> int:
    """Companies in different FYs may all be 'latest'; pick the most common."""
    if not rows:
        from datetime import date

        return date.today().year - 1
    counts: dict[int, int] = {}
    for r in rows:
        counts[r.fiscal_year] = counts.get(r.fiscal_year, 0) + 1
    return max(counts.items(), key=lambda kv: kv[1])[0]
