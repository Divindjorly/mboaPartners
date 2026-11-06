import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { connection } from "next/server";
import { ScrollToTopOnNavigate } from "#/components/layout/ScrollToTopOnNavigate";
import { I18nProvider } from "#/i18n/I18nProvider";
import { LOCALES } from "#/i18n/config";
import { getT, resolveLocale } from "#/i18n/server";
import "../globals.css";

/**
 * Une seule famille typographique pour tout le site : Barlow.
 * - Barlow : texte courant ;
 * - Barlow Condensed : titres et boutons (capitales condensées façon affiche).
 */
const body = Barlow({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const poster = Barlow_Condensed({ variable: "--font-poster", subsets: ["latin"], weight: ["700", "800", "900"], style: ["normal", "italic"] });

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const lang = await resolveLocale(params);
  const t = getT(lang);
  return {
    title: { default: t("meta.home_title"), template: `%s · ${t("meta.site_name")}` },
    description: t("meta.home_description"),
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])) },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  // Rendu dynamique : nécessaire au nonce CSP généré par requête (src/proxy.ts)
  await connection();
  const lang = await resolveLocale(params);

  return (
    <html lang={lang} className={`${body.variable} ${poster.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <ScrollToTopOnNavigate />
        <I18nProvider key={lang} locale={lang}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
