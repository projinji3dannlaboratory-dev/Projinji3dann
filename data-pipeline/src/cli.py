"""Command-line entry point for the data pipeline.

Examples:
    python -m src.cli list-recent
    python -m src.cli list-recent --date 2025-06-30
    python -m src.cli fetch-doc S100ABCD
    python -m src.cli run-batch --fiscal-year 2024
    python -m src.cli run-batch --fiscal-year 2024 --dry-run
"""
from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from .config import CACHE_DIR, PROCESSED_DIR, get_edinet_api_key
from .edinet_client import EdinetClient

app = typer.Typer(help="EDINET data pipeline CLI")
console = Console()


@app.command("list-recent")
def list_recent(
    target: str = typer.Option(
        "",
        "--date",
        help="Target date YYYY-MM-DD. Defaults to latest weekday with data (~yesterday).",
    ),
    only_annual: bool = typer.Option(
        True, help="Filter to annual securities reports (docTypeCode=120)."
    ),
) -> None:
    """List documents submitted on a single day."""
    if target:
        target_date = date.fromisoformat(target)
    else:
        target_date = date.today() - timedelta(days=1)

    api_key = get_edinet_api_key()
    console.print(f"[bold]EDINET docs for [cyan]{target_date.isoformat()}[/cyan][/bold]")

    with EdinetClient(api_key) as client:
        docs = client.list_documents(target_date)

    if only_annual:
        docs = [d for d in docs if d.doc_type_code == "120" and d.sec_code]

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("docID", style="dim")
    table.add_column("ticker")
    table.add_column("filer")
    table.add_column("type")
    table.add_column("period_end")
    table.add_column("xbrl")

    for d in docs[:40]:
        table.add_row(
            d.doc_id,
            d.sec_code or "-",
            d.filer_name[:30],
            d.doc_type_code,
            d.period_end or "-",
            "✓" if d.xbrl_flag else "-",
        )
    console.print(table)
    console.print(f"[bold green]total: {len(docs)} matching docs[/bold green]")


@app.command("fetch-doc")
def fetch_doc(
    doc_id: str = typer.Argument(..., help="EDINET docID, e.g. S100ABCD"),
) -> None:
    """Download a single document and list files inside the XBRL zip."""
    api_key = get_edinet_api_key()
    with EdinetClient(api_key) as client:
        files = client.fetch_xbrl_files(doc_id, cache_dir=CACHE_DIR)

    console.print(f"[bold]docID:[/bold] {doc_id} -> {len(files)} files")
    for name in sorted(files.keys())[:30]:
        size = len(files[name])
        console.print(f"  {size:>10,} B  {name}")
    if len(files) > 30:
        console.print(f"  ... and {len(files) - 30} more")


@app.command("run-batch")
def run_batch(
    fiscal_year: int = typer.Option(
        None,
        "--fiscal-year",
        help="Target fiscal year (year of period end). Defaults to last completed FY.",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        help="Skip DB writes; just collect, parse and print summary.",
    ),
    limit: int = typer.Option(
        0,
        "--limit",
        help="Max number of docs to parse (0=all). Useful for testing.",
    ),
) -> None:
    """End-to-end annual batch: list → download → parse → score → upsert."""
    from .pipeline import (
        collect_documents,
        compute_industry_aggregates,
        compute_scores,
        fiscal_year_window,
        parse_all,
    )

    if fiscal_year is None:
        # Default: previous calendar year
        fiscal_year = date.today().year - 1

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    start, end = fiscal_year_window(fiscal_year)
    console.rule(f"[bold cyan]Annual batch FY{fiscal_year} ({start} → {end})")

    docs = collect_documents(start, end)
    # Dedupe by sec_code: keep latest (most recent submit datetime)
    by_sec: dict[str, "object"] = {}
    for d in docs:
        if not d.sec_code:
            continue
        prev = by_sec.get(d.sec_code)
        if prev is None or d.submit_datetime > prev.submit_datetime:
            by_sec[d.sec_code] = d
    docs = list(by_sec.values())
    console.print(f"[bold]listed {len(docs)} unique annual reports[/bold]")

    if limit:
        docs = docs[:limit]
        console.print(f"[yellow]--limit applied: parsing first {limit}[/yellow]")

    rows = parse_all(docs)
    console.print(f"[bold green]parsed {len(rows)} companies with usable stats[/bold green]")

    aggs = compute_industry_aggregates(rows)
    scored = compute_scores(rows, aggs)
    console.print(
        f"industries with aggregate: {len(aggs)} / scored companies: {len(scored)}"
    )

    # Save to disk regardless of dry-run for inspection
    out_path = PROCESSED_DIR / f"fy{fiscal_year}.json"
    out_path.write_text(
        json.dumps(
            {
                "fiscal_year": fiscal_year,
                "rows": [r.as_dict() for r in rows],
                "industry_aggregates": aggs,
                "scores": scored,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    console.print(f"snapshot saved → {out_path}")

    if dry_run:
        console.print("[yellow]--dry-run: skipping DB upserts[/yellow]")
        return

    from .db import (
        refresh_industry_and_market_ranks,
        upsert_companies,
        upsert_employee_stats,
        upsert_industry_aggregates,
        upsert_scores,
    )

    company_dicts = [
        {
            "edinet_code": r.edinet_code,
            "sec_code": r.sec_code,
            "name_ja": r.name_ja,
            "industry_code": r.industry_code,
            "market": None,
        }
        for r in rows
    ]
    stats_dicts = [
        {
            "edinet_code": r.edinet_code,
            "fiscal_year": r.fiscal_year,
            "period_end": r.period_end,
            "avg_age_years": r.avg_age_years,
            "avg_tenure_years": r.avg_tenure_years,
            "avg_annual_salary_yen": r.avg_annual_salary_yen,
            "employee_count": r.employee_count,
            "doc_id": r.doc_id,
            "submitted_at": r.submitted_at or None,
            "source_url": r.source_url,
        }
        for r in rows
    ]
    upsert_companies(company_dicts)
    upsert_employee_stats(stats_dicts)
    upsert_industry_aggregates(fiscal_year, aggs)
    upsert_scores(scored)
    refresh_industry_and_market_ranks(fiscal_year)
    console.print("[bold green]batch complete[/bold green]")


if __name__ == "__main__":
    app()
