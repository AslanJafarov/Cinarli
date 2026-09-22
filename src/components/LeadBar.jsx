"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n/client";
import { formatLocalPhone } from "../lib/phone";
import { useLeadForm } from "./useLeadForm";

// Sticky "liked this flat?" bar; the lead is saved with the apartment's ID.
export default function LeadBar({ apartmentId }) {
  const { locale, content } = useI18n();
  const t = content.ui.leadBar;
  const [open, setOpen] = useState(true);
  const { digits, changeDigits, status, setStatus, error, submit } = useLeadForm({
    source: "apartment",
    apartmentId,
    locale,
    messages: content.ui.leadForm,
  });

  useEffect(() => {
    const openForm = (event) => {
      if (event.detail.target !== "apartment-callback") return;
      setOpen(true);
      setStatus("idle");
    };
    window.addEventListener("open-callback", openForm);
    if (window.location.hash === "#apartment-callback") {
      document.getElementById("lead-phone")?.focus();
    }
    return () => window.removeEventListener("open-callback", openForm);
  }, [setStatus]);

  if (!open) return null;

  return (
    // Sticky on desktop; on mobile it sits above the pinned MobileActionBar instead.
    <div id="apartment-callback" tabIndex={-1} className="z-40 flex flex-wrap items-center gap-x-[clamp(12px,2vw,40px)] gap-y-3 bg-[#19241f] px-page py-5 text-white md:sticky md:bottom-0 md:gap-y-2 md:py-[clamp(6px,0.5vw,10px)]">
      <p className="order-1 text-[clamp(14px,1.15vw,22px)] font-bold">
        {t.title}
      </p>
      <p className="order-2 hidden text-[clamp(12px,0.92vw,18px)] text-white/75 md:block">
        {t.text}
      </p>

      {status === "success" ? (
        <p role="status" className="order-3 w-full font-semibold md:ml-auto md:w-auto">
          {t.success}
        </p>
      ) : (
      <form
        noValidate
        onSubmit={submit}
        className="order-3 flex w-full flex-wrap gap-[clamp(6px,0.7vw,14px)] md:ml-auto md:w-auto md:max-w-[34vw]"
      >
        <label htmlFor="lead-phone" className="sr-only">
          {t.phoneLabel}
        </label>
        <div className="relative min-w-0 flex-1 md:w-[15vw] md:flex-none">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[clamp(12px,1vw,20px)] top-1/2 -translate-y-1/2 text-[clamp(12px,0.92vw,18px)] text-[#8a8a85]"
          >
            +994
          </span>
          <input
            id="lead-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="__ ___ __ __"
            value={formatLocalPhone(digits)}
            onChange={(event) => changeDigits(event.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "lead-phone-error" : undefined}
            className="h-11 w-full rounded-full bg-white pl-[clamp(48px,3.6vw,72px)] pr-[clamp(12px,1vw,20px)] text-[clamp(12px,0.92vw,18px)] text-[#16201b] placeholder:text-[#8a8a85] aria-invalid:ring-2 aria-invalid:ring-[#e0766a] md:h-[clamp(30px,2.1vw,42px)]"
          />
        </div>
        {/* Honeypot: hidden from visitors, bots tend to fill it in */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 cursor-pointer rounded-full bg-[#ebe3cc] md:h-[clamp(30px,2.1vw,42px)] px-[clamp(16px,2vw,40px)] text-[clamp(11px,0.85vw,17px)] font-bold uppercase text-[#16201b] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? content.ui.leadForm.sending : t.submit}
        </button>
        {error && (
          <p id="lead-phone-error" role="alert" className="w-full text-[clamp(11px,0.8vw,15px)] text-[#f0a79d]">
            {error}
          </p>
        )}
        <p className="w-full text-[clamp(10px,0.68vw,13px)] leading-snug text-white/55">
          {content.ui.consent}
        </p>
      </form>
      )}

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
