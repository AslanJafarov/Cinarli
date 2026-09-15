"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ApartmentsEditor from "./ApartmentsEditor";
import { SECTION_GROUPS, STORAGE_KEY } from "./adminConfig";
import { ValueEditor } from "./FieldEditor";
import GalleryEditor from "./GalleryEditor";
import { buttonClass, Icon } from "./ui";

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

function readDraft(initialData) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = mergeKnownSections(initialData, parsed.data);
    return data ? { data, savedAt: parsed.savedAt ?? null } : null;
  } catch {
    return null;
  }
}

function buildGroups(initialData) {
  const listed = new Set(
    SECTION_GROUPS.flatMap((group) => group.items.map((item) => item.key)),
  );
  const groups = SECTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.key in initialData),
  })).filter((group) => group.items.length > 0);

  const extra = Object.keys(initialData).filter((key) => !listed.has(key));
  if (extra.length > 0) {
    groups.push({
      group: "Digər",
      items: extra.map((key) => ({ key, title: key, description: "" })),
    });
  }
  return groups;
}

export default function AdminDashboard({ initialData }) {
  // Rendered on the client only (see AdminApp), so reading the draft here is safe.
  const [initialDraft] = useState(() => readDraft(initialData));
  const [data, setData] = useState(() => initialDraft?.data ?? initialData);
  const [savedData, setSavedData] = useState(() => initialDraft?.data ?? initialData);
  const [savedAt, setSavedAt] = useState(() => initialDraft?.savedAt ?? null);
  const [activeKey, setActiveKey] = useState("apartments");
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState(null);
  const importInputRef = useRef(null);

  const groups = buildGroups(initialData);
  const activeGroup = groups.find((group) =>
    group.items.some((item) => item.key === activeKey),
  );
  const activeSection =
    activeGroup?.items.find((item) => item.key === activeKey) ?? groups[0].items[0];
  const dirty = data !== savedData;

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
    setTimeout(() => {
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
    setConfirmReset(false);
    window.scrollTo({ top: 0 });
  };

  const save = () => {
    const at = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: at, data }));
      setSavedData(data);
      setSavedAt(at);
      showNotice("success", "Qaralama yadda saxlanıldı.");
    } catch {
      showNotice(
        "error",
        "Brauzer yaddaşı doldu. Bəzi şəkilləri silib yenidən yadda saxlayın.",
      );
    }
  };

  const reset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable — nothing to remove.
    }
    setData(initialData);
    setSavedData(initialData);
    setSavedAt(null);
    setConfirmReset(false);
    showNotice("success", "Dəyişikliklər silindi, orijinal məlumatlar bərpa olundu.");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
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
      const merged = mergeKnownSections(initialData, parsed?.data ?? parsed);
      if (!merged) throw new Error("Invalid data");
      setData(merged);
      showNotice("success", "JSON faylı yükləndi. Yadda saxlamağı unutmayın.");
    } catch {
      showNotice("error", "JSON faylı oxunmadı. Faylı yoxlayın.");
    }
  };

  const statusText = dirty
    ? "Yadda saxlanmamış dəyişikliklər var"
    : savedAt
      ? `Son saxlanma: ${new Date(savedAt).toLocaleString("az-AZ", {
          dateStyle: "short",
          timeStyle: "short",
        })}`
      : "Orijinal məlumatlar";

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
          <Link
            href="/"
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10 lg:hidden"
          >
            Sayta qayıt
          </Link>
        </div>

        <nav
          aria-label="Bölmələr"
          className="flex gap-4 overflow-x-auto px-5 pb-4 lg:flex-1 lg:flex-col lg:gap-7 lg:overflow-y-auto lg:px-4 lg:pb-6"
        >
          {groups.map((group) => (
            <div key={group.group} className="shrink-0">
              <p className="hidden px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 lg:block">
                {group.group}
              </p>
              <ul className="flex gap-1.5 lg:block lg:space-y-1">
                {group.items.map((item) => {
                  const active = item.key === activeSection.key;
                  const count = Array.isArray(data[item.key]) ? data[item.key].length : null;
                  return (
                    <li key={item.key} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => selectSection(item.key)}
                        aria-current={active ? "page" : undefined}
                        className={`flex w-full cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition max-md:py-3 ${
                          active
                            ? "bg-white font-semibold text-[#13271f]"
                            : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {item.title}
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
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 px-7 py-5 lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <Icon name="left" /> Sayta qayıt
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#16201b]/10 bg-[#f3f0e9]/95 px-5 py-4 backdrop-blur max-md:py-3 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 max-md:gap-y-2.5">
            <div className="min-w-0 max-md:w-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9991] max-md:hidden">
                {activeGroup?.group}
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
                    Bəli, sıfırla
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className={buttonClass.ghost}
                  >
                    Ləğv et
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className={buttonClass.secondary}
                >
                  Sıfırla
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!dirty}
                className={`${buttonClass.primary} max-md:order-first`}
              >
                Yadda saxla
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#c9a73f]/30 bg-[#fbf5df] px-4 py-3 text-sm text-[#5a4a1e]">
            <Icon name="info" className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Qaralama rejimi.</strong> Buradakı dəyişikliklər hələ sayta tətbiq
              edilmir və yalnız bu brauzerdə saxlanılır. Məlumatları başqa yerə köçürmək
              üçün “JSON ixrac” istifadə edin.
            </p>
          </div>

          {activeSection.description && (
            <p className="mb-6 max-w-3xl text-sm text-[#77766f]">
              {activeSection.description}
            </p>
          )}

          {activeSection.key === "apartments" ? (
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
            <div className="max-w-5xl rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-7">
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
