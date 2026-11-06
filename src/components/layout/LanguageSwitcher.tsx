"use client";

import { useTranslation } from "react-i18next";
import { useAppLanguage } from "#/i18n/useAppLanguage";

/** Sélecteur de langue « FR / EN » façon ours de magazine. */
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, languages, changeLanguage } = useAppLanguage();

  return (
    <div role="group" aria-label={t("common.language")} className="flex items-center gap-1.5 text-sm">
      {languages.map((lng, i) => (
        <span key={lng} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-muted">/</span>}
          <button
            type="button"
            onClick={() => changeLanguage(lng)}
            aria-pressed={lng === language}
            aria-label={t(`common.languages.${lng}`)}
            className={lng === language ? "font-semibold text-ink underline underline-offset-4" : "text-muted hover:text-ink"}
          >
            {lng.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
