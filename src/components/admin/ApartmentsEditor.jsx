"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { defaultPlanKey, planImages } from "../PlanCard";
import { moveItem } from "./adminConfig";
import { readImageFile } from "./imageUtils";
import { buttonClass, Icon, IconButton, inputClass, labelClass } from "./ui";

const statusChipClass = {
  available: "bg-[#c8d9cd] text-[#1c3b2b]",
  reserved: "bg-[#ebe3c9] text-[#5a4a1e]",
  sold: "bg-[#e0e0de] text-[#55554f]",
};

const RENOVATION_SUGGESTIONS = ["Qara karkas", "Ağ karkas", "Təmirli", "Seçimə görə"];
const ACCEPTED_IMAGES = "image/png,image/jpeg,image/webp";

const toNumber = (raw) => (raw === "" ? 0 : Number(raw));

function uniqueId(apartments, base) {
  const taken = new Set(apartments.map((apartment) => apartment.id));
  let n = 1;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function createApartment(apartments) {
  return {
    id: uniqueId(apartments, "YENİ"),
    unit: "",
    highlights: [],
    rooms: 2,
    area: "",
    building: "B",
    floor: 1,
    balconies: 1,
    renovation: "Seçimə görə",
    status: "available",
    plan: defaultPlanKey,
    planImage: null,
    photos: [],
    layout: [{ name: "", area: "" }],
  };
}

function PlanThumbnail({ apartment, sizes, className = "object-contain", eager = false }) {
  const loading = eager ? "eager" : undefined;

  if (apartment.planImage) {
    return (
      <Image
        src={apartment.planImage}
        alt={`${apartment.id} planı`}
        fill
        unoptimized
        loading={loading}
        className={className}
      />
    );
  }
  return (
    <Image
      src={planImages[apartment.plan] ?? planImages[defaultPlanKey]}
      alt={`${apartment.id} standart planı`}
      fill
      sizes={sizes}
      loading={loading}
      className={className}
    />
  );
}

function Card({ title, description, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6">
      <h3 className="text-base font-bold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[#77766f]">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-semibold text-[#9b2f22]">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-[#9a9991]">{hint}</p>
      )}
    </div>
  );
}

