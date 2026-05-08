import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbbf24, #ef4444)",
          color: "white",
          fontWeight: 800,
          letterSpacing: -4,
          borderRadius: 36,
        }}
      >
        ¥
      </div>
    ),
    size,
  );
}
