import Link from "next/link";
import LeadBar from "./LeadBar";
import MobileActionBar from "./MobileActionBar";
import PlanCard from "./PlanCard";
import { localizeHref } from "../i18n/config";
import { translate } from "../i18n/format";
import { getI18n } from "../i18n/server";
import { ordinal } from "../i18n/format";

export default async function ApartmentDetail({ apartment }) {
  const { locale, content } = await getI18n();
  const { apartmentPage, apartmentStatuses, apartments, ui } = content;
  const t = ui.apartment;
  const areaText = (value) => translate(ui.common.area, { value });

  const areaRows = [
    ...apartment.layout,
    { name: t.totalArea, area: apartment.area },
  ];

  return (
    <>
      <main className="flex-1 bg-white px-page pb-[clamp(48px,5.5vw,110px)] pt-[clamp(28px,3.2vw,64px)] text-[#16201b]">
        <Link
          href={localizeHref(locale, "/menziller")}
          className="inline-flex items-center gap-[clamp(6px,0.5vw,10px)] rounded-full bg-[#f1f0ec] py-[clamp(7px,0.6vw,12px)] pl-[clamp(10px,0.9vw,16px)] pr-[clamp(14px,1.2vw,22px)] text-[clamp(13px,0.95vw,18px)] font-bold text-[#16201b] transition-colors hover:bg-[#e6e4de]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 8 14"
            className="h-[clamp(11px,0.8vw,15px)] w-auto"
          >
            <path
              d="M7 1 1 7l6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.back}
        </Link>

        <div className="mt-[clamp(24px,2.8vw,56px)] grid items-start gap-[clamp(32px,6vw,120px)] lg:grid-cols-[40vw_minmax(0,1fr)]">
          <PlanCard apartment={apartment} variant="large" />

          <div className="lg:pt-[1.2vw]">
            <p className="text-[clamp(12px,1vw,19px)] font-bold uppercase tracking-[0.06em] text-[#2a5a40]">
              {translate(t.roomsTitle, { count: apartment.rooms })}
            </p>
            <h1 className="mt-[clamp(14px,1.8vw,36px)] text-[clamp(38px,4vw,76px)] font-bold leading-none">
              {areaText(apartment.area)}
            </h1>
            <p className="mt-[clamp(12px,1.4vw,28px)] text-[clamp(14px,1.15vw,22px)] text-[#6c6b65]">
              {translate(apartmentPage.floorLabel, {
                building: apartment.building,
                floor: apartment.floor,
                floorOrdinal: ordinal(apartment.floor),
              })}{" "}
              · {translate(t.unit, { unit: apartment.unit })}
            </p>

            <ul className="mt-[clamp(20px,2.4vw,46px)] flex flex-wrap gap-[clamp(8px,0.8vw,16px)]">
              {apartment.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-full bg-[#c8d9cd] px-[clamp(14px,1.2vw,22px)] py-[clamp(7px,0.65vw,12px)] text-[clamp(12px,0.9vw,17px)] font-bold"
                >
                  {highlight}
                </li>
              ))}
            </ul>

            <section className="mt-[clamp(32px,3.6vw,72px)] rounded-[clamp(18px,2vw,40px)] bg-[#f1f0ec] px-[clamp(20px,2.8vw,54px)] pb-[clamp(16px,1.8vw,34px)] pt-[clamp(22px,2.6vw,50px)]">
              <h2 className="text-[clamp(17px,1.4vw,27px)] font-bold">
                {t.about}
              </h2>
              <dl className="mt-[clamp(10px,1.2vw,22px)]">
                {/* Index keys: room names repeat (two bedrooms) */}
                {areaRows.map((row, index) => (
                  <div
                    key={index}
                    className="flex h-[clamp(46px,3.7vw,72px)] items-center justify-between gap-4 border-b border-[#16201b]/8 last:border-b-0"
                  >
                    <dt className="text-[clamp(13px,1vw,19px)] text-[#6c6b65]">
                      {row.name}
                    </dt>
                    <dd className="text-[clamp(13px,1vw,19px)] font-bold">
                      {areaText(row.area)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <h2 className="mt-[clamp(36px,4vw,80px)] text-[clamp(17px,1.4vw,27px)] font-bold">
              {t.paymentTitle}
            </h2>
            <div className="mt-[clamp(14px,1.4vw,28px)] grid gap-[clamp(10px,1vw,20px)] sm:grid-cols-[344fr_468fr]">
              <button
                type="button"
                className="h-[clamp(48px,3.9vw,76px)] cursor-pointer rounded-full bg-[#24503a] px-4 text-[clamp(12px,0.9vw,17px)] font-bold uppercase tracking-[0.03em] text-white"
              >
                {t.calculator}
              </button>
              <button
                type="button"
                className="h-[clamp(48px,3.9vw,76px)] cursor-pointer rounded-full bg-[#16241d] px-4 text-[clamp(12px,0.9vw,17px)] font-bold uppercase tracking-[0.03em] text-white"
              >
                {t.talkToManager}
              </button>
            </div>
          </div>
        </div>

        {/* Links every apartment (reserved and sold too), so none is unreachable */}
        {apartments.length > 1 && (
        <section
          aria-labelledby="other-apartments"
          className="mt-[clamp(48px,5vw,100px)]"
        >
          <h2
            id="other-apartments"
            className="text-[clamp(20px,1.8vw,34px)] font-bold"
          >
            {t.others}
          </h2>
          <ul className="mt-[clamp(16px,1.6vw,32px)] grid gap-[clamp(10px,1vw,20px)] sm:grid-cols-2 lg:grid-cols-5">
            {apartments
              .filter((other) => other.id !== apartment.id)
              .map((other) => (
                <li key={other.id}>
                  <Link
                    href={localizeHref(locale, `/menziller/${other.id}`)}
                    className="flex h-full flex-col rounded-[clamp(16px,1.4vw,28px)] bg-[#f1f0ec] px-[clamp(18px,1.4vw,28px)] py-[clamp(16px,1.3vw,26px)] transition-colors hover:bg-[#e8e6e0]"
                  >
                    <span className="text-[clamp(13px,0.9vw,17px)] text-[#2a5a40]">
                      {other.id}
                    </span>
                    <span className="mt-2 text-[clamp(18px,1.4vw,27px)] font-bold leading-tight">
                      {translate(ui.common.rooms, { count: other.rooms }, locale)} ·{" "}
                      {areaText(other.area)}
                    </span>
                    <span className="mt-1 text-[clamp(12px,0.85vw,16px)] text-[#6c6b65]">
                      {apartmentStatuses[other.status]}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
        )}
      </main>

      <LeadBar apartmentId={apartment.id} />
      <MobileActionBar variant="contact" />
    </>
  );
}
