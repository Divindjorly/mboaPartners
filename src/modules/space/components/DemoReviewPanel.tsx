"use client";

import { useTranslation } from "react-i18next";
import { DemoNotice } from "#/components/DemoNotice";
import { Button } from "#/components/ui/Button";
import { useSpaceAction } from "../hooks/useSpaceAction";
import { simulateReviewAction } from "../services/space.actions";

/** Mode démo : remplace l'équipe Mboa pour faire avancer le dossier. Jamais affiché avec l'API réelle. */
export function DemoReviewPanel({ loginHref }: { loginHref: string }) {
  const { t } = useTranslation();
  const review = useSpaceAction(simulateReviewAction, loginHref);
  return (
    <DemoNotice title={t("demo.review_title")}>
      <p>{t("demo.review_text")}</p>
      <div className="flex flex-wrap gap-2 pt-3">
        <Button type="button" size="sm" disabled={review.pending} onClick={() => review.run({ decision: "approve" })}>
          {t("demo.approve")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={review.pending} onClick={() => review.run({ decision: "request_changes" })}>
          {t("demo.request_changes")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={review.pending} onClick={() => review.run({ decision: "reject" })}>
          {t("demo.reject")}
        </Button>
      </div>
      {review.error && <p className="pt-2 text-danger">{review.error}</p>}
    </DemoNotice>
  );
}
