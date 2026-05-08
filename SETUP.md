# 起床後の手順 — デプロイまでの最短経路

おはようございます。寝ている間に Phase 1〜3 の実装を完了し、追加の Phase 4（テスト・お気に入り・業種別ランキング・SEO・PWA・OGP日本語フォント・loading/error UI・note記事テンプレ）まで進めました。

下記の作業はすべて **ユーザー本人のアカウント操作が必要** なため、私側では完了できません。
所要時間は合計 30〜45分程度です。

---

## チェックリスト

- [ ] **0.** EDINET APIキーを再発行（メール認証完了後）
- [ ] **1.** Supabase プロジェクト作成
- [ ] **2.** Supabase に SQL マイグレーションを投入
- [ ] **3.** GitHub リポジトリを作成して push
- [ ] **4.** Vercel に連携してデプロイ
- [ ] **5.** GitHub Actions の Secrets を設定
- [ ] **6.** 初回バッチを GitHub Actions 手動実行
- [ ] **7.** note 記事を公開

---

## 0. EDINET APIキー再発行

1. https://disclosure2.edinet-fsa.go.jp/weee0010.aspx を開く
2. 登録時のメールアドレスでログイン or 新規登録
3. メールで届いた認証リンクを必ずクリック（**これを忘れるとキーが無効）
4. 管理画面で APIキーを発行（または再発行）
5. 取得したキー（`edb_` 接頭辞なしの 32文字 hex のはず）を控える

確認: ブラウザで以下を開き、JSONが返るかチェック（`YOUR_KEY` を置換）
```
https://api.edinet-fsa.go.jp/api/v2/documents.json?date=2025-06-30&type=2&Subscription-Key=YOUR_KEY
```
`StatusCode: 401` なら無効、巨大な JSON が返れば有効です。

---

## 1. Supabase プロジェクト作成

1. https://supabase.com/dashboard で `New project`
2. 任意のプロジェクト名（例: `salary-ranking-jp`）、リージョンは `Northeast Asia (Tokyo)` 推奨
3. Database password はメモ
4. プロジェクト作成完了まで2-3分待つ

---

## 2. Supabase スキーマ投入

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/001_initial_schema.sql` の内容をコピペして Run
3. `supabase/migrations/002_industries_seed.sql` も同様に Run
4. Table Editor で `companies` `employee_stats` `industries` `industry_aggregates` `company_scores` `batch_runs` の6テーブル + `v_company_latest` ビューが見えれば成功

### 接続情報の確認

Project Settings → API から:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (※サーバー側専用、外部公開禁止)

Project Settings → Database → Connection pooling から:
- `Connection string` (`Transaction` mode, port 6543) → `DATABASE_URL`

これらをローカル `.env.local` にも追記してください（既に `EDINET_API_KEY` は私が記入済み・要差替え）。

---

## 3. GitHub リポジトリ

```bash
cd C:/Users/seito/projects/salary-ranking-jp

# GitHub CLI が入っていれば
gh auth login                 # 一度きり
gh repo create salary-ranking-jp --public --source=. --remote=origin --push
```

CLI が無い場合は GitHub.com で空のリポジトリを作成して、

```bash
git remote add origin https://github.com/<YOUR_USER>/salary-ranking-jp.git
git push -u origin main
```

---

## 4. Vercel デプロイ

1. https://vercel.com/new で GitHub リポジトリをインポート
2. **Root Directory** を `web` に設定（重要：これを忘れるとビルドが失敗）
3. Framework は `Next.js` で自動検出される
4. Environment Variables に以下を入力:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (Supabaseで取得) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabaseで取得) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Supabaseで取得) |
| `NEXT_PUBLIC_SITE_URL` | デプロイ後の URL（例: `https://salary-ranking-jp.vercel.app`） |

5. Deploy をクリック → 数分で公開URLが発行される
6. 発行後、`NEXT_PUBLIC_SITE_URL` を実URLに更新して再デプロイ（OGP画像のフルパス用）

### 独自ドメイン（任意）

