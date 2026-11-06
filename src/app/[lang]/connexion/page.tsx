import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "#/constants/routes";
import { getT, resolveLocale } from "#/i18n/server";
import { getDemoInfo } from "#/modules/auth/demo";
import { LoginView } from "#/modules/auth/views/LoginView";
import { readSession } from "#/utils/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/connexion">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.login_title"), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[lang]/connexion">) {
  const lang = await resolveLocale(params);
  if (await readSession()) redirect(routes.space(lang));
  const expired = (await searchParams).session === "expiree";
  return <LoginView lang={lang} demo={getDemoInfo()} expired={expired} />;
}
