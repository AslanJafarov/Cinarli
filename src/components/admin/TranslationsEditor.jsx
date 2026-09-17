"use client";

import { useId, useState } from "react";
import { collectTexts } from "../../lib/translatable";
import { MAIN_SECTIONS, TEXT_GROUPS } from "./adminConfig";
import { Icon, inputClass, labelClass } from "./ui";

const LANGUAGES = [
  { code: "ru", label: "Rusca" },
  { code: "en", label: "İngiliscə" },
];

const sectionTitles = Object.fromEntries(
  [...MAIN_SECTIONS, ...TEXT_GROUPS.flatMap((group) => group.items)].map((item) => [
    item.key,
    item.title,
  ]),
);

/**
 * Every Azerbaijani text on the site with its Russian and English version. Translations belong
 * to the text, not to its position, so reordering items keeps them. A text without a
 * translation appears in Azerbaijani on the RU/EN site.
 */
export default function TranslationsEditor({ data, translations, onChange }) {
  const baseId = useId();
  const [section, setSection] = useState("all");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [query, setQuery] = useState("");

  const texts = [...collectTexts(data)].map(([text, sections]) => ({
    text,
    sections: [...sections],
  }));
  const isMissing = (text, code) => !translations[code]?.[text]?.trim();
  const missingCount = (code) => texts.filter(({ text }) => isMissing(text, code)).length;

  const sections = [...new Set(texts.flatMap((item) => item.sections))];
  const needle = query.trim().toLocaleLowerCase("az");
  const visible = texts.filter(
    ({ text, sections: inSections }) =>
      (section === "all" || inSections.includes(section)) &&
      (!onlyMissing || LANGUAGES.some(({ code }) => isMissing(text, code))) &&
      (!needle ||
        [text, translations.ru?.[text], translations.en?.[text]].some((value) =>
          value?.toLocaleLowerCase("az").includes(needle),
        )),
  );

  const setTranslation = (code, text, value) =>
    onChange((current) => ({
      ...current,
      [code]: { ...current[code], [text]: value },
    }));

  return (
    <div className="space-y-4">
      {/* Summary + filters */}
      <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(({ code, label }) => {
            const missing = missingCount(code);
            return (
              <span
                key={code}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  missing ? "bg-[#fbf5df] text-[#8a6a12]" : "bg-[#e7f0ea] text-[#1c3b2b]"
                }`}
              >
                {label}: {missing ? `${missing} tərcümə yoxdur` : "hamısı tərcümə olunub"}
              </span>
            );
          })}
          <span className="rounded-full bg-[#16201b]/6 px-3 py-1 text-xs font-semibold text-[#6b6a63]">
            Cəmi {texts.length} mətn
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor={`${baseId}-search`} className={labelClass}>
              Axtar
            </label>
            <input
              id={`${baseId}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Mətn və ya tərcümə"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${baseId}-section`} className={labelClass}>
              Bölmə
            </label>
            <select
              id={`${baseId}-section`}
              value={section}
              onChange={(event) => setSection(event.target.value)}
              className={inputClass}
            >
              <option value="all">Bütün bölmələr</option>
              {sections.map((key) => (
                <option key={key} value={key}>
                  {sectionTitles[key] ?? key}
                </option>
              ))}
            </select>
          </div>
          <label className="flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(event) => setOnlyMissing(event.target.checked)}
              className="size-4 accent-[#24503a]"
            />
            Yalnız tərcüməsizlər
          </label>
        </div>
      </section>

      {/* Rows */}
      {visible.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-12 text-center text-sm text-[#77766f]">
          {onlyMissing ? "Bütün mətnlər tərcümə olunub." : "Heç nə tapılmadı."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map(({ text, sections: inSections }, index) => {
            const long = text.length > 70;
            return (
              <li
                key={text}
                className="grid gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-5 lg:grid-cols-3"
              >
                <div className="min-w-0">
                  <p className={labelClass}>
                    Azərbaycanca · {inSections.map((key) => sectionTitles[key] ?? key).join(", ")}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{text}</p>
                </div>

                {LANGUAGES.map(({ code, label }) => {
                  const id = `${baseId}-${code}-${index}`;
                  const missing = isMissing(text, code);
                  const Field = long ? "textarea" : "input";
                  return (
                    <div key={code} className="min-w-0">
                      <label htmlFor={id} className={`${labelClass} flex items-center gap-1.5`}>
                        {label}
                        {missing && (
                          <span className="inline-flex items-center gap-1 text-[#8a6a12]">
                            <Icon name="info" className="size-3" /> saytda azərbaycanca görünür
                          </span>
                        )}
                      </label>
                      <Field
                        id={id}
                        value={translations[code]?.[text] ?? ""}
                        onChange={(event) => setTranslation(code, text, event.target.value)}
                        rows={long ? 3 : undefined}
                        className={`${inputClass} ${long ? "resize-y" : ""} ${
                          missing ? "border-[#d19a1a]/60 bg-[#fffbeb]" : ""
                        }`}
                      />
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
