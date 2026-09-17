import Image from "next/image";
import Link from "next/link";
import { localizeHref } from "../i18n/config";
import { getI18n } from "../i18n/server";
import { siteImage } from "../lib/siteImages";

export default async function ProjectOverview() {
  const { locale, content } = await getI18n();
  const { titleLines, description, stats, features } = content.projectOverview;
  const t = content.ui.overview;
  const photo = siteImage(content.siteImages, "project");

  return (
    <section
      id="layihe"
      data-admin-preview="projectOverview"
      className="w-full scroll-mt-(--nav-h) bg-[#f3f0e9] px-page pb-[clamp(48px,5.7vw,110px)] pt-[clamp(20px,1.6vw,32px)] text-[#1a2a22] max-md:pb-14 max-md:pt-10"
    >
      {/* Intro + image */}
      <div className="grid gap-[clamp(28px,1.75vw,34px)] lg:grid-cols-[minmax(0,1fr)_42.75vw]">
        <div className="lg:pt-[1.6vw]">
          <h2 className="text-[clamp(34px,4.25vw,80px)] leading-[1.02] max-md:text-[32px] max-md:leading-[1.1]">
            {titleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="mt-[clamp(12px,1.2vw,22px)] max-w-[48vw] text-[clamp(16px,1.5vw,28px)] leading-[1.15] text-[#6c6b65] max-lg:max-w-none">
            {description}
          </p>

          <dl className="mt-[clamp(32px,5.2vw,100px)] grid grid-cols-2 gap-x-[clamp(20px,2vw,40px)] gap-y-6 sm:grid-cols-[repeat(4,auto)] sm:justify-between">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-[clamp(24px,2.3vw,44px)] font-medium leading-tight whitespace-nowrap text-[#2a5a40]">
                  {stat.value}
                </dd>
                <dd className="mt-[0.35em] text-[clamp(12px,0.92vw,17px)] text-[#6c6b65]">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Image card */}
        <div
          className={`relative aspect-[855/518] w-full max-w-full overflow-hidden rounded-[clamp(18px,2vw,38px)] ${
            photo ? "bg-[#3f7fc4]" : "bg-[#24503a]"
          }`}
        >
          {/* The sample photo is shifted to frame its tower; uploads fill the card */}
          {photo?.uploaded && (
            <Image
              src={photo.image}
              alt={t.imageAlt}
              fill
              sizes="(min-width: 1024px) 43vw, 100vw"
              className="object-cover"
            />
          )}
          {photo && !photo.uploaded && (
            <Image
              src={photo.image}
              alt={t.imageAlt}
              placeholder="blur"
              sizes="(min-width: 1024px) 64vw, 150vw"
              className="absolute left-[-33%] top-[-5%] h-auto w-[148%] max-w-none"
            />
          )}
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 855 518"
            preserveAspectRatio="none"
          >
            <polygon
              points="0,0 520,0 310,518 0,518"
              fill="#1a3346"
              fillOpacity="0.5"
            />
            <polygon
              points="0,0 130,0 45,518 0,518"
              fill="#1b3129"
              fillOpacity="0.85"
            />
            <polygon
              points="310,518 395,340 435,518"
              fill="#1b3129"
              fillOpacity="0.5"
            />
            <polygon
              points="690,0 855,0 855,415 765,518 600,518"
              fill="#4a9367"
              fillOpacity="0.96"
            />
          </svg>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-[clamp(28px,3.15vw,60px)] grid grid-cols-1 gap-[clamp(16px,3.45vw,66px)] md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex min-h-[clamp(120px,13.35vw,256px)] max-md:min-h-0 gap-[clamp(12px,1.15vw,22px)] rounded-[clamp(18px,2vw,38px)] bg-white px-[clamp(16px,1.55vw,30px)] py-[clamp(18px,1.85vw,36px)]"
          >
            <span
              aria-hidden="true"
              className="size-[clamp(34px,3.3vw,64px)] shrink-0 rounded-full bg-[#24503a]"
            />
            <div className="min-w-0 pt-[0.1em]">
              <h3 className="text-[clamp(17px,1.6vw,30px)] leading-tight">
                {feature.title}
              </h3>
              <p className="mt-[0.9em] text-[clamp(13px,1.1vw,21px)] leading-[1.4] text-[#6c6b65]">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-[clamp(16px,1.5vw,30px)] flex flex-wrap gap-[clamp(10px,1.2vw,22px)] max-md:mt-6 max-md:flex-col max-md:gap-3">
        {/* Same destination as the "Mənzillər" nav link */}
        <Link
          href={localizeHref(locale, "/menziller")}
          className="inline-flex h-[clamp(46px,4.15vw,80px)] cursor-pointer items-center rounded-full bg-[#12271e] px-[clamp(22px,2.7vw,52px)] text-[clamp(13px,1.02vw,19px)] uppercase text-[#f0ede6] max-md:h-12 max-md:w-full max-md:justify-center max-md:tracking-[0.04em]"
        >
          {t.apartmentsButton}
        </Link>
        {/* Same target as the "Yerləşmə" nav link */}
        <a
          href="#yerlesme"
          className="inline-flex h-[clamp(46px,4.15vw,80px)] cursor-pointer items-center rounded-full border-2 border-[#2f6b4a] px-[clamp(28px,3.3vw,62px)] text-[clamp(13px,1.02vw,19px)] uppercase text-[#2f6b4a] max-md:h-12 max-md:w-full max-md:justify-center max-md:tracking-[0.04em]"
        >
          {t.locationButton}
        </a>
      </div>
    </section>
  );
}
