"use client";

import Image from "next/image";
import { useState } from "react";
import { blurPlaceholder } from "../lib/galleryPhotos";

import ImageViewer from "./ImageViewer";

/**
 * Pinterest-style masonry: CSS columns keep every photo at its natural height.
 * `photos`: [{ key, alt, category, image }], `categories`: [{ id, label }].
 */
export default function GalleryGrid({ photos, categories, labels }) {
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  const visible =
    category === "all" ? photos : photos.filter((photo) => photo.category === category);
  const current = openIndex === null ? null : visible[openIndex];
  const count = visible.length;

  const close = () => setOpenIndex(null);
  const step = (delta) =>
    setOpenIndex((index) => (index === null ? null : (index + delta + count) % count));

  const chips = [
    { id: "all", label: labels.all, total: photos.length },
    ...categories.map((item) => ({
      ...item,
      total: photos.filter((photo) => photo.category === item.id).length,
    })),
  ].filter((chip) => chip.total > 0);

  return (
    <>
      {/* Category filter */}
      <div
        role="group"
        aria-label={labels.filter}
        // Phones: the row scrolls edge to edge (negative page gutter, padded back in).
        className="mt-[clamp(24px,2.6vw,52px)] flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] max-md:mx-[calc(var(--page-gutter)*-1)] max-md:px-page md:flex-wrap md:gap-[clamp(8px,0.7vw,14px)]"
      >
        {chips.map((chip) => {
          const active = chip.id === category;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setCategory(chip.id);
                setOpenIndex(null);
              }}
              className={`flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 text-[clamp(13px,0.95vw,17px)] transition-colors duration-300 ease-butter ${
                active
                  ? "bg-[#13271f] text-white"
                  : "bg-white text-[#16201b] hover:bg-[#e8e4da]"
              }`}
            >
              {chip.label}
              <span className={active ? "text-white/60" : "text-[#6c6b65]"}>{chip.total}</span>
            </button>
          );
        })}
      </div>

      {/* Masonry */}
      <ul
        key={category}
        className="mt-[clamp(20px,2.2vw,44px)] columns-2 gap-[clamp(10px,1.2vw,24px)] md:columns-3 xl:columns-4"
      >
        {visible.map((photo, index) => (
          <li
            key={photo.key ?? photo.src}
            style={{ animationDelay: `${Math.min(index * 45, 700)}ms` }}
            className="mb-[clamp(10px,1.2vw,24px)] animate-rise-in break-inside-avoid motion-reduce:animate-none"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`${labels.open}: ${photo.alt}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-[clamp(14px,1.3vw,26px)] bg-[#e4e1d9] outline-offset-4"
            >
              <Image
                src={photo.image}
                alt={photo.alt}
                placeholder={blurPlaceholder(photo.image)}
                sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
                className="block h-auto w-full transition-[scale] duration-[900ms] ease-butter group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#13271f]/35 to-transparent to-45% opacity-0 transition-opacity duration-500 ease-butter group-hover:opacity-100"
              />
            </button>
          </li>
        ))}
      </ul>

      {current && <ImageViewer photo={current} index={openIndex} count={count} labels={labels} onClose={close} onStep={step} />}
    </>
  );
}
