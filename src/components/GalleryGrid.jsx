"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { blurPlaceholder } from "../lib/galleryPhotos";

const SWIPE_DISTANCE = 50;

/**
 * Pinterest-style masonry: CSS columns keep every photo at its natural height.
 * `photos`: [{ key, alt, category, image }], `categories`: [{ id, label }].
 */
export default function GalleryGrid({ photos, categories, labels }) {
  const [category, setCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const touchStartX = useRef(null);

  const visible =
    category === "all" ? photos : photos.filter((photo) => photo.category === category);
  const current = openIndex === null ? null : visible[openIndex];
  const count = visible.length;
  const isOpen = current !== null;

  const close = () => setOpenIndex(null);
  const step = (delta) =>
    setOpenIndex((index) => (index === null ? null : (index + delta + count) % count));

  // Lock page scroll and handle Escape / arrow keys while the viewer is open.
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight") {
        setOpenIndex((index) => (index === null ? null : (index + 1) % count));
      }
      if (event.key === "ArrowLeft") {
        setOpenIndex((index) => (index === null ? null : (index - 1 + count) % count));
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, count]);

  const chips = [
    { id: "all", label: labels.all, total: photos.length },
    ...categories.map((item) => ({
      ...item,
      total: photos.filter((photo) => photo.category === item.id).length,
    })),
  ].filter((chip) => chip.total > 0);

  const iconButton =
    "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";

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
            key={photo.key}
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

      {/* Full-screen viewer */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={close}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const distance = event.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(distance) > SWIPE_DISTANCE) step(distance < 0 ? 1 : -1);
          }}
          className="fixed inset-0 z-[70] flex flex-col bg-[#0f1c16] text-white"
        >
          <div className="flex items-center justify-between px-page py-4">
            <span className="text-[14px] text-white/70">
              {openIndex + 1} / {count}
            </span>
            <button
              type="button"
              aria-label={labels.close}
              onClick={close}
              className={iconButton}
            >
              <svg aria-hidden="true" viewBox="0 0 14 14" className="size-4">
                <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center gap-4 px-page pb-6">
            <button
              type="button"
              aria-label={labels.previous}
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className={`${iconButton} max-md:hidden`}
            >
              <svg aria-hidden="true" viewBox="0 0 8 14" className="h-4 w-auto">
                <path d="M7 1 1 7l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <figure
              onClick={(event) => event.stopPropagation()}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-center"
            >
              <Image
                key={current.key}
                src={current.image}
                alt={current.alt}
                placeholder={blurPlaceholder(current.image)}
                sizes="90vw"
                className="h-auto max-h-[calc(100%-3rem)] w-auto max-w-full animate-rise-in rounded-[clamp(10px,1vw,18px)] object-contain motion-reduce:animate-none"
              />
              <figcaption className="mt-4 text-center text-[clamp(13px,1vw,17px)] text-white/80">
                {current.alt}
              </figcaption>
            </figure>

            <button
              type="button"
              aria-label={labels.next}
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className={`${iconButton} max-md:hidden`}
            >
              <svg aria-hidden="true" viewBox="0 0 8 14" className="h-4 w-auto rotate-180">
                <path d="M7 1 1 7l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
