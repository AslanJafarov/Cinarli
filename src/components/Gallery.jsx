import Image from "next/image";
import Link from "next/link";
import EmptyNotice from "./EmptyNotice";
import { localizeHref } from "../i18n/config";
import { getI18n } from "../i18n/server";
import { blurPlaceholder, photosWithImages } from "../lib/galleryPhotos";
import { getSiteData } from "../lib/store";

// Phones: the four smaller photos become a 2×2 grid of squares.
const tileClass =
  "relative aspect-[4/3] overflow-hidden rounded-[clamp(14px,1.5vw,30px)] bg-[#e4e1d9] max-sm:aspect-square max-sm:rounded-[20px] lg:aspect-auto";

function GalleryImage({ image, sizes }) {
  return (
    <Image
      src={image.image}
      alt={image.alt}
      fill
      placeholder={blurPlaceholder(image.image)}
      sizes={sizes}
      className="object-cover"
      style={image.position ? { objectPosition: image.position } : undefined}
    />
  );
}

export default async function Gallery() {
  const { locale, content } = await getI18n();
  const { gallery, ui } = content;
  // Preserve the curated sample homepage; saved content follows the admin's photo order.
  const homepagePhotos = getSiteData().mode === "mock"
    ? gallery.images
    : gallery.photos ?? gallery.images;
  const tiles = photosWithImages(homepagePhotos).slice(0, 5);
  const photoCount = photosWithImages(gallery.photos).length;
  const [featured, ...rest] = tiles;
  const rows = [rest.slice(0, 2), rest.slice(2, 4)].filter((row) => row.length > 0);
  // Column ratios per row, taken from the design.
  const rowColumns = [
    "sm:grid-cols-[449fr_611fr]",
    "sm:grid-cols-[493fr_566fr]",
  ];

  return (
    <section
      id="qalereya"
      data-admin-preview="gallery"
      className="w-full scroll-mt-(--nav-h) bg-[#f3f0e9] px-page pb-[clamp(56px,6vw,120px)] pt-[clamp(40px,3.6vw,72px)] text-[#16201b]"
    >
      <h2 className="text-[clamp(34px,4vw,76px)] leading-[1.1]">
        {gallery.title}
      </h2>
      <p className="mt-[clamp(8px,0.7vw,14px)] text-[clamp(14px,1.22vw,24px)] text-[#6c6b65]">
        {gallery.subtitle}
      </p>

      {!featured ? (
        <EmptyNotice
          icon="photo"
          title={ui.empty.noPhotosTitle}
          text={ui.empty.noPhotosText}
          className="mt-[clamp(28px,4.25vw,82px)]"
        />
      ) : (
      <div
        className={`mt-[clamp(28px,4.25vw,82px)] grid gap-[clamp(12px,1.85vw,36px)] lg:aspect-[1821/648] ${
          rows.length > 0 ? "lg:grid-cols-[688fr_1096fr]" : ""
        }`}
      >
        <figure className={`${tileClass} max-lg:aspect-[688/648]`}>
          <GalleryImage
            image={featured}
            sizes="(min-width: 1024px) 36vw, 100vw"
          />
          {/* Opens the full gallery page; the count follows the photos listed there */}
          <Link
            href={localizeHref(locale, "/qalereya")}
            className="absolute bottom-[11.4%] left-[5.8%] flex h-[clamp(46px,5vw,96px)] min-w-[54%] cursor-pointer items-center justify-center rounded-full bg-[#16271e] px-[clamp(20px,2vw,40px)] text-[clamp(11px,0.95vw,18px)] uppercase tracking-[0.04em] text-white/85 transition-colors duration-300 hover:bg-[#1f3d30] hover:text-white"
          >
            {photoCount} {ui.gallery.photos}
            {gallery.videoCount > 0 && (
              <>
                <span aria-hidden="true" className="mx-[0.9em]">
                  •
                </span>
                {gallery.videoCount} {ui.gallery.videos}
              </>
            )}
          </Link>
        </figure>

        {/* With fewer than five photos, the remaining ones fill the space they have. */}
        {rows.length > 0 && (
        <div
          className={`grid gap-[clamp(12px,1.85vw,36px)] ${
            rows.length > 1 ? "lg:grid-rows-[318fr_293fr]" : ""
          }`}
        >
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`grid gap-[clamp(12px,1.85vw,36px)] max-sm:grid-cols-2 ${
                row.length > 1 ? rowColumns[rowIndex] : ""
              }`}
            >
              {row.map((image) => (
                <figure key={image.key} className={tileClass}>
                  <GalleryImage
                    image={image}
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                  />
                </figure>
              ))}
            </div>
          ))}
        </div>
        )}
      </div>
      )}
    </section>
  );
}
