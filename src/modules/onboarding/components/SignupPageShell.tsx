import type { ReactNode } from "react";
import { ImageSlot } from "#/components/ImageSlot";
import { NumberBadge } from "#/components/ui/NumberBadge";
import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import { IMAGES, type ImageKey } from "#/constants/images";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";

type Props = {
  lang: Locale;
  eyebrow: string;
  title: string;
  intro: string;
  perks: string[];
  image: ImageKey;
  children: ReactNode;
};

/**
 * Mise en page des inscriptions : colonne éditoriale (titre, photo, arguments)
 * à gauche, formulaire à droite.
 */
export function SignupPageShell({ lang, eyebrow, title, intro, perks, image, children }: Props) {
  const t = getT(lang);
  return (
    <>
      <SiteHeader lang={lang} />
      <main className="flex-1 bg-surface">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-10">
          <div className="flex items-center gap-3 border-b border-rule py-4 text-sm text-muted">
            <span>{eyebrow}</span>
          </div>

          <div className="grid gap-10 py-8 sm:py-12 lg:grid-cols-12 lg:gap-10 lg:py-16">
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <h1 className="font-poster text-[clamp(2.25rem,3.4vw,3.25rem)] font-black">{title}</h1>
                <p className="mt-5 text-lg leading-relaxed text-muted">{intro}</p>

                <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-[2rem] lg:block">
                  <ImageSlot
                    name={image}
                    alt={t(`images.${image}`)}
                    devHint={t("common.dev_image_hint", { name: image, recommended: IMAGES[image].recommended })}
                    sizes="30vw"
                  />
                </div>

                <p className="mt-8 font-poster text-xl font-extrabold">{t("onboarding.shell.perks_title")}</p>
                <ol className="mt-4 space-y-3">
                  {perks.map((perk, i) => (
                    <li key={perk} className="flex items-center gap-3 text-ink">
                      <NumberBadge size="sm">{i + 1}</NumberBadge>
                      {perk}
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t border-rule pt-5 text-sm text-muted">
                  <span className="font-semibold text-ink">{t("onboarding.shell.time_title")}</span> {t("onboarding.shell.time_text")}
                </p>
              </div>
            </aside>

            <div className="min-w-0 lg:col-span-7 lg:col-start-6">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
