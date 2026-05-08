"use client";

import * as React from "react";
import { useConsent } from "@/lib/consent-store";
import { SITE_CONFIG, isAdsenseEnabled } from "@/lib/site-config";

interface AdSlotProps {
  /** AdSense ad unit ID, e.g. "1234567890". If empty, the component renders nothing. */
  slot?: string;
  /** AdSense format: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid" */
  format?: string;
  /** data-full-width-responsive */
  responsive?: boolean;
  /** layout key for in-feed/in-article ads (advanced) */
  layoutKey?: string;
  /** Outer wrapper className (margins / centering) */
  className?: string;
  /** Show a tiny "広告" label above the slot for transparency (recommended) */
  label?: boolean;
  /** Min height to reserve to avoid CLS (Cumulative Layout Shift) */
  minHeight?: number;
  /** Max width of the ad container in px. AdSense's responsive ad picks an ad
   *  size based on this width — smaller maxWidth = smaller ads. */
  maxWidth?: number;
}

/**
 * Reusable AdSense ad slot for in-content (manual) placements.
 * Renders nothing unless:
 *   1. AdSense Publisher ID is configured (NEXT_PUBLIC_ADSENSE_CLIENT)
 *   2. A slot ID is provided
 *   3. The user has granted ad consent (Consent Mode v2 'granted')
 */
export function AdSlot({
  slot,
  format = "auto",
  responsive = true,
  layoutKey,
  className = "",
  label = true,
  minHeight = 60,
  maxWidth = 500,
}: AdSlotProps) {
  const adsConsent = useConsent((s) => s.ads);
  const hydrated = useConsent((s) => s.hydrated);
  const insRef = React.useRef<HTMLModElement>(null);

  React.useEffect(() => {
    if (!hydrated || !adsConsent || !isAdsenseEnabled() || !slot) return;
    if (!insRef.current) return;
    // Avoid re-pushing if AdSense already populated this slot
    if (insRef.current.getAttribute("data-adsbygoogle-status") === "done") return;
    try {
      // adsbygoogle is exposed by Google's loader as an Array-like queue;
      // `.push({})` either queues a config (pre-load) or processes it (post-load).
      // We type it loosely to cover both states.
      const w = window as unknown as {
        adsbygoogle?: { push: (param: object) => void };
      };
      if (!w.adsbygoogle) {
        (w as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
      }
      w.adsbygoogle!.push({});
    } catch (e) {
      console.warn("[ads] adsbygoogle push failed", e);
    }
  }, [hydrated, adsConsent, slot]);

  if (!isAdsenseEnabled() || !slot) return null;
  if (!hydrated || !adsConsent) return null;

  return (
    <div
      className={`my-6 mx-auto ${className}`}
      style={{ minHeight, maxWidth }}
      aria-label="広告"
    >
      {label && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          広告 / Sponsored
        </div>
      )}
      <ins
        ref={insRef as unknown as React.Ref<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={SITE_CONFIG.adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        data-ad-layout-key={layoutKey}
      />
    </div>
  );
}

/** Convenience wrapper that uses the default inline slot from env. */
export function InlineAd({
  className,
  minHeight,
  maxWidth,
}: {
  className?: string;
  minHeight?: number;
  maxWidth?: number;
}) {
  return (
    <AdSlot
      slot={SITE_CONFIG.adsenseSlotInline}
      className={className}
      minHeight={minHeight}
      maxWidth={maxWidth}
    />
  );
}
