import { notFound } from "next/navigation";
import { hasLocale, locales } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { fontVariables } from "@/lib/fonts";
import "../../globals.css";

// The "under construction" page, shown to visitors by src/proxy.js while the admin panel's
// "Tikinti rejimi" switch is on. Its own root layout: no navigation, no footer, no indexing.
// Static like the site pages; text edits reach it through revalidatePath (admin actions).
export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo, maintenance } = getContent(lang);
  return {
    title: `${maintenance.title} | ${seo.siteName}`,
    description: maintenance.text,
    robots: { index: false, follow: false },
  };
}

export const viewport = { themeColor: "#13271f" };

export default async function MaintenanceLayout({ children, params }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
