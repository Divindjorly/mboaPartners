"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";
import { Alert, Field, Input } from "#/components/ui/Form";
import { PasswordInput } from "#/components/ui/PasswordInput";
import { routes } from "#/constants/routes";
import { translateFieldError } from "#/i18n/translateError";
import { useAppLanguage } from "#/i18n/useAppLanguage";
import { useTimedMessage } from "#/hooks/useTimedMessage";
import { useLogin } from "../hooks/useLogin";
import { loginErrorOf, type LoginErrorPlace } from "../utils/loginError";
import { EmailCodeStep } from "./EmailCodeStep";

export function LoginForm({ expired = false }: { expired?: boolean }) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const router = useRouter();
  const goToSpace = () => {
    router.replace(routes.space(language));
    router.refresh();
  };
  const login = useLogin(goToSpace);
  const err = (name: string) => translateFieldError(t, login.fieldErrors[name]);
  // Erreur de connexion : une phrase claire, sous le champ concerné (ou au-dessus du bouton), effacée quand on corrige ce champ
  const [dismissed, setDismissed] = useState<unknown>(null);
  // Messages temporaires : ils s'effacent seuls après quelques secondes (le délai repart à chaque nouvel envoi)
  const failureShown = useTimedMessage(login.failure);
  const expiredShown = useTimedMessage(expired && !login.failure ? "session-expired" : null);
  const loginError = failureShown && dismissed !== login.failure ? loginErrorOf(t, login.failure) : null;
  const errorAt = (place: LoginErrorPlace) => (loginError?.place === place ? loginError.message : undefined);
  const notFound = login.accountNotFound && !!errorAt("email");
  const dismissOn = (place: LoginErrorPlace) => {
    if (loginError?.place === place) setDismissed(login.failure);
  };
  const emailInvalid = !!errorAt("email") || !!login.fieldErrors.email;
  const passwordInvalid = !!errorAt("password") || !!login.fieldErrors.password;

  if (login.needsVerification) {
    return (
      <div className="space-y-4">
        <Alert title={t("auth.login.unverified")} tone="success" />
        <EmailCodeStep email={login.email} onVerified={goToSpace} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={login.handleSubmit} noValidate className="space-y-5 rounded-3xl bg-paper p-6 sm:p-9">
        {/* Session expirée : une ligne discrète en haut du formulaire, masquée dès la première tentative */}
        {expiredShown && (
          <p role="status" className="flex items-center gap-2 border-b border-rule pb-3 text-[13px] font-medium text-brand">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-brand" />
            {t("api_errors.UNAUTHENTICATED")}
          </p>
        )}
        <div>
          <Field id="email" label={t("auth.fields.email")} error={errorAt("email") ?? err("email")}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              invalid={emailInvalid}
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? "email-error" : undefined}
              onChange={() => {
                login.clearError("email");
                dismissOn("email");
              }}
              required
            />
          </Field>
          {notFound && (
            <Link href={routes.section(language, "devenir-partenaire")} className="link-underline mt-1 inline-block text-[13px] font-semibold text-ink">
              {t("auth.login.not_found_cta")}
            </Link>
          )}
        </div>
        <Field id="password" label={t("auth.fields.password")} error={errorAt("password") ?? err("password")}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            maxLength={128}
            invalid={passwordInvalid}
            onChange={() => {
              login.clearError("password");
              dismissOn("password");
            }}
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
        {errorAt("form") && (
          <p role="alert" className="text-[13px] font-medium text-danger">
            {errorAt("form")}
          </p>
        )}
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
