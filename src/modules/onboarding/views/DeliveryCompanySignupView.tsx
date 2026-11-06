import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { getDemoInfo } from "#/modules/auth/demo";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { SignupPageShell } from "../components/SignupPageShell";

const PERKS = ["invite", "tracking", "control", "history"] as const;

export function DeliveryCompanySignupView({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <SignupPageShell
      lang={lang}
      image="fleet"
      eyebrow={t("onboarding.fleet.eyebrow")}
      title={t("onboarding.fleet.title")}
      intro={t("onboarding.fleet.intro")}
      perks={PERKS.map((p) => t(`onboarding.fleet.perks.${p}`))}
    >
      <OnboardingFlow kind="livraison" demoCode={getDemoInfo()?.code ?? null} />
    </SignupPageShell>
  );
}
