import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle, Building2, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "年収ランキング.jpへのお問い合わせ・データ訂正依頼・取材依頼などはこちらから。",
  robots: { index: true, follow: true },
};

const INQUIRY_TYPES: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; subject: string }[] = [
  {
    icon: AlertTriangle,
    title: "データ訂正・削除依頼",
    desc: "掲載企業の数値に誤りがある、または掲載中止を希望する場合",
    subject: "[年収ランキング.jp] データ訂正/削除依頼",
  },
  {
    icon: Building2,
    title: "企業からの異議申し立て",
    desc: "ご自身の会社の情報の取扱いに関するお申し立て",
    subject: "[年収ランキング.jp] 企業からの異議申し立て",
  },
  {
    icon: MessageSquare,
    title: "取材・執筆依頼・その他お問い合わせ",
    desc: "メディアからの取材、機能要望、不具合報告など",
    subject: "[年収ランキング.jp] お問い合わせ",
  },
];

export default function ContactPage() {
  const email = SITE_CONFIG.contactEmail;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">お問い合わせ</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        当サイトへのお問い合わせは、以下の用途別にメールでご連絡ください。
        通常 5 営業日以内に返信いたします。
      </p>

      <div className="mt-6 space-y-3">
        {INQUIRY_TYPES.map((t) => {
          const Icon = t.icon;
          const mailto = `mailto:${email}?subject=${encodeURIComponent(t.subject)}`;
          return (
            <Card key={t.title} className="p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{t.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={mailto}>
                    <Mail className="size-4" />
                    メール
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-5 text-sm">
        <div className="font-semibold">運営者情報</div>
        <dl className="mt-2 grid grid-cols-[120px_1fr] gap-y-2">
          <dt className="text-muted-foreground">サイト名</dt>
          <dd>{SITE_CONFIG.siteName}</dd>
          <dt className="text-muted-foreground">運営者</dt>
          <dd>{SITE_CONFIG.operator}</dd>
          <dt className="text-muted-foreground">連絡先</dt>
          <dd>
            <a className="underline" href={`mailto:${email}`}>
              {email}
            </a>
          </dd>
          <dt className="text-muted-foreground">サービス開始</dt>
          <dd>2026年</dd>
        </dl>
      </Card>

      <Card className="mt-6 p-5 text-sm space-y-2">
        <div className="font-semibold">ご連絡前のお願い</div>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
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
          <li>
            掲載されている数値は有価証券報告書記載の値からの集計・推計値です
          </li>
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
