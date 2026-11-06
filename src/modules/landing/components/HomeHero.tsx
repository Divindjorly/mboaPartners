import { ImageSlot } from "#/components/ImageSlot";
import { ButtonLink } from "#/components/ui/Button";
import { Wave } from "#/components/Wave";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";

/**
 * Page de garde inspirée de Glovo, aux couleurs Mboa :
 * aplat jaune du logo, photo ronde à gauche, titre à droite, bord inférieur arrondi.
 * Seules couleurs : jaune, encre, vert (MBOA + bouton principal) et blanc.
 */
export function HomeHero({ lang }: { lang: Locale }) {
  const t = getT(lang);

  return (
    <section className="bg-accent-soft">
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 px-5 pt-8 pb-8 sm:px-10 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-16">
        {/* Texte */}
        <div className="min-w-0 text-center lg:text-left">
          <p className="inline-block rounded-full bg-paper px-4 py-1 font-poster text-lg font-extrabold text-ink sm:text-xl">
            {t("home.hero.sticker")}
          </p>
          <h1 className="mt-5 font-poster text-ink">
            <span className="block text-[clamp(2.25rem,4vw,3.75rem)] font-black">{t("home.hero.title")}</span>
            <span className="block text-[clamp(3.75rem,7.5vw,6.5rem)] leading-[0.85] font-black text-brand">{t("home.hero.brand")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg font-medium text-ink/80 lg:mx-0">{t("home.hero.subtitle")}</p>

          <div id="devenir-partenaire" className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
            <ButtonLink href={routes.signupRestaurant(lang)} size="lg">
              {t("home.hero.cta_restaurant")}
            </ButtonLink>
            <ButtonLink href={routes.signupFleet(lang)} size="lg" variant="outline">
              {t("home.hero.cta_fleet")}
            </ButtonLink>
          </div>
        </div>
        {/* Visuel : photo ronde */}
        <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[24rem] lg:order-first lg:max-w-[34rem]">
          <div className="relative aspect-square overflow-hidden rounded-full border-8 border-paper bg-surface">
            <ImageSlot name="hero" alt={t("images.hero")} priority sizes="(min-width: 1024px) 34rem, 90vw" />
          </div>
        </div>

      </div>
      <Wave className="-mb-px text-paper" />
    </section>
  );
}
