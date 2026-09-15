import ApartmentPicker from "@/components/ApartmentPicker";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { apartmentListJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo } = getContent(lang);

  return pageMetadata({ locale: lang, ...seo.apartments, path: "/menziller" });
}

const page = async ({ params }) => {
  const { lang } = await params;
  const { seo } = getContent(lang).ui;

  return (
    <>
      <Navbar variant="dark" activePage="menziller" />
      <ApartmentPicker />
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: seo.breadcrumbApartments, path: localizeHref(lang, "/menziller") },
          ]),
          apartmentListJsonLd(lang),
        ]}
      />
    </>
  );
};

export default page;
