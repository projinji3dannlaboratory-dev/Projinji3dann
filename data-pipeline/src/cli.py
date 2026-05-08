"""Command-line entry point for the data pipeline.

Examples:
    python -m src.cli ping                      # smoke-test edinetdb.jp key
    python -m src.cli list-recent --date 2025-06-30   # legacy: hits 金融庁 EDINET API
    python -m src.cli run-batch                 # full annual batch via edinetdb.jp
    python -m src.cli run-batch --dry-run       # skip DB writes
    python -m src.cli run-batch --limit 50      # parse only first N rows
"""
from __future__ import annotations

import json
from datetime import date, timedelta

import typer
from rich.console import Console
from rich.table import Table

from .config import PROCESSED_DIR

app = typer.Typer(help="salary-ranking-jp data pipeline")
console = Console()


@app.command("ping")
def ping() -> None:
    """Smoke-test the edinetdb.jp API key and show service status."""
    from .edinetdb_client import EdinetdbClient

    with EdinetdbClient() as client:
        s = client.status()
    console.print("[bold]edinetdb.jp status[/bold]")
    console.print(f"  companies            : {s.get('data_freshness', {}).get('companies')}")
    console.print(
        "  companies w/ financ. : "
        f"{s.get('data_freshness', {}).get('companies_with_financials')}"
    )
    console.print(
        "  last refreshed       : "
        f"{s.get('data_freshness', {}).get('last_refreshed')}"
    )
    console.print(f"  metrics              : {len(s.get('available_metrics', []))} 個")
    console.print(f"  industries           : {len(s.get('available_industries', []))} 個")
    console.print(f"[green]API key OK[/green]")


@app.command("list-recent")
def list_recent(
    target: str = typer.Option("", "--date"),
    only_annual: bool = typer.Option(True),
) -> None:
    """[legacy] List 有報 submissions for a single day from the official EDINET API.

    Requires EDINET_API_KEY (NOT edinetdb.jp). Currently blocked on auth flow,
    so this is mostly here as a safety net for future re-activation.
    """
    from .edinet_client import EdinetdbClient as _Edinet  # noqa: F401  # pragma: no cover

    from .edinet_client import EdinetClient  # local import to avoid env requirement
    if target:
        target_date = date.fromisoformat(target)
    else:
        target_date = date.today() - timedelta(days=1)

    with EdinetClient() as client:
        docs = client.list_documents(target_date)
    if only_annual:
        docs = [d for d in docs if d.doc_type_code == "120" and d.sec_code]

    table = Table(show_header=True, header_style="bold magenta")
    for col in ("docID", "ticker", "filer", "type", "period_end"):
        table.add_column(col)
    for d in docs[:30]:
        table.add_row(
            d.doc_id, d.sec_code or "-", d.filer_name[:30], d.doc_type_code, d.period_end or "-"
        )
    console.print(table)
    console.print(f"[bold green]total: {len(docs)} matching docs[/bold green]")


@app.command("run-batch")
def run_batch(
    fiscal_year: int = typer.Option(
        None,
        "--fiscal-year",
        help="Override the predominant FY from the snapshot.",
    ),
    dry_run: bool = typer.Option(
        False, "--dry-run", help="Skip Postgres writes; save the JSON snapshot only."
    ),
    limit: int = typer.Option(
        0, "--limit", help="Truncate to first N rows (testing)."
    ),
) -> None:
    """End-to-end batch: edinetdb.jp screener → score → upsert."""
    from .pipeline import (
        collect_snapshots,
        compute_industry_aggregates,
        compute_scores,
        predominant_fiscal_year,
    )

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    console.rule("[bold cyan]Annual batch via edinetdb.jp")
    rows = collect_snapshots()
    if limit:
        rows = rows[:limit]
        console.print(f"[yellow]--limit applied: keeping first {limit} rows[/yellow]")

    fy = fiscal_year or predominant_fiscal_year(rows)
    console.print(f"target fiscal year: [bold]{fy}[/bold]")

    aggs = compute_industry_aggregates(rows)
    scored = compute_scores(rows, aggs)
    console.print(
        f"industries with aggregate: [bold]{len(aggs)}[/bold] / "
        f"scored companies: [bold]{len(scored)}[/bold]"
    )

    out_path = PROCESSED_DIR / f"fy{fy}.json"
    out_path.write_text(
        json.dumps(
            {
                "fiscal_year": fy,
                "rows": [r.as_dict() for r in rows],
                "industry_aggregates": aggs,
                "scores": scored,
                "source": "edinetdb.jp",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    console.print(f"snapshot saved → [bold]{out_path}[/bold]")

    if dry_run:
        console.print("[yellow]--dry-run: skipping DB upserts[/yellow]")
        _print_top10(scored, rows)
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
            "doc_id": "edinetdb",
            "submitted_at": None,
            "source_url": r.source_url,
        }
        for r in rows
    ]
    upsert_companies(company_dicts)
    upsert_employee_stats(stats_dicts)
    upsert_industry_aggregates(fy, aggs)
    upsert_scores(scored)
    refresh_industry_and_market_ranks(fy)
    console.print("[bold green]batch complete[/bold green]")


def _print_top10(scored: list[dict], rows) -> None:
    """Pretty-print the top10 by score for sanity check."""
    by_code = {r.edinet_code: r for r in rows}
    table = Table(title="Top 10 by raw_score", show_lines=False)
    for col in ("rank", "grade", "score", "name", "industry", "salary(万円)", "age"):
        table.add_column(col)
    for s in scored[:10]:
        r = by_code.get(s["edinet_code"])
        if not r:
            continue
        table.add_row(
            str(s["rank_overall"]),
            s["grade"],
            f"{s['raw_score']:.1f}",
            (r.name_ja or "")[:24],
            (r.industry_name or "")[:8],
            f"{(r.avg_annual_salary_yen or 0)/10000:.0f}",
            f"{r.avg_age_years:.1f}" if r.avg_age_years else "-",
        )
    console.print(table)


if __name__ == "__main__":
    app()
