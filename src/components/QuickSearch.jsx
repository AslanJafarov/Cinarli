"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "../i18n/client";
import { localizeHref } from "../i18n/config";
import { translate } from "../i18n/format";
import { defaultFilterValues, filterQuery } from "../lib/apartmentFilters";

// The apartments page's filters most people start with; the rest are set there.
const searchFields = ["rooms", "area", "floor"];

// Card under the hero: a column on phones, one row on larger screens. The button opens the
// apartments page with the chosen filters in the URL.
export default function QuickSearch() {
  const { locale, content } = useI18n();
  const { apartmentFilters, quickSearch, ui } = content;
  const [values, setValues] = useState(() => defaultFilterValues(apartmentFilters));

  const filters = searchFields
    .map((field) => apartmentFilters.find((filter) => filter.field === field))
    .filter(Boolean);

  const optionText = (filter, option) =>
    filter.field === "rooms" && option.value !== "all"
      ? translate(ui.common.rooms, { count: option.label }, locale)
      : option.label;

  return (
    <div
      data-admin-preview="quickSearch"
      className="relative z-10 -mt-[96px] bg-[linear-gradient(to_bottom,transparent_96px,#f1f0ec_96px)] px-page md:-mt-[clamp(44px,3.6vw,70px)] md:bg-[linear-gradient(to_bottom,transparent_clamp(44px,3.6vw,70px),#f1f0ec_clamp(44px,3.6vw,70px))]"
    >
      <div className="rounded-[24px] bg-white p-6 text-[#16201b] shadow-[0_16px_40px_rgba(20,36,27,0.14)] md:flex md:items-center md:gap-[clamp(12px,1.4vw,28px)] md:rounded-[clamp(18px,1.6vw,32px)] md:py-[clamp(12px,1.1vw,22px)] md:pl-[clamp(20px,2.1vw,40px)] md:pr-[clamp(12px,1.1vw,22px)]">
        <h2 className="text-[19px] font-bold leading-tight md:w-[clamp(130px,11vw,220px)] md:shrink-0 md:text-[clamp(16px,1.3vw,26px)]">
          {quickSearch.title}
        </h2>

        <div className="mt-3 md:mt-0 md:flex md:flex-1">
          {filters.map((filter) => {
            const selected =
              filter.options.find((option) => option.value === values[filter.field]) ??
              filter.options[0];
            return (
              // The select is invisible and covers the whole row, so a tap anywhere opens it.
              <div
                key={filter.field}
                className="relative flex items-center justify-between gap-4 rounded-[10px] border-b border-[#16201b]/6 py-3 last:border-b-0 has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-[#24503a]/40 md:flex-1 md:flex-col md:items-start md:justify-center md:gap-[clamp(2px,0.3vw,6px)] md:rounded-none md:border-b-0 md:border-l md:px-[clamp(14px,1.4vw,28px)] md:py-[clamp(4px,0.4vw,8px)]"
              >
                <label
                  htmlFor={`quick-search-${filter.field}`}
                  className="pointer-events-none text-[13px] text-[#6c6b65] md:text-[clamp(10px,0.8vw,15px)] md:font-bold md:uppercase"
                >
                  {ui.quickSearch[filter.field]}
                </label>
                <span className="pointer-events-none flex items-center gap-2 text-[14px] font-bold md:text-[clamp(14px,1.15vw,22px)]">
                  {optionText(filter, selected)}
                  <svg aria-hidden="true" viewBox="0 0 12 8" className="h-2 w-3 shrink-0 text-[#6c6b65]">
                    <path
                      d="M1 1.5 6 6.5 11 1.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <select
                  id={`quick-search-${filter.field}`}
                  value={selected.value}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [filter.field]: event.target.value }))
                  }
                  className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {optionText(filter, option)}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <Link
          href={`${localizeHref(locale, "/menziller")}${filterQuery(filters, values)}`}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#24503a] text-[12px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-[#1c402e] md:mt-0 md:h-[clamp(48px,3.8vw,72px)] md:w-auto md:shrink-0 md:px-[clamp(24px,2.4vw,46px)] md:text-[clamp(12px,0.9vw,17px)]"
        >
          {quickSearch.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
