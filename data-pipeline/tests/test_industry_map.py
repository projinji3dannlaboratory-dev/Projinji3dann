"""Tests for industry_map."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.industry_map import industry_name_to_code  # noqa: E402


def test_canonical_names() -> None:
    assert industry_name_to_code("情報・通信業") == 5250
    assert industry_name_to_code("輸送用機器") == 3700
    assert industry_name_to_code("銀行業") == 7050
    assert industry_name_to_code("水産・農林業") == 50
    assert industry_name_to_code("サービス業") == 9050


def test_aliases() -> None:
    assert industry_name_to_code("情報通信業") == 5250
    assert industry_name_to_code("証券・商品先物取引業") == 7100


def test_whitespace_tolerant() -> None:
    assert industry_name_to_code("  情報・通信業  ") == 5250
    assert industry_name_to_code("情報・通信業\n") == 5250


def test_unknown_returns_none() -> None:
    assert industry_name_to_code(None) is None
    assert industry_name_to_code("") is None
    assert industry_name_to_code("不明な業種") is None


if __name__ == "__main__":
    test_canonical_names()
    test_aliases()
    test_whitespace_tolerant()
    test_unknown_returns_none()
    print("[OK] all industry_map tests pass")
