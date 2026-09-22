"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { logout, saveSiteData, setSiteMode } from "@/app/admin/actions";
import ApartmentsEditor from "./ApartmentsEditor";
import { MAIN_SECTIONS, TEXT_GROUPS } from "./adminConfig";
import { ValueEditor } from "./FieldEditor";
import GalleryEditor from "./GalleryEditor";
import SitePreview from "./SitePreview";
import LeadsEditor from "./LeadsEditor";
import NewsEditor from "./NewsEditor";
import SiteImagesEditor from "./SiteImagesEditor";
import TranslationsEditor from "./TranslationsEditor";
import { buttonClass, Icon } from "./ui";
import { validateContent } from "../../lib/contentValidation";

// Keeps only sections the website knows about, falling back to the original data.
function mergeKnownSections(initialData, incoming) {
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return null;
  }
  const merged = { ...initialData };
  for (const key of Object.keys(initialData)) {
    if (key in incoming) merged[key] = incoming[key];
  }
  return merged;
}

const TEXTS_MENU = "Sayt mətnləri";

// Main sections first; everything else in the texts menu. Sections the site has but the
// config doesn't list land under "Digər".
function buildMenus(initialData) {
  const listed = new Set([
    ...MAIN_SECTIONS.map((item) => item.key),
    ...TEXT_GROUPS.flatMap((group) => group.items.map((item) => item.key)),
  ]);
  const main = MAIN_SECTIONS.filter((item) => item.special || item.key in initialData);
  const texts = TEXT_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.special || item.key in initialData),
  })).filter((group) => group.items.length > 0);

  const extra = Object.keys(initialData).filter((key) => !listed.has(key));
  if (extra.length > 0) {
    texts.push({
      group: "Digər",
      items: extra.map((key) => ({ key, title: key, description: "" })),
    });
  }
  return { main, texts };
}

