"""Postgres / Supabase upserter."""
from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterable, Iterator

import psycopg
from psycopg.rows import dict_row


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL not set in environment.")
    return url


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    with psycopg.connect(get_database_url(), row_factory=dict_row) as conn:
        yield conn


def upsert_companies(rows: list[dict]) -> int:
    """Upsert companies. Expects keys: edinet_code, sec_code, name_ja, industry_code, market."""
    if not rows:
        return 0
    sql = """
    insert into companies (edinet_code, sec_code, name_ja, industry_code, market, last_seen_at)
    values (%(edinet_code)s, %(sec_code)s, %(name_ja)s, %(industry_code)s, %(market)s, now())
    on conflict (edinet_code) do update set
        sec_code = excluded.sec_code,
        name_ja = excluded.name_ja,
        industry_code = excluded.industry_code,
        market = coalesce(excluded.market, companies.market),
        last_seen_at = now()
    """
    with connection() as conn, conn.cursor() as cur:
        cur.executemany(sql, rows)
        conn.commit()
        return cur.rowcount or 0


def upsert_employee_stats(rows: list[dict]) -> int:
    if not rows:
        return 0
    sql = """
    insert into employee_stats (
        edinet_code, fiscal_year, period_end,
        avg_age_years, avg_tenure_years, avg_annual_salary_yen, employee_count,
        doc_id, submitted_at, source_url
    ) values (
        %(edinet_code)s, %(fiscal_year)s, %(period_end)s,
        %(avg_age_years)s, %(avg_tenure_years)s, %(avg_annual_salary_yen)s, %(employee_count)s,
        %(doc_id)s, %(submitted_at)s, %(source_url)s
    )
    on conflict (edinet_code, fiscal_year) do update set
        period_end = excluded.period_end,
        avg_age_years = excluded.avg_age_years,
        avg_tenure_years = excluded.avg_tenure_years,
        avg_annual_salary_yen = excluded.avg_annual_salary_yen,
        employee_count = excluded.employee_count,
        doc_id = excluded.doc_id,
        submitted_at = excluded.submitted_at,
        source_url = excluded.source_url
    """
    with connection() as conn, conn.cursor() as cur:
        cur.executemany(sql, rows)
        conn.commit()
        return cur.rowcount or 0


def upsert_industry_aggregates(fiscal_year: int, aggs: dict[int, dict]) -> int:
    if not aggs:
        return 0
    rows = []
    for code, a in aggs.items():
        rows.append({
            "industry_code": code,
            "fiscal_year": fiscal_year,
            "company_count": a.get("company_count"),
            "avg_salary_yen": int(a.get("avg_salary_yen") or 0),
            "median_salary_yen": int(a.get("median_salary_yen") or 0),
            "avg_age_years": a.get("avg_age_years"),
            "median_age_years": a.get("median_age_years"),
            "salary_p25_yen": int(a.get("salary_p25_yen") or 0),
            "salary_p75_yen": int(a.get("salary_p75_yen") or 0),
            "age_p25_years": a.get("age_p25_years"),
            "age_p75_years": a.get("age_p75_years"),
            "salary_stddev_yen": int(a.get("salary_stddev_yen") or 0),
            "age_stddev_years": a.get("age_stddev_years"),
        })
    sql = """
    insert into industry_aggregates (
        industry_code, fiscal_year, company_count, avg_salary_yen, median_salary_yen,
        avg_age_years, median_age_years, salary_p25_yen, salary_p75_yen,
        age_p25_years, age_p75_years, salary_stddev_yen, age_stddev_years, refreshed_at
    ) values (
        %(industry_code)s, %(fiscal_year)s, %(company_count)s, %(avg_salary_yen)s, %(median_salary_yen)s,
        %(avg_age_years)s, %(median_age_years)s, %(salary_p25_yen)s, %(salary_p75_yen)s,
        %(age_p25_years)s, %(age_p75_years)s, %(salary_stddev_yen)s, %(age_stddev_years)s, now()
    )
    on conflict (industry_code, fiscal_year) do update set
        company_count = excluded.company_count,
        avg_salary_yen = excluded.avg_salary_yen,
        median_salary_yen = excluded.median_salary_yen,
        avg_age_years = excluded.avg_age_years,
        median_age_years = excluded.median_age_years,
        salary_p25_yen = excluded.salary_p25_yen,
        salary_p75_yen = excluded.salary_p75_yen,
        age_p25_years = excluded.age_p25_years,
        age_p75_years = excluded.age_p75_years,
        salary_stddev_yen = excluded.salary_stddev_yen,
        age_stddev_years = excluded.age_stddev_years,
        refreshed_at = now()
    """
    with connection() as conn, conn.cursor() as cur:
        cur.executemany(sql, rows)
        conn.commit()
        return cur.rowcount or 0


def upsert_scores(rows: list[dict]) -> int:
    if not rows:
        return 0
    sql = """
    insert into company_scores (
        edinet_code, fiscal_year, raw_score, grade,
        salary_deviation, age_deviation, industry_correction, rank_overall, refreshed_at
    ) values (
        %(edinet_code)s, %(fiscal_year)s, %(raw_score)s, %(grade)s,
        %(salary_deviation)s, %(age_deviation)s, %(industry_correction)s, %(rank_overall)s, now()
    )
    on conflict (edinet_code, fiscal_year) do update set
        raw_score = excluded.raw_score,
        grade = excluded.grade,
        salary_deviation = excluded.salary_deviation,
        age_deviation = excluded.age_deviation,
        industry_correction = excluded.industry_correction,
        rank_overall = excluded.rank_overall,
        refreshed_at = now()
    """
    with connection() as conn, conn.cursor() as cur:
        cur.executemany(sql, rows)
        conn.commit()
        return cur.rowcount or 0


def refresh_industry_and_market_ranks(fiscal_year: int) -> None:
    """Update rank_in_industry and rank_in_market via SQL window functions."""
    sql = """
    with ranked as (
      select cs.edinet_code, cs.fiscal_year,
        rank() over (
          partition by c.industry_code
          order by cs.raw_score desc nulls last
        ) as r_industry,
        rank() over (
          partition by c.market
          order by cs.raw_score desc nulls last
        ) as r_market
      from company_scores cs
      join companies c using (edinet_code)
      where cs.fiscal_year = %s
    )
    update company_scores cs
    set rank_in_industry = r_industry,
        rank_in_market = r_market
    from ranked
    where cs.edinet_code = ranked.edinet_code and cs.fiscal_year = ranked.fiscal_year
    """
    with connection() as conn, conn.cursor() as cur:
        cur.execute(sql, (fiscal_year,))
        conn.commit()
