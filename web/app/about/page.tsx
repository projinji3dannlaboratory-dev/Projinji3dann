import type { Metadata } from "next";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "スコアの考え方・免責事項",
  description:
    "本サイトの独自スコアの計算方法、年収シミュレーションの前提、データソース、免責事項について。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">スコア・年収シミュレーションの考え方</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        本サイトでは「若くして高年収」を可視化することを目的とし、業種補正をかけた独自スコアを採用しています。
      </p>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold">独自スコアの計算式</h2>
        <pre className="mt-3 overflow-x-auto rounded-md bg-muted p-4 text-sm">
{`raw_score = (企業の平均年収 / 業界平均年収) × (業界平均年齢 / 企業の平均年齢) × 50`}
        </pre>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>業界平均と同じなら 50（業界平均）</li>
          <li>「業界平均の2倍年収」または「業界平均の半分の年齢」相当なら 100</li>
          <li>業界補正により業種間の年収・年齢構造の差を吸収</li>
        </ul>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-xl font-semibold">グレード</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <li><b>S</b> raw_score ≥ 80 — 業種内トップクラス</li>
          <li><b>A</b> 65 ≤ raw_score &lt; 80 — 業種内上位</li>
          <li><b>B</b> 50 ≤ raw_score &lt; 65 — 業種内平均以上</li>
          <li><b>C</b> 35 ≤ raw_score &lt; 50 — 業種内平均未満</li>
          <li><b>D</b> raw_score &lt; 35 — 業種内下位</li>
        </ul>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-xl font-semibold">年収シミュレーション</h2>
        <p className="mt-3 text-sm">
          各業種を「年功型 / バランス型 / 成果型」の3つのカーブに分類し、ロジスティック型の成長カーブで年齢別年収を推計しています。
        </p>
        <p className="mt-2 text-sm">
          企業ごとの「平均年齢時点の年収」がカーブにフィットするようにスケーリングし、22歳〜65歳の推定年収カーブを生成しています。
          あくまで開示データからの推計であり、個人の役職・成果・転職歴により大きく変動します。
        </p>
      </Card>

      <Card id="disclaimer" className="mt-4 p-6">
        <h2 className="text-xl font-semibold">免責事項</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
          <li>
            データソース: <a className="underline" target="_blank" rel="noopener noreferrer" href="https://disclosure2.edinet-fsa.go.jp/">EDINET (金融庁)</a> に公衆開示された有価証券報告書
          </li>
          <li>更新頻度: 毎年7月1日に前年度分を一括取込</li>
          <li>本サイトの数値は推計を含み、実際の給与額・将来の昇給を保証するものではありません</li>
          <li>掲載企業の異議申し立てはお問い合わせフォームより受け付けます</li>
          <li>個人を特定する情報は扱わず、企業の平均値のみを集計しています</li>
        </ul>
      </Card>

      <Card id="contact" className="mt-4 p-6">
        <h2 className="text-xl font-semibold">関連ページ</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <a className="underline" href="/contact">お問い合わせ</a> — データ訂正依頼・取材依頼など
          </li>
          <li>
            <a className="underline" href="/privacy">プライバシーポリシー</a> — Cookie・広告配信の取扱い
          </li>
          <li>
            <a className="underline" href="/terms">利用規約</a> — サービスのご利用条件
          </li>
        </ul>
      </Card>
    </div>
  );
}
