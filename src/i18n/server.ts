import "server-only";

import type { TFunction } from "i18next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { createI18n } from "./createI18n";

const cache = new Map<Locale, TFunction>();

/** Fonction de traduction pour les Server Components. */
export const getT = (locale: Locale): TFunction => {
  const cached = cache.get(locale);
  if (cached) return cached;
  const t = createI18n(locale).t;
  cache.set(locale, t);
  return t;
};

/** Valide le segment `[lang]` de l'URL (404 si la langue n'est pas prise en charge). */
export const resolveLocale = async (params: Promise<{ lang: string }>): Promise<Locale> => {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
};
