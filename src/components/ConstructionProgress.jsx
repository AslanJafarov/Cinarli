import Image from "next/image";
import heroBuilding from "../assets/hero-building.jpg";
import { getI18n } from "../i18n/server";

function ProgressBar({ value, label, className }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`overflow-hidden rounded-full bg-[#e8e5dd] ${className}`}
    >
      <div
        className="h-full rounded-full bg-[#24503a]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default async function ConstructionProgress() {
  const { content } = await getI18n();
  const { title, subtitle, featured, updates, allUpdatesLabel } =
    content.constructionProgress;

  return (
    <section
      id="tikinti"
      className="w-full scroll-mt-(--nav-h) bg-[#f6f5f0] pb-[clamp(56px,5vw,100px)] px-page pt-[clamp(40px,3vw,60px)] text-[#1a2a22]"
    >
      {/* Heading */}
      <h2 className="text-[clamp(34px,4vw,76px)] leading-[1.15]">{title}</h2>
      <p className="mt-[clamp(8px,0.7vw,14px)] text-[clamp(15px,1.3vw,25px)] leading-tight text-[#6c6b65]">
        {subtitle}
      </p>

      <div className="mt-[clamp(28px,4.3vw,84px)] grid gap-[clamp(20px,3.1vw,60px)] lg:grid-cols-[41.65vw_minmax(0,1fr)] lg:items-start">
        {/* Latest update */}
        <article className="rounded-[clamp(18px,2vw,40px)] bg-white p-[clamp(12px,1.4vw,28px)] pb-[clamp(22px,1.9vw,38px)]">
          <div className="relative aspect-[773/391] w-full max-w-full overflow-hidden rounded-[clamp(14px,1.4vw,28px)] bg-[#3f7fc4] max-sm:aspect-[4/3]">
            <Image
              src={heroBuilding}
              alt={content.ui.construction.imageAlt}
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover object-[35%_30%]"
            />
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 773 391"
              preserveAspectRatio="none"
            >
              <polygon points="160,0 455,0 300,391 60,391" fill="#1a3346" fillOpacity="0.45" />
              <polygon points="0,0 160,0 60,391 0,391" fill="#1b3129" fillOpacity="0.85" />
              <polygon points="585,0 773,0 773,240 650,391 515,391" fill="#4a9367" fillOpacity="0.96" />
            </svg>
          </div>

          <div className="px-[clamp(8px,0.8vw,16px)]">
            <p className="mt-[clamp(18px,1.9vw,38px)] text-[clamp(13px,1.1vw,21px)] text-[#2a5a40]">
              {featured.date}
            </p>
            <h3 className="mt-[clamp(8px,1vw,20px)] text-[clamp(19px,1.6vw,31px)] leading-tight">
              {featured.title}
            </h3>

            <p className="mt-[clamp(18px,1.9vw,38px)] text-[clamp(12px,0.95vw,18px)] text-[#6c6b65]">
              {featured.progressLabel}
            </p>
            <div className="mt-[clamp(8px,0.8vw,16px)] flex items-center gap-[clamp(10px,0.9vw,18px)]">
              <ProgressBar
                value={featured.progress}
                label={featured.progressLabel}
                className="h-[clamp(12px,1.1vw,22px)] flex-1"
              />
              <span className="shrink-0 text-[clamp(14px,1.1vw,21px)] text-[#2a5a40]">
                {featured.progress}%
              </span>
            </div>
          </div>
        </article>

        {/* Earlier updates */}
        <div>
          <ul className="flex flex-col gap-[clamp(12px,1.55vw,30px)]">
            {updates.map((update) => (
              <li
                key={update.title}
                className="flex min-h-[clamp(96px,6.5vw,124px)] items-center justify-between gap-[clamp(16px,2vw,40px)] rounded-[clamp(16px,1.6vw,32px)] bg-white py-[clamp(16px,1.5vw,28px)] pl-[clamp(18px,1.85vw,36px)] pr-[clamp(18px,2.75vw,52px)]"
              >
                <div className="min-w-0">
                  <p className="text-[clamp(11px,0.85vw,16px)] text-[#6c6b65]">
                    {update.date}
                  </p>
                  <h3 className="mt-[clamp(6px,0.7vw,14px)] text-[clamp(16px,1.25vw,24px)] leading-tight">
                    {update.title}
                  </h3>
                </div>

                <div className="w-[clamp(110px,10.9vw,210px)] shrink-0 text-right">
                  <span className="text-[clamp(17px,1.35vw,26px)] leading-none text-[#2a5a40]">
                    {update.progress}%
                  </span>
                  <ProgressBar
                    value={update.progress}
                    label={update.title}
                    className="mt-[clamp(6px,0.6vw,12px)] h-[clamp(10px,0.8vw,15px)]"
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* Not functional yet */}
          <button
            type="button"
            className="mt-[clamp(20px,2.15vw,42px)] h-[clamp(50px,3.75vw,72px)] w-full cursor-pointer rounded-full bg-[#12271e] px-8 text-[clamp(13px,0.9vw,17px)] uppercase tracking-[0.02em] text-[#f0ede6] sm:w-[clamp(240px,17.7vw,340px)]"
          >
            {allUpdatesLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
