"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  React.useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <AlertTriangle className="size-10 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">エラーが発生しました</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ページの読み込み中に問題が発生しました。再読み込みするか、しばらく時間を置いてからお試しください。
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>再試行</Button>
        <Button variant="outline" asChild>
          <Link href="/">ホームへ戻る</Link>
        </Button>
      </div>
    </div>
  );
}
