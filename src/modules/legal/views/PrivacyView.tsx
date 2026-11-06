import Link from "next/link";
import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import { LEGAL } from "#/constants/legal";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";

const SECTIONS = ["controller", "data", "purposes", "basis", "recipients", "retention", "security", "cookies", "rights"] as const;

/** Politique de confidentialité : texte décrivant les traitements réellement effectués par le site. */
export function PrivacyView({ lang }: { lang: Locale }) {
  const t = getT(lang);
  const updatedAt = new Intl.DateTimeFormat(lang, { dateStyle: "long", timeZone: "UTC" }).format(new Date(LEGAL.privacyUpdatedAt));

  return (
    <>
      <SiteHeader lang={lang} />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-5 py-16 sm:px-10 sm:py-20">
          <h1 className="font-poster text-[clamp(2.25rem,3.4vw,3.25rem)] font-black">{t("privacy.title")}</h1>
          <p className="mt-3 text-sm text-muted">{t("privacy.updated", { date: updatedAt })}</p>
          <p className="mt-8 text-lg leading-relaxed">{t("privacy.intro")}</p>

          <div className="mt-12 divide-y divide-rule border-y border-rule">
            {SECTIONS.map((key, i) => {
              const items = t(`privacy.${key}.items`, { returnObjects: true, defaultValue: [] }) as unknown;
              return (
                <section key={key} className="py-8">
                  <h2 className="font-poster text-2xl font-extrabold">
                    <span className="mr-2 text-brand">{i + 1}.</span>
                    {t(`privacy.${key}.title`)}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted">{t(`privacy.${key}.text`, { email: LEGAL.privacyContactEmail })}</p>
                  {Array.isArray(items) && items.length > 0 && (
                    <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-brand">
                      {items.map((item) => (
                        <li key={String(item)}>{String(item)}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-10 leading-relaxed">
            {t("privacy.contact")}{" "}
            <a href={`mailto:${LEGAL.privacyContactEmail}`} className="link-underline font-semibold text-brand">
              {LEGAL.privacyContactEmail}
            </a>
          </p>
          <Link href={routes.home(lang)} className="link-hover mt-10 inline-block text-sm text-muted">
            ← {t("common.back_home")}
          </Link>
        </article>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
