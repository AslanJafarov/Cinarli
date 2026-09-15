"use client";

import { useEffect, useRef, useState } from "react";

const BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

let mapsPromise;

// Loads the Maps JavaScript API once per page.
function loadGoogleMaps(language) {
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);

  mapsPromise ??= new Promise((resolve, reject) => {
    const callback = "__cinarliMapsReady";
    window[callback] = () => resolve(window.google.maps);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(BROWSER_KEY)}&v=weekly&loading=async&language=${language}&callback=${callback}`;
    script.async = true;
    script.onerror = () => {
      mapsPromise = undefined;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.append(script);
  });

  return mapsPromise;
}

function buildingPin() {
  const pin = document.createElement("div");
  pin.className =
    "rounded-[12px] bg-[#12271e] px-3 py-2 text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-white shadow-lg";
  for (const word of ["Çınarlı", "Park"]) {
    const line = document.createElement("span");
    line.className = "block";
    line.textContent = word;
    pin.append(line);
  }
  return pin;
}

function placePin() {
  const pin = document.createElement("div");
  pin.className =
    "size-[18px] rounded-full border-[3px] border-white bg-[#24503a] shadow-md";
  return pin;
}

export default function NearbyMap({
  address,
  origin,
  places,
  nearbyTitle,
  routeLabel,
  locale,
  mapTitle,
}) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const [activeKey, setActiveKey] = useState(null);
  const [status, setStatus] = useState(BROWSER_KEY ? "loading" : "embed");

  const query = encodeURIComponent(address);
  const active = places.find((place) => place.key === activeKey);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  // Keyless fallback: Google's embed draws the walking route between the two points.
  const originParam = `${origin.lat},${origin.lng}`;
  let embedSrc = `https://maps.google.com/maps?q=${originParam}&z=16&hl=${locale}&output=embed`;
  if (active?.location) {
    const { lat, lng } = active.location;
    embedSrc = `https://maps.google.com/maps?saddr=${originParam}&daddr=${lat},${lng}&dirflg=w&hl=${locale}&output=embed`;
  }

  // Create the interactive map.
  useEffect(() => {
    if (!BROWSER_KEY || !origin) return;
    let cancelled = false;

    (async () => {
      const maps = await loadGoogleMaps(locale);
      const [{ Map, Polyline }, { AdvancedMarkerElement }, { encoding }, { LatLngBounds }] =
        await Promise.all([
          maps.importLibrary("maps"),
          maps.importLibrary("marker"),
          maps.importLibrary("geometry"),
          maps.importLibrary("core"),
        ]);
      if (cancelled) return;

      const map = new Map(mapEl.current, {
        center: origin,
        zoom: 15,
        mapId: MAP_ID,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        clickableIcons: false,
        gestureHandling: "cooperative",
      });

      new AdvancedMarkerElement({
        map,
        position: origin,
        content: buildingPin(),
        title: "Çınarlı Park",
        zIndex: 10,
      });

      mapRef.current = { map, Polyline, AdvancedMarkerElement, encoding, LatLngBounds };
      setStatus("ready");
    })().catch((error) => {
      console.error("[NearbyMap]", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
    };
  }, [origin, locale]);

  // Draw the walking route to the selected place.
  useEffect(() => {
    const google = mapRef.current;
    if (status !== "ready" || !google) return;
    const { map, Polyline, AdvancedMarkerElement, encoding, LatLngBounds } = google;

    const place = places.find((item) => item.key === activeKey);
    if (!place?.location) {
      map.panTo(origin);
      map.setZoom(15);
      return;
    }

    const path = place.polyline
      ? encoding.decodePath(place.polyline)
      : [origin, place.location];

    const route = new Polyline({
      map,
      path,
      strokeColor: "#24503a",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    });
    const marker = new AdvancedMarkerElement({
      map,
      position: place.location,
      content: placePin(),
      title: place.name ?? place.label,
    });

    const bounds = new LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    bounds.extend(origin);
    map.fitBounds(bounds, 64);

    return () => {
      route.setMap(null);
      marker.map = null;
    };
  }, [activeKey, status, places, origin]);

  const useEmbed = status === "embed" || status === "error";

  return (
    <div className="mt-[clamp(28px,3.3vw,64px)] grid gap-[clamp(28px,3.5vw,68px)] lg:grid-cols-[minmax(0,62fr)_minmax(0,27fr)] lg:items-start">
      {/* Map */}
      <div className="relative isolate aspect-[1240/670] w-full max-w-full overflow-hidden rounded-[clamp(18px,2vw,40px)] bg-white max-md:aspect-[4/3]">
        {useEmbed ? (
          <iframe
            title={mapTitle}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <>
            <div ref={mapEl} className="absolute inset-0" />
            {status === "loading" && (
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-[#e9e7e1]" />
            )}
          </>
        )}
      </div>

      {/* Nearby places */}
      <div>
        <h3 className="text-[clamp(22px,1.8vw,35px)] leading-tight">{nearbyTitle}</h3>

        <ul className="mt-[clamp(14px,1.4vw,28px)] flex flex-col gap-[clamp(12px,1.2vw,24px)]">
          {places.map((place) => {
            const isActive = place.key === activeKey;
            return (
              <li key={place.key}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveKey(isActive ? null : place.key)}
                  className={`flex h-[clamp(64px,4.4vw,84px)] w-full cursor-pointer items-center gap-[clamp(14px,1.2vw,24px)] rounded-[clamp(16px,1.2vw,24px)] pl-[clamp(16px,1.2vw,24px)] pr-[clamp(20px,3.25vw,62px)] text-left transition-colors duration-300 ease-butter ${
                    isActive
                      ? "bg-[#24503a] text-white"
                      : "bg-white text-[#1a2a22] hover:bg-[#fbfaf7]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-[clamp(34px,2.3vw,44px)] shrink-0 rounded-full transition-colors duration-300 ease-butter ${
                      isActive ? "bg-[#e8e1cd]" : "bg-[#24503a]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[clamp(15px,1.1vw,21px)] leading-tight">
                      {place.label}
                    </span>
                    {place.name && (
                      <span
                        className={`mt-[0.2em] block truncate text-[clamp(11px,0.8vw,15px)] leading-tight ${
                          isActive ? "text-white/70" : "text-[#6c6b66]"
                        }`}
                      >
                        {place.name}
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-[clamp(13px,0.95vw,18px)] ${
                      isActive ? "text-white/90" : "text-[#2a5a40]"
                    }`}
                  >
                    {place.time}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-[clamp(20px,2.2vw,44px)] flex h-[clamp(52px,3.8vw,72px)] cursor-pointer items-center justify-center rounded-full bg-[#12271e] px-6 text-[clamp(13px,0.95vw,18px)] uppercase tracking-[0.02em] text-[#f0ede6]"
        >
          {routeLabel}
        </a>
      </div>
    </div>
  );
}
