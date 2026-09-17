import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { I18nProvider } from "@/i18n/client";
import { getContent } from "@/i18n/content";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

// Only /ru/… and /en/… exist as prefixes; Azerbaijani is rewritten here by src/proxy.js.
// Other prefixes hit notFound() below. (dynamicParams = false would also block apartments
// added in the admin panel after the build, because child segments inherit it.)

// Pages are static and rebuilt when the admin panel saves (revalidatePath). The time limit also
// picks up saved data a build didn't have, e.g. when the app was built on another machine.
export const revalidate = 60;

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
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider locale={lang} content={getContent(lang)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
