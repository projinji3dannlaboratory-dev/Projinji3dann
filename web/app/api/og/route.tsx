import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { fetchCompany } from "@/lib/queries";
import { formatYen } from "@/lib/utils";

export const runtime = "edge";

// Cache the Japanese font fetch across requests within an instance.
// We pull a Noto Sans JP weight 700 subset from Google Fonts CDN.
let _fontPromise: Promise<ArrayBuffer> | null = null;

async function loadJpFont(): Promise<ArrayBuffer> {
  if (_fontPromise) return _fontPromise;
  _fontPromise = (async () => {
    // Use a CSS endpoint that returns ttf bytes directly. This is a known pattern
    // for @vercel/og — we fetch the .ttf URL extracted from a CSS query.
    const cssUrl =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap";
    const cssResp = await fetch(cssUrl, {
      headers: {
        // Pretend to be a modern browser that supports woff2; some endpoints
        // return ttf when sent a non-woff2 UA. We then look for any url(...) hit.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const css = await cssResp.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format/);
    if (!match) throw new Error("Could not locate font URL in Google Fonts CSS");
    const fontUrl = match[1];
    const fontResp = await fetch(fontUrl);
    return await fontResp.arrayBuffer();
  })();
  return _fontPromise;
}

async function ogFonts() {
  try {
    const data = await loadJpFont();
    return [
      { name: "NotoSansJP", data, weight: 700 as const, style: "normal" as const },
    ];
  } catch (e) {
    console.warn("[og] failed to load Noto Sans JP, falling back to default", e);
    return undefined;
  }
}

const GRADE_GRADIENT: Record<string, string> = {
  S: "linear-gradient(135deg, #fb923c, #ef4444)",
  A: "linear-gradient(135deg, #34d399, #10b981)",
  B: "linear-gradient(135deg, #38bdf8, #2563eb)",
  C: "linear-gradient(135deg, #94a3b8, #64748b)",
  D: "linear-gradient(135deg, #71717a, #52525b)",
};

const PAGE: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#0a0a0a",
  color: "white",
  padding: "60px",
  fontFamily: "sans-serif",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return defaultOg();
  }

  const c = await fetchCompany(code);
  if (!c) return defaultOg();

  const grade = c.grade ?? "—";
  const bg = GRADE_GRADIENT[grade] ?? "linear-gradient(135deg, #475569, #1e293b)";

  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div style={{ ...PAGE, fontFamily: fonts ? "NotoSansJP" : PAGE.fontFamily }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: "#a1a1aa" }}>
          <div style={{ display: "flex" }}>年収ランキング.jp</div>
          <div style={{ display: "flex", width: 4, height: 4, borderRadius: 2, background: "#52525b" }} />
          <div style={{ display: "flex" }}>{c.industry_name ?? ""}</div>
          {c.market && (
            <div
              style={{
                display: "flex",
                fontSize: 16,
                padding: "4px 10px",
                borderRadius: 999,
                background: "#27272a",
              }}
            >
              {c.market}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 700,
            marginTop: 16,
            lineHeight: 1.1,
          }}
        >
          {c.name_ja}
        </div>

        <div style={{ display: "flex", gap: 40, marginTop: 50 }}>
          <Stat label="平均年収" value={formatYen(c.avg_annual_salary_yen)} />
          <Stat
            label="平均年齢"
            value={c.avg_age_years != null ? `${c.avg_age_years.toFixed(1)} 歳` : "—"}
          />
          <Stat
            label="勤続年数"
            value={c.avg_tenure_years != null ? `${c.avg_tenure_years.toFixed(1)} 年` : "—"}
          />
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: 999,
              fontSize: 96,
              fontWeight: 800,
              background: bg,
              color: "white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {grade}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              独自スコア
            </div>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 800, lineHeight: 1 }}>
              {c.raw_score?.toFixed(1) ?? "—"}
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#a1a1aa", marginTop: 6 }}>
              業界補正後の「若くして高年収」指標
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}

async function defaultOg() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0c0a09, #1c1917)",
          color: "white",
          padding: "80px",
          fontFamily: fonts ? "NotoSansJP" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, color: "#fbbf24" }}>✨ 年収ランキング.jp</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 76,
            fontWeight: 800,
            marginTop: 30,
            lineHeight: 1.1,
          }}
        >
          <div style={{ display: "flex" }}>若くして高年収を実現している</div>
          <div style={{ display: "flex" }}>上場企業ランキング</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#a1a1aa", marginTop: 40 }}>
          有価証券報告書の開示データを業種補正・スコア化
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          fontSize: 18,
          color: "#a1a1aa",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
