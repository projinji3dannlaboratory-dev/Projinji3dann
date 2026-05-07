"""EDINET API v2 client.

Docs: https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/WZEK0110.html
"""
from __future__ import annotations

import io
import os
import zipfile
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Iterator

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


EDINET_BASE = "https://api.edinet-fsa.go.jp/api/v2"

# 有価証券報告書 = docTypeCode 120
ANNUAL_REPORT_DOC_TYPE = "120"


@dataclass(frozen=True)
class DocumentMeta:
    doc_id: str
    edinet_code: str          # E + 6 digits
    sec_code: str | None      # 5-digit ticker (4-digit + check digit), None for non-listed
    filer_name: str
    doc_type_code: str
    period_start: str | None  # YYYY-MM-DD
    period_end: str | None
    submit_datetime: str
    xbrl_flag: bool


class EdinetClient:
    """Thin wrapper around EDINET v2 endpoints."""

    def __init__(self, api_key: str | None = None, *, timeout: float = 60.0) -> None:
        key = api_key or os.environ.get("EDINET_API_KEY")
        if not key:
            raise RuntimeError(
                "EDINET_API_KEY is not set. Put it in .env.local or pass api_key=."
            )
        self._key = key
        self._client = httpx.Client(timeout=timeout, follow_redirects=True)

    def __enter__(self) -> "EdinetClient":
        return self

    def __exit__(self, *_exc: object) -> None:
        self._client.close()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20))
    def list_documents(self, target_date: date) -> list[DocumentMeta]:
        """List all documents submitted on a given date.

        type=2 returns metadata for every submitted document on that date.
        """
        url = f"{EDINET_BASE}/documents.json"
        params = {
            "date": target_date.isoformat(),
            "type": "2",
            "Subscription-Key": self._key,
        }
        r = self._client.get(url, params=params)
        r.raise_for_status()
        data = r.json()
        if data.get("metadata", {}).get("status") != "200":
            return []
        out: list[DocumentMeta] = []
        for d in data.get("results", []):
            out.append(
                DocumentMeta(
                    doc_id=d["docID"],
                    edinet_code=d.get("edinetCode") or "",
                    sec_code=d.get("secCode"),
                    filer_name=d.get("filerName") or "",
                    doc_type_code=d.get("docTypeCode") or "",
                    period_start=d.get("periodStart"),
                    period_end=d.get("periodEnd"),
                    submit_datetime=d.get("submitDateTime") or "",
                    xbrl_flag=str(d.get("xbrlFlag", "0")) == "1",
                )
            )
        return out

    def iter_annual_reports(
        self, start: date, end: date
    ) -> Iterator[DocumentMeta]:
        """Yield all 有価証券報告書 (docTypeCode=120) submitted between start and end inclusive."""
        cur = start
        while cur <= end:
            for meta in self.list_documents(cur):
                if (
                    meta.doc_type_code == ANNUAL_REPORT_DOC_TYPE
                    and meta.xbrl_flag
                    and meta.sec_code  # listed companies only
                ):
                    yield meta
            cur += timedelta(days=1)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=20))
    def download_xbrl_zip(self, doc_id: str) -> bytes:
        """Download the XBRL ZIP archive for a document. type=1 = main XBRL package."""
        url = f"{EDINET_BASE}/documents/{doc_id}"
        params = {"type": "1", "Subscription-Key": self._key}
        r = self._client.get(url, params=params)
        r.raise_for_status()
        return r.content

    def fetch_xbrl_files(
        self, doc_id: str, *, cache_dir: Path | None = None
    ) -> dict[str, bytes]:
        """Download a doc and return a {filename: bytes} dict for files inside the zip.

        Uses an on-disk cache so re-runs don't re-download.
        """
        if cache_dir:
            cache_dir.mkdir(parents=True, exist_ok=True)
            cache_path = cache_dir / f"{doc_id}.zip"
            if cache_path.exists():
                blob = cache_path.read_bytes()
            else:
                blob = self.download_xbrl_zip(doc_id)
                cache_path.write_bytes(blob)
        else:
            blob = self.download_xbrl_zip(doc_id)

        files: dict[str, bytes] = {}
        with zipfile.ZipFile(io.BytesIO(blob)) as zf:
            for name in zf.namelist():
                if name.endswith("/"):
                    continue
                files[name] = zf.read(name)
        return files
