import type { Metadata } from "next";
import { fetchAllCompanies } from "@/lib/queries";
import { FavoritesView } from "./favorites-view";

export const metadata: Metadata = {
  title: "お気に入り企業",
  description: "保存した企業の年収・スコアを一覧表示。ブラウザのlocalStorageに保存されます。",
};

export const revalidate = 86400;

export default async function FavoritesPage() {
  const all = await fetchAllCompanies();
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="text-2xl font-bold md:text-3xl">お気に入り企業</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        企業ページや一覧の <span className="text-amber-500">★</span> ボタンで追加できます。お気に入りはブラウザ内に保存されます。
      </p>
      <div className="mt-6">
        <FavoritesView all={all} />
      </div>
    </div>
  );
}
