"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { LANGUAGE_COOKIE, LANGUAGE_COOKIE_MAX_AGE, LOCALES, isLocale, type Locale } from "./config";
import { getTranslatedErrorMessage } from "./translateError";

/**
 * Langue courante + changement de langue persistant (cookie `app_language`,
 * équivalent web de l'AsyncStorage de l'app mobile).
 */
export const useAppLanguage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const language = (isLocale(i18n.language) ? i18n.language : "fr") as Locale;

  const changeLanguage = (next: Locale) => {
    if (next === language) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
  };

  return {
    language,
    languages: LOCALES,
    changeLanguage,
    translateError: (failure: Parameters<typeof getTranslatedErrorMessage>[1]) => getTranslatedErrorMessage(t, failure),
  };
};
