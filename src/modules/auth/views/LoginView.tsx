import type { Locale } from "#/i18n/config";
import { getT } from "#/i18n/server";
import { AuthShell } from "../components/AuthShell";
import { LoginForm } from "../components/LoginForm";
import { Alert } from "#/components/ui/Form";
import type { DemoInfo } from "../types/auth.types";

export function LoginView({ lang, demo, expired }: { lang: Locale; demo: DemoInfo | null; expired: boolean }) {
  const t = getT(lang);
  return (
    <AuthShell lang={lang} eyebrow={t("auth.eyebrow")} title={t("auth.login.title")} intro={t("auth.login.intro")}>
      {expired && (
        <div className="mb-6">
          <Alert title={t("api_errors.UNAUTHENTICATED")} tone="success" />
        </div>
      )}
      <LoginForm demo={demo} />
    </AuthShell>
  );
}
