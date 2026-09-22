"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { photoImage } from "../../lib/galleryPhotos";
import { moveItem } from "./adminConfig";
import { uploadImage } from "./imageUtils";
import { buttonClass, Icon, IconButton, inputClass, labelClass } from "./ui";

const ACCEPTED_IMAGES = ["image/png", "image/jpeg", "image/webp"];
const LETTERS = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g" };

// "Korpus B-də fasad işləri" -> "korpus-b-de-fasad-isleri"
export function slugify(text) {
  return String(text)
    .toLocaleLowerCase("az")
    .replace(/[əıöüşçğ]/g, (letter) => LETTERS[letter])
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 80);
}

const today = () => new Date().toISOString().slice(0, 10);

function NewsItem({ item, index, list, onChange }) {
  const baseId = useId();
  const [open, setOpen] = useState(!item.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const cover = item.cover ? photoImage(item.cover) : null;

  const patch = (changes) =>
    onChange((current) => current.map((entry, i) => (i === index ? { ...entry, ...changes } : entry)));

  const idError = !item.id
    ? "Ünvan boş ola bilməz."
    : list.some((other, i) => i !== index && other.id === item.id)
      ? "Bu ünvan artıq başqa xəbərdə istifadə olunur."
      : null;

  async function upload(file) {
    if (!file) return;
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      setError("Yalnız PNG, JPG və ya WEBP şəkilləri yükləyə bilərsiniz.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      patch({ cover: await uploadImage(file) });
    } catch {
      setError("Şəkil yüklənmədi. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(22,32,27,0.06)]">
      {/* Summary row */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[#efeeeb]">
            {cover && <Image src={cover} alt="" fill sizes="56px" className="object-cover" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-bold">{item.title || "Başlıqsız xəbər"}</span>
            <span className="block text-sm text-[#77766f]">
              {item.date || "Tarix yoxdur"}
              {idError && <span className="ml-2 font-semibold text-[#9b2f22]">· {idError}</span>}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center">
          <IconButton
            label="Yuxarı daşı"
            icon="up"
            disabled={index === 0}
            onClick={() => onChange((current) => moveItem(current, index, index - 1))}
          />
          <IconButton
            label="Aşağı daşı"
            icon="down"
            disabled={index === list.length - 1}
            onClick={() => onChange((current) => moveItem(current, index, index + 1))}
          />
          <IconButton
            label={open ? "Bağla" : "Redaktə et"}
            icon={open ? "up" : "chevron"}
            onClick={() => setOpen((value) => !value)}
          />
        </div>
      </div>

      {open && (
        <div className="grid gap-4 border-t border-[#16201b]/8 p-4 sm:p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <label htmlFor={`${baseId}-title`} className={labelClass}>
                Başlıq
              </label>
              <input
                id={`${baseId}-title`}
                value={item.title ?? ""}
                onChange={(event) => {
                  const title = event.target.value;
                  patch({ title });
                }}
                onBlur={() => {
                  if (!item.id) patch({ id: slugify(item.title) });
                }}
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${baseId}-date`} className={labelClass}>
                  Tarix
                </label>
                <input
                  id={`${baseId}-date`}
                  type="date"
                  value={item.date ?? ""}
                  onChange={(event) => patch({ date: event.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${baseId}-id`} className={labelClass}>
                  Səhifə ünvanı
                </label>
                <input
                  id={`${baseId}-id`}
                  value={item.id ?? ""}
                  onChange={(event) => patch({ id: slugify(event.target.value) })}
                  aria-invalid={idError ? "true" : undefined}
                  className={`${inputClass} ${idError ? "border-[#9b2f22]/50" : ""}`}
                />
                <p className="mt-1 truncate text-xs text-[#9a9991]">/xeberler/{item.id}</p>
              </div>
            </div>
            <div>
              <label htmlFor={`${baseId}-summary`} className={labelClass}>
                Qısa təsvir (siyahıda görünür)
              </label>
              <textarea
                id={`${baseId}-summary`}
                rows={2}
                value={item.summary ?? ""}
                onChange={(event) => patch({ summary: event.target.value })}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label htmlFor={`${baseId}-body`} className={labelClass}>
                Mətn — abzasları boş sətirlə ayırın
              </label>
              <textarea
                id={`${baseId}-body`}
                rows={10}
                value={item.body ?? ""}
                onChange={(event) => patch({ body: event.target.value })}
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          <div>
            <p className={labelClass}>Şəkil</p>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#efeeeb]">
              {cover ? (
                <Image src={cover} alt="" fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-sm text-[#9a9991]">Şəkil yoxdur</span>
              )}
            </div>
            {error && (
              <p role="alert" className="mt-2 text-sm font-semibold text-[#9b2f22]">
                {error}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <label htmlFor={`${baseId}-cover`} className={`${buttonClass.secondary} ${busy ? "opacity-60" : ""}`}>
                <Icon name="upload" /> {busy ? "Yüklənir…" : cover ? "Dəyiş" : "Yüklə"}
                <input
                  id={`${baseId}-cover`}
                  type="file"
                  accept={ACCEPTED_IMAGES.join(",")}
                  disabled={busy}
                  className="sr-only"
                  onChange={(event) => {
                    upload(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {cover && (
                <button type="button" onClick={() => patch({ cover: null })} className={buttonClass.ghost}>
                  Sil
                </button>
              )}
            </div>

            <div className="mt-6 border-t border-[#16201b]/8 pt-4">
              {confirmDelete ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onChange((current) => current.filter((_, i) => i !== index))}
                    className={buttonClass.danger}
                  >
                    Bəli, xəbəri sil
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className={buttonClass.ghost}>
                    Geri
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className={buttonClass.secondary}>
                  <Icon name="trash" /> Xəbəri sil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

/** News for /xeberler. The site lists them by date, newest first. */
export default function NewsEditor({ news = [], onChange }) {
  const add = () =>
    onChange((current = []) => [{ id: "", date: today(), title: "", summary: "", body: "", cover: null }, ...current]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#77766f]">
          {news.length} xəbər · saytda tarixə görə, ən yenisi birinci göstərilir.
        </p>
        <button type="button" onClick={add} className={buttonClass.primary}>
          <Icon name="plus" /> Yeni xəbər
        </button>
      </div>

      {news.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-14 text-center text-sm text-[#77766f]">
          Hələ xəbər yoxdur. Əlavə etmək üçün “Yeni xəbər” düyməsinə basın.
        </p>
      ) : (
        <ul className="space-y-3">
          {news.map((item, index) => (
            // Index keys: the address can be empty or change while typing.
            <NewsItem key={index} item={item} index={index} list={news} onChange={onChange} />
          ))}
        </ul>
      )}
    </div>
  );
}
