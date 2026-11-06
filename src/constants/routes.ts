import type { Locale } from "#/i18n/config";

/** Routes de l'application, toujours préfixées par la langue. */
export const routes = {
  home: (lang: Locale) => `/${lang}`,
  section: (lang: Locale, id: "restaurants" | "livraison" | "etapes" | "faq" | "devenir-partenaire") => `/${lang}#${id}`,
  signupRestaurant: (lang: Locale) => `/${lang}/inscription/restaurant`,
  signupFleet: (lang: Locale) => `/${lang}/inscription/livraison`,
  privacy: (lang: Locale) => `/${lang}/confidentialite`,
  about: (lang: Locale) => `/${lang}/a-propos`,
  login: (lang: Locale) => `/${lang}/connexion`,
  forgotPassword: (lang: Locale) => `/${lang}/mot-de-passe-oublie`,
  space: (lang: Locale) => `/${lang}/espace`,
} as const;

/** Route API d'envoi des pièces (hors préfixe de langue, exclue du proxy). */
export const DOCUMENT_UPLOAD_ENDPOINT = "/api/partenaire/documents";

/** Efface une session devenue invalide puis renvoie vers la connexion. */
export const sessionExpiredHref = (lang: Locale) => `/api/partenaire/session-expiree?lang=${lang}`;
