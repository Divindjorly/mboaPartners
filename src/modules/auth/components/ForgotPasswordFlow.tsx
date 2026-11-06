"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DemoNotice } from "#/components/DemoNotice";
import { Button, ButtonLink } from "#/components/ui/Button";
import { Alert, Field, Input } from "#/components/ui/Form";
import { routes } from "#/constants/routes";
import { translateFieldError } from "#/i18n/translateError";
import { useAppLanguage } from "#/i18n/useAppLanguage";
import { PasswordFields } from "#/modules/onboarding/components/PasswordFields";
import { usePasswordReset } from "../hooks/usePasswordReset";

/** Mot de passe oublié en trois temps : adresse e-mail, code + nouveau mot de passe, confirmation. */
export function ForgotPasswordFlow({ demoCode }: { demoCode: string | null }) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const { step, email, request, confirm, restart } = usePasswordReset();

  if (step === "done") {
    return (
      <div className="rounded-3xl bg-paper p-6 sm:p-9">
        <h2 className="font-poster text-3xl font-black">{t("auth.reset.done_title")}</h2>
        <p className="mt-3 text-muted">{t("auth.reset.done_text")}</p>
        <ButtonLink href={routes.login(language)} size="lg" className="mt-8 w-full">
          {t("auth.login.submit")}
        </ButtonLink>
      </div>
    );
  }

  if (step === "confirm") {
    const err = (name: string) => translateFieldError(t, confirm.fieldErrors[name]);
    return (
      <form onSubmit={confirm.handleSubmit} noValidate className="space-y-5 rounded-3xl bg-paper p-6 sm:p-9">
        <p className="text-muted">
          {t("auth.reset.code_sent")} <span className="font-semibold break-all text-ink">{email}</span>
        </p>
        {demoCode && (
          <DemoNotice title={t("demo.title")}>
            <p>{t("demo.code", { code: demoCode })}</p>
          </DemoNotice>
        )}
        <input type="hidden" name="email" value={email} />
        <Field id="code" label={t("auth.code.label")} error={err("code")}>
          <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={!!confirm.fieldErrors.code} onChange={() => confirm.clearError("code")} required />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordFields errors={confirm.fieldErrors} onChange={confirm.clearError} />
        </div>
        {confirm.serverError && <Alert title={confirm.serverError.message} />}
        <Button type="submit" size="lg" className="w-full" disabled={confirm.pending}>
          {confirm.pending ? t("auth.reset.saving") : t("auth.reset.save")}
        </Button>
        <button type="button" onClick={restart} className="link-underline text-sm text-muted hover:text-ink">
          {t("auth.reset.other_email")}
        </button>
      </form>
    );
  }

  const err = (name: string) => translateFieldError(t, request.fieldErrors[name]);
  return (
    <div className="space-y-6">
      <form onSubmit={request.handleSubmit} noValidate className="space-y-5 rounded-3xl bg-paper p-6 sm:p-9">
        <Field id="email" label={t("auth.fields.email")} error={err("email")}>
          <Input id="email" type="email" autoComplete="email" maxLength={254} invalid={!!request.fieldErrors.email} onChange={() => request.clearError("email")} required />
        </Field>
        {request.serverError && <Alert title={request.serverError.message} />}
        <Button type="submit" size="lg" className="w-full" disabled={request.pending}>
          {request.pending ? t("auth.reset.sending") : t("auth.reset.send")}
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href={routes.login(language)} className="link-underline text-muted hover:text-ink">
          ← {t("auth.reset.back_to_login")}
        </Link>
      </p>
    </div>
  );
}