export default function AdminDashboard({
  initialData,
  initialTranslations,
  initialLeads,
  leadsError = null,
  initialMode,
  initialSavedAt,
  initialRevision,
}) {
  const [data, setData] = useState(initialData);
  const [savedData, setSavedData] = useState(initialData);
  const [translations, setTranslations] = useState(initialTranslations);
  const [savedTranslations, setSavedTranslations] = useState(initialTranslations);
  const [leads, setLeads] = useState(initialLeads);
  const [savedAt, setSavedAt] = useState(initialSavedAt);
  const [mode, setMode] = useState(initialMode);
  const [revision, setRevision] = useState(initialRevision);
  const [saving, startSaving] = useTransition();
  const [switchingMode, startSwitchingMode] = useTransition();
  const [activeKey, setActiveKey] = useState("leads");
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState(null);
  const importInputRef = useRef(null);

  const menus = buildMenus(initialData);
  const textItems = menus.texts.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.group })),
  );
  const activeSection =
    [...menus.main, ...textItems].find((item) => item.key === activeKey) ?? menus.main[0];
  const inTexts = textItems.some((item) => item.key === activeSection.key);
  // Which sidebar menu is open; follows the active section until the user switches.
  const [openMenu, setOpenMenu] = useState(null);
  const menu = openMenu ?? (inTexts ? "texts" : "main");
  const dirty = data !== savedData || translations !== savedTranslations;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const showNotice = (type, text) => {
    const id = Date.now();
    setNotice({ id, type, text });
    if (type !== "error") setTimeout(() => {
      setNotice((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const updateSection = (key, valueOrUpdater) =>
    setData((current) => ({
      ...current,
      [key]:
        typeof valueOrUpdater === "function"
          ? valueOrUpdater(current[key])
          : valueOrUpdater,
    }));

  const selectSection = (key) => {
    setActiveKey(key);
    setOpenMenu(null);
    setConfirmReset(false);
    window.scrollTo({ top: 0 });
  };

  const save = () =>
    startSaving(async () => {
      try {
        const result = await saveSiteData(data, translations, revision);
        if (result?.error) throw new Error(result.error);
        setSavedData(data);
        setSavedTranslations(translations);
        setSavedAt(result.savedAt);
        setRevision(result.revision);
        showNotice(
          "success",
          mode === "production"
            ? "Yadda saxlanıldı. Dəyişikliklər saytda görünür."
            : "Yadda saxlanıldı. Mock rejimi söndürüləndə saytda görünəcək.",
        );
      } catch (error) {
        showNotice("error", error.message || "Yadda saxlanmadı. İnterneti yoxlayıb yenidən cəhd edin.");
      }
    });

  const toggleMode = () =>
    startSwitchingMode(async () => {
      const next = mode === "mock" ? "production" : "mock";
      try {
        const result = await setSiteMode(next, revision);
        if (result?.error) throw new Error(result.error);
        setMode(result.mode);
        setRevision(result.revision);
        showNotice(
          "success",
          result.mode === "mock"
            ? "Mock data rejimi açıldı: saytda nümunə məlumatlar göstərilir."
            : "Mock data rejimi söndürüldü: saytda yadda saxlanmış məlumatlar göstərilir.",
        );
      } catch (error) {
        showNotice("error", error.message || "Rejim dəyişmədi. Yenidən cəhd edin.");
      }
    });

  // Throws away unsaved edits.
  const reset = () => {
    setData(savedData);
    setTranslations(savedTranslations);
    setConfirmReset(false);
    showNotice("success", "Yadda saxlanmamış dəyişikliklər ləğv edildi.");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ data, translations }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cinarli-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const merged = mergeKnownSections(data, parsed?.data ?? parsed);
      if (!merged) throw new Error("Invalid data");
      validateContent(merged, parsed?.translations ?? {});
      setData((current) => mergeKnownSections(current, parsed?.data ?? parsed));
      if (parsed?.translations?.ru || parsed?.translations?.en) {
        setTranslations((current) => ({
          ru: { ...current.ru, ...parsed.translations.ru },
          en: { ...current.en, ...parsed.translations.en },
        }));
      }
      showNotice("success", "JSON faylı yükləndi. Yadda saxlamağı unutmayın.");
    } catch (error) {
      // Validation errors name the field; a parse error only gets the generic message.
      const detail = error instanceof SyntaxError ? "" : error?.message;
      showNotice("error", detail ? `JSON faylı qəbul edilmədi: ${detail}` : "JSON faylı oxunmadı. Faylı yoxlayın.");
    }
  };

  const statusText = dirty
    ? "Yadda saxlanmamış dəyişikliklər var"
    : savedAt
      ? `Son saxlanma: ${new Date(savedAt).toLocaleString("az-AZ", {
          dateStyle: "short",
          timeStyle: "short",
        })}`
      : "Hələ yadda saxlanmayıb";

  const buildingOptions = (
    data.apartmentFilters?.find((filter) => filter.field === "building")?.options ?? []
  )
    .map((option) => option.value)
    .filter((value) => value !== "all");

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#f3f0e9] text-[#16201b] lg:flex-row">
      {/* Sidebar */}
      <aside className="bg-[#13271f] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-7 lg:py-7">
          <div>
            <p className="text-2xl font-bold leading-none tracking-tight">ÇINARLI</p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
              Admin panel
            </p>
          </div>
          <div className="flex gap-2 lg:hidden">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
            >
              Sayta qayıt
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
              >
                Çıxış
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Bölmələr"
          className="flex gap-1.5 overflow-x-auto px-5 pb-4 lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:px-4 lg:pb-6"
        >
          {menu === "main" ? (
            <>
              <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 lg:block">
                Əsas
              </p>
              {menus.main.map((item) => {
                const active = item.key === activeSection.key;
                const count = Array.isArray(data[item.key])
                  ? data[item.key].length
                  : item.key === "gallery"
                    ? (data.gallery?.photos?.length ?? 0)
                    : item.key === "leads"
                      ? leads.filter((lead) => lead.status !== "done").length
                      : null;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => selectSection(item.key)}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition max-lg:py-2.5 lg:py-2.5 ${
                      active
                        ? "bg-white text-[#13271f]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg max-lg:hidden ${
                        active ? "bg-[#13271f] text-white" : "bg-white/10"
                      }`}
                    >
                      <Icon name={item.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{item.title}</span>
                      <span
                        className={`block truncate text-xs max-lg:hidden ${
                          active ? "text-[#13271f]/60" : "text-white/45"
                        }`}
                      >
                        {item.summary}
                      </span>
                    </span>
                    {count !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          active ? "bg-[#13271f]/10" : "bg-white/10"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Opens the separate texts menu */}
              <button
                type="button"
                onClick={() => setOpenMenu("texts")}
                className="flex shrink-0 cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white max-lg:border max-lg:border-white/15 lg:mt-4 lg:border-t lg:border-white/10 lg:pt-5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 max-lg:hidden">
                  <Icon name="text" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{TEXTS_MENU}</span>
                  <span className="block truncate text-xs text-white/45 max-lg:hidden">
                    Tərcümələr, başlıqlar, footer, SEO
                  </span>
                </span>
                <Icon name="right" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpenMenu("main")}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white max-lg:border max-lg:border-white/15 lg:mb-2"
              >
                <Icon name="left" /> Əsas menyu
              </button>
              {menus.texts.map((group) => (
                <div key={group.group} className="contents lg:mb-4 lg:block">
                  <p className="hidden px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 lg:block">
                    {group.group}
                  </p>
                  {group.items.map((item) => {
                    const active = item.key === activeSection.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => selectSection(item.key)}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full shrink-0 cursor-pointer items-center whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition max-lg:w-auto max-md:py-3 ${
                          active
                            ? "bg-white font-semibold text-[#13271f]"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="hidden border-t border-white/10 px-7 py-5 lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <Icon name="left" /> Sayta qayıt
          </Link>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="cursor-pointer text-sm text-white/50 transition hover:text-white"
            >
              Çıxış
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#16201b]/10 bg-[#f3f0e9]/95 px-5 py-4 backdrop-blur max-md:py-3 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 max-md:gap-y-2.5">
            <div className="min-w-0 max-md:w-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9991] max-md:hidden">
                {inTexts ? `${TEXTS_MENU} · ${activeSection.group}` : "Əsas"}
              </p>
              <h1 className="truncate text-2xl font-bold max-md:text-xl">{activeSection.title}</h1>
              {/* Mobile: status sits under the title; the action row scrolls sideways */}
              <p
                className={`mt-0.5 flex items-center gap-1.5 truncate text-xs md:hidden ${
                  dirty ? "font-semibold text-[#8a6a12]" : "text-[#77766f]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${dirty ? "bg-[#d19a1a]" : "bg-[#5f9a78]"}`}
                />
                {statusText}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-md:-mx-5 max-md:w-[calc(100%+2.5rem)] max-md:flex-nowrap max-md:overflow-x-auto max-md:px-5 max-md:pb-1 max-md:[&>*]:shrink-0">
              <span
                role="status"
                className={`mr-1 inline-flex items-center gap-1.5 text-xs max-md:hidden ${
                  dirty ? "font-semibold text-[#8a6a12]" : "text-[#77766f]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-2 rounded-full ${dirty ? "bg-[#d19a1a]" : "bg-[#5f9a78]"}`}
                />
                {statusText}
              </span>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => {
                  importJson(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className={buttonClass.secondary}
              >
                <Icon name="upload" /> JSON idxal
              </button>
              <button type="button" onClick={exportJson} className={buttonClass.secondary}>
                <Icon name="download" /> JSON ixrac
              </button>
              {confirmReset ? (
                <>
                  <button type="button" onClick={reset} className={buttonClass.danger}>
                    Bəli, ləğv et
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className={buttonClass.ghost}
                  >
                    Geri
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  disabled={!dirty || saving || switchingMode}
                  className={buttonClass.secondary}
                >
                  Dəyişiklikləri ləğv et
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving || switchingMode}
                className={`${buttonClass.primary} max-md:order-first`}
              >
                {saving ? "Saxlanılır…" : "Yadda saxla"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 lg:px-10 lg:py-8">
          {/* Site mode */}
          <div
            className={`mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border px-4 py-3 text-sm ${
              mode === "mock"
                ? "border-[#c9a73f]/30 bg-[#fbf5df] text-[#5a4a1e]"
                : "border-[#5f9a78]/30 bg-[#e7f0ea] text-[#1c3b2b]"
            }`}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Icon name="info" className="mt-0.5 size-4 shrink-0" />
              {mode === "mock" ? (
                <p>
                  <strong>Mock data rejimi açıqdır.</strong> Saytda nümunə mənzillər və
                  fotolar göstərilir. Burada yadda saxladığınız məlumatlar rejimi
                  söndürəndə saytda görünəcək.
                </p>
              ) : (
                <p>
                  <strong>Canlı rejim.</strong> Saytda buradakı məlumatlar göstərilir. Yadda
                  saxladığınız dəyişikliklər saytda dərhal görünür; mənzil və ya foto yoxdursa,
                  saytda “hazırda yoxdur” bildirişi çıxır.
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={mode === "mock"}
              onClick={toggleMode}
              disabled={switchingMode || saving}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2.5 font-semibold disabled:cursor-wait disabled:opacity-60"
            >
              Mock data
              <span
                aria-hidden="true"
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  mode === "mock" ? "bg-[#c9a73f]" : "bg-[#16201b]/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${
                    mode === "mock" ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          {/* What is being edited and where it appears on the site */}
          <section
            className={`mb-6 grid items-center gap-6 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6 lg:gap-8 ${
              activeSection.preview ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f7d57]">
                Nəyi redaktə edirsiniz
              </p>
              <h2 className="mt-1.5 text-xl font-bold">{activeSection.title}</h2>
              {activeSection.description && (
                <p className="mt-1.5 max-w-xl text-sm text-[#77766f]">
                  {activeSection.description}
                </p>
              )}
              {activeSection.where && (
                <p className="mt-4 flex items-start gap-2 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-[2px] bg-[#2f7d57]" />
                  <span>
                    <span className="font-semibold">Saytda: </span>
                    {activeSection.where}
                  </span>
                </p>
              )}
              {activeSection.href && (
                <a
                  href={activeSection.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass.secondary} mt-4`}
                >
                  Saytda bax <Icon name="external" />
                </a>
              )}
            </div>
            <SitePreview
              section={activeSection}
              data={data}
              mode={mode}
              version={savedAt ?? "initial"}
            />
          </section>

          {activeSection.key === "leads" ? (
            <LeadsEditor
              leads={leads}
              loadError={leadsError}
              onChange={setLeads}
              onError={(text) => showNotice("error", text)}
            />
          ) : activeSection.key === "news" ? (
            <NewsEditor
              news={data.news}
              onChange={(updater) => updateSection("news", updater)}
            />
          ) : activeSection.key === "siteImages" ? (
            <SiteImagesEditor
              siteImages={data.siteImages}
              onChange={(updater) => updateSection("siteImages", updater)}
            />
          ) : activeSection.key === "translations" ? (
            <TranslationsEditor
              data={data}
              translations={translations}
              onChange={setTranslations}
            />
          ) : activeSection.key === "apartments" ? (
            <ApartmentsEditor
              apartments={data.apartments}
              statuses={data.apartmentStatuses ?? {}}
              buildingOptions={buildingOptions}
              onChange={(updater) => updateSection("apartments", updater)}
            />
          ) : activeSection.key === "gallery" ? (
            <GalleryEditor
              gallery={data.gallery}
              onChange={(updater) => updateSection("gallery", updater)}
            />
          ) : (
            <div className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-7">
              <ValueEditor
                key={activeSection.key}
                idPrefix={activeSection.key}
                fieldKey={activeSection.key}
                value={data[activeSection.key]}
                onChange={(next) => updateSection(activeSection.key, next)}
              />
            </div>
          )}
        </main>
      </div>

      {notice && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl max-md:left-5 max-md:max-w-none px-4 py-3 text-sm font-semibold shadow-lg ${
            notice.type === "error" ? "bg-[#9b2f22] text-white" : "bg-[#13271f] text-white"
          }`}
        >
          {notice.text}
        </div>
      )}
    </div>
  );
}
