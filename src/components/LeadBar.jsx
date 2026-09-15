"use client";

import { useState } from "react";
import { useI18n } from "../i18n/client";

// Sticky "liked this flat?" bar. Sending is not functional yet.
export default function LeadBar() {
  const { content } = useI18n();
  const t = content.ui.leadBar;
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    // Sticky on desktop; on mobile it sits above the pinned MobileActionBar instead.
    <div className="z-40 flex flex-wrap items-center gap-x-[clamp(12px,2vw,40px)] gap-y-3 bg-[#19241f] px-page py-5 text-white md:sticky md:bottom-0 md:gap-y-2 md:py-[clamp(6px,0.5vw,10px)]">
      <p className="order-1 text-[clamp(14px,1.15vw,22px)] font-bold">
        {t.title}
      </p>
      <p className="order-2 hidden text-[clamp(12px,0.92vw,18px)] text-white/75 md:block">
        {t.text}
      </p>

      <form className="order-3 flex w-full gap-[clamp(6px,0.7vw,14px)] md:ml-auto md:w-auto">
        <label htmlFor="lead-phone" className="sr-only">
          {t.phoneLabel}
        </label>
        <input
          id="lead-phone"
          type="tel"
          placeholder="+994 __ ___ __ __"
          className="h-11 min-w-0 flex-1 md:h-[clamp(30px,2.1vw,42px)] rounded-full bg-white px-[clamp(12px,1vw,20px)] text-[clamp(12px,0.92vw,18px)] text-[#16201b] placeholder:text-[#8a8a85] md:w-[15vw] md:flex-none"
        />
        <button
          type="button"
          className="h-11 cursor-pointer rounded-full bg-[#ebe3cc] md:h-[clamp(30px,2.1vw,42px)] px-[clamp(16px,2vw,40px)] text-[clamp(11px,0.85vw,17px)] font-bold uppercase text-[#16201b]"
        >
          {t.submit}
        </button>
      </form>

      <button
        type="button"
        aria-label={t.close}
        onClick={() => setOpen(false)}
        className="order-2 ml-auto flex size-[clamp(28px,2vw,40px)] shrink-0 cursor-pointer items-center justify-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white md:order-4 md:ml-0"
      >
        <svg aria-hidden="true" viewBox="0 0 14 14" className="size-[45%]">
          <path
            d="M1 1l12 12M13 1 1 13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
