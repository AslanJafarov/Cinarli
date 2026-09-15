import Link from "next/link";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { galleryImageFiles } from "@/lib/galleryPhotos";
import { breadcrumbJsonLd, imageGalleryJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo } = getContent(lang);

  return pageMetadata({ locale: lang, ...seo.gallery, path: "/qalereya" });
}

const page = async ({ params }) => {
  const { lang } = await params;
  const { gallery, ui } = getContent(lang);

  // Photos whose file is missing are skipped instead of breaking the page.
  const photos = gallery.photos
    .filter((photo) => galleryImageFiles[photo.key])
    .map((photo) => ({ ...photo, image: galleryImageFiles[photo.key] }));

  return (
    <>
      <Navbar variant="dark" />
      <main className="flex-1 bg-[#f3f0e9] px-page pb-[clamp(56px,6vw,120px)] pt-[clamp(28px,3.2vw,64px)] text-[#16201b]">
        <Link
          href={localizeHref(lang, "/#qalereya")}
          className="inline-flex items-center gap-[clamp(6px,0.5vw,10px)] rounded-full bg-[#e8e4da] py-[clamp(10px,0.6vw,12px)] pl-[clamp(12px,0.9vw,16px)] pr-[clamp(16px,1.2vw,22px)] text-[clamp(14px,0.95vw,18px)] font-bold text-[#16201b] transition-colors hover:bg-[#ddd8cc]"
        >
          <svg aria-hidden="true" viewBox="0 0 8 14" className="h-[clamp(11px,0.8vw,15px)] w-auto">
            <path
              d="M7 1 1 7l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {ui.gallery.back}
        </Link>

        <h1 className="mt-[clamp(28px,3.4vw,68px)] text-[clamp(34px,4vw,76px)] leading-[1.08]">
          {gallery.pageTitle}
        </h1>
        <p className="mt-[clamp(8px,0.8vw,16px)] max-w-[44em] text-[clamp(15px,1.25vw,24px)] text-[#6c6b65]">
          {gallery.pageSubtitle}
        </p>

        <GalleryGrid photos={photos} categories={gallery.categories} labels={ui.gallery} />
      </main>
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: ui.seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: ui.seo.breadcrumbGallery, path: localizeHref(lang, "/qalereya") },
          ]),
          imageGalleryJsonLd(lang, photos),
        ]}
      />
    </>
  );
};

export default page;
