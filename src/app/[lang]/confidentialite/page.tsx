import type { Metadata } from "next";
import { getT, resolveLocale } from "#/i18n/server";
import { PrivacyView } from "#/modules/legal/views/PrivacyView";

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialite">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.privacy_title"), description: t("meta.privacy_description") };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/confidentialite">) {
  const lang = await resolveLocale(params);
  return <PrivacyView lang={lang} />;
}
