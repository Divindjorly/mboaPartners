"use client";

import { useTranslation } from "react-i18next";
import { ButtonLink } from "#/components/ui/Button";
import { routes } from "#/constants/routes";
import { useAppLanguage } from "#/i18n/useAppLanguage";

export default function NotFound() {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-5 py-24 sm:px-10">
      <div className="max-w-2xl rounded-3xl border border-rule bg-paper p-8 sm:p-12">
        <h1 className="font-poster text-5xl font-black">{t("errors_page.not_found_title")}</h1>
        <p className="mt-5 text-lg text-muted">{t("errors_page.not_found_text")}</p>
        <ButtonLink href={routes.home(language)} className="mt-8">
          {t("common.back_home")}
        </ButtonLink>
      </div>
    </main>
  );
}
