import Image from "next/image";
import { getI18n } from "../i18n/server";
import { siteImage } from "../lib/siteImages";

export default async function Advantages() {
  const { content } = await getI18n();
  const { titleLines, description, highlight, items } = content.advantages;
  const photo = siteImage(content.siteImages, "advantages");

  return (
    <section
      id="ustunlukler"
      data-admin-preview="advantages"
      className="w-full scroll-mt-(--nav-h) bg-[#f3f0e9] pb-[clamp(56px,7vw,134px)] px-page pt-[clamp(48px,4vw,76px)] text-[#1a2a22]"
    >
      {/* Heading */}
      {/* Phones: lines flow inline so short words don't sit alone */}
      <h2 className="text-[clamp(34px,4.25vw,80px)] leading-[1.18] max-md:text-[32px] max-md:leading-[1.15]">
        {titleLines.map((line) => (
          <span key={line} className="block max-md:inline">
            {line}{" "}
          </span>
        ))}
      </h2>

      <p className="mt-[clamp(10px,0.9vw,18px)] text-[clamp(15px,1.3vw,25px)] leading-tight text-[#6c6b65]">
        {description}
      </p>

      <div className="mt-[clamp(28px,2.75vw,52px)] grid gap-[clamp(16px,3.15vw,60px)] lg:grid-cols-[41.1vw_minmax(0,1fr)] lg:items-start">
        {/* Image card */}
        <figure className="group relative isolate cursor-pointer aspect-[822/648] transform-gpu w-full max-w-full overflow-hidden rounded-[clamp(18px,1.6vw,30px)] bg-[#dcd9d3] max-sm:aspect-[4/5]">
          {photo && (
          <Image
            src={photo.image}
            alt={content.ui.advantages.imageAlt}
            placeholder={photo.uploaded ? "empty" : "blur"}
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover object-[center_28%] transition-[scale] duration-[1400ms] ease-butter will-change-transform group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          )}

          <figcaption className="absolute inset-x-0 bottom-0 flex h-[40%] flex-col bg-[#1e3a2b]/90 px-[clamp(20px,2.35vw,44px)] pt-[clamp(20px,2.4vw,46px)] text-white max-sm:h-auto max-sm:pb-6">
            <h3 className="text-[clamp(20px,1.85vw,35px)] leading-tight transition-[translate] duration-[1400ms] ease-butter group-hover:-translate-y-[0.2em] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
              {highlight.title}
            </h3>
            <p className="mt-[clamp(8px,0.85vw,16px)] text-[clamp(14px,1.1vw,21px)] leading-[1.25] text-white/90 transition-[translate] duration-[1400ms] ease-butter group-hover:-translate-y-[0.2em] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
              {highlight.descriptionLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </figcaption>
        </figure>

        {/* Advantage cards */}
        <div className="grid grid-cols-1 gap-[clamp(16px,2.2vw,44px)] sm:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.label}
              className="flex min-h-[clamp(180px,12.65vw,240px)] flex-col max-md:min-h-0 rounded-[clamp(18px,1.6vw,30px)] bg-white px-[clamp(20px,1.8vw,34px)] pb-[clamp(20px,1.6vw,30px)] pt-[clamp(20px,1.7vw,32px)]"
            >
              <p className="text-[clamp(22px,1.75vw,33px)] leading-tight text-[#2a5a40]">
                {item.value}
              </p>
              <h3 className="mt-[clamp(10px,1.05vw,20px)] text-[clamp(14px,1.1vw,21px)] leading-tight">
                {item.label}
              </h3>
              <hr className="mt-[clamp(14px,1.75vw,33px)] border-t-2 border-[#ebe8e1]" />
              <p className="mt-[clamp(12px,1.2vw,23px)] max-w-[clamp(180px,12vw,230px)] text-[clamp(12px,0.9vw,17px)] max-md:max-w-none max-md:text-[13px] leading-[1.22] text-[#6c6b66]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
