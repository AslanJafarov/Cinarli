import Image from "next/image";
import Link from "next/link";
import { localizeHref } from "../i18n/config";
import { getI18n } from "../i18n/server";
import { heroImages } from "../lib/siteImages";
import HeroSlideshow from "./HeroSlideshow";

export default async function Header() {
  const { locale, content } = await getI18n();
  const hero = content.ui.hero;
  const photos = heroImages(content.siteImages);

  return (
    <header
      data-admin-preview="siteImages"
      className={`relative isolate h-[max(560px,39.4vw)] w-full overflow-hidden text-white max-md:h-auto max-md:min-h-[640px] max-md:pb-[132px] ${
        photos.length > 0 ? "bg-[#3f7fc4]" : "bg-[#24503a]"
      }`}
    >
      {/* Background photos, changing every 7 seconds. The first sample is placed for its sky;
          the other photos simply cover the hero, keeping their right side next to the copy panel. */}
      {photos.length > 0 && (
        <HeroSlideshow>
          {photos.map((photo, index) =>
            !photo.uploaded && index === 0 ? (
              <Image
                key={index}
                src={photo.image}
                alt={hero.imageAlt}
                priority
                placeholder="blur"
                sizes="100vw"
                className="absolute left-[4%] top-[6%] h-auto w-[97%] max-w-none max-md:inset-0 max-md:h-full max-md:w-full max-md:object-cover max-md:object-[50%_80%]"
              />
            ) : (
              <Image
                key={index}
                src={photo.image}
                alt={hero.imageAlt}
                priority={index === 0}
                fill
                sizes="100vw"
                className="object-cover md:object-[70%_50%]"
              />
            ),
          )}
        </HeroSlideshow>
      )}

      {/* Mobile overlays: dark top for the copy, the tower shows through below */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 md:hidden">
        <div className="absolute inset-0 bg-linear-to-b from-[#1e3a2b] from-35% via-[#1e3a2b]/80 via-55% to-[#1e3a2b]/10" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 390 640"
          preserveAspectRatio="none"
        >
          <polygon points="195,60 340,430 50,430" fill="#ffffff" fillOpacity="0.05" />
          <polygon points="0,330 110,640 0,640" fill="#1e3a2b" fillOpacity="0.9" />
          <polygon points="390,210 390,560 330,640 270,640 355,340" fill="#4a9367" fillOpacity="0.92" />
        </svg>
      </div>

      {/* Geometric overlays */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full max-md:hidden"
        viewBox="0 0 2000 788"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14241b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#14241b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Blue tint across the middle of the photo */}
        <polygon
          points="985,0 1180,0 1270,185 1400,40 1180,788 760,788"
          fill="#1b3f5e"
          fillOpacity="0.38"
        />

        {/* Semi-transparent dark band that lets the tower show through */}
        <polygon
          points="820,0 985,0 760,788 590,788 735,180"
          fill="#1d3829"
          fillOpacity="0.72"
        />

        {/* Solid dark green panel behind the copy */}
        <polygon
          points="0,0 820,0 735,180 590,788 0,788"
          fill="#1e3a2b"
          fillOpacity="0.95"
        />

        {/* Subtle facets on the dark panel */}
        <polygon
          points="445,55 900,210 760,788 560,788"
          fill="#ffffff"
          fillOpacity="0.035"
        />
        <polygon
          points="0,560 150,520 390,788 0,788"
          fill="#51615a"
          fillOpacity="0.35"
        />

        {/* Dark green notch at the top */}
        <polygon
          points="1180,0 1430,0 1270,185"
          fill="#2c5639"
          fillOpacity="0.92"
        />

        {/* Bright green panel on the right */}
        <polygon
          points="1420,0 2000,0 2000,712 1880,745 1845,508 1610,788 1420,788 1550,52"
          fill="#4a9367"
          fillOpacity="0.97"
        />

        <rect width="2000" height="120" fill="url(#topShade)" />
      </svg>

      {/* Hero copy (top padding leaves room for the fixed navbar) */}
      <div className="px-page pt-[calc(var(--nav-h)_+_clamp(24px,3.2vw,60px))]">
        <h1 className="leading-[1.1] max-md:mt-6 max-md:text-[34px] max-md:font-bold">
          {/* Brand + location in the page's main heading */}
          <span className="mb-[clamp(10px,1.1vw,22px)] block text-[clamp(12px,0.95vw,18px)] font-bold uppercase tracking-[0.12em] text-white/75 max-md:mb-3 max-md:text-[12px]">
            {content.seo.siteName} · {content.seo.locationLabel}
          </span>
          <span className="block text-[clamp(28px,3.75vw,68px)] font-normal max-md:inline max-md:text-[length:inherit] max-md:font-bold">
            {hero.titleLines[0]}
          </span>{" "}
          <span className="block text-[clamp(32px,4.7vw,86px)] font-bold max-md:inline max-md:text-[length:inherit]">
            {hero.titleLines[1]}
          </span>
        </h1>

        <p className="mt-[clamp(16px,1.9vw,36px)] max-w-[clamp(320px,38vw,720px)] text-[clamp(16px,1.6vw,28px)] leading-[1.3] text-white/90">
          {hero.description}
        </p>

        <div className="mt-[clamp(28px,4.2vw,80px)] flex flex-wrap gap-[clamp(10px,1vw,18px)]">
          <Link
            href={localizeHref(locale, "/menziller")}
            className="cursor-pointer rounded-full bg-[#e8e1cd] px-[clamp(24px,3.6vw,68px)] py-[clamp(12px,1.4vw,26px)] text-[clamp(13px,1.15vw,20px)] font-bold uppercase text-[#1c2a22] max-md:px-14 max-md:py-4"
          >
            {hero.primary}
          </Link>
          {/* Same target as the "Layihə" nav link; the hero only renders on the home page */}
          <a
            href="#layihe"
            className="cursor-pointer rounded-full border-2 border-white/90 px-[clamp(24px,2.9vw,56px)] py-[clamp(10px,1.3vw,24px)] text-[clamp(13px,1.15vw,20px)] font-bold uppercase max-md:hidden"
          >
            {hero.secondary}
          </a>
        </div>
      </div>
    </header>
  );
}
