import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the square stays full-bleed.
export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 18,
          background: "#13271f",
          color: "#ebe3c6",
          fontFamily: "Noto Sans",
          fontSize: 118,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        Ç
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
