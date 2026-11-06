"use client";

import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";

/**
 * OWASP A10 : erreur de rendu affichée sans détail technique.
 * Seul `error.digest` (identifiant opaque) permet la corrélation avec les journaux serveur.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-5 py-24 sm:px-10">
      <div className="max-w-2xl rounded-3xl border border-rule bg-paper p-8 sm:p-12">
        <h1 className="font-poster text-5xl font-black">{t("errors_page.title")}</h1>
        <p className="mt-5 text-lg text-muted">{t("errors_page.text")}</p>
        <Button onClick={reset} className="mt-8">
          {t("errors_page.retry")}
        </Button>
      </div>
    </main>
  );
}
