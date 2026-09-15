import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 48,
          background: "#13271f",
          borderRadius: 112,
          color: "#ebe3c6",
          fontFamily: "Noto Sans",
          fontSize: 330,
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
