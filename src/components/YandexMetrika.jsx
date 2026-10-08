"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Yandex.Metrika visitor counter for the public site (not the admin panel, not the
// "under construction" page). The init call below counts the first page load only; Next.js
// swaps pages without reloading after that, so every route change sends a separate "hit".
// Loaded only in production builds so local development doesn't pollute the statistics.
const COUNTER_ID = 111243482;

export default function YandexMetrika() {
  const pathname = usePathname();
  // The URL already counted by "init" (or by the previous "hit").
  const counted = useRef(null);

  useEffect(() => {
    const url = window.location.href;
    if (counted.current === null) {
      counted.current = url; // first load: counted by "init"
      return;
    }
    if (counted.current === url) return;
    counted.current = url;
    if (typeof window.ym === "function") window.ym(COUNTER_ID, "hit", url);
  }, [pathname]);

  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}', 'ym');

          ym(${COUNTER_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}
      </Script>
      <noscript>
        <div>
          {/* Tracking pixel, not content: next/image would route it through the optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
