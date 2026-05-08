"""edinetdb.jp REST API client.

This is the primary data source. It is a third-party service (Cabocia Inc.)
that re-publishes 金融庁 EDINET data with additional analytics. Output for our
batch is the (avg_age, avg_annual_salary, industry, fiscal_year, codes) tuple
for every listed company in one shot.

Strategy:
- /v1/screener with multi-condition JSON returns BOTH avg-age AND
  avg-annual-salary as columns when both metrics are passed as conditions.
- Cap is 500 records per response, but `offset` works.
- 3,800 companies / 500 = 8 calls per annual batch — well within the free
  100/day quota.

Docs: https://edinetdb.jp/developers
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Iterator

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


BASE_URL = "https://edinetdb.jp/v1"
DEFAULT_TIMEOUT = 60.0


@dataclass(frozen=True)
class CompanySnapshot:
    """Per-company row returned by the screener."""

    edinet_code: str
    sec_code: str | None
    name_ja: str
    name_en: str | None
    industry_name: str        # Japanese, e.g. "情報・通信業"
    fiscal_year: int | None
    accounting_standard: str | None
    avg_age_years: float | None
    avg_annual_salary_man_yen: float | None  # 単位: 万円
    avg_tenure_years: float | None
    num_employees: int | None
    business_tags: list[str]


class EdinetdbClient:
    def __init__(self, api_key: str | None = None, *, timeout: float = DEFAULT_TIMEOUT) -> None:
        key = api_key or os.environ.get("EDINETDB_API_KEY")
        if not key:
            raise RuntimeError(
                "EDINETDB_API_KEY is not set. Put it in .env.local or pass api_key=."
            )
        self._key = key
        self._client = httpx.Client(
            timeout=timeout,
            headers={"X-API-Key": key, "User-Agent": "salary-ranking-jp/1.0"},
        )

    def __enter__(self) -> "EdinetdbClient":
        return self

    def __exit__(self, *_exc: object) -> None:
        self._client.close()

    # ─── status ──────────────────────────────────────────────────────────
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20))
    def status(self) -> dict:
        """Hit /v1/status. Useful for smoke-testing the API key."""
        r = self._client.get(f"{BASE_URL}/status")
        r.raise_for_status()
        return r.json().get("data", {})

    # ─── screener ───────────────────────────────────────────────────────
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20))
    def _screener_page(
        self,
        conditions: list[dict],
        *,
        limit: int = 500,
        offset: int = 0,
        sort: str | None = None,
        order: str = "desc",
    ) -> tuple[list[dict], int]:
        """Fetch a single page from /v1/screener. Returns (companies, total)."""
        params: dict[str, object] = {
            "conditions": json.dumps(conditions, ensure_ascii=False),
            "limit": limit,
            "offset": offset,
            "order": order,
        }
        if sort:
            params["sort"] = sort
        r = self._client.get(f"{BASE_URL}/screener", params=params)
        r.raise_for_status()
        body = r.json()
        if "error" in body:
            raise RuntimeError(f"edinetdb error: {body['error']}")
        data = body.get("data", {})
        return data.get("companies", []), int(data.get("total", 0))

    def fetch_all_company_snapshots(
        self,
        *,
        page_size: int = 500,
        max_pages: int = 50,
        progress: bool = True,
    ) -> list[CompanySnapshot]:
        """Walk the screener with offset to retrieve every listed company.

        Adding 4 metrics as conditions causes the screener to include all 4 as
        columns in the response. avg-tenure-years and num-employees are not in
        the public `available_metrics` list, but the API still accepts them.
        """
        conditions = [
            {"metric": "avg-annual-salary", "operator": "gte", "value": 0},
            {"metric": "avg-age", "operator": "gte", "value": 0},
            {"metric": "avg-tenure-years", "operator": "gte", "value": 0},
            {"metric": "num-employees", "operator": "gte", "value": 0},
        ]
        out: list[CompanySnapshot] = []
        offset = 0
        for page in range(max_pages):
            rows, total = self._screener_page(
                conditions, limit=page_size, offset=offset, sort="avg-annual-salary"
            )
            if progress:
                print(
                    f"[edinetdb] page {page + 1}: got {len(rows)} rows "
                    f"(offset={offset}, total={total})"
                )
            if not rows:
                break
            for row in rows:
                out.append(_row_to_snapshot(row))
            offset += len(rows)
            if offset >= total:
                break
        return out

    # ─── per-company detail (rich data, optional) ────────────────────────
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20))
    def fetch_company(self, edinet_code: str) -> dict:
        """Fetch /v1/companies/{edinet_code}. Quota-heavy, only used for top
        companies if we want the rich fields (num_employees, tenure, etc.).
        """
        r = self._client.get(f"{BASE_URL}/companies/{edinet_code}")
        r.raise_for_status()
        body = r.json()
        if "error" in body:
            raise RuntimeError(f"edinetdb error: {body['error']}")
        return body.get("data", {})


# ─── helpers ────────────────────────────────────────────────────────────

def _row_to_snapshot(row: dict) -> CompanySnapshot:
    headcount = _to_float(row.get("num-employees"))
    return CompanySnapshot(
        edinet_code=row.get("edinetCode") or "",
        sec_code=row.get("secCode") or None,
        name_ja=row.get("filerName") or "",
        name_en=row.get("name_en") or None,
        industry_name=row.get("industry") or "",
        fiscal_year=int(row["fiscalYear"]) if row.get("fiscalYear") else None,
        accounting_standard=row.get("accountingStandard"),
        avg_age_years=_to_float(row.get("avg-age")),
        avg_annual_salary_man_yen=_to_float(row.get("avg-annual-salary")),
        avg_tenure_years=_to_float(row.get("avg-tenure-years")),
        num_employees=int(headcount) if headcount is not None else None,
        business_tags=list(row.get("business_tags") or []),
    )


def _to_float(v: object) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None
