"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/lib/consent-store";

export function CookieBanner() {
  const status = useConsent((s) => s.status);
  const hydrated = useConsent((s) => s.hydrated);
  const acceptAll = useConsent((s) => s.acceptAll);
  const rejectAll = useConsent((s) => s.rejectAll);
  const [details, setDetails] = React.useState(false);

  // Banner only shows after hydration when status is unknown
  const visible = hydrated && status === "unknown";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:px-4 md:pb-4"
          role="dialog"
          aria-labelledby="cookie-banner-title"
        >
          <div className="mx-auto max-w-3xl rounded-xl border bg-card/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-card/85 md:p-5">
            <div className="flex items-start gap-3">
              <div className="hidden rounded-lg bg-amber-500/10 p-2 md:block">
                <Cookie className="size-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  id="cookie-banner-title"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <Cookie className="size-4 text-amber-500 md:hidden" />
                  Cookie の使用について
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  当サイトはサービス改善・アクセス解析・広告配信のために Cookie を使用します。
                  「すべて許可」を選ぶと Google Analytics と Google AdSense
                  によるパーソナライズが有効になります。
                  詳細は
                  <Link href="/privacy" className="underline mx-1">
                    プライバシーポリシー
                  </Link>
                  をご覧ください。
                </p>

                {details && (
                  <div className="mt-3 space-y-2 rounded-md border bg-background/50 p-3 text-xs">
                    <ConsentRow
                      label="必須 Cookie"
                      desc="サイトの表示・お気に入り保存・テーマ設定に使用。常時オン (無効化不可)。"
                      always
                    />
                    <ConsentRow
                      label="アクセス解析 (Google Analytics)"
                      desc="ページビュー・利用状況の匿名集計"
                    />
                    <ConsentRow
                      label="広告配信 (Google AdSense)"
                      desc="興味関心に応じた広告表示・効果測定"
                    />
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={acceptAll}>
                    すべて許可
                  </Button>
                  <Button size="sm" variant="outline" onClick={rejectAll}>
                    必須のみ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetails((v) => !v)}
                  >
                    {details ? "閉じる" : "詳細"}
                  </Button>
                </div>
              </div>
              <button
                aria-label="閉じる (必須のみ)"
                onClick={rejectAll}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConsentRow({
  label,
  desc,
  always = false,
}: {
  label: string;
  desc: string;
  always?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground">{desc}</div>
      </div>
      {always && (
        <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
          常時ON
        </span>
      )}
    </div>
  );
}
