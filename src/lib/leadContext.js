// Browser-only. Where a visitor came from, sent along with their lead: the ad campaign (UTM)
// and page of their first visit, remembered for this browser.
const KEY = "cinarli-first-visit";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

export function leadContext() {
  let first = null;
  try {
    first = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
  } catch {
    // Storage blocked: fall back to the current page.
  }

  const params = new URLSearchParams(window.location.search);
  const utmNow = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)]).filter(([, value]) => value),
  );

  // A new campaign link replaces the remembered one.
  if (!first || Object.keys(utmNow).length > 0) {
    first = { utm: utmNow, landingPage: window.location.pathname };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(first));
    } catch {
      // Not remembered; still sent with this lead.
    }
  }
  return first;
}
