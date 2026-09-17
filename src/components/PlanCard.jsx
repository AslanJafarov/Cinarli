"use client";

import Image from "next/image";
import plan2Room8210 from "../assets/plans/2-otaq-82-10.jpg";
import plan3Room11495 from "../assets/plans/3-otaq-114-95.jpg";
import plan3Room11635 from "../assets/plans/3-otaq-116-35.jpg";
import plan3Room9666 from "../assets/plans/3-otaq-96-66.jpg";
import { useI18n } from "../i18n/client";
import { translate } from "../i18n/format";

// Keys are the `plan` values in src/data/mock.js apartments.
export const planImages = {
  "2-otaq-82-10": plan2Room8210,
  "3-otaq-96-66": plan3Room9666,
  "3-otaq-114-95": plan3Room11495,
  "3-otaq-116-35": plan3Room11635,
};

// Uploaded plan ({ src, width, height } from the admin panel). The built-in files above only
// serve the sample apartments in mock data; there is no default plan.
export const planSource = (apartment) =>
  apartment.planImage?.src ? apartment.planImage : (planImages[apartment.plan] ?? null);

// Sizes are relative to the card width (cqw), so both variants scale.
// The room list fits up to eight rooms beside the plan.
// `sizes` covers the plan at its 1.6x hover scale so it stays sharp.
const variants = {
  compact: {
    card: "aspect-[651/547] rounded-[clamp(14px,1.5vw,30px)]",
    sizes: "(min-width: 768px) 20vw, 64vw",
  },
  large: {
    card: "aspect-[925/885] rounded-[clamp(18px,2vw,40px)]",
    sizes: "(min-width: 1024px) 26vw, 64vw",
  },
};

export default function PlanCard({ apartment, variant = "compact", className = "" }) {
  const { locale, content } = useI18n();
  const { ui } = content;
  const styles = variants[variant];
  const areaText = (value) => translate(ui.common.area, { value });
  const plan = planSource(apartment);

  return (
    <div
      className={`@container relative flex w-full shrink-0 overflow-hidden bg-[#efeeeb] font-display text-[#141414] ${styles.card} ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-32deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 4%, rgba(255,255,255,0) 9%)",
      }}
    >
      <div className="flex w-full items-center gap-[4cqw] py-[6cqw] pl-[6cqw] pr-[5cqw]">
        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch gap-[4cqw]">
          <div>
            <p className="flex items-baseline gap-[2cqw] leading-none">
              <span className="text-[13cqw] font-extrabold tracking-tight">
                {apartment.rooms}
              </span>
              <span className="text-[6.2cqw] font-extrabold tracking-tight">
                {translate(ui.planCard.roomsWord, { count: apartment.rooms }, locale)}
              </span>
            </p>
            <span className="mt-[2.4cqw] inline-block rounded-full bg-[#2a6a4e] px-[2.2cqw] py-[0.4cqw] text-[3.6cqw] font-semibold text-white">
              {areaText(apartment.area)}
            </span>
          </div>

          <ol className="space-y-[1.1cqw] text-[2.5cqw] leading-[1.25]">
            {apartment.layout.map((room, index) => (
              <li
                key={`${index}-${room.name}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[1.5cqw]"
              >
                <span className="font-bold">
                  {index + 1}. {room.name}
                </span>
                <span className="font-semibold text-[#2a6a4e]">
                  {areaText(room.area)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Grows from its right edge so the enlarged plan stays inside the card. */}
        <div className={`relative z-10 w-[38%] shrink-0 origin-right overflow-hidden rounded-[2.5cqw] shadow-[0_1.5cqw_4cqw_rgba(20,36,27,0.18)] ${
            plan ? "cursor-pointer transition-transform duration-300 ease-out hover:scale-160 motion-reduce:transition-none" : ""
          }`}>
          {plan ? (
            <Image
              src={plan}
              alt={translate(ui.planCard.planAlt, { count: apartment.rooms }, locale)}
              sizes={styles.sizes}
              // The large plan is the main image on apartment pages, so start loading it right away.
              preload={variant === "large"}
              className="block h-auto w-full"
            />
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-[2cqw] bg-white px-[2cqw] text-center text-[#6c6b65]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[9cqw]"
              >
                <path d="M3 3h18v18H3zM3 12h7M14 3v6M14 13v8M10 12v5" />
              </svg>
              <span className="text-[2.8cqw] font-semibold leading-tight">{ui.planCard.planSoon}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
