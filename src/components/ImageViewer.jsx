"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { blurPlaceholder } from "../lib/galleryPhotos";
import { containDialogTab } from "../lib/dialogFocus";

// Existing gallery viewer, also used to enlarge apartment floor plans.
export default function ImageViewer({ photo, index = 0, count = 1, labels, onClose, onStep }) {
  const dialog = useRef(null);
  const touchStart = useRef(null);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    element.showModal();
    root.style.overflow = "hidden";
    return () => {
      element.close();
      root.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  const step = (delta) => { setZoomed(false); onStep?.(delta); };
  const button = "flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2";
  return (
    <dialog
      ref={dialog}
      aria-label={photo.alt}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        containDialogTab(event, event.currentTarget);
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 flex h-dvh max-h-none w-screen max-w-none flex-col border-0 bg-[#0f1c16] p-0 text-white [&:not([open])]:hidden"
    >
      <div className="flex items-center justify-between gap-3 px-page py-4">
        <span className="mr-auto text-sm text-white/70" aria-live="polite">{index + 1} / {count}</span>
        <button type="button" className={button} aria-label={labels.zoom} aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)}>{zoomed ? "−" : "+"}</button>
        <button type="button" className={button} aria-label={labels.close} onClick={onClose}>×</button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-page pb-6">
        {count > 1 && <button type="button" className={button} aria-label={labels.previous} onClick={() => step(-1)}>‹</button>}
        <figure
          className="flex h-full min-w-0 flex-1 flex-col items-center overflow-auto"
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchEnd={(event) => {
            if (touchStart.current === null || zoomed) return;
            const distance = event.changedTouches[0].clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1);
          }}
        >
          <Image src={photo.image} alt={photo.alt} placeholder={blurPlaceholder(photo.image)} sizes={zoomed ? "180vw" : "90vw"}
            className={zoomed ? "h-auto w-[150%] max-w-none shrink-0 self-start" : "min-h-0 w-full flex-1 object-contain"} />
          <figcaption className="mt-4 shrink-0 text-center text-sm text-white/80">{photo.alt}</figcaption>
        </figure>
        {count > 1 && <button type="button" className={button} aria-label={labels.next} onClick={() => step(1)}>›</button>}
      </div>
    </dialog>
  );
}
