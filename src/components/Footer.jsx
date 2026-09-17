import Link from "next/link";
import FooterLeadForm from "./FooterLeadForm";
import { localizeHref } from "../i18n/config";
import { getI18n } from "../i18n/server";

const actionStyles = {
  dark: "bg-[#13271f] text-white hover:bg-[#1f3d30]",
  light: "bg-[#ebe3c6] text-[#16201b] hover:bg-[#e2d7b0]",
  outline: "border-2 border-[#24573f] text-[#24573f] hover:bg-[#24573f]/5",
};

// Page routes use <Link>; hash links stay plain anchors so the browser
// smooth-scrolls on the home page; tel:/https links open natively.
function FooterLink({ href, className, children }) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (!href.startsWith("/") || href.includes("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function Footer() {
  const { locale, content } = await getI18n();
  const { title, subtitle, description, actions, form, copyright, links } =
    content.footer;
  const { ui } = content;
  const year = new Date().getFullYear();

  return (
    <footer data-admin-preview="footer" className="w-full border-t border-[#16201b]/8 bg-[#f6f4ef] px-page pb-[clamp(28px,2.6vw,52px)] pt-[clamp(48px,4.4vw,88px)] text-[#16201b]">
      <div className="grid gap-[clamp(40px,5vw,100px)] lg:grid-cols-[minmax(0,1fr)_39vw]">
        <div>
          <p className="text-[clamp(28px,2.75vw,56px)] leading-[1.15]">{title}</p>
          <p className="mt-[clamp(10px,1.3vw,26px)] text-[clamp(16px,1.4vw,28px)]">
            {subtitle}
          </p>
          <p className="mt-[clamp(10px,1.2vw,24px)] max-w-[40em] text-[clamp(13px,1.05vw,20px)] text-[#6c6b65]">
            {description}
          </p>

          <div className="mt-[clamp(28px,3.9vw,78px)] flex flex-wrap gap-[clamp(10px,1.2vw,24px)]">
            {actions.map((action) => (
              <FooterLink
                key={action.label}
                href={localizeHref(locale, action.href)}
                className={`flex h-[clamp(46px,3.8vw,76px)] min-w-[clamp(140px,13.2vw,264px)] items-center justify-center rounded-full px-6 text-[clamp(12px,1.05vw,20px)] uppercase tracking-[0.03em] transition-colors ${
                  actionStyles[action.style] ?? actionStyles.dark
                }`}
              >
                {action.label}
              </FooterLink>
            ))}
          </div>
        </div>

        <FooterLeadForm {...form} messages={ui.leadForm} consent={ui.consent} locale={locale} />
      </div>

      <nav
        aria-label={ui.footer.navLabel}
        className="mt-[clamp(40px,8vw,160px)] flex flex-wrap items-center gap-x-[clamp(8px,0.7vw,14px)] gap-y-2 text-[clamp(12px,0.95vw,19px)] text-[#6c6b65]"
      >
        <span>
          © {year} {copyright}
        </span>
        {/* Each bullet stays on the same line as its link, so none dangles at a line end */}
        {links.map((link) => (
          <span
            key={link.label}
            className="inline-flex items-center gap-x-[clamp(8px,0.7vw,14px)] whitespace-nowrap"
          >
            <span aria-hidden="true">•</span>
            <FooterLink
              href={localizeHref(locale, link.href)}
              className="transition-colors hover:text-[#16201b]"
            >
              {link.label}
            </FooterLink>
          </span>
        ))}
      </nav>
    </footer>
  );
}