`年収ランキング.jp` のような独自ドメインを取りたい場合は、Vercel Dashboard の Domains から追加。
お名前.com・Cloudflare Registrar 等で取得した日本語ドメインも Punycode で動作します。

---

## 5. GitHub Actions Secrets

リポジトリ Settings → Secrets and variables → Actions:

| Name | Value |
|---|---|
| `EDINET_API_KEY` | EDINET から取得した有効なキー |
| `DATABASE_URL` | Supabase Pooler URL (`postgresql://postgres.xxx:...@aws-0-...pooler.supabase.com:6543/postgres`) |
| `SLACK_WEBHOOK_URL` | （任意）失敗時通知 |

---

## 6. 初回バッチを手動実行

GitHub → Actions → `Annual Data Batch` → `Run workflow`:

- `fiscal_year` は空のまま（前年が自動選択）
- `dry_run` は最初は `false`（本番投入）

**初回は注意:**
- 4,000社 × XBRL ZIP ダウンロードで2〜4時間かかる可能性
- 失敗時は workflow の "Upload processed snapshot" artifact から JSON を確認

完了したら Vercel の `/` を開き、サンプルではなく Supabase のデータがランキング表示されていれば成功。

### 動作テストだけしたい場合

ローカルで:

```bash
cd data-pipeline
.venv\Scripts\activate
python -m src.cli list-recent --date 2025-06-30      # APIキー疎通テスト
python -m src.cli run-batch --fiscal-year 2024 --dry-run --limit 50
```

`data/processed/fy2024.json` に50社分のスナップショットが保存されます。

---

## 7. note記事公開

`docs/note-article-template.md` を `<YOUR_SITE_URL>`・`<YOUR_GITHUB_URL>`・`${COMPANY_EXAMPLE}` などのプレースホルダを置換してそのまま使えます。

OGP画像は note の自動取得で表示されます（公開後 24h でキャッシュ更新）。

---

## トラブルシュート

### ビルドが Vercel で失敗する

- `Root Directory` を `web` に設定したか確認
- `package.json` の `engines` 制約を満たしているか（Node 20+）

### 検索が遅い / DB クエリが重い

- Supabase Free tier は CPU 制限あり。`pg_trgm` インデックスは効いているはず
- 4,000社分 select * は 1MB 程度なので問題ないはず
- 困ったら `v_company_latest` をマテリアライズドビューに変更

### XBRL パースエラーで企業がスキップされる

- バッチ artifact の JSON を確認
- `data-pipeline/src/xbrl_parser.py` で要素名 / contextRef の優先度を調整

---

## 進捗サマリ

実装済み (Phase 1 + 2 + 3 + 4):

| カテゴリ | 内容 |
|---|---|
| Python パイプライン | EDINET v2クライアント、XBRL パーサー、独自スコア、Postgres upsert、Typer CLI |
| DB スキーマ | 6テーブル + 1ビュー、東証33業種シード、`pg_trgm` GIN |
| Web (Next.js 15) | TOPランキング / 企業詳細 / 比較 / 業種別 / お気に入り / About / OGP / sitemap / robots / manifest / favicon |
| 機能 | 仮想スクロール、レーダーチャート、年収カーブシミュレーション、ダークモード、JSON-LD、お気に入り永続化 |
| インフラ | GitHub Actions cron (7/1 00:00 JST)、Vercel ISR、Supabase Free対応 |
| テスト | Python 11ケース + TypeScript 25ケース、すべて通過 |
| バンドル | TOP 169KB、企業詳細 270KB、46ページ生成 |

未実装 (将来拡張):

- 認証 / マルチデバイス同期 (現状 localStorage のみ)
- 5年成長率（バッチを複数年回した後に意味を持つ）
- 連結ベース vs 単体ベースの切替
- 役員報酬データ
- 検索のさらなる高速化（Meilisearch等）
- CMS連携 / 編集画面

---

何か詰まったらこのドキュメント / README.md を再確認してください。
お疲れさまでした！
