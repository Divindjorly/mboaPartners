import { ImageSlot } from "#/components/ImageSlot";
import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import { CONGO_CITIES } from "#/constants/geography";
import { IMAGES } from "#/constants/images";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { NumberBadge } from "#/components/ui/NumberBadge";
import { ChapterHeading } from "#/modules/landing/components/ChapterHeading";
import { Closing } from "#/modules/landing/components/Closing";

/** Ordre éditorial imposé : clients, puis commerces, puis livraison. */
const PILLARS = ["customers", "merchants", "delivery"] as const;
const VALUES = ["accessible", "reliable", "local"] as const;
const IMAGE = "signupRestaurant" as const;

/** Page « À propos » : ambition, trois piliers, façon de faire, villes, puis le bandeau d'inscription. */
export function AboutView({ lang }: { lang: Locale }) {
  const t = getT(lang);

  return (
    <>
      <SiteHeader lang={lang} current="about" />
      <main className="flex-1">
        {/* Ouverture */}
        <section className="mx-auto max-w-[90rem] px-5 pt-10 pb-16 sm:px-10 sm:pt-16 sm:pb-24">
          <p className="inline-block rounded-full border border-ink/30 px-3 py-0.5 font-poster text-sm font-extrabold">{t("about.eyebrow")}</p>
          <h1 className="mt-5 max-w-4xl font-poster text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.95] font-black text-balance">{t("about.title")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{t("about.intro")}</p>
          <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[2rem] sm:aspect-[16/9] lg:aspect-[21/9]">
            <ImageSlot
              name={IMAGE}
              alt={t(`images.${IMAGE}`)}
              devHint={t("common.dev_image_hint", { name: IMAGE, recommended: IMAGES[IMAGE].recommended })}
              sizes="(min-width: 1440px) 1360px, 100vw"
              priority
            />
          </div>
        </section>

        {/* 01 Ambition */}
        <section className="mx-auto max-w-[90rem] px-5 pb-16 sm:px-10 sm:pb-24">
          <ChapterHeading title={t("about.ambition.title")} />
          <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-12">
            <p className="font-poster text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.05] font-extrabold lg:col-span-5">{t("about.ambition.lead")}</p>
            <p className="text-lg leading-relaxed text-muted lg:col-span-7">{t("about.ambition.text")}</p>
          </div>
        </section>

        {/* 02 Piliers */}
        <section className="bg-surface">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
            <ChapterHeading title={t("about.pillars.title")} />
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {PILLARS.map((key, i) => (
                <li key={key} className="flex flex-col rounded-3xl bg-paper p-7 sm:p-8">
                  <NumberBadge size="lg">{i + 1}</NumberBadge>
                  <h3 className="mt-6 font-poster text-2xl font-extrabold">{t(`about.pillars.${key}.title`)}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{t(`about.pillars.${key}.text`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 03 Façon de faire */}
        <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
          <ChapterHeading title={t("about.values.title")} />
          <ul className="mt-10 grid gap-x-10 gap-y-8 border-t border-rule pt-10 md:grid-cols-3">
            {VALUES.map((key) => (
              <li key={key}>
                <p className="font-poster text-xl font-extrabold">{t(`about.values.${key}.title`)}</p>
                <p className="mt-2 leading-relaxed text-muted">{t(`about.values.${key}.text`)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 04 Villes */}
        <section className="bg-surface">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
            <ChapterHeading title={t("about.cities.title")} />
            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
              <p className="text-lg leading-relaxed text-muted lg:col-span-5">{t("about.cities.text")}</p>
              <div className="lg:col-span-7">
                <p className="text-sm font-semibold tracking-wide text-muted uppercase">{t("about.cities.label")}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {CONGO_CITIES.map((city) => (
                    <li key={city} className="rounded-full border border-ink/15 bg-paper px-4 py-2 font-semibold">
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Closing
          title={[t("home.closing.title_1"), t("home.closing.title_2")]}
          text={t("home.closing.text")}
          restaurant={{ href: routes.signupRestaurant(lang), label: t("home.closing.restaurant") }}
          fleet={{ href: routes.signupFleet(lang), label: t("home.closing.fleet") }}
        />
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
