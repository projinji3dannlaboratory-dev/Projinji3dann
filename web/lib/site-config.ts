/**
 * Site-wide configuration. Defaults match the operator's verified public
 * identity ("プロ人事３段 さとう"); env vars can override per environment.
 */

export const SITE_CONFIG = {
  /** 公開URL */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL
    ?? "https://salary.projinji3dann-laboratory.com",

  /** サイト名（プロダクト名） */
  siteName: "年収ランキング.jp",

  /** 運営者表示名 (フッター・ポリシーで使用) */
  operator: process.env.NEXT_PUBLIC_SITE_OPERATOR ?? "プロ人事３段 さとう",

  /** 運営者の肩書き */
  operatorTitle:
    process.env.NEXT_PUBLIC_SITE_OPERATOR_TITLE
    ?? "現役人事・採用コンサルタント",

  /** 運営者の略歴 */
  operatorBio:
    "東証プライム上場の大手商社・大手メーカーで人事経験15年以上。新卒・キャリア採用中心に延べ1万人以上の面接・面談、1,000社超の企業研究実績。",

  /** 親ブランド (AdSense承認実績ありのメインサイト) */
  parentSite: {
    name: "就職・転職 LAB. by プロ人事３段",
    shortName: "プロ人事３段の就職・転職研究室",
    url: "https://projinji3dann-laboratory.com/",
    contactUrl: "https://projinji3dann-laboratory.com/contact/",
    privacyUrl: "https://projinji3dann-laboratory.com/privacy/",
  },

  /** 個別相談・サービス販売 */
  coconalaUrl: "https://coconala.com/users/724079",

  /** note (面接対策・転職コラム集) */
  noteUrl: "https://note.com/projinji3dann",

  /** 連絡先メールアドレス
   *  Public display intentionally disabled. Inquiries route to the parent
   *  site's contact form instead. Set NEXT_PUBLIC_CONTACT_EMAIL to re-enable. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",

  /** Google AdSense Publisher ID (例: "ca-pub-1234567890123456") */
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",

  /** AdSense ad unit slot ID for in-content placements (例: "1234567890")
   *  Defaults to the operator's "salary-ranking-jp-inline" unit. Override
   *  via env var to swap to a different unit without redeploying code. */
  adsenseSlotInline:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? "5739211750",

  /** Google Analytics Measurement ID (例: "G-XXXXXXXXXX") */
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
