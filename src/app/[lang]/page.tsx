import { resolveLocale } from "#/i18n/server";
import { HomeView } from "#/modules/landing/views/HomeView";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = await resolveLocale(params);
  return <HomeView lang={lang} />;
}
