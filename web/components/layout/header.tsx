import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Sparkles } from "lucide-react";

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
            <Link href="/compare" className="hover:text-foreground">企業比較</Link>
            <Link href="/about" className="hover:text-foreground">スコアの考え方</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
