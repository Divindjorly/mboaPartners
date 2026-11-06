"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Field, Input } from "#/components/ui/Form";
import { PASSWORD_POLICY } from "#/constants/security";
import { translateFieldError } from "#/i18n/translateError";

type Props = { errors: Record<string, string[]>; onChange: (name: string) => void };

export function PasswordFields({ errors, onChange }: Props) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const type = visible ? "text" : "password";

  return (
    <>
      <Field id="password" label={t("onboarding.fields.password")} error={translateFieldError(t, errors.password)} hint={t("onboarding.fields.password_hint")}>
        <div className="relative">
          <Input
            id="password"
            type={type}
            autoComplete="new-password"
            minLength={PASSWORD_POLICY.minLength}
            maxLength={PASSWORD_POLICY.maxLength}
            invalid={!!errors.password}
            onChange={() => onChange("password")}
            className="pr-24"
            required
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-muted hover:text-ink"
            aria-label={visible ? t("onboarding.fields.hide_password") : t("onboarding.fields.show_password")}
          >
            {visible ? t("onboarding.fields.hide_short") : t("onboarding.fields.show_short")}
          </button>
        </div>
      </Field>
      <Field id="confirmPassword" label={t("onboarding.fields.confirmPassword")} error={translateFieldError(t, errors.confirmPassword)}>
        <Input
          id="confirmPassword"
          type={type}
          autoComplete="new-password"
          maxLength={PASSWORD_POLICY.maxLength}
          invalid={!!errors.confirmPassword}
          onChange={() => onChange("confirmPassword")}
          required
        />
      </Field>
    </>
  );
}
