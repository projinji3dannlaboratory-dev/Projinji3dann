import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "年収ランキング.jpの利用規約。サービスの利用条件、禁止事項、免責事項について定めます。",
  robots: { index: true, follow: true },
};

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "intro",
    title: "1. はじめに",
    body: (
      <p>
        本利用規約 (以下「本規約」) は、{SITE_CONFIG.operator} (以下「当方」) が運営する
        {SITE_CONFIG.siteName} (以下「当サイト」) のサービス利用に関する条件を定めるものです。
        利用者は当サイトを利用することで、本規約に同意したものとみなします。
      </p>
    ),
  },
  {
    id: "service",
    title: "2. サービスの内容",
    body: (
      <>
        <p>
          当サイトは、金融庁 EDINET において公衆開示されている有価証券報告書のデータを基に、
          上場企業の平均年齢・平均年収・独自スコアをランキング形式で提供する情報提供サービスです。
        </p>
        <p>
          データは公開情報に基づく推計値および編集情報であり、特定の企業の給与水準・採用条件を
          保証するものではありません。
        </p>
      </>
    ),
  },
  {
    id: "data-accuracy",
    title: "3. データの正確性・完全性",
    body: (
      <>
        <p>当方は、当サイト上の情報について以下を保証しません:</p>
        <ul>
          <li>掲載情報の正確性、完全性、最新性</li>
          <li>独自スコアおよび年収シミュレーションの将来予測における的中性</li>
          <li>掲載企業への入社・在籍時の実際の給与・処遇</li>
        </ul>
        <p>
          当サイトのデータは、利用者の意思決定 (転職、就職、投資等)
          の唯一の判断材料としては使用しないでください。
        </p>
      </>
    ),
  },
  {
    id: "prohibited",
    title: "4. 禁止事項",
    body: (
      <>
        <p>利用者は当サイトの利用にあたり、以下の行為を行ってはなりません:</p>
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>当方または第三者の知的財産権、プライバシー、名誉を侵害する行為</li>
          <li>当サイトのサーバーまたはネットワークに過剰な負荷をかける行為 (大量アクセス、スクレイピング等)</li>
          <li>当サイトのソースコード、API、データを当方の許諾なく複製・再配布・販売する行為</li>
          <li>不正アクセス、または不正な手段で情報を取得する行為</li>
          <li>当サイトの運営を妨害する一切の行為</li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    title: "5. 知的財産権",
    body: (
      <>
        <p>
          当サイトの編集著作物 (独自スコアの計算ロジック、デザイン、コード、説明文等) の
          著作権は当方および各権利者に帰属します。
        </p>
        <p>
          当サイトに掲載されている企業情報の原典は金融庁 EDINET の公開情報であり、
          当該情報の権利は各情報源に帰属します。
        </p>
      </>
    ),
  },
  {
    id: "disclaimer",
    title: "6. 免責事項",
    body: (
      <>
        <p>
          当方は、利用者が当サイトを利用したことにより生じた一切の損害について、
          理由のいかんを問わず責任を負いません。
        </p>
        <p>
          特に以下については免責とします:
        </p>
        <ul>
          <li>掲載情報に基づく転職・投資・採用等の意思決定の結果生じた損害</li>
          <li>当サイトのサービス停止・終了、データ消失による損害</li>
          <li>第三者サービス (Vercel, Google AdSense 等) の不具合による損害</li>
          <li>外部リンク先の内容・運営による損害</li>
        </ul>
      </>
    ),
  },
  {
    id: "removal",
    title: "7. 掲載情報の修正・削除請求",
    body: (
      <p>
        当サイトに掲載されている企業情報について、当該企業またはその代理人より
        正確性に問題があるとの申し立てがあった場合、当方は調査の上、必要に応じて修正・削除等の
        対応を行います。請求は{" "}
        <a className="underline" href="/contact">
          お問い合わせ
        </a>
        {" "}フォームよりご連絡ください。
      </p>
    ),
  },
  {
    id: "ads",
    title: "8. 広告掲載について",
    body: (
      <p>
        当サイトは、Google AdSense 等の第三者配信広告を表示する場合があります。
        広告の内容について当方は一切の責任を負いません。
        広告主のサービス利用に伴うトラブルは利用者と広告主の間で解決していただきます。
      </p>
    ),
  },
  {
    id: "amendments",
    title: "9. 規約の変更",
    body: (
      <p>
        当方は、本規約を必要に応じて変更することができます。
        変更後の規約は、当サイトに掲載した時点から効力を生じるものとします。
      </p>
    ),
  },
  {
    id: "law",
    title: "10. 準拠法・裁判管轄",
    body: (
      <p>
        本規約は日本法を準拠法とします。
        当サイトに関連して生じた紛争については、当方の所在地を管轄する地方裁判所を専属的合意管轄裁判所とします。
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">利用規約</h1>
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

      <p className="mt-6 text-xs text-muted-foreground">以上</p>
    </div>
  );
}
