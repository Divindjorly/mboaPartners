import type { TFunction } from "i18next";
import type { ApplicationStatus } from "#/types/partner.types";

const STEPS = ["account", "dossier", "review", "activation"] as const;

/** Index de l'étape courante et état d'alerte, selon le statut du dossier. */
const position: Record<ApplicationStatus, { current: number; tone: "normal" | "warning" | "danger" | "done" }> = {
  DRAFT: { current: 1, tone: "normal" },
  CHANGES_REQUESTED: { current: 1, tone: "warning" },
  IN_REVIEW: { current: 2, tone: "normal" },
  APPROVED: { current: 3, tone: "done" },
  REJECTED: { current: 2, tone: "danger" },
};

/** Frise : Compte créé → Dossier → Analyse → Activation. */
export function ApplicationProgress({ status, t }: { status: ApplicationStatus; t: TFunction }) {
  const { current, tone } = position[status];
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label={t("space.progress.label")}>
      {STEPS.map((step, i) => {
        const done = i < current || tone === "done";
        const active = i === current && tone !== "done";
        const bar = done ? "bg-brand" : active ? (tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-ink" : "bg-brand/40") : "bg-ink/10";
        return (
          <li key={step} aria-current={active ? "step" : undefined} className="min-w-0">
            <div className={`h-1.5 rounded-full ${bar}`} />
            <p className={`mt-2 text-xs font-semibold sm:text-sm ${done || active ? "text-ink" : "text-muted"}`}>
              {done && <span aria-hidden>✓ </span>}
              {t(`space.progress.${step}`)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
