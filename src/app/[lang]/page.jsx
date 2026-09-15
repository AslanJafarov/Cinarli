import Advantages from "@/components/Advantages";
import ConstructionProgress from "@/components/ConstructionProgress";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import LocationSection from "@/components/LocationSection";
import Navbar from "@/components/Navbar";
import PaymentCalculator from "@/components/PaymentCalculator";
import ProjectHighlights from "@/components/ProjectHighlights";
import ProjectOverview from "@/components/ProjectOverview";
import QuickSearch from "@/components/QuickSearch";
import { getContent } from "@/i18n/content";
import { complexJsonLd, pageMetadata, salesOfficeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo } = getContent(lang);

  return pageMetadata({
    locale: lang,
    title: seo.home.title,
    description: seo.home.description,
    path: "/",
    absoluteTitle: true,
  });
}

const page = async ({ params }) => {
  const { lang } = await params;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Header />
        <QuickSearch />
        <ProjectHighlights />
        <ProjectOverview />
        <Advantages />
        <LocationSection />
        <Gallery />
        <ConstructionProgress />
        <PaymentCalculator />
      </main>
      <Footer />
      <JsonLd data={[complexJsonLd(lang), salesOfficeJsonLd(lang)]} />
    </>
  );
};

export default page;
