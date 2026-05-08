# ✅ 公開完了

🔗 **本番URL: https://salary-ranking-jp.vercel.app**
🔗 **GitHubリポジトリ: https://github.com/projinji3dannlaboratory-dev/Projinji3dann**

---

# 公開までの手順 (edinetdb.jp 経由 / 完全無料)

データソースを **edinetdb.jp に正式ピボット**しました。EDINET公式のログイン詰まりは回避され、APIキーは既に登録・動作確認済みです。

**現在の状態**:
- ✅ APIキー疎通確認済み (3,785社取得可能)
- ✅ 本番データ (`web/data/snapshot.json`, 3.2MB) コミット済み
- ✅ ビルド成功、TS strict typecheck pass、Vitest 25/25 pass、Python tests 19/19 pass
- ✅ OGP画像が実データ (Toyota 983万円・40.7歳・A 76.1点) で正しくレンダリング
- ⏸ あとは GitHub push → Vercel デプロイ だけ

---

## 最短デプロイ手順（合計 15-20分）

### Step 1. GitHub リポジトリ作成 + push (5分)

GitHub CLI を使う場合（推奨）:

```bash
cd C:\Users\seito\projects\salary-ranking-jp

# 初回のみ
gh auth login

gh repo create salary-ranking-jp --public --source=. --remote=origin --push
```

もし `gh` が無い場合:

1. https://github.com/new で空リポジトリを作成（Public 推奨）
2. ターミナルで:

```bash
cd C:\Users\seito\projects\salary-ranking-jp
git remote add origin https://github.com/<YOUR_USER>/salary-ranking-jp.git
git push -u origin main
```

### Step 2. Vercel デプロイ (5分)

1. https://vercel.com/new にアクセス → 上記GitHubリポジトリを Import
2. **Root Directory** を `web` に設定（**重要・忘れるとビルド失敗**）
3. Framework は Next.js が自動検出される
4. Environment Variables（最初は1つだけでOK）:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | デプロイ後のURL（仮で `https://salary-ranking-jp.vercel.app` 入れて後で更新） |

5. Deploy をクリック → 1〜2分で公開URL発行
6. 発行されたURLにアクセスして、3,785社のランキングが見えれば成功 🎉
7. 必要に応じ `NEXT_PUBLIC_SITE_URL` を実URLに更新して再デプロイ（OGP画像のフルパス用）

### Step 3. GitHub Actions Secrets 設定 (3分)

リポジトリの **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `EDINETDB_API_KEY` | `edb_5d078bc2e573f487f5cd105e4c2adfa2`（または最新キー） |

これで毎年 7/1 00:00 JST にデータが自動更新されます。

### Step 4. note 記事公開 (10分)

`docs/note-article-template.md` のプレースホルダ `<YOUR_SITE_URL>` `<YOUR_GITHUB_URL>` を置換してそのまま使えます。

OGP画像は note 側が自動取得します。

---

## オプション: Supabase 連携（後でやってもOK）

snapshot.json で十分動きますが、リアルタイム検索を Supabase Postgres でやりたい場合のみ。

1. https://supabase.com/dashboard で New project（無料・東京リージョン推奨）
2. SQL Editor で `supabase/migrations/001_initial_schema.sql` → `002_industries_seed.sql` を順に Run
3. Project Settings から接続情報をコピー
4. Vercel + GitHub Actions の Secrets に追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Vercelのみ)
   - `DATABASE_URL` (GitHub Actionsのみ・Pooler URL/port 6543)
5. ローカルで一度 `python -m src.cli run-batch` を流して DB 投入
6. Vercelを再デプロイ

これで Supabase が優先データソースになり、snapshot.json はフォールバックとして残ります。

---

## 動作確認の小ネタ

- ローカルで本番データ確認: `cd web && npm run dev` → http://localhost:3000
- ローカルでバッチを再実行: `cd data-pipeline && python -m src.cli run-batch --dry-run`
- snapshot.json を再生成: `python -m src.export_for_web`
- スコアを納得行くまで調整したい: `docs/scoring.md` を編集 → `data-pipeline/src/scoring.py` を編集 → 再バッチ

---

## トラブルシュート

### Vercel ビルドが失敗する
- `Root Directory` が `web` になっているか確認
- Node.js バージョンが 20+ か確認

### snapshot.json のデータが古い
- 手動: `python -m src.cli run-batch --dry-run && python -m src.export_for_web` を実行 → コミット → push
- 自動: GitHub Actions の Annual Data Batch を手動実行（Actions タブ → Run workflow）

### OGP画像で日本語が文字化け
- Edge Runtime での Noto Sans JP フェッチに失敗している可能性。Vercel Logs で `[og]` を grep
- 一時的なネットワーク問題の場合、再生成すれば直る

---

## 進捗サマリ

完成済み機能:

| カテゴリ | 内容 |
|---|---|
| データパイプライン | edinetdb.jp screener で 3,785社を 8リクエストで取得 |
| DB スキーマ | 6テーブル + 1ビュー、東証33業種シード（Supabase連携時に使用） |
| Web (Next.js 15) | TOPランキング / 企業詳細 / 比較 / 業種別 / お気に入り / About / OGP |
| 機能 | 仮想スクロール、レーダーチャート、年収カーブシミュレーション、ダークモード、JSON-LD、お気に入り |
| インフラ | GitHub Actions cron (7/1 00:00 JST)、Vercel ISR、Supabase Free対応 |
| テスト | Python 15ケース + TypeScript 25ケース、すべて通過 |
| OGP | Noto Sans JP 統合済み・実データで動作確認済 |

未実装 (将来拡張):

- Supabase 連携（snapshot.json で動くため緊急性は低い）
- 認証 / マルチデバイス同期
- 5年成長率（時系列データ蓄積後）
- 役員報酬データ
- 検索のさらなる高速化（Meilisearch等）
