# 日本上場企業 年収ランキング (salary-ranking-jp)

🔗 **公開URL: https://salary-ranking-jp.vercel.app**

日本の上場企業（プライム / スタンダード / グロース）の有価証券報告書から
平均年齢・平均年収・平均勤続年数を取得し、独自スコアでランキング表示する Webアプリケーション。

> 公開情報（EDINET / 金融庁）を基にした推計値であり、実際の給与を保証するものではありません。

## 機能ハイライト

- 上場企業の年収・年齢・スコアランキング（市場別 / 業種別 / 検索可能）
- 独自スコア「若くして高年収」指標 (年収補正 × 年齢補正 × 業界補正)
- 年収シミュレーション（5年前 / 5年後 / 10年後 / 22-65歳の生涯年収カーブ）
- 最大4社の横並び比較（レーダーチャート）
- 企業ごとのOGP画像自動生成（SNS共有時にカード表示）
- インクリメンタル検索 + 多軸フィルタ + URL状態共有
- ダーク／ライト切替・モバイル対応

## アーキテクチャ全体像

```
edinetdb.jp /v1/screener         GitHub Actions cron
   (8 calls / annual batch)      7/1 00:00 JST 毎年
        │                                 │
        ▼                                 │
data-pipeline (Python)  ◀─────────────────┘
  - edinetdb.jp クライアント
  - 業種名→JPX33業種コード マッピング
  - 独自スコア計算 (年収 × 年齢 × 業界補正)
  - JSON スナップショット保存 + Supabase upsert
  - web/data/snapshot.json を自動コミット
        │
        ├──> web/data/snapshot.json
        │    (静的フォールバック・Supabase未設定時はこれを使用)
        │
        ▼
Supabase Postgres (Free 500MB) — オプション
  - companies / employee_stats / industry_aggregates / company_scores
  - v_company_latest (フロントが直接読むビュー)
        │
        ▼
Next.js 15 (App Router) on Vercel Hobby (Free)
  - SSG/ISR + shadcn/ui + Tailwind v4 + Recharts + TanStack Virtual
```

