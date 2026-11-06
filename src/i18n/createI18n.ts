import { createInstance, type i18n as I18nInstance } from "i18next";
import en from "#/locales/en.json";
import fr from "#/locales/fr.json";
import { DEFAULT_LOCALE, type Locale } from "./config";

export const RESOURCES = {
  fr: { translation: fr },
  en: { translation: en },
} as const;

/**
 * Crée une instance i18next isolée (une par requête serveur ou par arbre client),
 * initialisée de façon synchrone avec les ressources embarquées.
 */
export const createI18n = (locale: Locale): I18nInstance => {
  const instance = createInstance();
  void instance.init({
    resources: RESOURCES,
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    initAsync: false,
    // React échappe déjà le rendu (OWASP A05 : pas de double échappement ni d'HTML injecté)
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
};
