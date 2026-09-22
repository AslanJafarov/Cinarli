"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyNotice from "./EmptyNotice";
import MobileActionBar from "./MobileActionBar";
import PlanCard from "./PlanCard";
import { useI18n } from "../i18n/client";
import { localizeHref } from "../i18n/config";
import { ordinal, translate } from "../i18n/format";
import { defaultFilterValues, filterQuery, filterValuesFromQuery } from "../lib/apartmentFilters";

const statusStyles = {
  available: { swatch: "bg-[#24503a]", tile: "bg-[#c8d9cd]" },
  reserved: { swatch: "bg-[#ebe3c9]", tile: "bg-[#ebe3c9]" },
  sold: { swatch: "bg-[#dcdcda]", tile: "bg-[#e0e0de]" },
};

function matchesFilter(apartment, filter, selectedValue) {
  if (selectedValue === "all") return true;

  const option = filter.options.find(({ value }) => value === selectedValue);
  if (!option) return true;

  if (filter.type === "range") {
    const value = Number(apartment[filter.field]);
    return (
      (option.min === undefined || value >= option.min) &&
      (option.max === undefined || value <= option.max)
    );
  }

  return apartment[filter.field] === option.value;
}

export default function ApartmentPicker() {
  const { locale, content } = useI18n();
  const { apartmentFilters, apartmentPage, apartmentStatuses, apartments, ui } =
    content;
  const t = ui.apartments;
  const roomsText = (count) => translate(ui.common.rooms, { count }, locale);
  const areaText = (value) => translate(ui.common.area, { value });
  const apartmentHref = (id) => localizeHref(locale, `/menziller/${id}`);

  const clearedFilterValues = Object.fromEntries(
    apartmentFilters.map((filter) => [filter.field, "all"]),
  );

  const [filterValues, setFilterValues] = useState(() => defaultFilterValues(apartmentFilters));
  // Mobile: filters collapse into a summary row.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Hovering or focusing a flat previews it; clicking opens its page.
  const [selectedId, setSelectedId] = useState(apartments[0]?.id);

  const filteredApartments = apartments.filter((apartment) =>
    apartmentFilters.every((filter) =>
      matchesFilter(apartment, filter, filterValues[filter.field]),
    ),
  );
  const selected =
    filteredApartments.find((apartment) => apartment.id === selectedId) ??
    filteredApartments[0];

  // "2-3 otaq", "70-120 m²", … for every filter that isn't "all".
  const activeFilterLabels = apartmentFilters.flatMap((filter) => {
    const value = filterValues[filter.field];
    if (value === "all") return [];
    const option = filter.options.find((item) => item.value === value);
    if (!option) return [];
    if (filter.field === "rooms") return [roomsText(option.label)];
    if (filter.field === "floor") {
      return [translate(t.floorSummary, { count: option.label }, locale)];
    }
    return [option.label];
  });

  // The page is prerendered without the query string, so filters from the link are applied
  // after it loads (links from the home page's quick search, shared links, the back button).
  // Reading the URL during render would make the server and browser HTML differ.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterValues(filterValuesFromQuery(apartmentFilters, window.location.search));
  }, [apartmentFilters]);

  // Keeps the chosen filters in the URL without adding history entries.
  const setFilters = (values) => {
    setFilterValues(values);
    const url = `${window.location.pathname}${filterQuery(apartmentFilters, values)}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  };

  const updateFilter = (field, value) => setFilters({ ...filterValues, [field]: value });

  const activeFilterCount = Object.values(filterValues).filter(
    (value) => value !== "all",
  ).length;
  const clearFilters = () => setFilters(clearedFilterValues);

  // Shown next to the filters only when at least one is set.
  const clearFiltersButton = (className) =>
    activeFilterCount > 0 && (
      <button
        type="button"
        onClick={clearFilters}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-[0.5em] rounded-full border border-[#24503a]/30 px-[1.1em] py-[0.55em] text-[clamp(13px,0.95vw,18px)] font-bold text-[#24503a] transition-colors hover:bg-[#24503a] hover:text-white ${className}`}
      >
        <svg aria-hidden="true" viewBox="0 0 14 14" className="size-[0.75em]">
          <path
            d="M1 1l12 12M13 1 1 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {t.reset} ({activeFilterCount})
      </button>
    );

  if (apartments.length === 0) {
    const { phoneHref } = content.contactPage.office;
    return (
      <>
        <main data-admin-preview="apartments" className="flex-1 bg-[#f1f0ec] px-page pb-[clamp(40px,4.1vw,80px)] pt-[clamp(28px,3vw,60px)] text-[#16201b]">
          <h1 className="animate-rise-in text-[clamp(34px,3.8vw,72px)] font-bold leading-[1.05] motion-reduce:animate-none">
            {apartmentPage.title}
          </h1>
          <EmptyNotice
            icon="building"
            title={ui.empty.noApartmentsTitle}
            text={ui.empty.noApartmentsText}
            actions={[
              { href: localizeHref(locale, "/elaqe"), label: ui.empty.contact, primary: true },
              ...(phoneHref ? [{ href: phoneHref, label: ui.empty.call, external: true }] : []),
            ]}
            className="mt-[clamp(20px,2.4vw,48px)] animate-rise-in [animation-delay:120ms] motion-reduce:animate-none"
          />
        </main>
        <MobileActionBar variant="contact" />
      </>
    );
  }

  return (
    <>
    <main data-admin-preview="apartments" className="flex-1 bg-[#f1f0ec] px-page pb-[clamp(40px,4.1vw,80px)] pt-[clamp(28px,3vw,60px)] text-[#16201b]">
      <div data-admin-preview="apartmentPage" className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="animate-rise-in text-[clamp(34px,3.8vw,72px)] font-bold leading-[1.05] motion-reduce:animate-none">
            {apartmentPage.title}
          </h1>
          <p className="animate-rise-in text-[clamp(15px,1.35vw,26px)] text-[#6c6b65] [animation-delay:80ms] motion-reduce:animate-none">
            {apartmentPage.subtitle}
          </p>
        </div>
        {clearFiltersButton("max-md:hidden")}
      </div>

      {/* Mobile: filter summary that opens the filters */}
      <button
        type="button"
        aria-expanded={filtersOpen}
        aria-controls="apartment-filters"
        onClick={() => setFiltersOpen((open) => !open)}
        className="mt-5 flex w-full animate-rise-in cursor-pointer items-center justify-between gap-3 rounded-[20px] bg-white px-5 py-4 text-left text-[14px] [animation-delay:160ms] motion-reduce:animate-none md:hidden"
      >
        <span className="min-w-0 truncate">
          {t.filters}
          {activeFilterLabels.map((label) => (
            <span key={label}>
              <span aria-hidden="true" className="mx-2 text-[#6c6b65]">
                •
              </span>
              {label}
            </span>
          ))}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className={`h-2 w-3 shrink-0 text-[#6c6b65] transition-transform duration-300 ${
            filtersOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Filters */}
      <div
        id="apartment-filters"
        data-admin-preview="apartmentFilters"
        className={`mt-[clamp(12px,1.65vw,32px)] grid grid-cols-2 gap-[clamp(8px,0.9vw,18px)] sm:grid-cols-3 lg:grid-cols-5 ${
          filtersOpen ? "" : "max-md:hidden"
        }`}
      >
        {/* The select covers the whole card, so a click anywhere opens the menu;
            the title and arrow sit on top and let clicks pass through. */}
        {apartmentFilters.map((filter, index) => (
          <div
            key={filter.field}
            style={{ animationDelay: `${160 + index * 60}ms` }}
            className="relative animate-rise-in rounded-[clamp(12px,1.1vw,22px)] bg-white transition-shadow has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-[#24503a]/40 hover:shadow-[0_2px_10px_rgba(22,32,27,0.06)] motion-reduce:animate-none"
          >
            <label
              htmlFor={`filter-${filter.field}`}
              className="pointer-events-none absolute left-[clamp(14px,1.2vw,24px)] top-[clamp(10px,1.1vw,22px)] text-[clamp(10px,0.8vw,15px)] font-bold uppercase leading-[1.5] text-[#6c6b65]"
            >
              {filter.label}
            </label>
            <select
              id={`filter-${filter.field}`}
              value={filterValues[filter.field]}
              onChange={(event) => updateFilter(filter.field, event.target.value)}
              className="block w-full cursor-pointer appearance-none rounded-[inherit] bg-transparent pb-[clamp(10px,1.1vw,22px)] pl-[clamp(14px,1.2vw,24px)] pr-[calc(clamp(14px,1.2vw,24px)_+_clamp(11px,0.85vw,17px)_+_8px)] pt-[calc(clamp(10px,1.1vw,22px)_+_clamp(10px,0.8vw,15px)*1.5_+_clamp(4px,0.45vw,9px))] text-[clamp(14px,1.2vw,23px)] font-bold leading-[1.5] outline-none"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 12 8"
              className="pointer-events-none absolute bottom-[calc(clamp(10px,1.1vw,22px)_+_clamp(14px,1.2vw,23px)*0.75)] right-[clamp(14px,1.2vw,24px)] h-[clamp(7px,0.55vw,11px)] w-[clamp(11px,0.85vw,17px)] translate-y-1/2 text-[#6c6b65]"
            >
              <path
                d="M1 1.5 6 6.5 11 1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Phones: under the opened filters */}
      {filtersOpen && clearFiltersButton("mt-3 md:hidden")}

      {selected ? (
        <>
        {/* Mobile: apartment cards */}
        <ul className="mt-5 space-y-4 md:hidden">
          {filteredApartments.map((apartment, index) => (
            <li
              key={apartment.id}
              style={{ animationDelay: `${240 + index * 70}ms` }}
              className="animate-rise-in motion-reduce:animate-none"
            >
              <Link
                href={apartmentHref(apartment.id)}
                className="flex items-stretch justify-between gap-4 rounded-[24px] bg-white p-6 transition-colors active:bg-[#fbfaf7]"
              >
                <div>
                  <p className="text-[15px] text-[#2a5a40]">{apartment.id}</p>
                  <p className="mt-2 text-[24px] leading-tight">
                    {roomsText(apartment.rooms)}
                  </p>
                  <p className="mt-1 text-[16px] text-[#6c6b65]">
                    {areaText(apartment.area)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between gap-4">
                  <span
                    className={`rounded-full px-4 py-2 text-[13px] ${statusStyles[apartment.status].tile}`}
                  >
                    {apartmentStatuses[apartment.status]}
                  </span>
                  <span className="text-[15px] uppercase tracking-[0.04em] text-[#2a5a40]">
                    {t.view} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(24px,2.9vw,56px)] grid gap-[clamp(20px,2.45vw,48px)] max-md:hidden lg:grid-cols-[minmax(0,1fr)_30vw]">
          {/* Plan + floor units */}
          <section data-admin-preview="apartmentStatuses" className="flex animate-rise-in flex-col gap-[clamp(24px,3.1vw,60px)] rounded-[clamp(18px,2vw,40px)] bg-white p-[clamp(16px,2.45vw,48px)] [animation-delay:420ms] motion-reduce:animate-none md:flex-row">
            <PlanCard apartment={selected} className="md:w-[30vw]" />

            <div className="min-w-0 flex-1 md:pt-[0.65vw]">
              <h2 className="text-[clamp(17px,1.57vw,30px)] font-bold leading-tight">
                {translate(apartmentPage.floorLabel, {
                  building: selected.building,
                  floor: selected.floor,
                  floorOrdinal: ordinal(selected.floor),
                })}
              </h2>

              <ul className="mt-[clamp(16px,1.9vw,36px)] space-y-[clamp(10px,1.2vw,22px)]">
                {Object.entries(apartmentStatuses).map(([status, label]) => (
                  <li
                    key={status}
                    className="flex items-center gap-[clamp(8px,0.7vw,14px)] text-[clamp(13px,1.02vw,20px)]"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-[clamp(18px,1.6vw,32px)] w-[clamp(24px,2.1vw,42px)] rounded-[clamp(5px,0.45vw,9px)] ${statusStyles[status].swatch}`}
                    />
                    {label}
                  </li>
                ))}
              </ul>

              <div className="mt-[clamp(18px,2.1vw,40px)] grid max-w-[clamp(220px,16.3vw,320px)] grid-cols-2 gap-x-[clamp(10px,1.2vw,22px)] gap-y-[clamp(12px,1.5vw,28px)]">
                {filteredApartments.map((apartment) => {
                  const isSelected = apartment.id === selected.id;
                  return (
                    <Link
                      key={apartment.id}
                      href={apartmentHref(apartment.id)}
                      aria-current={isSelected ? "true" : undefined}
                      onMouseEnter={() => setSelectedId(apartment.id)}
                      onFocus={() => setSelectedId(apartment.id)}
                      className={`rounded-[clamp(10px,1.1vw,22px)] px-[clamp(10px,0.8vw,16px)] py-[clamp(12px,1.2vw,22px)] transition-colors ${
                        isSelected
                          ? "bg-[#24503a] text-white"
                          : `${statusStyles[apartment.status].tile} text-[#1c2a22]`
                      }`}
                    >
                      <span className="block text-[clamp(11px,0.86vw,17px)] font-bold">
                        {apartment.id}
                      </span>
                      <span className="mt-[clamp(8px,0.9vw,18px)] block text-[clamp(11px,0.86vw,17px)]">
                        {roomsText(apartment.rooms)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Selected apartment */}
          <aside className="flex animate-rise-in flex-col rounded-[clamp(18px,2vw,40px)] bg-[#19241f] [animation-delay:520ms] motion-reduce:animate-none px-[clamp(20px,2.5vw,48px)] pb-[clamp(20px,2.7vw,52px)] pt-[clamp(24px,2.8vw,54px)] text-white">
            <p className="text-[clamp(12px,0.95vw,18px)] font-bold text-white/80">
              {t.selected}
            </p>
            <p className="mt-[clamp(10px,1.25vw,24px)] text-[clamp(28px,2.6vw,50px)] font-bold leading-tight">
              {selected.id}
            </p>
            <div className="mt-[clamp(8px,1.1vw,22px)] grid grid-cols-2 text-[clamp(17px,1.5vw,29px)] font-bold">
              <span>{roomsText(selected.rooms)}</span>
              <span>{areaText(selected.area)}</span>
            </div>

            {/* Bottom padding keeps a gap above the button when the panel is tight */}
            <dl className="mt-[clamp(8px,1.4vw,28px)] pb-[clamp(12px,1.2vw,24px)]">
              {[
                [t.floor, selected.floor],
                [t.balcony, selected.balconies],
                [t.renovation, selected.renovation],
                [t.status, apartmentStatuses[selected.status]],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex h-[clamp(44px,3.75vw,72px)] items-center justify-between border-b border-[#35584a] last:border-b-0"
                >
                  <dt className="text-[clamp(12px,0.98vw,19px)] text-white/75">
                    {label}
                  </dt>
                  <dd className="pr-[clamp(10px,2vw,38px)] text-[clamp(13px,1.02vw,20px)] font-bold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={`${apartmentHref(selected.id)}#apartment-callback`}
              className="mt-auto flex items-center justify-center h-[clamp(44px,3.6vw,70px)] w-full shrink-0 cursor-pointer rounded-full bg-[#ebe3cc] text-[clamp(13px,1.02vw,20px)] font-bold uppercase text-[#16201b]"
            >
              {t.apply}
            </Link>
          </aside>
        </div>
        </>
      ) : (
        <div className="mt-[clamp(24px,2.9vw,56px)] flex animate-rise-in flex-col items-center rounded-[clamp(18px,2vw,40px)] [animation-delay:420ms] motion-reduce:animate-none bg-white px-6 py-[clamp(48px,6vw,120px)] text-center">
          <p className="text-[clamp(17px,1.57vw,30px)] font-bold">
            {t.emptyTitle}
          </p>
          <p className="mt-2 text-[clamp(13px,1.02vw,20px)] text-[#6c6b65]">
            {t.emptyText}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 h-[clamp(44px,3.6vw,70px)] cursor-pointer rounded-full bg-[#19241f] px-[clamp(24px,2.5vw,48px)] text-[clamp(13px,1.02vw,20px)] font-bold uppercase text-white"
          >
            {t.reset}
          </button>
        </div>
      )}
    </main>

    <MobileActionBar />
    </>
  );
}
