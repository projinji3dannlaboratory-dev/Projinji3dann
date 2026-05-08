"use client";

import Script from "next/script";
import * as React from "react";
import { useConsent } from "@/lib/consent-store";
import { SITE_CONFIG, isAdsenseEnabled, isGaEnabled } from "@/lib/site-config";

/**
 * Loads Google Analytics + AdSense scripts only when:
 *   1. The corresponding env var is set (build-time gate)
 *   2. The user has granted consent (runtime gate)
 *
 * Implements Google Consent Mode v2 — analytics/ads run in "denied"
 * default mode, then we call gtag('consent', 'update', ...) once the
 * user clicks Accept on the cookie banner.
 */
export function AnalyticsScripts() {
  const hydrated = useConsent((s) => s.hydrated);
  const analytics = useConsent((s) => s.analytics);
  const ads = useConsent((s) => s.ads);

  // Sync consent to gtag whenever it changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // gtag may not be loaded yet; queue it via dataLayer fallback
    type GtagFn = (...args: unknown[]) => void;
    type WindowWithGtag = Window & { gtag?: GtagFn; dataLayer?: unknown[] };
    const w = window as WindowWithGtag;
    const gtag: GtagFn =
      w.gtag
      ?? function (...args: unknown[]) {
        (w.dataLayer = w.dataLayer || []).push(args);
      };
    gtag("consent", "update", {
      ad_storage: ads ? "granted" : "denied",
      ad_user_data: ads ? "granted" : "denied",
      ad_personalization: ads ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    });
  }, [analytics, ads, hydrated]);

  return (
    <>
      {/* Default Consent Mode v2: deny everything until user opts in */}
      <Script id="gtag-default-consent" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>

      {/* Google Analytics 4 */}
      {isGaEnabled() && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${SITE_CONFIG.gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Google AdSense — emitted as a plain async <script> tag (NOT next/script)
          to follow AdSense's recommended snippet exactly and avoid the
          'AdSense head tag doesn't support data-nscript attribute' warning */}
      {isAdsenseEnabled() && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adsenseClient}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
