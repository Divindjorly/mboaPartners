import type { Metadata } from "next";
import { getT, resolveLocale } from "#/i18n/server";
import { DeliveryCompanySignupView } from "#/modules/onboarding/views/DeliveryCompanySignupView";

export async function generateMetadata({ params }: PageProps<"/[lang]/inscription/livraison">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.fleet_title"), description: t("meta.fleet_description") };
}

export default async function DeliveryCompanySignupPage({ params }: PageProps<"/[lang]/inscription/livraison">) {
  const lang = await resolveLocale(params);
  return <DeliveryCompanySignupView lang={lang} />;
}
