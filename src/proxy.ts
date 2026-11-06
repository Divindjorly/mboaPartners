import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LANGUAGE_COOKIE, isLocale, type Locale } from "#/i18n/config";

/**
 * Proxy (ex-middleware) exécuté avant chaque page :
 *  1. préfixe de langue : redirige "/" → "/fr" selon le cookie `app_language` puis Accept-Language ;
 *  2. Content-Security-Policy stricte avec nonce unique par requête
 *     (OWASP A05 Injection/XSS, A02 Misconfiguration). Les autres en-têtes
 *     de sécurité sont statiques et définis dans next.config.ts.
 */

const isDev = process.env.NODE_ENV === "development";

const buildCsp = (nonce: string): string =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Balises <style> : nonce (dev : inline pour le rechargement à chaud)
    `style-src-elem 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // Attributs style="" posés par next/image (positionnement) : sans risque d'exécution
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

const pickLocale = (request: NextRequest): Locale => {
  const fromCookie = request.cookies.get(LANGUAGE_COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0]?.trim().slice(0, 2).toLowerCase() ?? "");
  return accepted.find(isLocale) ?? DEFAULT_LOCALE;
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (!isLocale(firstSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
    url.search = search;
    return NextResponse.redirect(url, 307);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Exclut les routes API (JSON, pas de CSP ni de tampon de corps), fichiers statiques, images, icônes et préchargements
      source: "/((?!api/|_next/static|_next/image|icon.png|favicon.ico|robots.txt|images/|logo-).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
