"use client";

import Link from "next/link";
import { useI18n } from "../i18n/client";
import { localizeHref } from "../i18n/config";

/**
 * Mobile-only bar pinned to the bottom of the screen.
 * variant "full": call, WhatsApp and a primary link.
 * variant "contact": call and WhatsApp as two pills.
 */
export default function MobileActionBar({
  variant = "full",
  primaryHref = "/menziller",
  primaryLabel,
}) {
  const { locale, content } = useI18n();
  const { phoneHref, whatsappHref } = content.contactPage.office;
  const { mobileBar, nav } = content.ui;
  const barClass =
    "sticky bottom-0 z-40 bg-[#13271f] px-page pb-[max(12px,env(safe-area-inset-bottom))] pt-3 text-white md:hidden";

  if (variant === "contact") {
    if (!phoneHref && !whatsappHref) return null;
    return (
      <div className={`${barClass} grid grid-flow-col auto-cols-fr gap-3`}>
        {phoneHref && (<a
          href={phoneHref}
          className="flex h-12 items-center justify-center rounded-full bg-[#ebe3c6] text-[13px] uppercase tracking-[0.04em] text-[#16201b]"
        >
          {nav.call}
        </a>)}
        {whatsappHref && (<a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center rounded-full bg-[#24573f] text-[13px] uppercase tracking-[0.04em]"
        >
          WhatsApp
        </a>)}
      </div>
    );
  }

  return (
    <div className={`${barClass} grid grid-flow-col auto-cols-fr items-center gap-2`}>
      {phoneHref && (<a
        href={phoneHref}
        className="flex h-12 items-center justify-center text-[13px] uppercase tracking-[0.04em]"
      >
        {mobileBar.call}
      </a>)}
      {whatsappHref && (<a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center text-[13px] uppercase tracking-[0.04em]"
      >
        WhatsApp
      </a>)}
      <Link
        href={localizeHref(locale, primaryHref)}
        className="flex h-12 items-center justify-center rounded-full bg-[#ebe3c6] px-2 text-[13px] uppercase tracking-[0.04em] text-[#16201b]"
      >
        {primaryLabel ?? mobileBar.primary}
      </Link>
    </div>
  );
}
