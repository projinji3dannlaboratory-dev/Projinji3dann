"""Tests for the scoring module."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.scoring import aggregate_industry, score_company, grade_from_score  # noqa: E402


def test_grade_thresholds() -> None:
    assert grade_from_score(95) == "S"
    assert grade_from_score(80) == "S"
    assert grade_from_score(79.99) == "A"
    assert grade_from_score(65) == "A"
    assert grade_from_score(64.99) == "B"
    assert grade_from_score(50) == "B"
    assert grade_from_score(49.99) == "C"
    assert grade_from_score(35) == "C"
    assert grade_from_score(34.99) == "D"


def test_industry_aggregate_skips_small_samples() -> None:
    salaries = [5_000_000, 6_000_000]
    ages = [40.0, 38.0]
    assert aggregate_industry(salaries, ages, 5250) is None


def test_industry_aggregate_basic() -> None:
    salaries = [5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000]
    ages = [38.0, 40.0, 42.0, 41.0, 39.0]
    agg = aggregate_industry(salaries, ages, 5250)
    assert agg is not None
    assert agg.company_count == 5
    assert agg.avg_salary_yen == 7_000_000
    assert 39.5 < agg.avg_age_years < 40.5


def test_score_well_paid_young_company_scores_high() -> None:
    salaries = [5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000]
    ages = [38.0, 40.0, 42.0, 41.0, 39.0]
    agg = aggregate_industry(salaries, ages, 5250)

    # Company: 12M salary (1.7x industry) + age 32 (vs 40 industry)
    s = score_company(12_000_000, 32.0, agg)
    assert s is not None
    assert s.raw_score > 80    # should hit S
    assert s.grade == "S"
    assert s.salary_deviation > 65
    assert s.age_deviation > 65


def test_score_low_pay_old_company_scores_low() -> None:
    salaries = [5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000]
    ages = [38.0, 40.0, 42.0, 41.0, 39.0]
    agg = aggregate_industry(salaries, ages, 5250)

    s = score_company(4_000_000, 50.0, agg)
    assert s is not None
    assert s.raw_score < 50
    assert s.grade in {"C", "D"}


def test_score_returns_none_for_missing_inputs() -> None:
    salaries = [5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000]
    ages = [38.0, 40.0, 42.0, 41.0, 39.0]
    agg = aggregate_industry(salaries, ages, 5250)
    assert score_company(None, 35.0, agg) is None
    assert score_company(8_000_000, None, agg) is None
    assert score_company(8_000_000, 35.0, None) is None


if __name__ == "__main__":
    test_grade_thresholds()
    test_industry_aggregate_skips_small_samples()
    test_industry_aggregate_basic()
    test_score_well_paid_young_company_scores_high()
    test_score_low_pay_old_company_scores_low()
    test_score_returns_none_for_missing_inputs()
    print("[OK] all scoring tests pass")
