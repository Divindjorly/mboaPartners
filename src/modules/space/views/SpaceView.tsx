import { SiteFooter } from "#/components/layout/SiteFooter";
import { SiteHeader } from "#/components/layout/SiteHeader";
import { routes, sessionExpiredHref } from "#/constants/routes";
import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import type { Application, PartnerProfile } from "#/types/partner.types";
import { ApplicationProgress } from "../components/ApplicationProgress";
import { DemoReviewPanel } from "../components/DemoReviewPanel";
import { DocumentRow } from "../components/DocumentRow";
import { LogoutButton } from "../components/LogoutButton";
import { StatusPanel } from "../components/StatusPanel";
import { SubmitPanel } from "../components/SubmitPanel";
import { isApplicationEditable } from "../utils/applicationRules";

type Props = {
  lang: Locale;
  profile: PartnerProfile;
  application: Application;
  platformUrl: string;
  demo: boolean;
};

/** Espace partenaire « Mon dossier » : statut, pièces, soumission (les livreurs se gèrent dans le panel flotte). */
export function SpaceView({ lang, profile, application, platformUrl, demo }: Props) {
  const t = getT(lang);
  // Session refusée pendant une action : on passe par l'effacement du cookie
  const loginHref = sessionExpiredHref(lang);
  const logoutHref = routes.login(lang);
  const editable = isApplicationEditable(application);

  return (
    <>
      <SiteHeader lang={lang} />
      <main className="flex-1 bg-surface">
        <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:space-y-6 sm:px-6 sm:py-12">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="inline-block rounded-full border border-ink/30 px-3 py-0.5 font-poster text-sm font-extrabold">{t("space.eyebrow")}</p>
              <h1 className="mt-3 font-poster text-[clamp(2rem,3.4vw,3rem)] font-black break-words">{profile.displayName}</h1>
              <p className="mt-1 text-sm break-all text-muted">
                {t(`partner_types.${profile.partnerType}`)} · {profile.email}
              </p>
            </div>
            <LogoutButton loginHref={logoutHref} />
          </header>

          <div className="rounded-3xl bg-paper p-5 sm:p-8">
            <ApplicationProgress status={application.status} t={t} />
          </div>

          <StatusPanel application={application} profile={profile} lang={lang} t={t} platformUrl={platformUrl} />

          {demo && application.status === "IN_REVIEW" && <DemoReviewPanel loginHref={loginHref} />}

          <section aria-labelledby="documents-title" className="rounded-3xl bg-paper p-5 sm:p-8">
            <h2 id="documents-title" className="font-poster text-2xl font-extrabold">
              {t("space.documents.title")}
            </h2>
            <p className="mt-1 text-sm text-muted">{editable ? t("space.documents.intro") : t("space.documents.intro_locked")}</p>
            <ul className="mt-4 divide-y divide-rule border-t border-rule">
              {application.requiredDocuments.map((type) => (
                <DocumentRow key={type} application={application} type={type} loginHref={loginHref} />
              ))}
            </ul>
          </section>


          {editable && <SubmitPanel application={application} loginHref={loginHref} />}
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
