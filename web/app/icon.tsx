import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbbf24, #ef4444)",
          color: "white",
          fontWeight: 800,
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        ¥
      </div>
    ),
    size,
  );
}
