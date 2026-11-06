import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { getDemoInfo } from "#/modules/auth/demo";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { SignupPageShell } from "../components/SignupPageShell";

const PERKS = ["orders", "delivery", "payments", "autonomy"] as const;

export function RestaurantSignupView({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <SignupPageShell
      lang={lang}
      image="signupRestaurant"
      eyebrow={t("onboarding.restaurant.eyebrow")}
      title={t("onboarding.restaurant.title")}
      intro={t("onboarding.restaurant.intro")}
      perks={PERKS.map((p) => t(`onboarding.restaurant.perks.${p}`))}
    >
      <OnboardingFlow kind="restaurant" demoCode={getDemoInfo()?.code ?? null} />
    </SignupPageShell>
  );
}