**データソース**: 一次情報は [金融庁 EDINET](https://disclosure2.edinet-fsa.go.jp/) の有価証券報告書。
構造化データの取得は [EDINET DB (Cabocia Inc.)](https://edinet-db.jp/) を経由しています。

すべて無料枠で動作するように設計：

| サービス | 用途 | 無料枠の使用感 |
|---|---|---|
| Vercel Hobby | フロントエンド・OGP生成・ISR | 帯域100GB/月 - ふつうの個人サイトなら十分 |
| Supabase Free | DB | 500MB - 4,000社×5年で約20MB程度の使用量 |
| GitHub Actions | 年1回バッチ | publicリポジトリなら無制限 |
| EDINET API | データ取得 | 無料 (要登録、レート制限あり) |

## プロジェクト構成

```
salary-ranking-jp/
├── data-pipeline/                # Python バッチ
│   ├── src/
│   │   ├── edinetdb_client.py    # ★ edinetdb.jp /v1/screener クライアント
│   │   ├── industry_map.py       # 業種名→東証33業種コード マッピング
│   │   ├── scoring.py            # 独自スコア計算
│   │   ├── pipeline.py           # オーケストレーション
│   │   ├── export_for_web.py     # web/data/snapshot.json 出力
│   │   ├── db.py                 # Postgres upsert (任意)
│   │   ├── config.py             # 環境変数ローダー
│   │   ├── cli.py                # Typer CLI
│   │   ├── edinet_client.py      # [legacy] 金融庁 EDINET API クライアント
│   │   └── xbrl_parser.py        # [legacy] XBRL XML 抽出
│   ├── tests/                    # ユニットテスト
│   └── requirements.txt
├── web/                          # Next.js アプリ
│   ├── app/
│   │   ├── page.tsx              # ランキング (TOP)
│   │   ├── companies/[code]/     # 企業詳細
│   │   ├── compare/              # 比較
│   │   ├── about/                # スコア解説 / 免責
│   │   └── api/og/               # OGP動的生成
│   ├── components/
│   │   ├── companies/            # ranking-list / score-breakdown / simulator etc.
│   │   ├── charts/               # salary-curve / radar
│   │   ├── layout/               # header / footer / theme
│   │   └── ui/                   # shadcn風 atomic components
│   ├── lib/
│   │   ├── score.ts              # スコア計算 (Python版とミラー)
│   │   ├── salary-curve.ts       # 年収カーブシミュレーション
│   │   ├── filter-store.ts       # Zustand state
│   │   ├── queries.ts            # Supabase / fallback サンプル
│   │   └── supabase.ts           # クライアント
│   └── data/sample.ts            # デプロイ前/DB空時のサンプルデータ
├── supabase/migrations/          # SQLスキーマ + シード
├── .github/workflows/            # 年1回バッチ
└── docs/                         # スコア・カーブの設計メモ
```

## セットアップ手順

### 0. 前提

- Python 3.12+、Node.js 20+、Git
- edinetdb.jp アカウント（無料）、Vercelアカウント（無料）
- Supabase は **任意**（無くてもデフォルトで snapshot.json を読みます）

### 1. edinetdb.jp APIキー取得 (3分)

1. https://edinetdb.jp/developers/dashboard でアカウント作成（無料）
2. ダッシュボードから「+新規キー発行」をクリック
3. `edb_xxxxxxxxxxxx` 形式のキーをコピー
4. `.env.example` を `.env.local` にコピーし `EDINETDB_API_KEY` を記入

**無料プラン**: 100リクエスト/日。年1回バッチで使うのは8リクエストのみ。

データ出典: [金融庁 EDINET](https://disclosure2.edinet-fsa.go.jp/) (一次情報)
データ提供: [EDINET DB](https://edinetdb.jp/) (構造化・配信)

### 2. Supabase プロジェクト作成

1. https://supabase.com で新規プロジェクト作成（Free）
2. SQL Editor で以下のマイグレーションを順に実行
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_industries_seed.sql`
3. Project Settings → API から取得して `.env.local` に追記:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   DATABASE_URL=postgresql://postgres.xxx:...@aws-0-...pooler.supabase.com:6543/postgres
   ```
   ※`DATABASE_URL` は Connection Pooling（Transaction mode）の URL を使用

### 3. データパイプライン (Python)

```bash
cd data-pipeline
python -m venv .venv
.venv\Scripts\activate          # Windows  (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt

# APIキー疎通テスト
python -m src.cli ping

# 全社ドライラン (DB 書込なし、3,785社を 8 リクエストで取得)
python -m src.cli run-batch --dry-run

# 50社だけ試したい場合
python -m src.cli run-batch --dry-run --limit 50

# Web app 用に snapshot.json を出力
python -m src.export_for_web

# Supabase 接続情報がある場合は本番投入
python -m src.cli run-batch
```

### 4. Web (Next.js)

```bash
cd web
npm install
npm run dev               # http://localhost:3000
```

`web/data/snapshot.json` (バッチ生成済み・3,785社の本番データ) が含まれているため、
Supabase 未設定でも **本物のランキング** が即座に動作します。

### 5. デプロイ (Vercel)

1. GitHubにpushしてVercelで連携
2. **Root Directory** を `web` に設定 (重要)
3. Vercel上で環境変数を設定（**最低限は `NEXT_PUBLIC_SITE_URL` だけでも動く**）:
   - `NEXT_PUBLIC_SITE_URL` (必須・デプロイ後のURL)
   - `NEXT_PUBLIC_SUPABASE_URL` (任意・Supabase連携時のみ)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (任意)

Supabase未設定の場合は `web/data/snapshot.json` (3,785社) を表示します。

### 6. 年次バッチの設定 (GitHub Actions)

GitHub リポジトリの Settings → Secrets で以下を登録:

| Secret | 必須 | 値 |
|---|:---:|---|
| `EDINETDB_API_KEY` | ✅ | edinetdb.jp APIキー |
| `DATABASE_URL` | 任意 | Supabase Pooler URL（Supabase連携時のみ） |
| `SLACK_WEBHOOK_URL` | 任意 | Slack通知用 webhook |

`.github/workflows/annual-batch.yml` が **毎年 7月1日 00:00 JST** に自動実行されます。

手動実行:
- GitHub → Actions → Annual Data Batch → Run workflow

## データ更新の仕組み

- **頻度**: 毎年 7/1 00:00 JST (GitHub Actions cron)
- **対象期間**: 前年（決算期）の 1/1〜8/31 提出分を全取得
- **冪等性**: `(edinet_code, fiscal_year)` でUPSERT、再実行しても重複しない
- **キャッシュ**: 同一docIDは zip ファイルをローカルにキャッシュ
- **失敗時**: workflow_run failure → Slack webhook通知 (任意)

## 独自スコア

詳細: [docs/scoring.md](docs/scoring.md) ・ [docs/salary-curve.md](docs/salary-curve.md)

```
raw_score = (S_c / S_i) × (A_i / A_c) × 50
```

| Grade | 範囲 | 意味 |
|---|---|---|
| **S** | ≥ 80 | 業種内トップクラス |
| **A** | 65–79 | 業種内上位 |
| **B** | 50–64 | 業種内平均以上 |
| **C** | 35–49 | 業種内平均未満 |
| **D** | < 35 | 業種内下位 |

## 法的・免責

- 出典: [EDINET (金融庁)](https://disclosure2.edinet-fsa.go.jp/) - 公衆開示情報
- 数値はあくまで有価証券報告書の開示値からの推計
- 個別企業の異議申し立てはお問い合わせフォームから受付
- 個人を特定する情報は扱わない（企業の平均値のみ）

## 技術選定の理由

| 選定 | 採用理由 / 代替案との比較 |
|---|---|
| Next.js 15 App Router | SSG/ISRでSEO最適化、`@vercel/og`との親和性、Vercel無料枠で動作 |
| Tailwind v4 | shadcn/uiと相性◎、ビルド爆速、CSS変数ベースのテーマ切替 |
| TanStack Virtual | 4,000行を仮想スクロールで瞬時に描画。React-window より型推論が良い |
| Recharts | SSR対応、bundle軽量。Chart.jsよりReact親和性高い |
| Zustand | URLクエリ同期との相性◎。Reduxは過剰、Jotaiは粒度が細かすぎる |
| Supabase | Postgres + REST API + 認証が無料枠で揃う。Pooler でVercel Edgeから接続可能 |
| EDINET XBRL 直接パース | `arelle` は重く起動も遅い。lxml + 名前空間ワイルドカードで十分軽量 |
| GitHub Actions cron | 年1回なら完全無料・シークレット管理も簡潔 |
| TypeScript strict | API契約とドメインモデルの一致を強制 |

## ライセンス

MIT
