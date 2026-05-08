"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavoritesState {
  /** Stores ticker (4-digit) or sec_code (5-digit) — whatever the company URL uses. */
  codes: string[];
  hydrated: boolean;
  toggle: (code: string) => void;
  add: (code: string) => void;
  remove: (code: string) => void;
  clear: () => void;
  has: (code: string) => boolean;
  setHydrated: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      codes: [],
      hydrated: false,
      toggle: (code) => {
        const cur = get().codes;
        if (cur.includes(code)) {
          set({ codes: cur.filter((c) => c !== code) });
        } else {
          set({ codes: [...cur, code] });
        }
      },
      add: (code) => {
        const cur = get().codes;
        if (!cur.includes(code)) set({ codes: [...cur, code] });
      },
      remove: (code) => set({ codes: get().codes.filter((c) => c !== code) }),
      clear: () => set({ codes: [] }),
      has: (code) => get().codes.includes(code),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "salary-ranking-jp:favorites",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ codes: s.codes }) as Partial<FavoritesState>,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
