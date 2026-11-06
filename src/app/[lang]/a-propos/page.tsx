import type { Metadata } from "next";
import { getT, resolveLocale } from "#/i18n/server";
import { AboutView } from "#/modules/about/views/AboutView";

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.about_title"), description: t("meta.about_description") };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const lang = await resolveLocale(params);
  return <AboutView lang={lang} />;
}
