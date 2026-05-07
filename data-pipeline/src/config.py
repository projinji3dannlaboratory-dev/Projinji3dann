"""Settings loaded from .env.local at repo root."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = REPO_ROOT / ".env.local"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=False)


def get_edinet_api_key() -> str:
    key = os.environ.get("EDINET_API_KEY")
    if not key:
        raise RuntimeError(
            f"EDINET_API_KEY missing. Set it in {ENV_PATH} or environment."
        )
    return key


CACHE_DIR = REPO_ROOT / "data-pipeline" / "data" / "cache"
RAW_DIR = REPO_ROOT / "data-pipeline" / "data" / "raw"
PROCESSED_DIR = REPO_ROOT / "data-pipeline" / "data" / "processed"
