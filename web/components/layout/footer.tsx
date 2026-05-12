import Link from "next/link";
import { ExternalLink, BookOpen, Briefcase, ArrowRight } from "lucide-react";
import { snapshotMeta } from "@/lib/queries";
import { SITE_CONFIG } from "@/lib/site-config";
import { CookieSettingsLink } from "./cookie-settings-link";

export function Footer() {
  const meta = snapshotMeta();
  return (
    <footer className="mt-20 border-t bg-muted/30">
      {/* Note への流入レバレッジ用 CTA バンド */}
      <div className="border-b bg-gradient-to-r from-amber-500/5 via-pink-500/5 to-sky-500/5">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                次のステップ: 面接対策・転職ノウハウは note で
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                現役人事15年の知見をもとにした面接対策・年収交渉・企業研究の解説記事を公開しています。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
                href={SITE_CONFIG.noteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="size-4" />
                note で記事を読む
                <ArrowRight className="size-3.5" />
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:bg-background transition-colors"
                href={SITE_CONFIG.coconalaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Briefcase className="size-4" />
                ココナラで個別相談
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About / Operator */}
          <div className="md:col-span-2">
            <h3 className="mb-2 font-semibold text-foreground">
              {SITE_CONFIG.siteName}
            </h3>
            <p>
              日本の上場企業の有価証券報告書から、平均年収・平均年齢・独自スコアをランキング表示します。
            </p>
            <div className="mt-4 rounded-lg border bg-background/40 p-3 text-xs">
              <div className="font-medium text-foreground">
                運営: {SITE_CONFIG.operator}
              </div>
              <div className="text-[11px]">{SITE_CONFIG.operatorTitle}</div>
              <p className="mt-1 leading-relaxed">{SITE_CONFIG.operatorBio}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                <a
                  className="inline-flex items-center gap-1 underline hover:text-foreground"
                  href={SITE_CONFIG.parentSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  公式サイト
                  <ExternalLink className="size-3" />
                </a>
                <a
                  className="inline-flex items-center gap-1 underline hover:text-foreground"
                  href={SITE_CONFIG.noteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  note
                  <ExternalLink className="size-3" />
                </a>
                <a
                  className="inline-flex items-center gap-1 underline hover:text-foreground"
                  href={SITE_CONFIG.coconalaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ココナラ
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-foreground">データ</h3>
            <ul className="space-y-1">
              <li>
                出典:{" "}
                <a
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://disclosure2.edinet-fsa.go.jp/"
                >
                  金融庁 EDINET
                </a>
              </li>
              <li>
                提供:{" "}
                <a
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://edinetdb.jp/"
                >
                  EDINET DB
                </a>
              </li>
              <li>
                対象:{" "}
                <span className="tabular-nums">
                  {meta.companyCount?.toLocaleString() ?? "—"}
                </span>{" "}
                社{meta.fiscalYear ? ` / FY${meta.fiscalYear}` : ""}
              </li>
              <li>更新: 毎年7月1日 自動バッチ</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-foreground">サイト情報</h3>
            <ul className="space-y-1">
              <li>
                <Link className="underline" href="/about">
                  スコアの考え方
                </Link>
              </li>
              <li>
                <Link className="underline" href="/privacy">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link className="underline" href="/terms">
                  利用規約
                </Link>
              </li>
              <li>
                <Link className="underline" href="/contact">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <CookieSettingsLink />
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs leading-relaxed">
          本サイトの数値は EDINET 開示情報に基づく推計値であり、実際の給与を保証するものではありません。
          個別企業の異議申し立ては
          <Link className="underline mx-1" href="/contact">
            お問い合わせ
          </Link>
          よりご連絡ください。
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/70">
          © {new Date().getFullYear()} {SITE_CONFIG.operator}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
