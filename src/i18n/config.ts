export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Même clé que l'app mobile (AsyncStorage `app_language`), ici en cookie. */
export const LANGUAGE_COOKIE = "app_language";
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);
