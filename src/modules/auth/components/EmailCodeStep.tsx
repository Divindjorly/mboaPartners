"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { DemoNotice } from "#/components/DemoNotice";
import { Button } from "#/components/ui/Button";
import { Alert } from "#/components/ui/Form";
import { useResendEmailCode } from "../hooks/useResendEmailCode";
import { useVerifyEmailCode } from "../hooks/useVerifyEmailCode";

type Props = {
  email: string;
  onVerified: () => void;
  /** Code affiché en mode démonstration uniquement. */
  demoCode?: string | null;
};

/** Saisie du code à 6 chiffres envoyé par e-mail (inscription ou connexion d'un compte non vérifié). */
export function EmailCodeStep({ email, onVerified, demoCode }: Props) {
  const { t } = useTranslation();
  const verify = useVerifyEmailCode(onVerified);
  const resend = useResendEmailCode(email);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const codeError = verify.fieldErrors.code?.[0];

  return (
    <div className="rounded-3xl bg-paper p-6 sm:p-10">
      <h2 className="font-poster text-3xl font-black sm:text-4xl">{t("auth.code.title")}</h2>
      <p className="mt-4 text-lg text-muted">
        {t("auth.code.text")} <span className="font-semibold break-all text-ink">{email}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{t("auth.code.spam_hint")}</p>

      {demoCode && (
        <div className="mt-6">
          <DemoNotice title={t("demo.title")}>
            <p>{t("demo.code", { code: demoCode })}</p>
          </DemoNotice>
        </div>
      )}

      <form onSubmit={verify.handleSubmit} className="mt-8 space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <label htmlFor="code" className="block text-sm font-semibold">
          {t("auth.code.label")}
        </label>
        <input
          ref={inputRef}
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          aria-invalid={!!codeError || undefined}
          aria-describedby={codeError ? "code-error" : undefined}
          onChange={() => verify.clearError("code")}
          className="block h-18 w-full rounded-2xl border-2 border-ink/20 bg-surface text-center font-poster text-4xl font-black tracking-[0.35em] text-ink tabular-nums placeholder:text-ink/15 focus:border-brand focus:bg-paper focus:ring-4 focus:ring-brand/20 focus:outline-none sm:h-20 sm:text-5xl"
        />
        {codeError && (
          <p id="code-error" className="text-[13px] font-medium text-danger">
            {t(codeError)}
          </p>
        )}
        {verify.serverError && <Alert title={verify.serverError.message} />}
        <Button type="submit" size="lg" className="w-full" disabled={verify.pending}>
          {verify.pending ? t("auth.code.submitting") : t("auth.code.submit")}
        </Button>
      </form>

      <div className="mt-8 border-t border-rule pt-6 text-sm">
        <button
          type="button"
          onClick={resend.resend}
          disabled={resend.cooldown > 0 || resend.pending}
          className="link-underline text-ink disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          {resend.pending
            ? t("auth.code.resending")
            : resend.cooldown > 0
              ? t("auth.code.resend_in", { seconds: resend.cooldown })
              : t("auth.code.resend")}
        </button>
        {resend.sent && <p className="mt-3 text-ink">{t("auth.code.resent")}</p>}
        {resend.errorMessage && <p className="mt-3 text-danger">{resend.errorMessage}</p>}
      </div>
    </div>
  );
}
