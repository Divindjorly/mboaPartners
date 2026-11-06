"use client";

import { createI18n } from "#/i18n/createI18n";
import { DEFAULT_LOCALE } from "#/i18n/config";
import "./globals.css";

/** Dernier filet de sécurité (erreur dans le layout racine) : aucune information technique exposée. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = createI18n(DEFAULT_LOCALE);
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="grid min-h-screen place-items-center bg-paper px-5 text-center font-sans text-ink">
        <div>
          <h1 className="font-poster text-5xl font-black uppercase">{t("errors_page.title")}</h1>
          <p className="mt-4 text-muted">{t("errors_page.text")}</p>
          <button onClick={reset} className="mt-8 rounded-full bg-brand px-8 py-3 font-poster text-xl font-extrabold text-paper uppercase hover:bg-brand-deep">
            {t("errors_page.retry")}
          </button>
        </div>
      </body>
    </html>
  );
}
