import { ImageResponse } from "next/og";
import { getContent } from "@/i18n/content";
import { translate } from "@/i18n/format";
import { assetDataUri, ogFonts, toJpegResponse } from "@/lib/og";

export const alt = "Çınarlı Park";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// Site-wide link preview, one per language; apartment pages have their own.
export default async function OpengraphImage({ params }) {
  const { lang } = await params;
  const { seo, ui } = getContent(lang);
  const [fonts, hero] = await Promise.all([
    ogFonts(),
    // 2× the 560px slot is plenty; the 1.4 MB original slows rendering.
    assetDataUri("hero-building.jpg", "image/jpeg", { width: 1120 }),
  ]);

  return toJpegResponse(new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#13271f",
          fontFamily: "Noto Sans",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 640,
            padding: "60px 56px 60px 64px",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            ÇINARLI PARK
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.08 }}>
              {seo.tagline}
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 28,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {translate(ui.seo.ogSubtitle, { location: seo.locationLabel })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "14px 32px",
              borderRadius: 999,
              background: "#ebe3c6",
              color: "#16201b",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {ui.seo.ogButton}
          </div>
        </div>

        <div style={{ display: "flex", position: "relative", width: 560, height: 630 }}>
          <img
            src={hero}
            alt=""
            width={560}
            height={630}
            style={{ width: 560, height: 630, objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 630,
              background: "#4a9367",
              opacity: 0.92,
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  ));
}
