"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { heroImages, SITE_IMAGE_SLOTS, siteImage } from "../../lib/siteImages";
import { uploadImage } from "./imageUtils";
import { buttonClass, Icon, IconButton } from "./ui";

const ACCEPTED_IMAGES = ["image/png", "image/jpeg", "image/webp"];

const SLOT_INFO = {
  hero: {
    title: "Giriş (hero)",
    where: "Ana səhifənin ən yuxarısı, bütün ekran eni boyunca. Bir neçə şəkil yükləsəniz, hər 7 saniyədən bir növbəti şəkil görünür.",
    hint: "Üfüqi, ən azı 2400 px enində. Binanı şəklin sağ tərəfində saxlayın — sol tərəfi mətn paneli örtür.",
  },
  project: {
    title: "Layihə bölməsi",
    where: "“Layihə” bölməsində mətnin yanındakı şəkil.",
    hint: "Üfüqi, ən azı 1600 px enində.",
  },
  advantages: {
    title: "Üstünlüklər bölməsi",
    where: "“Üstünlüklər” bölməsindəki böyük kart.",
    hint: "Təxminən kvadrat, ən azı 1400 px.",
  },
  construction: {
    title: "Tikintinin gedişi",
    where: "“Tikinti” bölməsində son yeniliyin şəkli.",
    hint: "Üfüqi, ən azı 1600 px enində.",
  },
};

function Slot({ slot, value, onChange }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const info = SLOT_INFO[slot];
  const photo = siteImage({ [slot]: value }, slot);

  async function upload(file) {
    if (!file) return;
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      setError("Yalnız PNG, JPG və ya WEBP şəkilləri yükləyə bilərsiniz.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file, 2600));
    } catch {
      setError("Şəkil yüklənmədi. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(22,32,27,0.06)]">
      <div className="relative aspect-[16/9] bg-[#efeeeb]">
        {photo ? (
          <Image
            src={photo.image}
            alt={info.title}
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="grid size-full place-items-center text-sm text-[#9a9991]">
            Şəkil yoxdur — saytda yaşıl fon görünür
          </span>
        )}
        {photo && !photo.uploaded && (
          <span className="absolute left-3 top-3 rounded-full bg-[#fbf5df] px-2.5 py-1 text-xs font-semibold text-[#8a6a12]">
            Nümunə şəkil (mock)
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-bold">{info.title}</h3>
        <p className="mt-1 text-sm text-[#77766f]">{info.where}</p>
        <p className="mt-1 text-xs text-[#9a9991]">{info.hint}</p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-[#9b2f22]">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <label htmlFor={inputId} className={`${buttonClass.primary} ${busy ? "opacity-60" : ""}`}>
            <Icon name="upload" /> {busy ? "Yüklənir…" : photo ? "Şəkli dəyiş" : "Şəkil yüklə"}
            <input
              id={inputId}
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
          {photo && (
            <button type="button" onClick={() => onChange(null)} className={buttonClass.secondary}>
              <Icon name="trash" /> Sil
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

// The hero slideshow: several photos, shown in this order.
function HeroSlot({ value, onChange }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const info = SLOT_INFO.hero;
  const photos = heroImages({ hero: value });
  const isSample = value === "built-in";
  // Uploads only; the sample photos are replaced by the first upload.
  const uploads = isSample ? [] : photos.map((photo) => photo.image);

  async function upload(files) {
    if (files.length === 0) return;
    if (files.some((file) => !ACCEPTED_IMAGES.includes(file.type))) {
      setError("Yalnız PNG, JPG və ya WEBP şəkilləri yükləyə bilərsiniz.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const added = [];
      for (const file of files) added.push(await uploadImage(file, 2600));
      onChange([...uploads, ...added]);
    } catch {
      setError("Şəkil yüklənmədi. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
    }
  }

  const move = (from, to) => {
    const next = [...uploads];
    next.splice(to, 0, next.splice(from, 1)[0]);
    onChange(next);
  };

  return (
    <li className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(22,32,27,0.06)] md:col-span-2">
      {photos.length > 0 ? (
        <ol className="grid grid-cols-2 gap-2 bg-[#efeeeb] p-2 sm:grid-cols-3 lg:grid-cols-5">
          {photos.map((photo, index) => (
            <li key={isSample ? index : photo.image.src} className="overflow-hidden rounded-xl bg-white">
              <div className="relative aspect-[16/9]">
                <Image
                  src={photo.image}
                  alt={`${info.title} — ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 240px, 50vw"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded-full bg-[#13271f]/80 px-2 py-0.5 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                {isSample && index === 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-[#fbf5df] px-2.5 py-0.5 text-xs font-semibold text-[#8a6a12]">
                    Nümunə (mock)
                  </span>
                )}
              </div>
              {!isSample && (
                <div className="flex justify-end gap-1 p-1">
                  <IconButton label="Əvvələ" icon="left" disabled={index === 0} onClick={() => move(index, index - 1)} />
                  <IconButton
                    label="Sonraya"
                    icon="right"
                    disabled={index === photos.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                  <IconButton
                    label="Sil"
                    icon="trash"
                    danger
                    onClick={() => {
                      const rest = uploads.filter((_, item) => item !== index);
                      onChange(rest.length > 0 ? rest : null);
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid aspect-[16/9] place-items-center bg-[#efeeeb] text-sm text-[#9a9991] md:aspect-[32/9]">
          Şəkil yoxdur — saytda yaşıl fon görünür
        </div>
      )}

      <div className="p-4 sm:p-5">
        <h3 className="font-bold">{info.title}</h3>
        <p className="mt-1 text-sm text-[#77766f]">{info.where}</p>
        <p className="mt-1 text-xs text-[#9a9991]">{info.hint}</p>

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-[#9b2f22]">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <label htmlFor={inputId} className={`${buttonClass.primary} ${busy ? "opacity-60" : ""}`}>
            <Icon name="upload" /> {busy ? "Yüklənir…" : isSample || photos.length === 0 ? "Şəkil yüklə" : "Şəkil əlavə et"}
            <input
              id={inputId}
              type="file"
              multiple
              accept={ACCEPTED_IMAGES.join(",")}
              disabled={busy}
              className="sr-only"
              onChange={(event) => {
                upload([...(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
          </label>
          {photos.length > 0 && (
            <button type="button" onClick={() => onChange(null)} className={buttonClass.secondary}>
              <Icon name="trash" /> {photos.length > 1 ? "Hamısını sil" : "Sil"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** The four large photos of the home page sections. */
export default function SiteImagesEditor({ siteImages, onChange }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {SITE_IMAGE_SLOTS.map((slot) =>
        slot === "hero" ? (
          <HeroSlot
            key={slot}
            value={siteImages?.hero ?? null}
            onChange={(value) => onChange((current) => ({ ...current, hero: value }))}
          />
        ) : (
          <Slot
            key={slot}
            slot={slot}
            value={siteImages?.[slot] ?? null}
            onChange={(value) => onChange((current) => ({ ...current, [slot]: value }))}
          />
        ),
      )}
    </ul>
  );
}
