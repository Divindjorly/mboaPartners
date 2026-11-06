"use client";

import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";
import type { Application } from "#/types/partner.types";
import { useSpaceAction } from "../hooks/useSpaceAction";
import { submitApplicationAction } from "../services/space.actions";
import { missingItems } from "../utils/applicationRules";

/** Soumission en une seule fois : active seulement quand tout est déposé. */
export function SubmitPanel({ application, loginHref }: { application: Application; loginHref: string }) {
  const { t } = useTranslation();
  const submit = useSpaceAction(submitApplicationAction, loginHref);
  const missing = missingItems(application);
  const again = application.status === "CHANGES_REQUESTED";

  return (
    <section className="rounded-3xl bg-paper p-5 sm:p-8">
      <h2 className="font-poster text-2xl font-extrabold">{again ? t("space.submit.title_again") : t("space.submit.title")}</h2>
      {missing.length > 0 ? (
        <div className="mt-3 text-muted">
          <p>{t("space.submit.missing_intro")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {missing.map((m) => (
              <li key={m}>{t(`space.documents.types.${m}.title`)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-muted">{t("space.submit.ready")}</p>
      )}
      {submit.error && (
        <p role="alert" className="mt-4 text-sm font-medium text-danger">
          {submit.error}
        </p>
      )}
      <Button type="button" size="lg" className="mt-6 w-full sm:w-auto" disabled={!application.canSubmit || submit.pending} onClick={() => submit.run({})}>
        {submit.pending ? t("space.submit.submitting") : again ? t("space.submit.button_again") : t("space.submit.button")}
      </Button>
    </section>
  );
}
