"""Unit tests for xbrl_parser using a synthetic minimal XBRL document."""
from __future__ import annotations

import sys
from pathlib import Path
from textwrap import dedent

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.xbrl_parser import parse_xbrl_instance, normalize_industry_code  # noqa: E402


SAMPLE_XBRL = dedent(
    """\
    <?xml version="1.0" encoding="UTF-8"?>
    <xbrli:xbrl
      xmlns:xbrli="http://www.xbrl.org/2003/instance"
      xmlns:link="http://www.xbrl.org/2003/linkbase"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:xbrldi="http://xbrl.org/2006/xbrldi"
      xmlns:jpcrp_cor="http://disclosure.edinet-fsa.go.jp/taxonomy/jpcrp/2024-11-01/jpcrp_cor"
      xmlns:jpdei_cor="http://disclosure.edinet-fsa.go.jp/taxonomy/jpdei/2013-08-31/jpdei_cor"
      xmlns:iso4217="http://www.xbrl.org/2003/iso4217">

      <xbrli:context id="FilingDateInstant">
        <xbrli:entity><xbrli:identifier scheme="http://disclosure.edinet-fsa.go.jp">E12345</xbrli:identifier></xbrli:entity>
        <xbrli:period><xbrli:instant>2024-06-28</xbrli:instant></xbrli:period>
      </xbrli:context>

      <xbrli:context id="CurrentYearInstant_NonConsolidatedMember">
        <xbrli:entity>
          <xbrli:identifier scheme="http://disclosure.edinet-fsa.go.jp">E12345</xbrli:identifier>
          <xbrli:segment>
            <xbrldi:explicitMember dimension="jpcrp_cor:ConsolidatedOrNonConsolidatedAxis">jpcrp_cor:NonConsolidatedMember</xbrldi:explicitMember>
          </xbrli:segment>
        </xbrli:entity>
        <xbrli:period><xbrli:instant>2024-03-31</xbrli:instant></xbrli:period>
      </xbrli:context>

      <xbrli:context id="CurrentYearInstant">
        <xbrli:entity><xbrli:identifier scheme="http://disclosure.edinet-fsa.go.jp">E12345</xbrli:identifier></xbrli:entity>
        <xbrli:period><xbrli:instant>2024-03-31</xbrli:instant></xbrli:period>
      </xbrli:context>

      <xbrli:context id="Prior1YearInstant_NonConsolidatedMember">
        <xbrli:entity>
          <xbrli:identifier scheme="http://disclosure.edinet-fsa.go.jp">E12345</xbrli:identifier>
          <xbrli:segment>
            <xbrldi:explicitMember dimension="jpcrp_cor:ConsolidatedOrNonConsolidatedAxis">jpcrp_cor:NonConsolidatedMember</xbrldi:explicitMember>
          </xbrli:segment>
        </xbrli:entity>
        <xbrli:period><xbrli:instant>2023-03-31</xbrli:instant></xbrli:period>
      </xbrli:context>

      <xbrli:unit id="JPY"><xbrli:measure>iso4217:JPY</xbrli:measure></xbrli:unit>
      <xbrli:unit id="years"><xbrli:measure>xbrli:pure</xbrli:measure></xbrli:unit>
      <xbrli:unit id="pure"><xbrli:measure>xbrli:pure</xbrli:measure></xbrli:unit>

      <jpdei_cor:EDINETCodeDEI contextRef="FilingDateInstant">E12345</jpdei_cor:EDINETCodeDEI>
      <jpdei_cor:SecurityCodeDEI contextRef="FilingDateInstant">12340</jpdei_cor:SecurityCodeDEI>
      <jpdei_cor:FilerNameInJapaneseDEI contextRef="FilingDateInstant">テスト株式会社</jpdei_cor:FilerNameInJapaneseDEI>
      <jpdei_cor:IndustryCodeDEI contextRef="FilingDateInstant">5250</jpdei_cor:IndustryCodeDEI>
      <jpdei_cor:CurrentFiscalYearEndDateDEI contextRef="FilingDateInstant">2024-03-31</jpdei_cor:CurrentFiscalYearEndDateDEI>

      <!-- Prior year (should NOT be picked) -->
      <jpcrp_cor:AverageAgeYearsEmployees contextRef="Prior1YearInstant_NonConsolidatedMember" unitRef="years" decimals="1">42.5</jpcrp_cor:AverageAgeYearsEmployees>
      <jpcrp_cor:AverageAnnualSalaryEmployees contextRef="Prior1YearInstant_NonConsolidatedMember" unitRef="JPY" decimals="0">7800000</jpcrp_cor:AverageAnnualSalaryEmployees>

      <!-- Consolidated (should be deprioritized) -->
      <jpcrp_cor:AverageAgeYearsEmployees contextRef="CurrentYearInstant" unitRef="years" decimals="1">39.0</jpcrp_cor:AverageAgeYearsEmployees>

      <!-- Current year non-consolidated (should be picked) -->
      <jpcrp_cor:AverageAgeYearsEmployees contextRef="CurrentYearInstant_NonConsolidatedMember" unitRef="years" decimals="1">41.2</jpcrp_cor:AverageAgeYearsEmployees>
      <jpcrp_cor:AverageLengthOfServiceYearsEmployees contextRef="CurrentYearInstant_NonConsolidatedMember" unitRef="years" decimals="1">12.5</jpcrp_cor:AverageLengthOfServiceYearsEmployees>
      <jpcrp_cor:AverageAnnualSalaryEmployees contextRef="CurrentYearInstant_NonConsolidatedMember" unitRef="JPY" decimals="0">8500000</jpcrp_cor:AverageAnnualSalaryEmployees>
      <jpcrp_cor:NumberOfEmployees contextRef="CurrentYearInstant_NonConsolidatedMember" unitRef="pure" decimals="0">3200</jpcrp_cor:NumberOfEmployees>

    </xbrli:xbrl>
    """
).encode("utf-8")


