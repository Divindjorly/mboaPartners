"use client";

import { useTranslation } from "react-i18next";
import { EmailCodeStep } from "#/modules/auth/components/EmailCodeStep";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import type { PartnerKind } from "../types/onboarding.types";
import { DeliveryCompanyForm } from "./DeliveryCompanyForm";
import { MerchantForm } from "./MerchantForm";

/** 3e étape « Dossier » : elle se déroule dans l'espace partenaire, après la vérification. */
const STEP_KEYS = ["form", "verify", "dossier"] as const;

export function OnboardingFlow({ kind, demoCode }: { kind: PartnerKind; demoCode: string | null }) {
  const { step, stepIndex, onSignedUp, onVerified } = useOnboardingFlow();

  return (
    <div>
      <Stepper current={stepIndex} />
      <div className="mt-6 sm:mt-10">
        {step.name === "form" &&
          (kind === "restaurant" ? <MerchantForm onSuccess={onSignedUp} /> : <DeliveryCompanyForm onSuccess={onSignedUp} />)}
        {step.name === "verify" && <EmailCodeStep email={step.email} onVerified={onVerified} demoCode={demoCode} />}
      </div>
    </div>
  );
}

/** Progression : étape courante en vert, étapes passées cochées, à venir en gris. */
function Stepper({ current }: { current: number }) {
  const { t } = useTranslation();
  return (
    <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label={t("onboarding.steps.label")}>
      {STEP_KEYS.map((key, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={key}
            aria-current={active ? "step" : undefined}
            className={`rounded-full px-3 py-1 font-poster text-base font-extrabold sm:px-4 sm:py-1.5 sm:text-lg ${active ? "bg-brand text-paper" : done ? "bg-paper text-brand" : "bg-paper text-muted"}`}
          >
            <span className="mr-1.5">{done ? "✓" : `${i + 1}.`}</span>
            {t(`onboarding.steps.${key}`)}
          </li>
        );
      })}
    </ol>
  );
}
