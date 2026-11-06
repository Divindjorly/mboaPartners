import Link from "next/link";
import { Logo } from "#/components/Logo";
import { ButtonLink } from "#/components/ui/Button";
import { routes } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { readSession } from "#/utils/session";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";

type Props = {
  lang: Locale;
  /** "accent" : en-tête fondu dans la couverture jaune de l'accueil. */
  tone?: "paper" | "accent";
  /** Page courante, signalée dans la navigation (aria-current). */
  current?: "about";
};

/** En-tête : navigation, langue, accès à l'espace partenaire (selon la session). */
export async function SiteHeader({ lang, tone = "paper", current }: Props) {
  const t = getT(lang);
  const signedIn = !!(await readSession());
  const nav = [
    { href: routes.section(lang, "restaurants"), label: t("nav.restaurants") },
    { href: routes.section(lang, "livraison"), label: t("nav.delivery") },
    { href: routes.section(lang, "etapes"), label: t("nav.how_it_works") },
    { href: routes.section(lang, "faq"), label: t("nav.faq") },
    { href: routes.about(lang), label: t("nav.about"), current: current === "about" },
  ];
  const surface = tone === "accent" ? "bg-accent-soft" : "bg-paper/95 backdrop-blur-sm border-b border-rule";
  // Bouton principal : accès à l'espace partenaire (connexion, ou espace si déjà connecté)
  const cta = signedIn ? { href: routes.space(lang), label: t("nav.my_space") } : { href: routes.login(lang), label: t("nav.login") };

  return (
    <header className={`sticky top-0 z-40 ${surface}`}>
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 px-4 sm:h-18 sm:gap-4 sm:px-10">
        <div className="flex items-center gap-3">
          <Logo href={routes.home(lang)} alt={t("common.logo_alt")} linkLabel={t("common.logo_home")} className="h-8 w-auto sm:h-9" />
          <span className="hidden rounded-full border border-ink/30 px-3 py-0.5 font-poster text-sm font-extrabold text-ink sm:inline">
            {t("common.partners_badge")}
          </span>
        </div>
        <nav aria-label={t("nav.label")} className="hidden items-center gap-6 font-semibold whitespace-nowrap lg:flex xl:gap-7">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className="link-hover text-ink aria-[current=page]:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher />
          {/* Enveloppe : la classe d'affichage du bouton (inline-flex) écraserait « hidden » */}
          <div className="hidden sm:block">
            <ButtonLink href={cta.href} size="sm" className="whitespace-nowrap">
              {cta.label}
            </ButtonLink>
          </div>
          <MobileMenu
            items={nav}
            cta={cta}
            surface={tone === "accent" ? "bg-accent-soft" : "bg-paper"}
            labels={{ open: t("nav.open_menu"), close: t("nav.close_menu"), nav: t("nav.label") }}
          />
        </div>
      </div>
    </header>
  );
}