function DropZone({ id, label, multiple = false, busy, onFiles }) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
        dragging
          ? "border-[#24503a] bg-[#24503a]/5"
          : "border-[#16201b]/15 hover:border-[#24503a]/50 hover:bg-[#faf9f6]"
      }`}
    >
      <input
        id={id}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Icon name="upload" className="size-5 text-[#24503a]" />
      <span className="text-sm font-semibold">
        {busy ? "Yüklənir…" : label}
      </span>
      <span className="text-xs text-[#9a9991]">
        PNG, JPG və ya WEBP · faylı bura sürüşdürün
      </span>
    </label>
  );
}

function TagEditor({ id, tags, onChange }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  };

  return (
    <div>
      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#c8d9cd] py-1 pl-3 pr-1 text-sm font-semibold"
            >
              {tag}
              <button
                type="button"
                aria-label={`“${tag}” sil`}
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="grid size-6 cursor-pointer place-items-center rounded-full transition hover:bg-[#16201b]/10"
              >
                <Icon name="close" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#9a9991]">Hələ xüsusiyyət əlavə edilməyib.</p>
      )}
      <div className="mt-3 flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder="Məs.: Geniş zal (Enter ilə əlavə edin)"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className={`${buttonClass.secondary} shrink-0 whitespace-nowrap`}
        >
          Əlavə et
        </button>
      </div>
    </div>
  );
}

function ApartmentForm({
  apartment,
  index,
  apartments,
  statuses,
  buildingOptions,
  onChange,
  onSelect,
}) {
  const baseId = useId();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const layout = apartment.layout ?? [];
  const photos = apartment.photos ?? [];
  const highlights = apartment.highlights ?? [];
  const layoutTotal = layout.reduce(
    (sum, room) => sum + (parseFloat(room.area) || 0),
    0,
  );
  const renovations = [
    ...new Set([
      ...RENOVATION_SUGGESTIONS,
      ...apartments.map((item) => item.renovation).filter(Boolean),
    ]),
  ];

  const trimmedId = String(apartment.id ?? "").trim();
  const idError = !trimmedId
    ? "ID boş ola bilməz."
    : apartments.some((item, i) => i !== index && String(item.id).trim() === trimmedId)
      ? "Bu ID artıq başqa mənzildə istifadə olunur."
      : null;

  const patchWith = (getChanges) =>
    onChange((list) =>
      list.map((item, i) => (i === index ? { ...item, ...getChanges(item) } : item)),
    );
  const patch = (changes) => patchWith(() => changes);

  const updateRoom = (roomIndex, changes) =>
    patchWith((item) => ({
      layout: (item.layout ?? []).map((room, i) =>
        i === roomIndex ? { ...room, ...changes } : room,
      ),
    }));

  async function handleFiles(fileList, kind) {
    const files = [...(fileList ?? [])].filter((file) =>
      ACCEPTED_IMAGES.split(",").includes(file.type),
    );
    if (files.length === 0) {
      if (fileList?.length) {
        setUploadError("Yalnız PNG, JPG və ya WEBP şəkilləri yükləyə bilərsiniz.");
      }
      return;
    }

    setUploading(kind);
    setUploadError(null);
    try {
      if (kind === "plan") {
        const dataUrl = await readImageFile(files[0], 1400);
        patch({ planImage: dataUrl });
      } else {
        const dataUrls = await Promise.all(
          files.map((file) => readImageFile(file, 1600)),
        );
        patchWith((item) => ({ photos: [...(item.photos ?? []), ...dataUrls] }));
      }
    } catch {
      setUploadError("Şəkil oxunmadı. Başqa fayl seçin.");
    } finally {
      setUploading(null);
    }
  }

  const duplicate = () => {
    onChange((list) => {
      const source = list[index];
      const copy = {
        ...structuredClone(source),
        id: uniqueId(list, `${source.id || "YENİ"}-KOPYA`),
      };
      return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
    });
    onSelect(index + 1);
  };

  const remove = () => {
    onChange((list) => list.filter((_, i) => i !== index));
    onSelect(Math.max(0, index - 1));
  };

  const numberField = (key, label, { min = 0, hint } = {}) => (
    <Field id={`${baseId}-${key}`} label={label} hint={hint}>
      <input
        id={`${baseId}-${key}`}
        type="number"
        min={min}
        step={1}
        value={apartment[key] ?? 0}
        onChange={(event) => patch({ [key]: toNumber(event.target.value) })}
        className={inputClass}
      />
    </Field>
  );

  return (
    <div className="min-w-0 space-y-6">
      {/* Summary + actions */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#efeeeb]">
            <PlanThumbnail apartment={apartment} sizes="64px" className="object-contain p-1.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold">
                {trimmedId || "Adsız mənzil"}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  statusChipClass[apartment.status] ?? "bg-[#efeeeb]"
                }`}
              >
                {statuses[apartment.status] ?? apartment.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-[#77766f]">
              Bina {apartment.building || "—"} · Mərtəbə {apartment.floor} ·{" "}
              {apartment.rooms} otaq · {apartment.area || "—"} m²
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={duplicate} className={buttonClass.secondary}>
            <Icon name="copy" /> Kopyala
          </button>
          {confirmDelete ? (
            <>
              <button type="button" onClick={remove} className={buttonClass.danger}>
                Bəli, sil
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className={buttonClass.ghost}
              >
                Ləğv et
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={buttonClass.secondary}
            >
              <Icon name="trash" /> Sil
            </button>
          )}
        </div>
      </section>

      {/* Images */}
      <Card
        title="Şəkillər"
        description="Plan şəkli mənzil kartında və mənzil səhifəsində göstəriləcək. Şəkil yüklənməyibsə standart plan istifadə olunur."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className={labelClass}>Plan şəkli</p>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#16201b]/10 bg-[#efeeeb]">
              <PlanThumbnail
                apartment={apartment}
                sizes="(min-width: 1024px) 30vw, 90vw"
                className="object-contain p-4"
                eager
              />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold">
                {apartment.planImage ? "Yüklənmiş şəkil" : "Standart plan"}
              </span>
            </div>
            <div className="mt-3">
              <DropZone
                id={`${baseId}-plan-upload`}
                label={apartment.planImage ? "Plan şəklini dəyiş" : "Plan şəklini yüklə"}
                busy={uploading === "plan"}
                onFiles={(files) => handleFiles(files, "plan")}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-44 flex-1">
                <label htmlFor={`${baseId}-plan`} className={labelClass}>
                  Standart plan (şəkil olmadıqda)
                </label>
                <select
                  id={`${baseId}-plan`}
                  value={apartment.plan}
                  onChange={(event) => patch({ plan: event.target.value })}
                  className={inputClass}
                >
                  {Object.keys(planImages).map((key) => (
                    <option key={key} value={key}>
                      {key.replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
              {apartment.planImage && (
                <button
                  type="button"
                  onClick={() => patch({ planImage: null })}
                  className={buttonClass.secondary}
                >
                  <Icon name="trash" /> Şəkli sil
                </button>
              )}
            </div>
          </div>

          <div>
            <p className={labelClass}>Əlavə fotolar ({photos.length})</p>
            {photos.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2 max-md:grid-cols-2">
                {photos.map((src, photoIndex) => (
                  <li
                    key={photoIndex}
                    className="relative aspect-square overflow-hidden rounded-lg bg-[#efeeeb]"
                  >
                    <Image
                      src={src}
                      alt={`${trimmedId} foto ${photoIndex + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-x-1 bottom-1 flex justify-end gap-0.5 rounded-lg bg-white/90 p-0.5">
                      <IconButton
                        label="Sola daşı"
                        icon="left"
                        disabled={photoIndex === 0}
                        onClick={() =>
                          patch({ photos: moveItem(photos, photoIndex, photoIndex - 1) })
                        }
                      />
                      <IconButton
                        label="Sağa daşı"
                        icon="right"
                        disabled={photoIndex === photos.length - 1}
                        onClick={() =>
                          patch({ photos: moveItem(photos, photoIndex, photoIndex + 1) })
                        }
                      />
                      <IconButton
                        label="Fotonu sil"
                        icon="trash"
                        danger
                        onClick={() =>
                          patch({ photos: photos.filter((_, i) => i !== photoIndex) })
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-[#16201b]/15 text-sm text-[#9a9991]">
                Hələ foto yoxdur.
              </p>
            )}
            <div className="mt-3">
              <DropZone
                id={`${baseId}-photos-upload`}
                label="Foto yüklə"
                multiple
                busy={uploading === "photos"}
                onFiles={(files) => handleFiles(files, "photos")}
              />
            </div>
          </div>
        </div>

        {uploadError && (
          <p role="alert" className="mt-4 text-sm font-semibold text-[#9b2f22]">
            {uploadError}
          </p>
        )}
      </Card>

      {/* Main details */}
      <Card title="Əsas məlumatlar">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field
            id={`${baseId}-id`}
            label="Mənzil ID"
            hint={`Səhifə ünvanı: /menziller/${trimmedId || "ID"}`}
            error={idError}
          >
            <input
              id={`${baseId}-id`}
              value={apartment.id}
              onChange={(event) => patch({ id: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${baseId}-unit`} label="Mənzil nömrəsi">
            <input
              id={`${baseId}-unit`}
              value={apartment.unit ?? ""}
              onChange={(event) => patch({ unit: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${baseId}-building`} label="Bina">
            <input
              id={`${baseId}-building`}
              list={`${baseId}-buildings`}
              value={apartment.building ?? ""}
              onChange={(event) => patch({ building: event.target.value })}
              className={inputClass}
            />
            <datalist id={`${baseId}-buildings`}>
              {buildingOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
          {numberField("floor", "Mərtəbə", { min: 1 })}
          {numberField("rooms", "Otaq sayı", { min: 1 })}
          <Field id={`${baseId}-area`} label="Ümumi sahə (m²)">
            <input
              id={`${baseId}-area`}
              inputMode="decimal"
              value={apartment.area ?? ""}
              onChange={(event) => patch({ area: event.target.value })}
              placeholder="0.00"
              className={inputClass}
            />
          </Field>
          {numberField("balconies", "Balkon sayı")}
          <Field id={`${baseId}-renovation`} label="Təmir">
            <input
              id={`${baseId}-renovation`}
              list={`${baseId}-renovations`}
              value={apartment.renovation ?? ""}
              onChange={(event) => patch({ renovation: event.target.value })}
              className={inputClass}
            />
            <datalist id={`${baseId}-renovations`}>
              {renovations.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
          <Field id={`${baseId}-status`} label="Status">
            <select
              id={`${baseId}-status`}
              value={apartment.status}
              onChange={(event) => patch({ status: event.target.value })}
              className={inputClass}
            >
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* Highlights */}
      <Card
        title="Xüsusiyyətlər"
        description="Mənzil səhifəsində sahənin altında göstərilən qısa etiketlər."
      >
        <TagEditor
          id={`${baseId}-highlight`}
          tags={highlights}
          onChange={(next) => patch({ highlights: next })}
        />
      </Card>

      {/* Rooms */}
      <Card
        title="Otaqlar və sahələr"
        description="Plan kartında və “Mənzil haqqında” blokunda göstərilən otaq siyahısı."
      >
        {layout.length > 0 ? (
          <ul className="space-y-2">
            {layout.map((room, roomIndex) => (
              <li
                key={roomIndex}
                className="grid grid-cols-[minmax(0,1fr)_110px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_150px_auto]"
              >
                <input
                  aria-label={`Otaq ${roomIndex + 1} adı`}
                  value={room.name}
                  onChange={(event) => updateRoom(roomIndex, { name: event.target.value })}
                  placeholder="Məs.: Yataq otağı"
                  className={inputClass}
                />
                <div className="relative">
                  <input
                    aria-label={`Otaq ${roomIndex + 1} sahəsi`}
                    inputMode="decimal"
                    value={room.area}
                    onChange={(event) => updateRoom(roomIndex, { area: event.target.value })}
                    placeholder="0.00"
                    className={`${inputClass} pr-10`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#77766f]">
                    m²
                  </span>
                </div>
                <div className="col-span-2 flex justify-end sm:col-span-1">
                  <IconButton
                    label="Yuxarı daşı"
                    icon="up"
                    disabled={roomIndex === 0}
                    onClick={() =>
                      patch({ layout: moveItem(layout, roomIndex, roomIndex - 1) })
                    }
                  />
                  <IconButton
                    label="Aşağı daşı"
                    icon="down"
                    disabled={roomIndex === layout.length - 1}
                    onClick={() =>
                      patch({ layout: moveItem(layout, roomIndex, roomIndex + 1) })
                    }
                  />
                  <IconButton
                    label="Otağı sil"
                    icon="trash"
                    danger
                    onClick={() =>
                      patch({ layout: layout.filter((_, i) => i !== roomIndex) })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#9a9991]">Hələ otaq əlavə edilməyib.</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => patch({ layout: [...layout, { name: "", area: "" }] })}
            className={buttonClass.add}
          >
            <Icon name="plus" /> Otaq əlavə et
          </button>
          <p className="text-sm text-[#77766f]">
            Otaqların cəmi: <strong>{layoutTotal.toFixed(2)} m²</strong> · Ümumi
            sahə: <strong>{apartment.area || "—"} m²</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function ApartmentsEditor({
  apartments,
  statuses,
  buildingOptions,
  onChange,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");

  const index = Math.min(selectedIndex, Math.max(apartments.length - 1, 0));
  const apartment = apartments[index];

  const normalizedQuery = query.trim().toLocaleLowerCase("az");
  const visible = apartments
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(
      ({ item }) =>
        !normalizedQuery ||
        [item.id, item.unit, `bina ${item.building}`, statuses[item.status], `${item.rooms} otaq`]
          .map((value) => String(value ?? "").toLocaleLowerCase("az"))
          .some((value) => value.includes(normalizedQuery)),
    );

  const add = () => {
    onChange((list) => [...list, createApartment(list)]);
    setSelectedIndex(apartments.length);
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      {/* Flat list */}
      <section className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(22,32,27,0.06)] xl:sticky xl:top-28">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 className="text-base font-bold">
            Bütün mənzillər{" "}
            <span className="font-semibold text-[#9a9991]">({apartments.length})</span>
          </h2>
          <button type="button" onClick={add} className={`${buttonClass.primary} h-9 px-3.5`}>
            <Icon name="plus" /> Yeni
          </button>
        </div>

        <div className="relative mt-3">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a9991]"
          />
          <input
            type="search"
            aria-label="Mənzil axtar"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ID, bina və ya status"
            className={`${inputClass} pl-9`}
          />
        </div>

        <ul className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto pr-1 max-md:max-h-80">
          {visible.map(({ item, itemIndex }) => {
            const active = itemIndex === index;
            return (
              <li key={itemIndex}>
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => setSelectedIndex(itemIndex)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition ${
                    active ? "bg-[#13271f] text-white" : "hover:bg-[#f3f0e9]"
                  }`}
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#efeeeb]">
                    <PlanThumbnail apartment={item} sizes="44px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {String(item.id).trim() || "Adsız mənzil"}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        active ? "text-white/70" : "text-[#77766f]"
                      }`}
                    >
                      {item.rooms} otaq · {item.area || "—"} m² · Mərtəbə {item.floor}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      statusChipClass[item.status] ?? "bg-[#efeeeb]"
                    }`}
                  >
                    {statuses[item.status] ?? item.status}
                  </span>
                </button>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-[#9a9991]">
              Heç nə tapılmadı.
            </li>
          )}
        </ul>
      </section>

      {apartment ? (
        <ApartmentForm
          key={index}
          apartment={apartment}
          index={index}
          apartments={apartments}
          statuses={statuses}
          buildingOptions={buildingOptions}
          onChange={onChange}
          onSelect={setSelectedIndex}
        />
      ) : (
        <section className="grid place-items-center rounded-2xl bg-white px-6 py-16 text-center">
          <div>
            <p className="text-base font-bold">Hələ mənzil yoxdur</p>
            <p className="mt-1 text-sm text-[#77766f]">
              İlk mənzili əlavə etmək üçün “Yeni” düyməsinə basın.
            </p>
            <button type="button" onClick={add} className={`${buttonClass.primary} mt-5`}>
              <Icon name="plus" /> Mənzil əlavə et
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
