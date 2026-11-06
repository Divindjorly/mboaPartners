import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import { IMAGES, type ImageKey } from "#/constants/images";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { Closing } from "../components/Closing";
import { FaqChapter } from "../components/FaqChapter";
import { FeatureChapter } from "../components/FeatureChapter";
import { HomeHero } from "../components/HomeHero";
import { StepsChapter } from "../components/StepsChapter";

const RESTAURANT_POINTS = ["orders", "delivery", "payments", "control"] as const;
const FLEET_POINTS = ["invite", "tracking", "manage", "dashboard"] as const;
const STEPS = ["signup", "verify", "review", "launch"] as const;
const FAQ = ["cost", "documents", "riders", "cities", "code"] as const;

export function HomeView({ lang }: { lang: Locale }) {
  const t = getT(lang);
  const image = (name: ImageKey) => ({
    name,
    alt: t(`images.${name}`),
    devHint: t("common.dev_image_hint", { name, recommended: IMAGES[name].recommended }),
  });

  return (
    <>
      <SiteHeader lang={lang} tone="accent" />
      <main className="flex-1">
        <HomeHero lang={lang} />

        <FeatureChapter
          id="restaurants"
          title={t("home.restaurants.title")}
          lead={t("home.restaurants.lead")}
          caption={t("home.restaurants.caption")}
          image={image("restaurant")}
          points={RESTAURANT_POINTS.map((k) => ({ title: t(`home.restaurants.points.${k}.title`), text: t(`home.restaurants.points.${k}.text`) }))}
          cta={{ href: routes.signupRestaurant(lang), label: t("home.restaurants.cta") }}
        />

        <FeatureChapter
          id="livraison"
          alternate
          title={t("home.fleet.title")}
          lead={t("home.fleet.lead")}
          caption={t("home.fleet.caption")}
          image={image("fleet")}
          points={FLEET_POINTS.map((k) => ({ title: t(`home.fleet.points.${k}.title`), text: t(`home.fleet.points.${k}.text`) }))}
          cta={{ href: routes.signupFleet(lang), label: t("home.fleet.cta") }}
        />

        <StepsChapter
          title={t("home.steps.title")}
          steps={STEPS.map((k) => ({ title: t(`home.steps.${k}.title`), text: t(`home.steps.${k}.text`) }))}
          cta={{ href: routes.section(lang, "devenir-partenaire"), label: t("home.steps.cta") }}
        />

        <FaqChapter title={t("home.faq.title")} items={FAQ.map((k) => ({ q: t(`home.faq.${k}.q`), a: t(`home.faq.${k}.a`) }))} />

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
