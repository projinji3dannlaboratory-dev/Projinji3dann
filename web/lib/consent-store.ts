"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Cookie consent state. Stored in localStorage so the banner doesn't show
 * again after the user picks. Maps directly to Google's Consent Mode v2:
 *   - analytics  → analytics_storage / ad_storage (page measurement)
 *   - ads        → ad_storage / ad_user_data / ad_personalization
 */
export interface ConsentState {
  /** "unknown" = not asked yet, banner should show */
  status: "unknown" | "all" | "necessary" | "custom";
  analytics: boolean;
  ads: boolean;
  hydrated: boolean;
  setStatus: (s: ConsentState["status"]) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  setAnalytics: (v: boolean) => void;
  setAds: (v: boolean) => void;
  setHydrated: () => void;
}

export const useConsent = create<ConsentState>()(
  persist(
    (set) => ({
      status: "unknown",
      analytics: false,
      ads: false,
      hydrated: false,
      setStatus: (s) => set({ status: s }),
      acceptAll: () => set({ status: "all", analytics: true, ads: true }),
      rejectAll: () => set({ status: "necessary", analytics: false, ads: false }),
      setAnalytics: (v) => set({ analytics: v, status: "custom" }),
      setAds: (v) => set({ ads: v, status: "custom" }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "salary-ranking-jp:cookie-consent",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          status: s.status,
          analytics: s.analytics,
          ads: s.ads,
        }) as Partial<ConsentState>,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
