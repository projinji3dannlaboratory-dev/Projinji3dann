import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  AlertTriangle,
  Building2,
  MessageSquare,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "年収ランキング.jpへのお問い合わせ・データ訂正依頼・取材依頼などはこちらから。運営者「プロ人事３段 さとう」の公式サイトのお問い合わせフォームより受付しています。",
  robots: { index: true, follow: true },
};

const INQUIRY_TYPES: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}[] = [
  {
    icon: AlertTriangle,
    title: "データ訂正・削除依頼",
    desc: "掲載企業の数値に誤りがある、または掲載中止を希望する場合",
  },
  {
    icon: Building2,
    title: "企業からの異議申し立て",
    desc: "ご自身の会社の情報の取扱いに関するお申し立て",
  },
  {
    icon: MessageSquare,
    title: "取材・執筆依頼・その他お問い合わせ",
    desc: "メディアからの取材、機能要望、不具合報告など",
  },
];

export default function ContactPage() {
  const { operator, operatorTitle, parentSite, coconalaUrl, contactEmail } =
    SITE_CONFIG;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">お問い合わせ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        当サイトへのお問い合わせは、運営者の公式サイトのお問い合わせフォームより承ります。
        通常 5 営業日以内に返信いたします。
      </p>

      {/* Primary CTA: parent site contact form */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="bg-gradient-to-br from-amber-500/10 via-pink-500/5 to-sky-500/10 p-6">
          <div className="text-xs font-medium text-muted-foreground">
            一般のお問い合わせ
          </div>
          <h2 className="mt-1 text-xl font-bold">
            公式お問い合わせフォーム (推奨)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            運営者「{parentSite.name}」のお問い合わせフォームより、本サイトに関する
            ご質問・ご指摘・取材依頼を受け付けています。
          </p>
          <Button asChild className="mt-4">
            <a href={parentSite.contactUrl} target="_blank" rel="noopener noreferrer">
              フォームを開く
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>

        <div className="border-t p-6">
          <div className="text-xs font-medium text-muted-foreground">
            主な受付内容
          </div>
          <ul className="mt-3 space-y-3">
            {INQUIRY_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.title} className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.title}</div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Card>

      {/* Secondary channels */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <Briefcase className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                個別相談・面接対策
              </div>
              <div className="font-semibold">ココナラで依頼</div>
              <p className="mt-1 text-xs text-muted-foreground">
                転職メンター支援・面接対策など、有料サービスの個別相談はココナラから。
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <a href={coconalaUrl} target="_blank" rel="noopener noreferrer">
                  プロフィールを見る
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2.5">
              <BookOpen className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                就職・転職の解説記事
              </div>
              <div className="font-semibold">公式ブログ</div>
              <p className="mt-1 text-xs text-muted-foreground">
                面接対策・年収レポート・企業研究の解説記事は公式サイトで公開しています。
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <a
                  href={parentSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ブログを開く
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {contactEmail && (
        <Card className="mt-6 p-5 text-sm">
          <div className="font-semibold">直接メール (補助)</div>
          <p className="mt-1 text-xs text-muted-foreground">
            上記フォームをご利用いただけない場合のみ、以下までご連絡ください。
          </p>
          <a
            className="mt-2 inline-flex font-mono underline"
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(
              "[年収ランキング.jp] お問い合わせ",
            )}`}
          >
            {contactEmail}
          </a>
        </Card>
      )}

      {/* Operator card */}
      <Card className="mt-6 p-5">
        <div className="text-xs font-medium text-muted-foreground">運営者</div>
        <div className="mt-1 text-lg font-semibold">{operator}</div>
        <div className="text-xs text-muted-foreground">{operatorTitle}</div>
        <p className="mt-3 text-sm leading-relaxed">{SITE_CONFIG.operatorBio}</p>
        <dl className="mt-4 grid grid-cols-[140px_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">公式サイト</dt>
          <dd>
            <a
              className="underline"
              href={parentSite.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {parentSite.name}
            </a>
          </dd>
          <dt className="text-muted-foreground">個別相談</dt>
          <dd>
            <a
              className="underline"
              href={coconalaUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ココナラ プロフィール
            </a>
          </dd>
          <dt className="text-muted-foreground">本サイト</dt>
          <dd>{SITE_CONFIG.siteName}（{SITE_CONFIG.siteUrl}）</dd>
          <dt className="text-muted-foreground">サービス開始</dt>
          <dd>2026年</dd>
        </dl>
      </Card>

      <Card className="mt-6 p-5 text-sm">
        <div className="font-semibold">ご連絡前のお願い</div>
        <ul className="mt-2 list-disc pl-6 space-y-1 text-muted-foreground">
          <li>
            データの出典は{" "}
            <a
              className="underline"
              href="https://disclosure2.edinet-fsa.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
            >
              金融庁 EDINET
            </a>
            （構造化提供:{" "}
            <a
              className="underline"
              href="https://edinetdb.jp/"
              target="_blank"
              rel="noopener noreferrer"
            >
              EDINET DB
            </a>
            ）の公開情報を基にしています
          </li>
          <li>掲載されている数値は有価証券報告書記載の値からの集計・推計値です</li>
          <li>
            <a className="underline" href="/about">
              スコアの考え方
            </a>{" "}
            と{" "}
            <a className="underline" href="/terms">
              利用規約
            </a>{" "}
            をご確認のうえ、お問い合わせください
          </li>
        </ul>
      </Card>
    </div>
  );
}
