import ContactPage from "@/components/ContactPage";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  pageMetadata,
  salesOfficeJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo } = getContent(lang);

  return pageMetadata({ locale: lang, ...seo.contact, path: "/elaqe" });
}

const page = async ({ params }) => {
  const { lang } = await params;
  const { contactPage, ui } = getContent(lang);

  return (
    <>
      <Navbar variant="dark" activePage="elaqe" />
      <ContactPage />
      <Footer />
      <JsonLd
        data={[
          salesOfficeJsonLd(lang),
          faqJsonLd(contactPage.faqs),
          breadcrumbJsonLd([
            { name: ui.seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: ui.seo.breadcrumbContact, path: localizeHref(lang, "/elaqe") },
          ]),
        ]}
      />
    </>
  );
};

export default page;