def test_picks_current_year_non_consolidated() -> None:
    stats = parse_xbrl_instance(SAMPLE_XBRL)
    assert stats.edinet_code == "E12345"
    assert stats.sec_code == "12340"
    assert stats.filer_name == "テスト株式会社"
    assert stats.industry_code == "5250"
    assert stats.fiscal_year_end == "2024-03-31"
    assert stats.avg_age_years == 41.2
    assert stats.avg_tenure_years == 12.5
    assert stats.avg_annual_salary_yen == 8_500_000
    assert stats.employee_count == 3200
    assert stats.is_non_consolidated is True


def test_complete_for_stats() -> None:
    stats = parse_xbrl_instance(SAMPLE_XBRL)
    assert stats.is_complete_for_stats() is True


def test_normalize_industry_code() -> None:
    assert normalize_industry_code("5250") == 5250
    assert normalize_industry_code("  3650  ") == 3650
    assert normalize_industry_code("9999") is None     # not in JPX 33
    assert normalize_industry_code(None) is None
    assert normalize_industry_code("") is None
    assert normalize_industry_code("abc") is None


def test_handles_missing_fields() -> None:
    minimal = b"""<?xml version='1.0'?>
    <xbrli:xbrl xmlns:xbrli='http://www.xbrl.org/2003/instance'
                xmlns:jpdei_cor='http://disclosure.edinet-fsa.go.jp/taxonomy/jpdei/2013-08-31/jpdei_cor'>
      <jpdei_cor:EDINETCodeDEI>E99999</jpdei_cor:EDINETCodeDEI>
    </xbrli:xbrl>"""
    stats = parse_xbrl_instance(minimal)
    assert stats.edinet_code == "E99999"
    assert stats.avg_age_years is None
    assert stats.avg_annual_salary_yen is None
    assert stats.is_complete_for_stats() is False


def test_handles_thousand_separators() -> None:
    blob = b"""<?xml version='1.0'?>
    <xbrli:xbrl xmlns:xbrli='http://www.xbrl.org/2003/instance'
                xmlns:jpcrp_cor='http://disclosure.edinet-fsa.go.jp/taxonomy/jpcrp/2024-11-01/jpcrp_cor'>
      <jpcrp_cor:AverageAnnualSalaryEmployees contextRef='CurrentYearInstant_NonConsolidatedMember'>8,500,000</jpcrp_cor:AverageAnnualSalaryEmployees>
    </xbrli:xbrl>"""
    stats = parse_xbrl_instance(blob)
    assert stats.avg_annual_salary_yen == 8_500_000


if __name__ == "__main__":
    test_picks_current_year_non_consolidated()
    test_complete_for_stats()
    test_normalize_industry_code()
    test_handles_missing_fields()
    test_handles_thousand_separators()
    print("[OK] all xbrl_parser tests pass")
