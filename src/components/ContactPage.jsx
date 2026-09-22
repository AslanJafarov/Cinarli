import Link from "next/link";
import Faq from "./Faq";
import CallbackLink from "./CallbackLink";
import { localizeHref } from "../i18n/config";
import { getI18n } from "../i18n/server";

export default async function ContactPage() {
  const { locale, content } = await getI18n();
  const { titleLines, office, faqTitle, faqs, meetingLabel } = content.contactPage;
  const { ui } = content;

  return (
    <main data-admin-preview="contactPage" className="flex-1 bg-[#f3f0e9] px-page pb-[clamp(64px,7vw,140px)] pt-[clamp(28px,3.2vw,64px)] text-[#16201b]">
      {/* Same pill as the "Mənzillər" back link on the apartment page */}
      <Link
        href={localizeHref(locale, "/")}
        className="inline-flex items-center gap-[clamp(6px,0.5vw,10px)] rounded-full bg-[#e8e4da] py-[clamp(7px,0.6vw,12px)] pl-[clamp(10px,0.9vw,16px)] pr-[clamp(14px,1.2vw,22px)] text-[clamp(13px,0.95vw,18px)] font-bold text-[#16201b] transition-colors hover:bg-[#ddd8cc] max-md:h-11 max-md:pl-3.5 max-md:pr-5 max-md:text-[14px]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 8 14"
          className="h-[clamp(11px,0.8vw,15px)] w-auto"
        >
          <path
            d="M7 1 1 7l6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {ui.contact.back}
      </Link>

      <h1 className="mt-[clamp(32px,4vw,80px)] text-[clamp(34px,3.5vw,68px)] leading-[1.08]">
        {titleLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <div className="mt-[clamp(40px,5vw,100px)] grid items-start gap-[clamp(36px,6vw,120px)] max-md:mt-10 max-md:gap-12 lg:grid-cols-[504fr_605fr]">
        {/* Sales office */}
        <section className="rounded-[clamp(20px,2.25vw,44px)] bg-[#13271f] px-[clamp(24px,3.4vw,68px)] pb-[clamp(28px,3.2vw,64px)] pt-[clamp(30px,3.6vw,72px)] text-white max-md:rounded-[24px] max-md:px-6 max-md:pb-6 max-md:pt-7">
          <p className="text-[clamp(14px,1.15vw,22px)] text-white/80">
            {office.label}
          </p>
          <h2 className="mt-[clamp(14px,1.8vw,36px)] text-[clamp(22px,2vw,40px)] leading-tight max-md:mt-2 max-md:text-[26px]">
            {office.name}
          </h2>

          <dl className="mt-[clamp(28px,3.2vw,64px)] space-y-[clamp(22px,2.5vw,48px)]">
            {office.details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-[clamp(11px,0.9vw,18px)] text-white/65 max-md:text-[12px]">
                  {detail.label}
                </dt>
                <dd className="mt-[clamp(8px,0.85vw,16px)] text-[clamp(14px,1.12vw,22px)] max-md:mt-1.5 max-md:text-[16px]">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-[clamp(32px,3.6vw,72px)] grid gap-[clamp(10px,1.2vw,24px)] max-md:mt-8 max-md:gap-3 sm:grid-cols-2">
            {office.phoneHref && (<a
              href={office.phoneHref}
              className="flex h-[clamp(48px,3.9vw,76px)] items-center justify-center rounded-full bg-[#ebe3c6] text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.03em] max-md:text-[13px] text-[#16201b]"
            >
              {ui.nav.call}
            </a>)}
            {office.whatsappHref && (<a
              href={office.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[clamp(48px,3.9vw,76px)] items-center justify-center rounded-full bg-[#24573f] text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.03em] max-md:text-[13px] text-white"
            >
              WhatsApp
            </a>)}
          </div>
        </section>

        {/* FAQ */}
        <div className="lg:pt-[0.6vw]">
          <Faq title={faqTitle} items={faqs} />

          <CallbackLink
            source="appointment"
            className="mt-[clamp(32px,3.2vw,64px)] flex items-center justify-center h-[clamp(48px,3.9vw,76px)] w-full cursor-pointer rounded-full bg-[#13271f] px-8 text-[clamp(12px,0.95vw,18px)] uppercase tracking-[0.03em] max-md:text-[13px] text-white sm:w-[45%]"
          >
            {meetingLabel}
          </CallbackLink>
        </div>
      </div>
    </main>
  );
}
