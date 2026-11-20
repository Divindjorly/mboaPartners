import type { Metadata } from "next";
import { headers } from "next/headers";
import { env } from "#/config/env";
import { getT, resolveLocale } from "#/i18n/server";
import { RestaurantSignupView } from "#/modules/onboarding/views/RestaurantSignupView";

export async function generateMetadata({ params }: PageProps<"/[lang]/inscription/restaurant">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.restaurant_title"), description: t("meta.restaurant_description") };
}

export default async function RestaurantSignupPage({ params }: PageProps<"/[lang]/inscription/restaurant">) {
  const lang = await resolveLocale(params);
  const maps = env.GOOGLE_MAPS_API_KEY
    ? { apiKey: env.GOOGLE_MAPS_API_KEY, mapId: env.GOOGLE_MAPS_MAP_ID, nonce: (await headers()).get("x-nonce") ?? undefined }
    : null;
  return <RestaurantSignupView lang={lang} maps={maps} />;
}
