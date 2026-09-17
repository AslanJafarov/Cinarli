"use client";

import { useEffect, useRef, useState } from "react";

const MAX_HEIGHT = 440;

// Applied inside the embedded page: bars pinned to the screen would cover the section,
// and entrance animations would show a half-faded snapshot.
const FRAME_CSS = `
  html, body { overflow: hidden !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
`;

/**
 * The real website in a small window, cropped to the section being edited
 * (the element with data-admin-preview="<section key>"). Shows the published site;
 * `version` reloads it after a save.
 */
function LivePreview({ path, sectionKey, viewport, version }) {
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [area, setArea] = useState(null);
  const frameKey = `${path}-${version}`;
  // Which page finished loading, and which section it didn't contain.
  const [loadedKey, setLoadedKey] = useState(null);
  const [missingKey, setMissingKey] = useState(null);
  const loaded = loadedKey === frameKey;
  const missing = loaded && missingKey === `${frameKey}-${sectionKey}`;

  useEffect(() => {
    const box = boxRef.current;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const scale = boxWidth / viewport;

  // Finds the section in the loaded page, hides pinned bars and shifts the page so the
  // section sits at the top of the frame. Runs again whenever the section changes size.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !loaded) return undefined;
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    const target = doc?.querySelector(`[data-admin-preview~="${sectionKey}"]`);
    if (!target) {
      setMissingKey(`${frameKey}-${sectionKey}`);
      return undefined;
    }

    if (!doc.getElementById("admin-preview-style")) {
      const style = doc.createElement("style");
      style.id = "admin-preview-style";
      style.textContent = FRAME_CSS;
      doc.head.append(style);
    }
    for (const element of doc.body.querySelectorAll("*")) {
      const { position } = win.getComputedStyle(element);
      if ((position === "fixed" || position === "sticky") && !target.contains(element)) {
        element.style.setProperty("display", "none", "important");
      }
    }

    const place = () => {
      doc.body.style.transform = "";
      const rect = target.getBoundingClientRect();
      const top = rect.top + win.scrollY;
      doc.body.style.transform = `translateY(${-top}px)`;
      setArea({ height: rect.height });
    };
    place();
    const observer = new win.ResizeObserver(place);
    observer.observe(target);
    return () => observer.disconnect();
  }, [loaded, frameKey, sectionKey]);

  const fullHeight = area ? area.height * scale : 0;
  const shownHeight = Math.min(fullHeight, MAX_HEIGHT);

  return (
    <div
      ref={boxRef}
      className="relative overflow-hidden bg-[#f6f5f1]"
      style={{ height: loaded && !missing && area ? shownHeight : 240 }}
    >
      {boxWidth > 0 && (
        <iframe
          key={frameKey}
          ref={frameRef}
          src={path}
          title="Saytın önizləməsi"
          aria-hidden="true"
          tabIndex={-1}
          onLoad={() => setLoadedKey(frameKey)}
          className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
          style={{
            width: viewport,
            // Tall enough to paint the whole section, capped for very long ones.
            height: Math.max(600, Math.min(area?.height ?? 900, MAX_HEIGHT / scale + 40)),
            transform: `scale(${scale})`,
            opacity: loaded && !missing && area ? 1 : 0,
          }}
        />
      )}

      {!loaded || missing || !area ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-[#9a9991]">
          {missing ? "Bu hissə səhifədə görünmür." : "Önizləmə yüklənir…"}
        </p>
      ) : (
        fullHeight > MAX_HEIGHT && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent" />
        )
      )}
    </div>
  );
}

// Search result built from the SEO texts being edited, so changes show before saving.
function GooglePreview({ seo }) {
  const home = seo?.home ?? {};
  return (
    <div className="space-y-1 bg-white px-6 py-7 font-[arial,sans-serif]">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-full bg-[#f1f3f4] text-xs font-bold text-[#13271f]">
          Ç
        </span>
        <span className="leading-tight">
          <span className="block text-sm text-[#202124]">{seo?.siteName}</span>
          <span className="block text-xs text-[#4d5156]">https://cinarli.az</span>
        </span>
      </div>
      <p className="pt-1 text-xl leading-snug text-[#1a0dab]">{home.title}</p>
      <p className="max-w-xl text-sm leading-relaxed text-[#4d5156]">{home.description}</p>
    </div>
  );
}

export default function SitePreview({ section, data, mode, version }) {
  const { preview } = section;
  if (!preview) return null;

  const url =
    preview.page === "google"
      ? "google.com"
      : `cinarli.az${preview.path === "/" ? "" : preview.path}`;

  return (
    // Phone-sized pages get a phone-sized window instead of being blown up.
    <figure className={`min-w-0 ${preview.viewport < 768 ? "mx-auto w-full max-w-[300px]" : ""}`}>
      <div className="overflow-hidden rounded-xl border border-[#16201b]/12 bg-white shadow-[0_8px_24px_rgba(22,32,27,0.10)]">
        <div className="flex items-center gap-1.5 border-b border-[#16201b]/8 bg-[#f6f5f1] px-3 py-2">
          <span className="size-2 rounded-full bg-[#e0766a]" />
          <span className="size-2 rounded-full bg-[#e5c15a]" />
          <span className="size-2 rounded-full bg-[#79b86f]" />
          <span className="ml-2 truncate rounded-full bg-white px-2.5 py-0.5 text-[11px] text-[#77766f]">
            {url}
          </span>
          {preview.viewport < 768 && (
            <span className="ml-auto rounded-full bg-[#16201b]/6 px-2 py-0.5 text-[10px] font-semibold text-[#77766f]">
              telefon görünüşü
            </span>
          )}
        </div>
        {preview.page === "google" ? (
          <GooglePreview seo={data.seo} />
        ) : (
          <LivePreview
            path={preview.path}
            sectionKey={section.key}
            viewport={preview.viewport ?? 1440}
            version={version}
          />
        )}
      </div>
      {preview.page !== "google" && (
        <figcaption className="mt-2 text-center text-xs text-[#77766f]">
          {mode === "mock"
            ? "Saytda hazırda belə görünür (mock data). Dəyişikliklər mock rejimi söndürüləndə görünəcək."
            : "Saytda hazırda belə görünür. Yadda saxladıqdan sonra yenilənir."}
        </figcaption>
      )}
    </figure>
  );
}
