import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "年収ランキング.jp - 日本上場企業 年収ランキング",
    short_name: "年収ランキング.jp",
    description:
      "日本の全上場企業（プライム/スタンダード/グロース）の有価証券報告書から平均年収・平均年齢・独自スコアをランキング表示。",
    lang: "ja",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#fbbf24",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
