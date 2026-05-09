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


def test_high_absolute_salary_dominates_industry_correction() -> None:
    """A 2,000万円 company should always reach S, even if its industry's
    average is also high (so industry correction is small)."""
    # 商社風: 業種平均がそもそも高い (1500万) ケース
    salaries = [13_000_000, 14_000_000, 15_000_000, 16_000_000, 17_000_000]
    ages = [41.0, 42.0, 42.0, 43.0, 43.0]
    agg = aggregate_industry(salaries, ages, 6050)

    s = score_company(20_000_000, 42.0, agg)
    assert s is not None
    assert s.grade == "S", f"Expected S, got {s.grade} (raw={s.raw_score})"


def test_low_absolute_salary_cannot_reach_S_via_industry_only() -> None:
    """A 400万円 company in a low-paying industry should NOT reach S.
    The new formula caps the absolute_score at 24 (= 400万 / 166,666),
    so even with maxed-out industry+age bonuses it stays well below 80.
    This is the main bug fix from the old multiplicative formula."""
    # 低年収業種: 全社が350万付近
    salaries = [3_400_000, 3_500_000, 3_600_000, 3_700_000, 3_800_000]
    ages = [42.0, 43.0, 44.0, 45.0, 46.0]
    agg = aggregate_industry(salaries, ages, 9050)

    # 業種内では年収+15%, 年齢-30% の "好成績" だが、絶対年収は依然低い
    s = score_company(4_000_000, 30.0, agg)
    assert s is not None
    assert s.grade != "S", (
        f"Low absolute salary should not reach S "
        f"(grade={s.grade}, raw={s.raw_score})"
    )


def test_average_salary_company_is_around_B() -> None:
    """A 700万円 company at industry average age should grade ~B."""
    salaries = [5_000_000, 6_000_000, 7_000_000, 8_000_000, 9_000_000]
    ages = [38.0, 40.0, 42.0, 41.0, 39.0]
    agg = aggregate_industry(salaries, ages, 5250)

    s = score_company(7_000_000, 40.0, agg)
    assert s is not None
    # 700万 → abs_score 42, ratio==1 → bonuses 0 → raw = 42 → C/B境界
    assert 35 <= s.raw_score < 65, f"Mid-tier company unexpected score {s.raw_score}"


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
    test_high_absolute_salary_dominates_industry_correction()
    test_low_absolute_salary_cannot_reach_S_via_industry_only()
    test_average_salary_company_is_around_B()
    test_score_returns_none_for_missing_inputs()
    print("[OK] all scoring tests pass")
