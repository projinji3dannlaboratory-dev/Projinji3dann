import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles, Star } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-5 text-amber-500" />
            <span>年収ランキング.jp</span>
          </Link>
          <nav className="hidden gap-4 text-sm text-muted-foreground md:flex">
            <Link href="/" className="hover:text-foreground">ランキング</Link>
            <Link href="/industries" className="hover:text-foreground">業種別</Link>
            <Link href="/compare" className="hover:text-foreground">企業比較</Link>
            <Link href="/favorites" className="inline-flex items-center gap-1 hover:text-foreground">
              <Star className="size-3.5" /> お気に入り
            </Link>
            <Link href="/about" className="hover:text-foreground">スコアの考え方</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/favorites"
            aria-label="お気に入り"
            className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-accent text-muted-foreground"
          >
            <Star className="size-4" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
