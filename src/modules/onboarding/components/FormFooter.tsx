"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";
import { Alert, Checkbox } from "#/components/ui/Form";
import { routes } from "#/constants/routes";
import { useAppLanguage } from "#/i18n/useAppLanguage";
import { translateFieldError } from "#/i18n/translateError";

type Props = {
  pending: boolean;
  errors: Record<string, string[]>;
  serverError: { message: string; details: string[] } | null;
  hasClientErrors: boolean;
  onChange: (name: string) => void;
};

/** Consentement, erreurs globales, champ piège et bouton d'envoi — communs aux deux formulaires. */
export function FormFooter({ pending, errors, serverError, hasClientErrors, onChange }: Props) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();

  return (
    <div className="space-y-6 rounded-3xl bg-paper p-5 sm:p-9">
      {/* Champ piège anti-robot : invisible et non focalisable pour les humains */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="website">{t("onboarding.fields.honeypot")}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Checkbox id="consent" error={translateFieldError(t, errors.consent)} invalid={!!errors.consent} onChange={() => onChange("consent")}>
        {t("onboarding.fields.consent")}
      </Checkbox>
      <Link href={routes.privacy(language)} target="_blank" className="link-underline -mt-3 ml-[30px] inline-block text-[13px] text-muted">
        {t("onboarding.fields.consent_privacy")} ↗
      </Link>

      {serverError && <Alert title={serverError.message} items={serverError.details} />}
      {hasClientErrors && <Alert title={t("onboarding.form.fix_fields")} />}

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={routes.home(language)} className="text-center text-sm text-muted hover:text-ink">
          ← {t("common.back_home")}
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("onboarding.form.submitting") : t("onboarding.form.submit")}
        </Button>
      </div>
    </div>
  );
}
