"use client";

import { useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import type { Locale } from "./config";
import { createI18n } from "./createI18n";

/**
 * Fournit `useTranslation()` aux Client Components, dans la langue de l'URL.
 * Le layout le monte avec `key={locale}` : un changement de langue recrée l'instance.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [i18n] = useState(() => createI18n(locale));
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
