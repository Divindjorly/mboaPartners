import type { TFunction } from "i18next";
import { ButtonLink } from "#/components/ui/Button";
import { LEGAL } from "#/constants/legal";
import type { Application, PartnerProfile } from "#/types/partner.types";
import { formatCongoPhone } from "#/utils/phone";
import { formatDateTime } from "../utils/applicationRules";

type Props = { application: Application; profile: PartnerProfile; lang: string; t: TFunction; platformUrl: string };

/** Encadré « Que se passe-t-il maintenant ? », propre à chaque statut. */
export function StatusPanel({ application, profile, lang, t, platformUrl }: Props) {
  const { status } = application;
  const tone =
    status === "APPROVED" ? "border-brand bg-brand/5" : status === "REJECTED" ? "border-danger bg-danger-soft" : status === "CHANGES_REQUESTED" ? "border-ink bg-paper" : "border-transparent bg-paper";

  return (
    <section aria-live="polite" className={`rounded-3xl border-2 p-5 sm:p-8 ${tone}`}>
      <h2 className="font-poster text-2xl font-extrabold sm:text-3xl">{t(`space.status.${status}.title`)}</h2>

      {status === "DRAFT" && <p className="mt-3 text-muted">{t("space.status.DRAFT.text")}</p>}

      {status === "IN_REVIEW" && application.submittedAt && application.reviewDueAt && (
        <div className="mt-3 space-y-2 text-muted">
          <p>{t("space.status.IN_REVIEW.submitted", { date: formatDateTime(application.submittedAt, lang) })}</p>
          <p className="text-lg font-semibold text-ink">{t("space.status.IN_REVIEW.due", { date: formatDateTime(application.reviewDueAt, lang) })}</p>
          <p>{t("space.status.IN_REVIEW.call", { phone: formatCongoPhone(profile.phoneNumber) })}</p>
        </div>
      )}

      {status === "CHANGES_REQUESTED" && <p className="mt-3 text-muted">{t("space.status.CHANGES_REQUESTED.text")}</p>}

      {status === "APPROVED" && (
        <div className="mt-3">
          <p className="text-muted">{t(`space.status.APPROVED.text_${application.partnerType}`)}</p>
          <ButtonLink href={platformUrl} size="lg" className="mt-6" target="_blank" rel="noopener noreferrer">
            {t(`space.status.APPROVED.cta_${application.partnerType}`)} ↗
          </ButtonLink>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="mt-3 space-y-2">
          {application.rejectionReason && (
            <p className="text-ink">
              <span className="font-semibold">{t("space.status.REJECTED.reason")}</span> {application.rejectionReason}
            </p>
          )}
          <p className="text-muted">
            {t("space.status.REJECTED.contact")}{" "}
            <a href={`mailto:${LEGAL.privacyContactEmail}`} className="link-underline font-semibold text-ink">
              {LEGAL.privacyContactEmail}
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
