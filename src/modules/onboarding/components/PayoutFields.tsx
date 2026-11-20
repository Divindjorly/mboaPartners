"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Field, Input, Select } from "#/components/ui/Form";
import { PhoneInput } from "#/components/ui/PhoneInput";
import { translateFieldError } from "#/i18n/translateError";

type Method = "MOBILE_MONEY" | "BANK";

/**
 * Compte de versement du partenaire (saisi à l'inscription) : Mobile Money (opérateur, numéro, titulaire) ou virement
 * bancaire (banque, RIB tapé, titulaire). Aucun justificatif demandé : beaucoup de partenaires n'ont pas de RIB sous la main.
 */
export function PayoutFields({ errors, onChange }: { errors: Record<string, string[] | undefined>; onChange: (name: string) => void }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState<Method>("MOBILE_MONEY");
  const err = (name: string) => translateFieldError(t, errors[name]);
  const on = (name: string) => () => onChange(name);

  const choice = (value: Method, title: string, text: string) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-sm transition-colors ${
        method === value ? "border-brand bg-brand/5" : "border-ink/15 hover:border-ink/30"
      }`}
    >
      <input
        type="radio"
        name="payoutMethod"
        value={value}
        checked={method === value}
        onChange={() => {
          setMethod(value);
          onChange("payoutMethod");
        }}
        className="mt-0.5 size-4 accent-brand"
      />
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-muted">{text}</span>
      </span>
    </label>
  );

  return (
    <>
      <div role="radiogroup" aria-label={t("onboarding.fields.payoutMethod")} className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
        {choice("MOBILE_MONEY", t("onboarding.fields.payout_mobile_money"), t("onboarding.fields.payout_mobile_money_text"))}
        {choice("BANK", t("onboarding.fields.payout_bank"), t("onboarding.fields.payout_bank_text"))}
      </div>

      {method === "MOBILE_MONEY" ? (
        <>
          <Field id="payoutOperator" label={t("onboarding.fields.payoutOperator")} error={err("payoutOperator")}>
            <Select id="payoutOperator" defaultValue="" invalid={!!errors.payoutOperator} onChange={on("payoutOperator")} required>
              <option value="" disabled>
                {t("onboarding.fields.choose")}
              </option>
              <option value="MTN">MTN Mobile Money</option>
              <option value="AIRTEL">Airtel Money</option>
            </Select>
          </Field>
          <Field id="payoutPhone" label={t("onboarding.fields.payoutPhone")} error={err("payoutPhone")}>
            <PhoneInput id="payoutPhone" invalid={!!errors.payoutPhone} onChange={on("payoutPhone")} required />
          </Field>
        </>
      ) : (
        <>
          <Field id="bankName" label={t("onboarding.fields.bankName")} error={err("bankName")}>
            <Input id="bankName" maxLength={80} placeholder="BGFIBank, LCB Bank, Ecobank…" invalid={!!errors.bankName} onChange={on("bankName")} required />
          </Field>
          <Field id="rib" label={t("onboarding.fields.rib")} error={err("rib")} hint={t("onboarding.fields.rib_hint")}>
            <Input id="rib" maxLength={40} inputMode="text" autoCapitalize="characters" spellCheck={false} placeholder="30012 00101 12345678901 47" invalid={!!errors.rib} onChange={on("rib")} required />
          </Field>
        </>
      )}
      <Field id="payoutHolder" label={t("onboarding.fields.payoutHolder")} error={err("payoutHolder")} hint={t("onboarding.fields.payoutHolder_hint")} className="sm:col-span-2">
        <Input id="payoutHolder" maxLength={150} autoComplete="name" invalid={!!errors.payoutHolder} onChange={on("payoutHolder")} required />
      </Field>
    </>
  );
}
