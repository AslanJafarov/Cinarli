"use client";

import { Children, useEffect, useState } from "react";

const SLIDE_MS = 7000;

// Stacks the hero photos (children) and fades to the next one every 7 seconds. Pauses while the
// tab is hidden, and stays on the first photo for people who turn off animations.
export default function HeroSlideshow({ children }) {
  const slides = Children.toArray(children);
  // The previous photo fades out on top of the new one, so the background never shows through.
  const [{ active, previous }, setSlides] = useState({ active: 0, previous: null });

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setSlides((current) => ({
        active: (current.active + 1) % slides.length,
        previous: current.active,
      }));
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 -z-20 isolate">
      {slides.map((slide, index) => (
        <div
          key={slide.key ?? index}
          aria-hidden={index === active ? undefined : "true"}
          className={`absolute inset-0 ${
            index === active
              ? "z-1 opacity-100"
              : index === previous
                ? "z-2 opacity-0 transition-opacity duration-1000 ease-in-out"
                : "opacity-0"
          }`}
        >
          {slide}
        </div>
      ))}
    </div>
  );
}
