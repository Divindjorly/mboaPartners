import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { AuthShell } from "../components/AuthShell";
import { ForgotPasswordFlow } from "../components/ForgotPasswordFlow";

export function ForgotPasswordView({ lang }: { lang: Locale }) {
  const t = getT(lang);
  return (
    <AuthShell lang={lang} eyebrow={t("auth.eyebrow")} title={t("auth.reset.title")} intro={t("auth.reset.intro")}>
      <ForgotPasswordFlow />
    </AuthShell>
  );
}
