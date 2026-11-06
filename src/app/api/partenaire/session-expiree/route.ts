import { NextResponse, type NextRequest } from "next/server";
import { routes } from "#/constants/routes";
import { DEFAULT_LOCALE, isLocale } from "#/i18n/config";
import { logger } from "#/utils/logger";
import { destroySession } from "#/utils/session";

/**
 * Session devenue inutilisable (compte introuvable, jeton refusé par l'API) : efface le cookie
 * puis renvoie vers la connexion. Une page (Server Component) ne peut pas modifier les cookies,
 * d'où ce passage par une route. Sans lui, /espace ↔ /connexion se renverraient la main en boucle.
 * Destination fixe (pas de paramètre d'URL libre) : aucune redirection ouverte.
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const locale = lang && isLocale(lang) ? lang : DEFAULT_LOCALE;
  await destroySession();
  logger.warn("security.session_invalid", { route: "session-expiree" });
  return NextResponse.redirect(new URL(`${routes.login(locale)}?session=expiree`, request.url), { headers: { "Cache-Control": "no-store" } });
}
