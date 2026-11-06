"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { routes } from "#/constants/routes";
import { useAppLanguage } from "#/i18n/useAppLanguage";
import type { OnboardingStep } from "../types/onboarding.types";

const STEP_INDEX: Record<OnboardingStep["name"], number> = { form: 0, verify: 1 };

/** Enchaînement : formulaire → code reçu par e-mail → espace partenaire (dépôt du dossier). */
export const useOnboardingFlow = () => {
  const router = useRouter();
  const { language } = useAppLanguage();
  const [step, setStep] = useState<OnboardingStep>({ name: "form" });

  return {
    step,
    stepIndex: STEP_INDEX[step.name],
    onSignedUp: useCallback((email: string) => {
      setStep({ name: "verify", email });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []),
    onVerified: useCallback(() => {
      router.replace(routes.space(language));
      router.refresh();
    }, [router, language]),
  };
};
