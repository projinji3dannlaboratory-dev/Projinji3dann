import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "年収ランキング.jpのプライバシーポリシー。Cookie・アクセス解析・広告配信における個人情報の取扱いについて説明します。",
  robots: { index: true, follow: true },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "intro",
    title: "1. はじめに",
    body: (
      <>
        <p>
          {SITE_CONFIG.siteName}（以下「当サイト」）は、
          {SITE_CONFIG.operator}（以下「当方」）が運営する Web サービスです。
          当方は利用者のプライバシーを尊重し、個人情報の保護に関する法律
          (個人情報保護法) その他の関連法令を遵守します。
        </p>
        <p>
          本プライバシーポリシーは、当サイトをご利用いただくすべての利用者に適用されます。
          当サイトのご利用は、本ポリシーに同意いただいたものとみなします。
        </p>
      </>
    ),
  },
  {
    id: "collected",
    title: "2. 取得する情報",
    body: (
      <>
        <p>当サイトでは以下の情報を取得する場合があります:</p>
        <ul>
          <li>
            <b>アクセスログ情報</b>: IPアドレス、ブラウザの種類、リファラ、ページの閲覧履歴、滞在時間など
          </li>
          <li>
            <b>Cookie / Local Storage</b>: お気に入り企業の保存、テーマ設定 (ダーク/ライト)、
            広告のパーソナライズ等を目的とした端末識別情報
          </li>
          <li>
            <b>お問い合わせ情報</b>:
            お問い合わせフォーム / メールにて利用者ご自身が任意に提供される氏名、メールアドレス、内容
          </li>
        </ul>
        <p>
          当サイトは、利用者の個人を特定する情報を意図的に収集することはありません。
          掲載企業のデータは公開情報 (有価証券報告書) に基づくもので、個人を特定する情報は含みません。
        </p>
      </>
    ),
  },
  {
    id: "purpose",
    title: "3. 利用目的",
    body: (
      <>
        <p>取得した情報は以下の目的のために利用します:</p>
        <ul>
          <li>サービスの提供・改善・運営</li>
          <li>不正利用の防止、セキュリティ確保</li>
          <li>アクセス解析による利用状況の把握</li>
          <li>広告配信、効果測定、表示頻度の最適化</li>
          <li>お問い合わせへの対応</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookie",
    title: "4. Cookie について",
    body: (
      <>
        <p>
          当サイトは、利便性向上およびアクセス解析・広告配信のため Cookie および類似技術を使用します。
          Cookie とは、Web サイトが利用者の端末に保存する小さなデータファイルです。
        </p>
        <p>
          利用者は、ブラウザの設定により Cookie の受け入れを拒否したり、削除したりすることができます。
          ただし、Cookie を無効化した場合、当サイトの一部機能 (お気に入り保存等) が利用できなくなる場合があります。
        </p>
        <p>
          初回訪問時にCookie使用の同意バナーを表示します。同意設定は再設定可能で、
          ブラウザの Local Storage に「{SITE_CONFIG.siteName}:cookie-consent」として保存されます。
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "5. アクセス解析ツール (Google Analytics)",
    body: (
      <>
        <p>
          当サイトでは、サービス改善のため Google LLC の提供するアクセス解析ツール
          「Google Analytics」を利用する場合があります。
          Google Analytics は Cookie を利用してトラフィックデータを収集します。
          このトラフィックデータは匿名で収集され、個人を特定するものではありません。
        </p>
        <p>
          詳細は{" "}
          <a
            className="underline"
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google ポリシーと規約
          </a>{" "}
          をご確認ください。
        </p>
        <p>
          利用者は{" "}
          <a
            className="underline"
            href="https://tools.google.com/dlpage/gaoptout?hl=ja"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Analytics オプトアウト アドオン
          </a>{" "}
          により Google Analytics の利用を無効化できます。
        </p>
      </>
    ),
  },
  {
    id: "adsense",
    title: "6. 第三者配信の広告サービス (Google AdSense)",
    body: (
      <>
        <p>
          当サイトは第三者配信の広告サービス Google AdSense を利用しています。
          広告配信事業者は、利用者の興味に応じた広告を表示するため Cookie を使用します。
        </p>
        <p>
          パーソナライズ広告を希望されない場合は、{" "}
          <a
            className="underline"
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            広告設定
          </a>{" "}
          から無効にすることが可能です。
        </p>
        <p>
          また、{" "}
          <a
            className="underline"
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>{" "}
          にて、サードパーティベンダーが提供するパーソナライズ広告を無効にすることもできます。
        </p>
        <p>
          Google による広告の Cookie 使用に関する詳細情報は{" "}
          <a
            className="underline"
            href="https://policies.google.com/technologies/ads?hl=ja"
            target="_blank"
            rel="noopener noreferrer"
          >
            こちら
          </a>{" "}
          をご確認ください。
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "7. 第三者への提供",
    body: (
      <>
        <p>
          当方は、以下の場合を除き、取得した個人情報を第三者に提供しません:
        </p>
        <ul>
          <li>利用者の同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合</li>
          <li>業務委託先に対し、利用目的の達成に必要な範囲で提供する場合 (Vercel, Supabase, Google等のクラウドサービス含む)</li>
        </ul>
      </>
    ),
  },
  {
    id: "disclosure",
    title: "8. 開示・訂正・利用停止",
    body: (
      <p>
        利用者は、当方が保有する自身の個人情報について、開示、訂正、追加、削除、
        利用停止、第三者提供の停止を請求することができます。
        ご請求は <a className="underline" href={`/contact`}>お問い合わせ</a> よりご連絡ください。
      </p>
    ),
  },
  {
    id: "amendments",
    title: "9. プライバシーポリシーの改定",
    body: (
      <p>
        当方は、本プライバシーポリシーを必要に応じて改定することがあります。
        改定後のポリシーは、当サイトに掲載した時点から効力を生じるものとします。
      </p>
    ),
  },
  {
    id: "contact",
    title: "10. お問い合わせ窓口",
    body: (
      <>
        <p>本ポリシーに関するお問い合わせは以下までお願いします。</p>
        <ul>
          <li>
            運営者: {SITE_CONFIG.operator}（{SITE_CONFIG.operatorTitle}）
          </li>
          {SITE_CONFIG.contactEmail && (
            <li>
              連絡先メール:{" "}
              <a
                className="underline"
                href={`mailto:${SITE_CONFIG.contactEmail}`}
              >
                {SITE_CONFIG.contactEmail}
              </a>
            </li>
          )}
          <li>
            姉妹サイト:{" "}
            <a
              className="underline"
              href={SITE_CONFIG.parentSite.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {SITE_CONFIG.parentSite.name}
            </a>{" "}
            (
            <a
              className="underline"
              href={SITE_CONFIG.parentSite.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              公式お問い合わせフォーム
            </a>
            )
          </li>
          <li>
            <a className="underline" href="/contact">
              当サイトのお問い合わせページ
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        最終更新日: {SITE_CONFIG.policyLastUpdated}
      </p>

      <Card className="mt-6 p-6 space-y-6 [&_p]:leading-relaxed [&_p]:text-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:my-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-4 [&_a]:text-foreground [&_a:hover]:opacity-80">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="space-y-3">
            <h2>{s.title}</h2>
            {s.body}
          </section>
        ))}
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        以上
      </p>
    </div>
  );
}
