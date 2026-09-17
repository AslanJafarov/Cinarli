import { getI18n } from "../i18n/server";

function Stat({ stat }) {
  return (
    <dl>
      <dt className="sr-only">{stat.label}</dt>
      <dd className="text-[clamp(26px,2.25vw,42px)] font-bold leading-tight text-[#24503a]">
        {stat.value}
      </dd>
      <dd className="mt-[0.2em] text-[clamp(13px,1.02vw,19px)] text-[#6b6b68]">
        {stat.label}
      </dd>
    </dl>
  );
}

export default async function ProjectHighlights() {
  const { content } = await getI18n();
  const { projectFeatures, projectStats } = content;

  return (
    <section data-admin-preview="projectStats projectFeatures" className="w-full bg-[#f1f0ec] px-page pb-[clamp(40px,3.8vw,72px)] pt-[clamp(40px,3.8vw,72px)]">
      {/* Key numbers */}
      {/* Same 3-column grid and gap as the cards below, so the numbers start on the card edges;
          the last column holds the remaining numbers, the final one ending at the right edge. */}
      <div className="grid grid-cols-2 gap-y-8 md:grid-cols-3 md:gap-x-[clamp(16px,3.75vw,72px)]">
        {projectStats.slice(0, 2).map((stat) => (
          <Stat key={stat.label} stat={stat} />
        ))}
        <div className="contents md:flex md:justify-between md:gap-4">
          {projectStats.slice(2).map((stat) => (
            <Stat key={stat.label} stat={stat} />
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-[clamp(32px,3.2vw,60px)] grid grid-cols-1 gap-[clamp(16px,3.75vw,72px)] md:grid-cols-3">
        {projectFeatures.map((feature) => (
          <article
            key={feature.title}
            className="flex min-h-[clamp(100px,8.8vw,168px)] gap-[clamp(14px,1.25vw,24px)] rounded-[clamp(20px,2vw,38px)] bg-white px-[clamp(18px,1.5vw,28px)] py-[clamp(18px,1.5vw,28px)]"
          >
            <span
              aria-hidden="true"
              className="mt-[0.1em] size-[clamp(30px,2.6vw,48px)] shrink-0 rounded-full bg-[#24503a]"
            />
            <div>
              <h3 className="text-[clamp(16px,1.4vw,26px)] font-bold leading-tight text-[#1c2a22]">
                {feature.title}
              </h3>
              <p className="mt-[0.5em] text-[clamp(13px,1.02vw,19px)] leading-[1.4] text-[#6b6b68]">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
