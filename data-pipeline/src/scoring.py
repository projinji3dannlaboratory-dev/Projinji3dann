"""Score calculation: original "young & well-paid" index.

See docs/scoring.md for the full design.
"""
from __future__ import annotations

import statistics
from dataclasses import dataclass


@dataclass
class IndustryStats:
    industry_code: int
    avg_salary_yen: float
    avg_age_years: float
    salary_stddev_yen: float
    age_stddev_years: float
    median_salary_yen: float
    median_age_years: float
    salary_p25_yen: float
    salary_p75_yen: float
    age_p25_years: float
    age_p75_years: float
    company_count: int


@dataclass
class CompanyScore:
    raw_score: float
    grade: str  # S/A/B/C/D
    salary_deviation: float  # 偏差値 (50=平均)
    age_deviation: float     # 偏差値 (年齢: 若いほど高い)
    industry_correction: float


def aggregate_industry(
    salary_yen: list[int | None],
    age_years: list[float | None],
    industry_code: int,
) -> IndustryStats | None:
    """Aggregate industry-level stats from a list of company values."""
    salaries = [s for s in salary_yen if s and s > 0]
    ages = [a for a in age_years if a and a > 0]

    if len(salaries) < 3 or len(ages) < 3:
        return None

    return IndustryStats(
        industry_code=industry_code,
        avg_salary_yen=statistics.mean(salaries),
        avg_age_years=statistics.mean(ages),
        salary_stddev_yen=statistics.stdev(salaries) if len(salaries) > 1 else 1.0,
        age_stddev_years=statistics.stdev(ages) if len(ages) > 1 else 1.0,
        median_salary_yen=statistics.median(salaries),
        median_age_years=statistics.median(ages),
        salary_p25_yen=_percentile(salaries, 25),
        salary_p75_yen=_percentile(salaries, 75),
        age_p25_years=_percentile(ages, 25),
        age_p75_years=_percentile(ages, 75),
        company_count=len(salaries),
    )


def _percentile(data: list[float], p: float) -> float:
    if not data:
        return 0.0
    sd = sorted(data)
    k = (len(sd) - 1) * p / 100.0
    lo = int(k)
    hi = min(lo + 1, len(sd) - 1)
    return sd[lo] + (sd[hi] - sd[lo]) * (k - lo)


def grade_from_score(raw: float) -> str:
    if raw >= 80:
        return "S"
    if raw >= 65:
        return "A"
    if raw >= 50:
        return "B"
    if raw >= 35:
        return "C"
    return "D"


def score_company(
    company_salary_yen: int | None,
    company_age_years: float | None,
    industry: IndustryStats | None,
) -> CompanyScore | None:
    """Compute the original score for one company.

    raw_score = (S_c / S_i) * (A_i / A_c) * 50
    """
    if (
        company_salary_yen is None
        or company_age_years is None
        or company_age_years <= 0
        or industry is None
    ):
        return None

    salary_ratio = company_salary_yen / industry.avg_salary_yen
    age_ratio = industry.avg_age_years / company_age_years
    raw = salary_ratio * age_ratio * 50.0
    raw = max(0.0, min(150.0, raw))  # clamp for display sanity

    salary_dev = 50.0 + 10.0 * (
        (company_salary_yen - industry.avg_salary_yen) / max(industry.salary_stddev_yen, 1.0)
    )
    age_dev = 50.0 + 10.0 * (
        (industry.avg_age_years - company_age_years) / max(industry.age_stddev_years, 0.1)
    )

    return CompanyScore(
        raw_score=round(raw, 2),
        grade=grade_from_score(raw),
        salary_deviation=round(max(20.0, min(80.0, salary_dev)), 2),
        age_deviation=round(max(20.0, min(80.0, age_dev)), 2),
        industry_correction=round(salary_ratio * age_ratio, 3),
    )
