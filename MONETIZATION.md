# マネタイゼーション設定ガイド

## 概要

このガイドに従えば、**Google AdSense 審査通過 → 広告掲載 → 収益化** までの流れを完了できます。

**現在の状態**:
- ✅ プライバシーポリシー (`/privacy`) — AdSense 必須
- ✅ 利用規約 (`/terms`)
- ✅ お問い合わせ (`/contact`) — AdSense 必須
- ✅ Cookie 同意バナー (Google Consent Mode v2 対応)
- ✅ ads.txt プレースホルダ (`/ads.txt`)
- ✅ AdSense スクリプト埋め込み枠（環境変数で ON/OFF）
- ✅ Google Analytics 枠（環境変数で ON/OFF）
- ⏸ 環境変数の本番設定（あなたのアクション）
- ⏸ Cloudflare で独自ドメイン取得 → Vercel 接続
- ⏸ AdSense 申請

---

## Phase A: 環境変数を本番（Vercel）に設定 (5 分)

Vercel Dashboard → `salary-ranking-jp` プロジェクト → **Settings → Environment Variables** で以下を追加:

| Name | Value 例 | 用途 | 必須 |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_OPERATOR` | `山田太郎` または `年収ラボ` | フッター・ポリシー記載の運営者名 | ✅ |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `projinji3dann.laboratory@gmail.com` | お問い合わせの mailto: 先 | ✅ |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics 4 (空でも可) | 任意 |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-1234567890123456` | AdSense 承認後に設定 | 後で |

設定後、**Deployments タブ → Redeploy** (キャッシュ外す) で反映。

---

## Phase B: Cloudflare で独自ドメイン取得 + Vercel 接続 (15-30 分)

### 1. Cloudflare Registrar でドメイン購入

1. https://dash.cloudflare.com/registrar
2. ドメイン検索 → 購入（例: `salary-ranking.jp` 約 ¥3,000-5,000/年）
3. .jp ドメインの場合は本人確認が必要

### 2. Vercel に接続

1. Vercel Dashboard → `salary-ranking-jp` → **Settings → Domains**
2. 「Add」をクリック → `salary.projinji3dann-laboratory.com` を入力
3. Vercel が「Add the following CNAME record / A record」と表示される
4. Cloudflare Dashboard → DNS → 表示された通りに追加:
   - `A` レコード: `@` → `76.76.21.21` (Vercel公式IP)
   - `CNAME` レコード: `www` → `cname.vercel-dns.com`
5. Cloudflare の **Proxy Status は「DNS only」** (グレー雲) にすること
   - オレンジ雲 (Proxied) だと Vercel SSL と衝突する場合あり
6. 数分でVercel側で `Verified` に変わる

### 3. 環境変数を独自ドメインに更新

Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_SITE_URL` を `https://salary.projinji3dann-laboratory.com` に変更
- 再デプロイ

---

## Phase C: AdSense 申請 (5 分入力 + 1日〜数週間の審査待ち)

### 1. AdSense アカウント作成

1. https://www.google.com/adsense/start/ にアクセス
2. Google アカウントでログイン
3. サイトURL: `https://salary.projinji3dann-laboratory.com` を入力（独自ドメイン推奨。`.vercel.app` でも申請可だが審査通りにくい）
4. 国: 日本

### 2. AdSense コードをサイトに紐付け

AdSense 管理画面で「サイトの追加」→「審査を申し込む」を押すと、Publisher ID `ca-pub-XXXXXXXXXXXXXXXX` が発行されます。

#### 設定方法（最短）

Vercel 環境変数に追加:
- Name: `NEXT_PUBLIC_ADSENSE_CLIENT`
- Value: `ca-pub-XXXXXXXXXXXXXXXX` (AdSense管理画面でコピー)

→ 再デプロイ → サイトに以下が自動的に追加されます:
- `<head>` 内に AdSense ownership meta タグ
- `<body>` 終端に AdSense JS スクリプト
- これで「Site verification」が通る

### 3. ads.txt 設定

AdSense 承認後、AdSense 管理画面で「ads.txt」セクションに表示される正確な行を:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

`web/public/ads.txt` を編集して上記行を追記 → コミット → push → 自動再デプロイ。

