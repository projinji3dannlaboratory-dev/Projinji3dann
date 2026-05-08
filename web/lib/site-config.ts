/**
 * Site-wide configuration sourced from environment variables so the user can
 * tweak operator name, contact email, and ad/analytics tracking IDs from the
 * Vercel dashboard without code changes.
 */

export const SITE_CONFIG = {
  /** 公開URL */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://salary-ranking-jp.vercel.app",

  /** サイト名 */
  siteName: "年収ランキング.jp",

  /** 運営者表示名 (例: "山田太郎" or "プロジンジ Lab") */
  operator: process.env.NEXT_PUBLIC_SITE_OPERATOR ?? "サイト運営者",

  /** 連絡先メールアドレス。お問い合わせフォームの mailto: に使用 */
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",

  /** Google AdSense Publisher ID (例: "ca-pub-1234567890123456") — 設定時のみAdSenseスクリプトをロード */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",

  /** Google Analytics Measurement ID (例: "G-XXXXXXXXXX") — 設定時のみGA読み込み */
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",

  /** プライバシーポリシー / 利用規約の最終更新日 */
  policyLastUpdated: "2026-05-08",
} as const;

export function isAdsenseEnabled(): boolean {
  return Boolean(SITE_CONFIG.adsenseClient);
}

export function isGaEnabled(): boolean {
  return Boolean(SITE_CONFIG.gaId);
}
