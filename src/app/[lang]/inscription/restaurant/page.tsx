import type { Metadata } from "next";
import { getT, resolveLocale } from "#/i18n/server";
import { RestaurantSignupView } from "#/modules/onboarding/views/RestaurantSignupView";

export async function generateMetadata({ params }: PageProps<"/[lang]/inscription/restaurant">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.restaurant_title"), description: t("meta.restaurant_description") };
}

export default async function RestaurantSignupPage({ params }: PageProps<"/[lang]/inscription/restaurant">) {
  const lang = await resolveLocale(params);
  return <RestaurantSignupView lang={lang} />;
}
