import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

// Only /ru/… and /en/… exist as prefixes; Azerbaijani is rewritten here by src/proxy.js.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo, ui } = getContent(lang);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: seo.home.title, template: `%s | ${seo.siteName}` },
    description: seo.home.description,
    applicationName: seo.siteName,
    openGraph: { type: "website", locale: ui.seo.ogLocale, siteName: seo.siteName },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport = { themeColor: "#13271f" };

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
