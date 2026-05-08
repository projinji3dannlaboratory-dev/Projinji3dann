"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({ code, size = 18, className, showLabel = false }: Props) {
  const has = useFavorites((s) => s.codes.includes(code));
  const hydrated = useFavorites((s) => s.hydrated);
  const toggle = useFavorites((s) => s.toggle);

  // Avoid hydration mismatch by waiting for storage rehydration
  const filled = hydrated && has;

  return (
    <button
      type="button"
      aria-pressed={filled}
      aria-label={filled ? "お気に入りから外す" : "お気に入りに追加"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(code);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent transition-colors",
        filled && "text-amber-500",
        className,
      )}
    >
      <Star
        size={size}
        fill={filled ? "currentColor" : "none"}
        strokeWidth={filled ? 0 : 2}
      />
      {showLabel && (
        <span className="text-xs">
          {filled ? "お気に入り済" : "お気に入り"}
        </span>
      )}
    </button>
  );
}
