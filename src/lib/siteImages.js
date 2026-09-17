import advantagesVilla from "../assets/advantages-villa.jpg";
import balconies from "../assets/gallery/balconies.jpg";
import exteriorBeige from "../assets/gallery/exterior-beige.jpg";
import exteriorSunset from "../assets/gallery/exterior-sunset.jpg";
import greenery from "../assets/gallery/greenery.jpg";
import heroBuilding from "../assets/hero-building.jpg";

// The large photos of the home page sections, uploadable in the admin panel ("Sayt şəkilləri").
// In `siteImages` (src/data/mock.js) each slot is an upload ({ src, width, height }),
// "built-in" (the sample photo below; mock data only) or null (no photo yet).
// The hero is a slideshow: its value is a list of uploads (a single upload from before still works).
export const SITE_IMAGE_SLOTS = ["hero", "project", "advantages", "construction"];

const builtIn = {
  hero: heroBuilding,
  project: heroBuilding,
  advantages: advantagesVilla,
  construction: heroBuilding,
};

// Sample hero slides; the first one is placed for its sky (see Header.jsx).
const builtInHero = [heroBuilding, greenery, exteriorSunset, balconies, exteriorBeige];

/** { image, uploaded } for a slot, or null when it has no photo. */
export function siteImage(siteImages, slot) {
  const value = siteImages?.[slot];
  if (value?.src && value.width && value.height) return { image: value, uploaded: true };
  if (value === "built-in") return { image: builtIn[slot], uploaded: false };
  return null;
}

/** The hero slides as [{ image, uploaded }], empty when there is no photo. */
export function heroImages(siteImages) {
  const value = siteImages?.hero;
  if (value === "built-in") return builtInHero.map((image) => ({ image, uploaded: false }));
  return (Array.isArray(value) ? value : [value])
    .map((item) => siteImage({ hero: item }, "hero"))
    .filter(Boolean);
}
