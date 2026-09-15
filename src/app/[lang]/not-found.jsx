import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getI18n } from "@/i18n/server";

const buttonStyles = {
  dark: "bg-[#13271f] text-white hover:bg-[#1f3d30]",
  light: "bg-[#ebe3c6] text-[#16201b] hover:bg-[#e2d7b0]",
  outline: "border-2 border-[#24573f] text-[#24573f] hover:bg-[#24573f]/5",
};

// Shown for unknown URLs (via [...rest]) and for notFound(), in the visitor's language.
export default async function NotFound() {
  const { locale, content } = await getI18n();
  const t = content.ui.notFound;
  const links = [
    { href: "/", label: t.home, style: "dark" },
    { href: "/menziller", label: t.apartments, style: "light" },
    { href: "/elaqe", label: t.contact, style: "outline" },
  ];

  return (
    <>
      {/* notFound() ignores page metadata, so the tab title is set here (React hoists it into <head>) */}
      <title>{`${t.metaTitle} | ${content.seo.siteName}`}</title>
      <Navbar variant="dark" />
      <main className="flex flex-1 flex-col justify-center bg-[#f3f0e9] px-page py-[clamp(64px,9vw,180px)] text-[#16201b]">
        <p className="text-[clamp(14px,1.1vw,21px)] font-bold tracking-[0.12em] text-[#2a5a40]">
          404
        </p>
        <h1 className="mt-4 text-[clamp(36px,4.2vw,80px)] leading-[1.08]">
          {t.title}
        </h1>
        <p className="mt-4 max-w-[40em] text-[clamp(15px,1.25vw,24px)] text-[#6c6b65]">
          {t.text}
        </p>
        <div className="mt-[clamp(28px,3vw,56px)] flex flex-wrap gap-[clamp(10px,1vw,20px)]">
          {links.map((link) => (
            <Link
              key={link.href}
              href={localizeHref(locale, link.href)}
              className={`flex h-[clamp(46px,3.8vw,76px)] min-w-[clamp(140px,12vw,240px)] items-center justify-center rounded-full px-6 text-[clamp(12px,1vw,19px)] uppercase tracking-[0.03em] transition-colors ${buttonStyles[link.style]}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
