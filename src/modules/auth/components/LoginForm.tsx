"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { DemoNotice } from "#/components/DemoNotice";
import { Button } from "#/components/ui/Button";
import { Alert, Field, Input } from "#/components/ui/Form";
import { PasswordInput } from "#/components/ui/PasswordInput";
import { routes } from "#/constants/routes";
import { translateFieldError } from "#/i18n/translateError";
import { useAppLanguage } from "#/i18n/useAppLanguage";
import { useLogin } from "../hooks/useLogin";
import type { DemoInfo } from "../types/auth.types";
import { EmailCodeStep } from "./EmailCodeStep";

export function LoginForm({ demo }: { demo: DemoInfo | null }) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const router = useRouter();
  const goToSpace = () => {
    router.replace(routes.space(language));
    router.refresh();
  };
  const login = useLogin(goToSpace);
  const err = (name: string) => translateFieldError(t, login.fieldErrors[name]);

  if (login.needsVerification) {
    return (
      <div className="space-y-4">
        <Alert title={t("auth.login.unverified")} tone="success" />
        <EmailCodeStep email={login.email} onVerified={goToSpace} demoCode={demo?.code} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {demo && (
        <DemoNotice title={t("demo.title")}>
          <p>{t("demo.accounts_intro")}</p>
          <ul className="list-disc pl-5">
            {demo.accounts.map((a) => (
              <li key={a.email}>
                <span className="font-semibold break-all text-ink">{a.email}</span> — {t(`partner_types.${a.partnerType}`)}
              </li>
            ))}
          </ul>
          <p>{t("demo.password", { password: demo.password })}</p>
        </DemoNotice>
      )}

      <form onSubmit={login.handleSubmit} noValidate className="space-y-5 rounded-3xl bg-paper p-6 sm:p-9">
        <Field id="email" label={t("auth.fields.email")} error={err("email")}>
          <Input id="email" type="email" autoComplete="email" maxLength={254} invalid={!!login.fieldErrors.email} onChange={() => login.clearError("email")} required />
        </Field>
        <Field id="password" label={t("auth.fields.password")} error={err("password")}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            maxLength={128}
            invalid={!!login.fieldErrors.password}
            onChange={() => login.clearError("password")}
            showLabel={t("onboarding.fields.show_password")}
            hideLabel={t("onboarding.fields.hide_password")}
            showShort={t("onboarding.fields.show_short")}
            hideShort={t("onboarding.fields.hide_short")}
            required
          />
        </Field>
        <div className="text-right text-sm">
          <Link href={routes.forgotPassword(language)} className="link-underline text-muted hover:text-ink">
            {t("auth.login.forgot")}
          </Link>
        </div>
        {login.serverError && <Alert title={login.serverError.message} />}
        <Button type="submit" size="lg" className="w-full" disabled={login.pending}>
          {login.pending ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t("auth.login.no_account")}{" "}
        <Link href={routes.section(language, "devenir-partenaire")} className="link-underline font-semibold text-ink">
          {t("auth.login.signup")}
        </Link>
      </p>
    </div>
  );
}
