import { translate } from "../i18n/format";
import { getI18n } from "../i18n/server";
import { getNearbyPlaces, hasNearbyApiKey } from "../lib/nearby";
import NearbyMap from "./NearbyMap";

// Live nearest places + walking minutes; falls back to the typed values in mock.js.
async function loadNearby(address, nearby) {
  if (!hasNearbyApiKey()) return null;
  try {
    return await getNearbyPlaces(
      address,
      nearby.map(({ key, types }) => ({ key, types })),
    );
  } catch (error) {
    console.error("[LocationSection] Nearby lookup failed:", error);
    return null;
  }
}

export default async function LocationSection() {
  const { locale, content } = await getI18n();
  const { title, description, address, origin, nearbyTitle, nearby, routeLabel } =
    content.locationInfo;
  const { ui } = content;

  const live = await loadNearby(address, nearby);

  const places = nearby.map((place) => {
    const found = live?.places.find((item) => item.key === place.key);
    return {
      key: place.key,
      label: place.label,
      time: found?.minutes
        ? translate(ui.common.minutes, { count: found.minutes }, locale)
        : place.time,
      name: found?.name ?? place.name ?? null,
      location: found?.location ?? place.location ?? null,
      polyline: found?.polyline ?? null,
    };
  });

  return (
    <section
      id="yerlesme"
      className="w-full scroll-mt-(--nav-h) bg-[#f6f5f0] pb-[clamp(48px,3.4vw,68px)] px-page pt-[clamp(32px,2vw,40px)] text-[#1a2a22]"
    >
      {/* Heading */}
      <h2 className="text-[clamp(34px,4vw,76px)] leading-[1.15]">{title}</h2>
      <p className="mt-[clamp(8px,0.7vw,14px)] text-[clamp(15px,1.3vw,25px)] leading-tight text-[#6c6b65]">
        {description}
      </p>

      <NearbyMap
        address={address}
        origin={live?.origin ?? origin}
        places={places}
        nearbyTitle={nearbyTitle}
        routeLabel={routeLabel}
        locale={locale}
        mapTitle={translate(ui.location.mapTitle, { address })}
      />
    </section>
  );
}
