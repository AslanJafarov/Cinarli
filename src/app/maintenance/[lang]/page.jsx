import FooterLeadForm from "@/components/FooterLeadForm";
import { localeNames, locales, localizeHref } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

// Visitors reach this through the proxy rewrite, so the address bar keeps the page they asked
// for (/, /ru/menziller, …). The language links therefore point at the normal site URLs, which
// the proxy turns into this page in the chosen language while the site is closed.
export default async function MaintenancePage() {
  const { locale, content } = await getI18n();
  const { maintenance, footer, contactPage, seo, ui } = content;
  const { phoneHref, whatsappHref } = contactPage.office;

  return (
    <main
      data-admin-preview="maintenance"
      data-maintenance-page=""
      className="flex flex-1 flex-col bg-[#13271f] px-page py-[clamp(28px,4vw,72px)] text-white"
    >
      <header className="flex items-center justify-between gap-6">
        <p className="text-[clamp(22px,2vw,36px)] font-bold tracking-tight">ÇINARLI</p>
        <nav aria-label={ui.nav.language} className="flex items-center gap-4 text-sm uppercase">
          {locales.map((code) => (
            <a
              key={code}
              href={localizeHref(code, "/")}
              hrefLang={code}
              lang={code}
              title={localeNames[code]}
              aria-current={code === locale ? "true" : undefined}
              className={code === locale ? "underline decoration-2 underline-offset-[6px]" : "opacity-60 hover:opacity-100"}
            >
              {code}
            </a>
          ))}
        </nav>
      </header>

      <section className="mx-auto mt-[clamp(40px,8vw,140px)] w-full max-w-3xl text-center">
        <p className="text-[clamp(12px,0.9vw,16px)] uppercase tracking-[0.18em] text-white/60">{seo.siteName}</p>
        <h1 className="mt-4 text-[clamp(34px,4.5vw,80px)] leading-[1.05]">{maintenance.title}</h1>
        <p className="mx-auto mt-6 max-w-[38em] text-[clamp(15px,1.25vw,22px)] leading-relaxed text-white/80">
          {maintenance.text}
        </p>

        {(phoneHref || whatsappHref) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {phoneHref && (
              <a href={phoneHref} className="rounded-full bg-[#ebe3c6] px-6 py-3 text-sm font-semibold uppercase tracking-[0.03em] text-[#16201b]">
                {contactPage.office.details.find((detail) => /telefon|phone|телефон/i.test(detail.label))?.value ?? phoneHref.slice(4)}
              </a>
            )}
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-[#ebe3c6] px-6 py-3 text-sm font-semibold uppercase tracking-[0.03em] text-[#ebe3c6]">
                WhatsApp
              </a>
            )}
          </div>
        )}
      </section>

      {/* Same callback form as the footer, so leads keep arriving while the site is closed. */}
      <section className="mx-auto mt-[clamp(36px,5vw,80px)] w-full max-w-xl text-[#16201b] [&_h2]:text-white">
        <FooterLeadForm {...footer.form} messages={ui.leadForm} consent={ui.consent} locale={locale} />
      </section>

      <p className="mt-auto pt-12 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {footer.copyright}
      </p>
    </main>
  );
}
