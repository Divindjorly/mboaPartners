import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "../components/LoginForm";

export function LoginView({ lang, expired }: { lang: Locale; expired: boolean }) {
  const t = getT(lang);
  return (
    <AuthShell lang={lang} eyebrow={t("auth.eyebrow")} title={t("auth.login.title")} intro={t("auth.login.intro")}>
      <LoginForm expired={expired} />
    </AuthShell>
  );
}