確認: `https://salary.projinji3dann-laboratory.com/ads.txt` で表示できればOK。

### 4. AdSense 審査ポイント

審査通過のために本サイトで既に対応済み:

| 項目 | 状態 |
|---|---|
| プライバシーポリシー | ✅ `/privacy` |
| 連絡先 | ✅ `/contact` |
| 利用規約 | ✅ `/terms` |
| Cookie 同意 (改正APPI / GDPR) | ✅ Consent Mode v2 |
| 充実したオリジナルコンテンツ | ✅ 3,785社の独自データ |
| 簡単なナビゲーション | ✅ ヘッダー・フッター充実 |
| モバイル対応 | ✅ レスポンシブ |
| 表示速度 | ✅ Vercel Edge + ISR |
| 独自ドメイン | ⏸ Cloudflare で取得 |
| サイトのある程度の運用実績 | ⚠️ 審査前に最低1-2週間運用、note記事公開でアクセス積み上げ推奨 |

審査落ちの典型理由:
- コンテンツ不足 → 当サイトは3,785企業ページあるので問題なし
- ナビゲーション欠如 → 対応済
- ポリシー欠如 → 対応済
- 違反コンテンツ → 該当なし
- ドメインの新規性 → 対策: 申請前に1-2週間運用実績を作る

---

## Phase D: 広告ユニット配置 (AdSense 承認後)

承認後、AdSense 管理画面で広告ユニット作成:
- **ディスプレイ広告** を「自動広告」モードで開始 → ページに自動配置（おすすめ）
- もしくは **手動配置** で `<ins class="adsbygoogle" ...>` をコードに追加

手動配置例 (`web/app/page.tsx` のランキング下に追加):

```tsx
{/* AdSense unit */}
<ins
  className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
<script>{`(adsbygoogle = window.adsbygoogle || []).push({});`}</script>
```

私（Claude）に「広告枠を○○ページに○○個追加して」とご依頼いただければ実装します。

---

## Phase E: Google Analytics 設定 (任意・5分)

### 1. GA4 プロパティ作成

1. https://analytics.google.com/ → 管理 → プロパティを作成
2. プロパティ名: `年収ランキング.jp`
3. データストリーム → ウェブ → URL `https://salary.projinji3dann-laboratory.com`
4. 表示される **測定ID `G-XXXXXXXXXX`** をコピー

### 2. Vercel に設定

- Name: `NEXT_PUBLIC_GA_ID`
- Value: `G-XXXXXXXXXX`

→ 再デプロイ

Cookie 同意バナーで「すべて許可」を押したユーザーのみトラッキング (Consent Mode v2 対応済み)。

---

## チェックリスト (順序推奨)

1. [ ] Phase A: Vercel に運営者情報の環境変数を設定
2. [ ] Phase B: Cloudflare でドメイン取得 → Vercel 接続
3. [ ] note 記事を公開して 1-2 週間アクセスを集める
4. [ ] Phase C: AdSense 申請 → 環境変数 `NEXT_PUBLIC_ADSENSE_CLIENT` 設定
5. [ ] AdSense 承認待ち（数日〜数週間）
6. [ ] 承認後: ads.txt 更新 + 広告ユニット配置
7. [ ] Phase E: GA を設定して効果測定

---

## トラブルシュート

### AdSense 審査で「価値の低い広告枠」エラー

- コンテンツ量が不足と判断されたケース。当サイトは大丈夫なはずだが、申請前にトップページ・企業ページ・業種ページが正しく表示されているか確認
- ドメインが新しすぎる場合 1-2 週間運用してから再申請

### Cookie バナーが消えた後表示されない

- 「すべて許可」「必須のみ」を選ぶと localStorage に同意状態が保存される
- 再表示するには ブラウザの DevTools → Application → Local Storage → `salary-ranking-jp:cookie-consent` を削除 → リロード

### 独自ドメイン接続後も古い `.vercel.app` URL でアクセスできる

- Vercel の挙動として両方のURLからアクセス可能
- SEO 的には Vercel Settings → Domains → 独自ドメインを「Primary」にして、`.vercel.app` 側は「Redirect」設定を追加することで正規化可能
