"""Map JP industry names returned by edinetdb.jp / EDINET to JPX 33 sector codes.

Some sources return slight variations (e.g. trailing 「業」, "・" vs "／")
so we normalize before lookup.
"""
from __future__ import annotations


# 東証33業種コード ↔ 日本語名
# Aliases handle minor wording differences (no 業, alt punctuation, etc.)
JPX_33_SECTORS: list[tuple[int, str, list[str]]] = [
    (50, "水産・農林業", ["水産・農林"]),
    (1050, "鉱業", []),
    (2050, "建設業", ["建設"]),
    (3050, "食料品", []),
    (3100, "繊維製品", []),
    (3150, "パルプ・紙", []),
    (3200, "化学", ["化学工業"]),
    (3250, "医薬品", []),
    (3300, "石油・石炭製品", ["石油石炭製品"]),
    (3350, "ゴム製品", []),
    (3400, "ガラス・土石製品", ["ガラス土石製品"]),
    (3450, "鉄鋼", []),
    (3500, "非鉄金属", []),
    (3550, "金属製品", []),
    (3600, "機械", []),
    (3650, "電気機器", []),
    (3700, "輸送用機器", []),
    (3750, "精密機器", []),
    (3800, "その他製品", []),
    (4050, "電気・ガス業", ["電気ガス業", "電力・ガス"]),
    (5050, "陸運業", []),
    (5100, "海運業", []),
    (5150, "空運業", []),
    (5200, "倉庫・運輸関連業", ["倉庫運輸関連業"]),
    (5250, "情報・通信業", ["情報通信業"]),
    (6050, "卸売業", []),
    (6100, "小売業", []),
    (7050, "銀行業", []),
    (7100, "証券、商品先物取引業", ["証券商品先物取引業", "証券・商品先物取引業"]),
    (7150, "保険業", []),
    (7200, "その他金融業", []),
    (8050, "不動産業", []),
    (9050, "サービス業", []),
]


def _normalize(name: str) -> str:
    """Strip whitespace and replace different middle-dot variants."""
    if not name:
        return ""
    return (
        name.strip()
        .replace("・", "・")  # full-width middle dot variants
        .replace("・", "・")
        .replace(" ", "")
        .replace("　", "")
    )


def _build_lookup() -> dict[str, int]:
    table: dict[str, int] = {}
    for code, canonical, aliases in JPX_33_SECTORS:
        for n in [canonical, *aliases]:
            table[_normalize(n)] = code
    return table


_LOOKUP = _build_lookup()


def industry_name_to_code(name: str | None) -> int | None:
    if not name:
        return None
    n = _normalize(name)
    return _LOOKUP.get(n)


# Reverse map: code → canonical Japanese name
INDUSTRY_NAME_BY_CODE: dict[int, str] = {
    code: canonical for code, canonical, _ in JPX_33_SECTORS
}
