import type { Metadata } from "next";
import { getT, resolveLocale } from "#/i18n/server";
import { getDemoInfo } from "#/modules/auth/demo";
import { ForgotPasswordView } from "#/modules/auth/views/ForgotPasswordView";

export async function generateMetadata({ params }: PageProps<"/[lang]/mot-de-passe-oublie">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.reset_title"), robots: { index: false } };
}

export default async function ForgotPasswordPage({ params }: PageProps<"/[lang]/mot-de-passe-oublie">) {
  const lang = await resolveLocale(params);
  return <ForgotPasswordView lang={lang} demoCode={getDemoInfo()?.code ?? null} />;
}
