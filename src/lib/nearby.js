import { unstable_cache } from "next/cache";

// Server-only: this key never reaches the browser (no NEXT_PUBLIC_ prefix).
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const SEARCH_RADIUS_METERS = 5000;
const ONE_WEEK = 60 * 60 * 24 * 7;

async function googlePost(url, fieldMask, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=az&key=${API_KEY}`;
  const data = await fetch(url).then((res) => res.json());
  if (data.status !== "OK") {
    throw new Error(`Geocoding failed: ${data.status} ${data.error_message ?? ""}`);
  }
  return data.results[0].geometry.location; // { lat, lng }
}

const toLatLng = ({ lat, lng }) => ({ latitude: lat, longitude: lng });

async function findNearest(origin, types) {
  const data = await googlePost(
    "https://places.googleapis.com/v1/places:searchNearby",
    "places.displayName,places.location",
    {
      includedTypes: types,
      maxResultCount: 1,
      rankPreference: "DISTANCE",
      languageCode: "az",
      locationRestriction: {
        circle: { center: toLatLng(origin), radius: SEARCH_RADIUS_METERS },
      },
    },
  );
  const place = data.places?.[0];
  if (!place) return null;
  return {
    name: place.displayName?.text ?? null,
    location: { lat: place.location.latitude, lng: place.location.longitude },
  };
}

async function walkingRoute(origin, destination) {
  const data = await googlePost(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    {
      origin: { location: { latLng: toLatLng(origin) } },
      destination: { location: { latLng: toLatLng(destination) } },
      travelMode: "WALK",
      languageCode: "az",
      units: "METRIC",
    },
  );
  const route = data.routes?.[0];
  if (!route) return null;
  const seconds = Number.parseInt(route.duration, 10); // e.g. "372s"
  return {
    minutes: Math.max(1, Math.round(seconds / 60)),
    distanceMeters: route.distanceMeters,
    polyline: route.polyline?.encodedPolyline ?? null,
  };
}

/**
 * Nearest place per category plus walking time from the address.
 * Cached for a week — the building doesn't move. Errors are thrown (and not cached).
 */
export const getNearbyPlaces = unstable_cache(
  async (address, categories) => {
    const origin = await geocode(address);

    const places = await Promise.all(
      categories.map(async ({ key, types }) => {
        const nearest = await findNearest(origin, types);
        if (!nearest) return { key, name: null, location: null, minutes: null, polyline: null };
        const route = await walkingRoute(origin, nearest.location);
        return {
          key,
          name: nearest.name,
          location: nearest.location,
          minutes: route?.minutes ?? null,
          polyline: route?.polyline ?? null,
        };
      }),
    );

    return { origin, places };
  },
  ["nearby-places-v1"],
  { revalidate: ONE_WEEK },
);

export const hasNearbyApiKey = () => Boolean(API_KEY);
