import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, Star } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <div className="leading-tight">
              <div className="font-semibold">{SITE_CONFIG.siteName}</div>
              <div className="hidden text-[10px] tracking-wide text-muted-foreground sm:block">
                by {SITE_CONFIG.operator}
              </div>
            </div>
          </Link>
          {/* Desktop navigation */}
          <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
            <Link href="/" className="hover:text-foreground">
              ランキング
            </Link>
            <Link href="/industries" className="hover:text-foreground">
              業種別
            </Link>
            <Link href="/compare" className="hover:text-foreground">
              企業比較
            </Link>
            <Link
              href="/favorites"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <Star className="size-3.5" /> お気に入り
            </Link>
            <Link href="/about" className="hover:text-foreground">
              スコアの考え方
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile-only secondary navigation row */}
      <nav
        className="md:hidden flex items-center gap-1 overflow-x-auto border-t border-border/60 px-3 py-1.5 text-xs text-muted-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="モバイル ナビゲーション"
      >
        <Link
          href="/"
          className="shrink-0 rounded-full px-3 py-1.5 hover:bg-accent hover:text-foreground"
        >
          ランキング
        </Link>
        <Link
          href="/industries"
          className="shrink-0 rounded-full px-3 py-1.5 hover:bg-accent hover:text-foreground"
        >
          業種別
        </Link>
        <Link
          href="/compare"
          className="shrink-0 rounded-full px-3 py-1.5 hover:bg-accent hover:text-foreground"
        >
          企業比較
        </Link>
        <Link
          href="/favorites"
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-accent hover:text-foreground"
        >
          <Star className="size-3" /> お気に入り
        </Link>
        <Link
          href="/about"
          className="shrink-0 rounded-full px-3 py-1.5 hover:bg-accent hover:text-foreground"
        >
          スコアの考え方
        </Link>
      </nav>
    </header>
  );
}
