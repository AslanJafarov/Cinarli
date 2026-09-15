import { notFound } from "next/navigation";
import ApartmentDetail from "@/components/ApartmentDetail";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { apartments } from "@/data/mock";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import {
  apartmentDescription,
  apartmentJsonLd,
  apartmentPath,
  apartmentTitle,
  breadcrumbJsonLd,
  pageMetadata,
} from "@/lib/seo";

const findApartment = (lang, id) =>
  getContent(lang).apartments.find((apartment) => apartment.id === id);

export function generateStaticParams() {
  return apartments.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const apartment = findApartment(lang, id);

  if (!apartment) return { title: getContent(lang).ui.notFound.metaTitle };

  return pageMetadata({
    locale: lang,
    title: apartmentTitle(apartment, lang),
    description: apartmentDescription(apartment, lang),
    path: apartmentPath(apartment),
    imagePath: `${apartmentPath(apartment)}/opengraph-image`,
  });
}

const page = async ({ params }) => {
  const { lang, id } = await params;
  const apartment = findApartment(lang, id);

  if (!apartment) notFound();

  const { seo } = getContent(lang).ui;

  return (
    <>
      <Navbar variant="dark" activePage="menziller" />
      <ApartmentDetail apartment={apartment} />
      <Footer />
      <JsonLd
        data={[
          apartmentJsonLd(apartment, lang),
          breadcrumbJsonLd([
            { name: seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: seo.breadcrumbApartments, path: localizeHref(lang, "/menziller") },
            { name: apartment.id, path: localizeHref(lang, apartmentPath(apartment)) },
          ]),
        ]}
      />
    </>
  );
};

export default page;
