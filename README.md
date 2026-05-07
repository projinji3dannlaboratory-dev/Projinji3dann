# 日本上場企業 年収ランキング (salary-ranking-jp)

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
EDINET API v2 (XBRL)         GitHub Actions cron
        │                    7/1 00:00 JST 毎年
        ▼                            │
data-pipeline (Python)  ◀────────────┘
  - EDINETクライアント / XBRLパーサー / スコア計算
  - JSONスナップショット保存 + Supabaseにupsert
        │
        ▼
Supabase Postgres (Free 500MB)
  - companies / employee_stats / industry_aggregates / company_scores
  - v_company_latest (フロントが直接読むビュー)
        │
        ▼
Next.js 15 (App Router) on Vercel Hobby (Free)
  - SSG/ISR + shadcn/ui + Tailwind v4 + Recharts + TanStack Virtual
```

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
│   │   ├── edinet_client.py      # EDINET API ラッパー
│   │   ├── xbrl_parser.py        # XBRL XML 抽出
│   │   ├── scoring.py            # 独自スコア計算
│   │   ├── pipeline.py           # オーケストレーション
│   │   ├── db.py                 # Postgres upsert
│   │   ├── config.py             # 環境変数ローダー
│   │   └── cli.py                # Typer CLI
│   ├── tests/                    # ユニットテスト (合成XBRL)
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
- Supabaseアカウント（無料）、Vercelアカウント（無料）

### 1. EDINET APIキー取得

1. [EDINET API利用登録](https://disclosure2.edinet-fsa.go.jp/weee0010.aspx) でAPIキーを発行
2. `.env.example` を `.env.local` にコピーし `EDINET_API_KEY` を記入

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

# 直近1日分の有報リスト確認 (APIキー疎通テスト)
python -m src.cli list-recent --date 2025-06-30

# 1社だけ落として中身を見る
python -m src.cli fetch-doc S100ABCD

# 本番バッチ (前年度の有報を全取得 → JSONスナップショット保存 + DB投入)
python -m src.cli run-batch --fiscal-year 2024

# DB書込なしでドライラン
python -m src.cli run-batch --fiscal-year 2024 --dry-run --limit 100
```

### 4. Web (Next.js)

```bash
cd web
npm install
npm run dev               # http://localhost:3000
```

サンプルデータ (50社) が `data/sample.ts` にあるため、Supabase未設定でもUIは動きます。

### 5. デプロイ (Vercel)

1. GitHubにpushしてVercelで連携
2. Vercel上で環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (例: `https://salary-ranking.jp`)
3. Build Command: `next build` / Root Directory: `web`

### 6. 年次バッチの設定 (GitHub Actions)

GitHub リポジトリの Settings → Secrets で以下を登録:

| Secret | 値 |
|---|---|
| `EDINET_API_KEY` | EDINET APIキー |
| `DATABASE_URL` | Supabase Pooler URL |
| `SLACK_WEBHOOK_URL` | (任意) Slack通知用 |

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
