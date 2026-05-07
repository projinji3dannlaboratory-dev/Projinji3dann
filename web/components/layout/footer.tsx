import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="mb-2 font-semibold text-foreground">年収ランキング.jp</h3>
            <p>
              日本の上場企業の有価証券報告書から、平均年収・平均年齢・独自スコアをランキング表示します。
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-foreground">データ</h3>
            <ul className="space-y-1">
              <li>出典: <a className="underline" target="_blank" rel="noopener noreferrer" href="https://disclosure2.edinet-fsa.go.jp/">EDINET (金融庁)</a></li>
              <li>更新: 毎年7月1日 自動バッチ</li>
              <li>業種分類: 東証33業種</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-foreground">サイト情報</h3>
            <ul className="space-y-1">
              <li><Link className="underline" href="/about">スコアの考え方</Link></li>
              <li><Link className="underline" href="/about#disclaimer">免責事項</Link></li>
              <li><Link className="underline" href="/about#contact">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs">
          本サイトの数値は EDINET 開示情報に基づく推計値であり、実際の給与を保証するものではありません。
          個別企業の異議申し立てはお問い合わせフォームよりご連絡ください。
        </p>
      </div>
    </footer>
  );
}
