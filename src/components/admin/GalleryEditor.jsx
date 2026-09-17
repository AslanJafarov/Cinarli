"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { galleryImageFiles } from "../../lib/galleryPhotos";
import { moveItem } from "./adminConfig";
import { uploadImage } from "./imageUtils";
import { Icon, IconButton } from "./ui";

const ACCEPTED_IMAGES = ["image/png", "image/jpeg", "image/webp"];

function PhotoPreview({ photo }) {
  // Uploaded in the admin panel: served from /media.
  if (photo.src) {
    return (
      <Image src={photo.src} alt={photo.alt} fill unoptimized className="object-cover" />
    );
  }

  const file = galleryImageFiles[photo.key];
  if (!file) {
    return (
      <span className="grid size-full place-items-center px-3 text-center text-xs text-[#6b6a63]">
        Şəkil tapılmadı
      </span>
    );
  }

  return (
    <Image
      src={file}
      alt={photo.alt}
      fill
      sizes="(min-width: 1280px) 260px, (min-width: 640px) 30vw, 45vw"
      className="object-cover"
    />
  );
}

/**
 * Photos of the /qalereya page as a picture grid: upload new ones, remove, reorder
 * and pick a category. Built-in photos come from src/lib/galleryPhotos.js.
 */
export default function GalleryEditor({ gallery, onChange }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const photos = gallery?.photos ?? [];
  const categories = gallery?.categories ?? [];

  const setPhotos = (updater) =>
    onChange((current) => ({ ...current, photos: updater(current?.photos ?? []) }));

  async function addFiles(fileList) {
    const files = [...(fileList ?? [])].filter((file) => ACCEPTED_IMAGES.includes(file.type));
    if (files.length === 0) {
      if (fileList?.length) {
        setError("Yalnız PNG, JPG və ya WEBP şəkilləri yükləyə bilərsiniz.");
      }
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const stamp = Date.now();
      const added = await Promise.all(
        files.map(async (file, index) => ({
          key: `upload-${stamp}-${index}`,
          category: categories[0]?.id ?? "exterior",
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          ...(await uploadImage(file)),
        })),
      );
      // New photos go first, so they're visible right away.
      setPhotos((current) => [...added, ...current]);
    } catch {
      setError("Şəkil yüklənmədi. Başqa fayl seçin və ya yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(22,32,27,0.06)] sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold">Qalereya fotoları</h3>
        <p className="text-sm text-[#6b6a63]">{photos.length} foto</p>
      </div>
      <p className="mt-1 text-sm text-[#6b6a63]">
        Qalereya səhifəsində bu ardıcıllıqla göstərilir. Silmək üçün zibil qutusuna, yerini
        dəyişmək üçün oxlara basın.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-sm font-semibold text-[#9b2f22]">
          {error}
        </p>
      )}

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {/* Add photos */}
        <li>
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            className={`flex aspect-[4/3] h-full min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed px-3 text-center transition ${
              dragging
                ? "border-[#24503a] bg-[#24503a]/5"
                : "border-[#16201b]/15 hover:border-[#24503a]/50 hover:bg-[#faf9f6]"
            }`}
          >
            <input
              id={inputId}
              type="file"
              accept={ACCEPTED_IMAGES.join(",")}
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <span className="grid size-10 place-items-center rounded-full bg-[#24503a]/10 text-[#24503a]">
              <Icon name={busy ? "upload" : "plus"} className="size-5" />
            </span>
            <span className="text-sm font-semibold">
              {busy ? "Yüklənir…" : "Foto əlavə et"}
            </span>
            <span className="text-balance text-xs text-[#6b6a63] max-sm:hidden">
              PNG, JPG, WEBP · sürüşdürüb buraxın
            </span>
          </label>
        </li>

        {photos.map((photo, index) => (
          <li
            key={photo.key}
            className="overflow-hidden rounded-xl bg-[#efeeeb] ring-1 ring-[#16201b]/8"
          >
            <div className="relative aspect-[4/3]">
              <PhotoPreview photo={photo} />
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[#16201b]">
                {index + 1}
              </span>
              {/* Reorder + delete sit on the photo, so the category keeps the full width below */}
              <div className="absolute right-1.5 top-1.5 flex rounded-lg bg-white/90">
                <IconButton
                  label="Sola daşı"
                  icon="left"
                  disabled={index === 0}
                  onClick={() => setPhotos((current) => moveItem(current, index, index - 1))}
                />
                <IconButton
                  label="Sağa daşı"
                  icon="right"
                  disabled={index === photos.length - 1}
                  onClick={() => setPhotos((current) => moveItem(current, index, index + 1))}
                />
                <IconButton
                  label="Fotonu sil"
                  icon="trash"
                  danger
                  onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                />
              </div>
            </div>

            <div className="bg-white p-1.5">
              <select
                aria-label={`Kateqoriya: foto ${index + 1}`}
                value={photo.category}
                onChange={(event) =>
                  setPhotos((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, category: event.target.value } : item,
                    ),
                  )
                }
                className="block w-full cursor-pointer truncate rounded-lg bg-transparent px-1.5 py-1.5 text-xs font-semibold text-[#16201b] outline-none hover:bg-[#16201b]/5 max-md:text-sm"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
