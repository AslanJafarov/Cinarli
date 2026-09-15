import { ImageResponse } from "next/og";
import { getContent } from "@/i18n/content";
import { translate } from "@/i18n/format";
import { assetDataUri, ogFonts, toJpegResponse } from "@/lib/og";
import { ordinal } from "@/lib/seo";

export const alt = "Çınarlı Park";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// Relative to src/assets; keys are the apartments' `plan` values.
const planFiles = {
  "2-otaq-82-10": "plans/2-otaq-82-10.jpg",
  "3-otaq-96-66": "plans/3-otaq-96-66.jpg",
  "3-otaq-114-95": "plans/3-otaq-114-95.jpg",
  "3-otaq-116-35": "plans/3-otaq-116-35.jpg",
};

const statusColors = {
  available: { background: "#c8d9cd", color: "#1c3b2b" },
  reserved: { background: "#ebe3c9", color: "#5a4a1e" },
  sold: { background: "#e0e0de", color: "#55554f" },
};

// Link preview per apartment and language: plan, area, location in the complex and status.
export default async function ApartmentOpengraphImage({ params }) {
  const { lang, id } = await params;
  const { apartments, apartmentStatuses, ui } = getContent(lang);
  const apartment = apartments.find((item) => item.id === id) ?? apartments[0];

  const [fonts, plan] = await Promise.all([
    ogFonts(),
    assetDataUri(planFiles[apartment.plan] ?? Object.values(planFiles)[0], "image/jpeg"),
  ]);
  const status = statusColors[apartment.status] ?? statusColors.available;

  return toJpegResponse(new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#f3f0e9",
          fontFamily: "Noto Sans",
          color: "#16201b",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 640,
            padding: "60px 40px 60px 64px",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
            ÇINARLI PARK
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#2a5a40" }}>
              {translate(ui.apartment.roomsTitle, { count: apartment.rooms }).toLocaleUpperCase(lang)}
            </div>
            <div style={{ marginTop: 12, fontSize: 104, fontWeight: 700, lineHeight: 1 }}>
              {translate(ui.common.area, { value: apartment.area })}
            </div>
            <div style={{ marginTop: 22, fontSize: 28, color: "#6b6a63" }}>
              {translate(ui.seo.ogApartmentMeta, {
                building: apartment.building,
                floor: apartment.floor,
                floorOrdinal: ordinal(apartment.floor),
                unit: apartment.unit,
              })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 999,
                background: status.background,
                color: status.color,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {apartmentStatuses[apartment.status]}
            </div>
            <div style={{ marginLeft: 20, fontSize: 24, color: "#6b6a63" }}>
              {apartment.id}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 560,
            height: 630,
            background: "#e9e6de",
          }}
        >
          <img
            src={plan}
            alt=""
            width={460}
            height={460}
            style={{ width: 460, height: 460, objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  ));
}
