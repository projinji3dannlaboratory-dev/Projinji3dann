"""End-to-end annual batch.

For a given fiscal year (e.g. 2024 = FY ending 2024-03-31 → 2024-12-31),
fetch all annual securities reports submitted in the corresponding window
[FY-end + 1 day, FY-end + 4 months], parse XBRL, compute scores, and
upsert into Postgres.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, asdict
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable

from rich.console import Console
from rich.progress import Progress, TaskID
from tqdm import tqdm

from .config import CACHE_DIR, get_edinet_api_key
from .edinet_client import DocumentMeta, EdinetClient
from .scoring import aggregate_industry, score_company
from .xbrl_parser import (
    EmployeeStats,
    find_instance_file,
    normalize_industry_code,
    parse_xbrl_instance,
)


logger = logging.getLogger(__name__)
console = Console()


@dataclass
class CompanyRow:
    edinet_code: str
    sec_code: str | None
    name_ja: str
    industry_code: int | None
    fiscal_year: int
    period_end: str
    avg_age_years: float | None
    avg_tenure_years: float | None
    avg_annual_salary_yen: int | None
    employee_count: int | None
    doc_id: str
    submitted_at: str
    source_url: str

    def as_dict(self) -> dict:
        return asdict(self)


def fiscal_year_window(fy: int) -> tuple[date, date]:
    """Window where annual reports for FY (= year of period end) are submitted.

    Most Japanese listed companies have fiscal year ending 3/31 → submission window
    1/1 – 8/31 of the same year covers virtually all 3月期 + others.
    """
    return date(fy, 1, 1), date(fy, 8, 31)


def collect_documents(start: date, end: date) -> list[DocumentMeta]:
    api_key = get_edinet_api_key()
    docs: list[DocumentMeta] = []
    cur = start
    days = (end - start).days + 1
    with EdinetClient(api_key) as client:
        for i in tqdm(range(days), desc="listing days"):
            day = start + timedelta(days=i)
            try:
                items = client.list_documents(day)
            except Exception as e:  # noqa: BLE001
                logger.warning("list_documents failed for %s: %s", day, e)
                continue
            for d in items:
                if d.doc_type_code == "120" and d.xbrl_flag and d.sec_code:
                    docs.append(d)
    return docs


def parse_one_doc(doc: DocumentMeta) -> CompanyRow | None:
    api_key = get_edinet_api_key()
    with EdinetClient(api_key) as client:
        try:
            files = client.fetch_xbrl_files(doc.doc_id, cache_dir=CACHE_DIR)
        except Exception as e:  # noqa: BLE001
            logger.warning("download failed: %s (%s)", doc.doc_id, e)
            return None

    instance = find_instance_file(files)
    if not instance:
        return None

    stats = parse_xbrl_instance(instance)
    if not stats.is_complete_for_stats():
        return None

    period_end = stats.fiscal_year_end or doc.period_end or ""
    if not period_end:
        return None
    fiscal_year = int(period_end[:4])

    return CompanyRow(
        edinet_code=stats.edinet_code or doc.edinet_code,
        sec_code=stats.sec_code or doc.sec_code,
        name_ja=stats.filer_name or doc.filer_name,
        industry_code=normalize_industry_code(stats.industry_code),
        fiscal_year=fiscal_year,
        period_end=period_end,
        avg_age_years=stats.avg_age_years,
        avg_tenure_years=stats.avg_tenure_years,
        avg_annual_salary_yen=stats.avg_annual_salary_yen,
        employee_count=stats.employee_count,
        doc_id=doc.doc_id,
        submitted_at=doc.submit_datetime,
        source_url=f"https://disclosure2.edinet-fsa.go.jp/WEEK0040.aspx?docID={doc.doc_id}",
    )


def parse_all(docs: Iterable[DocumentMeta]) -> list[CompanyRow]:
    docs = list(docs)
    rows: list[CompanyRow] = []
    for d in tqdm(docs, desc="parsing XBRL"):
        row = parse_one_doc(d)
        if row:
            rows.append(row)
    return rows


def compute_industry_aggregates(
    rows: list[CompanyRow],
) -> dict[int, dict]:
    """Group rows by industry → IndustryStats dict."""
    by_industry: dict[int, list[CompanyRow]] = {}
    for r in rows:
        if r.industry_code:
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
    from .scoring import IndustryStats

    scored: list[dict] = []
    for r in rows:
        if not r.industry_code:
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
    # Compute overall ranks
    scored.sort(key=lambda x: x["raw_score"], reverse=True)
    for i, s in enumerate(scored, start=1):
        s["rank_overall"] = i
    return scored
