import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { AnalyticsScripts } from "@/components/layout/analytics-scripts";
import {
  JsonLd,
  organizationJsonLd,
  siteJsonLd,
} from "@/components/seo/json-ld";
import { SITE_CONFIG, isAdsenseEnabled } from "@/lib/site-config";
import ShareWidget from "@/components/layout/share-widget";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "日本上場企業 年収ランキング - 若くして高年収な企業を可視化",
    template: "%s | 年収ランキング.jp",
  },
  description:
    "日本の全上場企業（プライム/スタンダード/グロース）の有価証券報告書から、平均年収・平均年齢・独自スコアをランキング形式で閲覧できる。業種補正・年齢補正された「若くして高年収」スコアと、年収シミュレーション機能を搭載。",
  keywords: [
    "年収ランキング",
    "上場企業",
    "平均年収",
    "有価証券報告書",
    "EDINET",
    "プライム",
    "スタンダード",
    "グロース",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "年収ランキング.jp",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "年収ランキング.jp - 若くして高年収な上場企業ランキング",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
  robots: { index: true, follow: true },
  // Google AdSense ownership verification (only emitted if env var is set)
  other: isAdsenseEnabled()
    ? { "google-adsense-account": SITE_CONFIG.adsenseClient }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
        <AnalyticsScripts />
        <JsonLd data={[siteJsonLd(), organizationJsonLd()]} />
        <ShareWidget />
      </body>
    </html>
  );
}
