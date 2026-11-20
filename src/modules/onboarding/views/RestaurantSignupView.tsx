import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { OnboardingFlow } from "../components/OnboardingFlow";
import { SignupPageShell } from "../components/SignupPageShell";
import type { MapsConfig } from "../types/onboarding.types";

const PERKS = ["orders", "delivery", "payments", "autonomy"] as const;

export function RestaurantSignupView({ lang, maps }: { lang: Locale; maps: MapsConfig | null }) {
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
      <OnboardingFlow kind="restaurant" maps={maps} />
    </SignupPageShell>
  );
}
