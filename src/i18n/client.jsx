"use client";

import { createContext, useContext } from "react";

const I18nContext = createContext(null);

// The [lang] layout passes the content in, because it comes from the admin panel's saved data
// on the server (see src/i18n/content.js) and can change without a new build.
export function I18nProvider({ locale, content, children }) {
  return <I18nContext value={{ locale, content }}>{children}</I18nContext>;
}

// Client Components under the [lang] layout.
export function useI18n() {
  return useContext(I18nContext);
}
