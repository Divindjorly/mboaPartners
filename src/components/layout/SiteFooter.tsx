import Link from "next/link";
import { Logo } from "#/components/Logo";
import { StoreBadges } from "#/components/StoreBadges";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";

/** Pied de page (fond gris soutenu) : logo, applications à venir, liens utiles et mentions légales. */
export function SiteFooter({ lang }: { lang: Locale }) {
  const t = getT(lang);
  const columns = [
    {
      title: t("footer.become_partner"),
      links: [
        { href: routes.signupRestaurant(lang), label: t("footer.register_restaurant") },
        { href: routes.signupFleet(lang), label: t("footer.register_fleet") },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { href: routes.about(lang), label: t("footer.about") },
        { href: routes.section(lang, "etapes"), label: t("footer.how_it_works") },
        { href: routes.section(lang, "faq"), label: t("footer.faq") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [{ href: routes.privacy(lang), label: t("footer.privacy") }],
    },
  ];

  return (
    <footer className="mt-auto bg-surface-deep">
      <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-x-8 gap-y-10 px-5 py-12 sm:grid-cols-3 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:py-14">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Logo href={routes.home(lang)} alt={t("common.logo_alt")} linkLabel={t("common.logo_home")} className="-ml-[1.15rem] h-11 w-auto" />
          <p className="mt-4 max-w-sm leading-relaxed text-muted">{t("footer.tagline")}</p>

          <p className="mt-6 text-sm font-semibold">{t("footer.app_title")}</p>
          <div className="mt-3">
            <StoreBadges soonLabel={t("footer.app_soon")} appStoreLabel="App Store" playStoreLabel="Google Play" />
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-sm font-semibold tracking-wide text-muted uppercase">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-hover text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-3 px-5 py-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>{t("footer.copyright")}</p>
          <Link href={routes.privacy(lang)} className="link-hover">
            {t("footer.privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
