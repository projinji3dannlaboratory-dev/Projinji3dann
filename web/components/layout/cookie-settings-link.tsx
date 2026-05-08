"use client";

import { useConsent } from "@/lib/consent-store";

/**
 * Footer link that re-opens the cookie consent banner. Required for GDPR /
 * 改正APPI compliance — users must always be able to revisit and change
 * their consent choice.
 */
export function CookieSettingsLink() {
  const reopen = useConsent((s) => s.reopenBanner);
  const status = useConsent((s) => s.status);
  const hydrated = useConsent((s) => s.hydrated);

  // Avoid SSR/CSR mismatch
  if (!hydrated) return null;

  const label =
    status === "all"
      ? "Cookie設定 (現在: すべて許可)"
      : status === "necessary"
        ? "Cookie設定 (現在: 必須のみ)"
        : status === "custom"
          ? "Cookie設定 (現在: カスタム)"
          : "Cookie設定";

  return (
    <button
      type="button"
      onClick={reopen}
      className="underline hover:text-foreground text-left"
    >
      {label}
    </button>
  );
}
