import Link from "next/link";
import { localizeHref } from "../i18n/config";
import { translate } from "../i18n/format";
import { getI18n } from "../i18n/server";

// Shows the apartment page's default filters, so both stay in sync.
const summaryFields = ["rooms", "area", "floor"];

// Mobile-only card that overlaps the bottom of the hero.
export default async function QuickSearch() {
  const { locale, content } = await getI18n();
  const { apartmentFilters, quickSearch, ui } = content;

  const rows = summaryFields.map((field) => {
    const filter = apartmentFilters.find((item) => item.field === field);
    const option = filter?.options.find(({ value }) => value === filter.defaultValue);

    let value = ui.quickSearch.all;
    if (option && option.value !== "all") {
      value =
        field === "rooms"
          ? translate(ui.common.rooms, { count: option.label }, locale)
          : option.label;
    }
    return { label: ui.quickSearch[field], value };
  });

  return (
    <div className="relative z-10 -mt-[96px] bg-[linear-gradient(to_bottom,transparent_96px,#f1f0ec_96px)] px-page md:hidden">
      <div className="rounded-[24px] bg-white p-6 text-[#16201b] shadow-[0_16px_40px_rgba(20,36,27,0.14)]">
        <h2 className="text-[19px] font-bold leading-tight">
          {quickSearch.title}
        </h2>

        <dl className="mt-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-[#16201b]/6 py-3 last:border-b-0"
            >
              <dt className="text-[13px] text-[#6c6b65]">{row.label}</dt>
              <dd className="text-[14px] font-bold">{row.value}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={localizeHref(locale, "/menziller")}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#24503a] text-[12px] font-bold uppercase tracking-[0.04em] text-white"
        >
          {quickSearch.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
