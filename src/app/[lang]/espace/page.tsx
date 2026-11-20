import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { env } from "#/config/env";
import { routes, sessionExpiredHref } from "#/constants/routes";
import { getT, resolveLocale } from "#/i18n/server";
import { loadSpaceFlow } from "#/modules/space/flows/application.flow";
import { SpaceView } from "#/modules/space/views/SpaceView";
import { resolveClientIp } from "#/utils/clientIp";
import { readSession } from "#/utils/session";

export async function generateMetadata({ params }: PageProps<"/[lang]/espace">): Promise<Metadata> {
  const t = getT(await resolveLocale(params));
  return { title: t("meta.space_title"), robots: { index: false } };
}

/** Page protégée : sans session valide, retour à la connexion (contrôle côté serveur). */
export default async function SpacePage({ params }: PageProps<"/[lang]/espace">) {
  const lang = await resolveLocale(params);
  const h = await headers();
  const data = await loadSpaceFlow({ requestId: randomUUID(), clientIp: resolveClientIp(h), userAgent: h.get("user-agent")?.slice(0, 400) ?? undefined, locale: lang });
  if (!data) {
    // Cookie présent mais inutilisable → on l'efface d'abord, sinon /connexion renverrait ici en boucle
    redirect((await readSession()) ? sessionExpiredHref(lang) : routes.login(lang));
  }

  const platformUrl = data.profile.partnerType === "MERCHANT" ? env.MERCHANT_PLATFORM_URL : env.FLEET_PANEL_URL;
  return <SpaceView lang={lang} profile={data.profile} application={data.application} inbox={data.inbox} platformUrl={platformUrl} />;
}
