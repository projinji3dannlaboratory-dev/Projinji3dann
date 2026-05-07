import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">該当する企業が見つかりません</h1>
      <p className="mt-2 text-muted-foreground">
        証券コード・企業名をご確認のうえ、ランキング一覧から再度お探しください。
      </p>
      <Button asChild className="mt-6">
        <Link href="/">ランキングへ戻る</Link>
      </Button>
    </div>
  );
}
