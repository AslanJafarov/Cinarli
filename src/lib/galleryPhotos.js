import advantagesVilla from "../assets/advantages-villa.jpg";
import balconies from "../assets/gallery/balconies.jpg";
import balconyCafe from "../assets/gallery/balcony-cafe.jpg";
import balconyGarden from "../assets/gallery/balcony-garden.jpg";
import balconyGlass from "../assets/gallery/balcony-glass.jpg";
import bedroom from "../assets/gallery/bedroom.jpg";
import dining from "../assets/gallery/dining.jpg";
import exteriorBeige from "../assets/gallery/exterior-beige.jpg";
import exteriorGlass from "../assets/gallery/exterior-glass.jpg";
import exteriorSunset from "../assets/gallery/exterior-sunset.jpg";
import exteriorTerraces from "../assets/gallery/exterior-terraces.jpg";
import exteriorWhite from "../assets/gallery/exterior-white.jpg";
import greenery from "../assets/gallery/greenery.jpg";
import interior from "../assets/gallery/interior.jpg";
import kitchenGalley from "../assets/gallery/kitchen-galley.jpg";
import kitchenMarble from "../assets/gallery/kitchen-marble.jpg";
import livingBeige from "../assets/gallery/living-beige.jpg";
import livingGreenSofa from "../assets/gallery/living-green-sofa.jpg";
import livingKitchen from "../assets/gallery/living-kitchen.jpg";
import livingRoom from "../assets/gallery/living-room.jpg";
import plan from "../assets/gallery/plan.jpg";
import tower from "../assets/gallery/tower.jpg";
import heroBuilding from "../assets/hero-building.jpg";

// `key` in gallery.photos (src/data/mock.js) → image file for the /qalereya page.
export const galleryImageFiles = {
  hero: heroBuilding,
  villa: advantagesVilla,
  tower,
  balconies,
  interior,
  plan,
  greenery,
  exteriorSunset,
  exteriorGlass,
  exteriorTerraces,
  exteriorBeige,
  exteriorWhite,
  balconyGarden,
  balconyCafe,
  balconyGlass,
  livingRoom,
  livingKitchen,
  livingGreenSofa,
  livingBeige,
  bedroom,
  kitchenMarble,
  kitchenGalley,
  dining,
};

/**
 * Image for a gallery photo: a built-in file by `key`, or an admin upload
 * ({ src, width, height } served from /media). Null when neither exists.
 */
export function photoImage(photo) {
  if (photo?.src && photo.width && photo.height) {
    return { src: photo.src, width: photo.width, height: photo.height };
  }
  return galleryImageFiles[photo?.key] ?? null;
}

// Built-in files carry a tiny blurred preview; uploads don't.
export const blurPlaceholder = (image) => (image?.blurDataURL ? "blur" : "empty");

/** Photos that have an image, each with its `image` attached. */
export const photosWithImages = (photos = []) =>
  photos.map((photo) => ({ ...photo, image: photoImage(photo) })).filter((photo) => photo.image);
