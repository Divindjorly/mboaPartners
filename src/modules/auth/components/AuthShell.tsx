import type { ReactNode } from "react";
import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import type { Locale } from "#/i18n/config";

/** Mise en page des écrans d'accès (connexion, mot de passe oublié) : colonne centrée sur fond gris. */
export function AuthShell({ lang, eyebrow, title, intro, children }: { lang: Locale; eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader lang={lang} />
      <main className="flex-1 bg-surface">
        <div className="mx-auto w-full max-w-xl px-5 py-10 sm:px-6 sm:py-16">
          <p className="inline-block rounded-full border border-ink/30 px-3 py-0.5 font-poster text-sm font-extrabold">{eyebrow}</p>
          <h1 className="mt-4 font-poster text-[clamp(2.25rem,3.4vw,3.25rem)] font-black text-balance">{title}</h1>
          <p className="mt-3 text-lg text-muted">{intro}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
