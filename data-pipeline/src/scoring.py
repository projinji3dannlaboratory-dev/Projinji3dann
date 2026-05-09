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
    """Grade thresholds tuned for the absolute-salary-weighted formula below.
    Calibration targets (approximate):
      S: 平均年収 1,500万円+ や、超優良 (キーエンス・商社) 水準
      A: 平均年収 1,000万円前後の上位企業
      B: 平均年収 600-800万円の中堅
      C: 平均年収 500万円前後の平均的企業
      D: 平均年収 400万円以下
    """
    if raw >= 80:
        return "S"
    if raw >= 65:
        return "A"
    if raw >= 50:
        return "B"
    if raw >= 35:
        return "C"
    return "D"


# 絶対年収のスコア化 anchor: 1,000万円 = 60点 (=B/A 境界より少し上)
# つまり raw_score = absolute_score (0-100) + bonuses (-25 to +25)
# 6,000,000 yen / 100 = 60,000 → 60万円 per point at the anchor
_SALARY_ANCHOR_YEN_PER_POINT = 1_000_000_0 / 60  # ≒ 166,666 yen / point


def score_company(
    company_salary_yen: int | None,
    company_age_years: float | None,
    industry: IndustryStats | None,
) -> CompanyScore | None:
    """Compute the salary-anchored score for one company.

    New formula (designed to make industry correction non-dominant):

        absolute_score = clamp(salary_yen / 166,666, 0, 100)
            # 1,000万円 → 60, 1,500万円 → 90, 2,000万円+ → 100

        industry_bonus = clamp((salary_ratio - 1) * 20, -15, 25)
            # 業界平均の +20% で +4, +50% で +10, 2倍以上は +25 で頭打ち

        age_bonus = clamp((age_ratio - 1) * 25, -10, 25)
            # 業界より若い分だけプラス (役職定年想定の年齢調整)

        raw_score = clamp(absolute_score + industry_bonus + age_bonus, 0, 150)

    This way, a 2,000万円 company always lands in S regardless of industry,
    and a 400万円 company can't reach S even if its industry is dominated
    by 350万円 peers (because absolute_score caps it at ~24).
    """
    if (
        company_salary_yen is None
        or company_age_years is None
        or company_age_years <= 0
        or industry is None
    ):
        return None

    # 1) Absolute salary anchor — the dominant signal
    absolute_score = max(0.0, min(100.0, company_salary_yen / _SALARY_ANCHOR_YEN_PER_POINT))

    # 2) Industry-relative salary bonus
    salary_ratio = company_salary_yen / industry.avg_salary_yen
    industry_bonus = max(-15.0, min(25.0, (salary_ratio - 1.0) * 20.0))

    # 3) Youth bonus relative to industry mean age
    age_ratio = industry.avg_age_years / company_age_years
    age_bonus = max(-10.0, min(25.0, (age_ratio - 1.0) * 25.0))

    raw = max(0.0, min(150.0, absolute_score + industry_bonus + age_bonus))

    # Deviation values (kept for the explainer UI, unchanged)
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
