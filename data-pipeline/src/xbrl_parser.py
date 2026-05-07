"""Parse EDINET XBRL instance documents to extract employee statistics.

Target elements (from jpcrp_cor / jpdei_cor taxonomies):

- jpcrp_cor:AverageAgeYearsEmployees                 平均年齢 (years)
- jpcrp_cor:AverageLengthOfServiceYearsEmployees     平均勤続年数 (years)
- jpcrp_cor:AverageAnnualSalaryEmployees             平均年間給与 (yen)
- jpcrp_cor:NumberOfEmployees                        従業員数
- jpdei_cor:SecurityCodeDEI                           証券コード
- jpdei_cor:EDINETCodeDEI                             EDINETコード
- jpdei_cor:FilerNameInJapaneseDEI                    提出者名 (日本語)
- jpdei_cor:IndustryCodeDEI                           業種コード (東証33業種)
- jpcrp_cor:CompanyNameCoverPage                      表紙の会社名
- jpdei_cor:CurrentFiscalYearEndDateDEI               当期末日 (YYYY-MM-DD)
- jpdei_cor:CurrentPeriodEndDateDEI                   当期末日 (代替)

We pick the **non-consolidated** context for employee stats because that's the
convention in 有価証券報告書「従業員等の状況」.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from lxml import etree


# Wildcard namespace match. Taxonomies are versioned by date so the URI changes,
# but the local-name approach is stable.
NS_LOCAL = "*"


@dataclass
class EmployeeStats:
    edinet_code: str | None
    sec_code: str | None
    filer_name: str | None
    industry_code: str | None  # 東証33業種コード (string of digits)
    fiscal_year_end: str | None  # YYYY-MM-DD
    avg_age_years: float | None
    avg_tenure_years: float | None
    avg_annual_salary_yen: int | None
    employee_count: int | None
    is_non_consolidated: bool

    def is_complete_for_stats(self) -> bool:
        """Need at least name + (age or salary) to be useful."""
        return bool(
            self.edinet_code
            and (self.avg_age_years is not None or self.avg_annual_salary_yen is not None)
        )


def _is_non_consolidated_ctx(ctx_id: str) -> bool:
    """Heuristic: many EDINET XBRLs use `_NonConsolidatedMember` suffix."""
    if not ctx_id:
        return False
    return "NonConsolidatedMember" in ctx_id


def _is_current_period_ctx(ctx_id: str) -> bool:
    """Pick CurrentYear / CurrentPeriod contexts over Prior."""
    if not ctx_id:
        return False
    if "Prior" in ctx_id:
        return False
    return ("CurrentYear" in ctx_id) or ("CurrentPeriod" in ctx_id)


def _to_float(text: str | None) -> float | None:
    if text is None:
        return None
    s = text.strip().replace(",", "")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _to_int(text: str | None) -> int | None:
    f = _to_float(text)
    if f is None:
        return None
    return int(round(f))


def _pick_best(elements: list[etree._Element]) -> etree._Element | None:
    """Pick the element whose contextRef is most likely the desired one.

    Priority: NonConsolidated AND Current > NonConsolidated > Current > first.
    """
    if not elements:
        return None

    def score(el: etree._Element) -> int:
        ctx = el.get("contextRef") or ""
        s = 0
        if _is_non_consolidated_ctx(ctx):
            s += 4
        if _is_current_period_ctx(ctx):
            s += 2
        # Prefer simple instant contexts (CurrentYearInstant) over
        # cumulative ones; instant=1, duration=0
        if ctx and "Instant" in ctx:
            s += 1
        return s

    return max(elements, key=score)


def _findall_local(root: etree._Element, local_name: str) -> list[etree._Element]:
    """Find all elements regardless of namespace by local name."""
    return root.xpath(f"//*[local-name()='{local_name}']")


def parse_xbrl_instance(xbrl_bytes: bytes) -> EmployeeStats:
    """Parse a single instance XBRL XML and return employee stats."""
    parser = etree.XMLParser(recover=True, huge_tree=True)
    root = etree.fromstring(xbrl_bytes, parser=parser)

    def pick(local_name: str) -> tuple[str | None, str | None]:
        """Return (text, contextRef) from the best-fitting element."""
        nodes = _findall_local(root, local_name)
        best = _pick_best(nodes)
        if best is None:
            return None, None
        return (best.text or "").strip() or None, best.get("contextRef")

    age_text, age_ctx = pick("AverageAgeYearsEmployees")
    tenure_text, _ = pick("AverageLengthOfServiceYearsEmployees")
    salary_text, _ = pick("AverageAnnualSalaryEmployees")
    headcount_text, _ = pick("NumberOfEmployees")

    edinet_text, _ = pick("EDINETCodeDEI")
    sec_text, _ = pick("SecurityCodeDEI")
    name_text, _ = pick("FilerNameInJapaneseDEI")
    if not name_text:
        name_text, _ = pick("CompanyNameCoverPage")
    industry_text, _ = pick("IndustryCodeDEI")
    period_end_text, _ = pick("CurrentFiscalYearEndDateDEI")
    if not period_end_text:
        period_end_text, _ = pick("CurrentPeriodEndDateDEI")

    return EmployeeStats(
        edinet_code=edinet_text,
        sec_code=sec_text,
        filer_name=name_text,
        industry_code=industry_text,
        fiscal_year_end=period_end_text,
        avg_age_years=_to_float(age_text),
        avg_tenure_years=_to_float(tenure_text),
        avg_annual_salary_yen=_to_int(salary_text),
        employee_count=_to_int(headcount_text),
        is_non_consolidated=_is_non_consolidated_ctx(age_ctx or ""),
    )


def find_instance_file(xbrl_files: dict[str, bytes]) -> bytes | None:
    """Find the main instance XBRL among files in the zip.

    EDINET zips typically contain:
        XBRL/PublicDoc/jpcrp030000-asr-001_E*-000_*.xbrl    <- instance (we want this)
        XBRL/PublicDoc/jpcrp030000-asr-001_E*-000_*.xsd
        XBRL/PublicDoc/0000000_header_*.xml                  <- header, not instance
    """
    candidates = [
        (name, blob)
        for name, blob in xbrl_files.items()
        if name.lower().endswith(".xbrl") and "publicdoc" in name.lower()
    ]
    # Prefer files starting with jpcrp... (annual report type 030000)
    for name, blob in candidates:
        base = Path(name).name.lower()
        if base.startswith("jpcrp") and "asr" in base:
            return blob
    # Fallback: any .xbrl in PublicDoc
    if candidates:
        return candidates[0][1]
    # Last resort: any .xbrl
    for name, blob in xbrl_files.items():
        if name.lower().endswith(".xbrl"):
            return blob
    return None


# ─── Industry code helpers ────────────────────────────────────────────────

# Some companies report jpdei IndustryCodeDEI as the JPX 33-sector code,
# but historically also as JSIC (Japan Standard Industrial Classification).
# We'll keep the raw string and let the pipeline map it.

JPX_33_SECTOR_CODES: set[int] = {
    50, 1050, 2050, 3050, 3100, 3150, 3200, 3250, 3300, 3350, 3400, 3450,
    3500, 3550, 3600, 3650, 3700, 3750, 3800, 4050, 5050, 5100, 5150, 5200,
    5250, 6050, 6100, 7050, 7100, 7150, 7200, 8050, 9050,
}


def normalize_industry_code(raw: str | None) -> int | None:
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if not digits:
        return None
    code = int(digits)
    return code if code in JPX_33_SECTOR_CODES else None
