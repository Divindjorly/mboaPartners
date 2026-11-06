"use client";

import { useTranslation } from "react-i18next";
import { Field, FormSection, Input, PhoneInput } from "#/components/ui/Form";
import { translateFieldError } from "#/i18n/translateError";
import { useRegisterDeliveryCompany } from "../hooks/useRegisterDeliveryCompany";
import { CitySelect } from "./CitySelect";
import { FormFooter } from "./FormFooter";
import { PasswordFields } from "./PasswordFields";

export function DeliveryCompanyForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const { t } = useTranslation();
  const { handleSubmit, pending, fieldErrors: e, serverError, clearError, hasClientErrors } = useRegisterDeliveryCompany(onSuccess);
  const err = (name: string) => translateFieldError(t, e[name]);
  const on = (name: string) => () => clearError(name);
  const optional = t("common.optional");

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-6">
      <FormSection step={1} title={t("onboarding.sections.company.title")} description={t("onboarding.sections.company.description")}>
        <Field id="companyName" label={t("onboarding.fields.companyName")} error={err("companyName")} className="sm:col-span-2">
          <Input id="companyName" autoComplete="organization" maxLength={150} placeholder={t("onboarding.fields.companyName_placeholder")} invalid={!!e.companyName} onChange={on("companyName")} required />
        </Field>
        <Field id="rccmNumber" label={t("onboarding.fields.rccmNumber")} optionalLabel={optional} error={err("rccmNumber")} hint={t("onboarding.fields.rccmNumber_hint")}>
          <Input id="rccmNumber" maxLength={100} placeholder="CG-BZV-01-2024-B12-00000" invalid={!!e.rccmNumber} onChange={on("rccmNumber")} />
        </Field>
        <Field id="taxId" label={t("onboarding.fields.taxId")} optionalLabel={optional} error={err("taxId")} hint={t("onboarding.fields.taxId_hint")}>
          <Input id="taxId" maxLength={100} placeholder="M2024000000000X" invalid={!!e.taxId} onChange={on("taxId")} />
        </Field>
        <Field id="addressLine" label={t("onboarding.fields.headOfficeAddress")} error={err("addressLine")} className="sm:col-span-2">
          <Input id="addressLine" autoComplete="street-address" maxLength={255} placeholder={t("onboarding.fields.headOfficeAddress_placeholder")} invalid={!!e.addressLine} onChange={on("addressLine")} required />
        </Field>
        <CitySelect error={err("city")} onChange={on("city")} />
        <Field id="contactPhone" label={t("onboarding.fields.contactPhone")} error={err("contactPhone")}>
          <PhoneInput id="contactPhone" placeholder={t("onboarding.fields.phone_placeholder")} invalid={!!e.contactPhone} onChange={on("contactPhone")} required />
        </Field>
        <Field id="contactEmail" label={t("onboarding.fields.contactEmail")} error={err("contactEmail")} className="sm:col-span-2">
          <Input id="contactEmail" type="email" autoComplete="email" maxLength={254} placeholder="contact@entreprise.cg" invalid={!!e.contactEmail} onChange={on("contactEmail")} required />
        </Field>
      </FormSection>

      <FormSection step={2} title={t("onboarding.sections.manager.title")} description={t("onboarding.sections.manager.description")}>
        <Field id="managerFirstName" label={t("onboarding.fields.managerFirstName")} error={err("managerFirstName")}>
          <Input id="managerFirstName" autoComplete="given-name" maxLength={100} invalid={!!e.managerFirstName} onChange={on("managerFirstName")} required />
        </Field>
        <Field id="managerLastName" label={t("onboarding.fields.managerLastName")} error={err("managerLastName")}>
          <Input id="managerLastName" autoComplete="family-name" maxLength={100} invalid={!!e.managerLastName} onChange={on("managerLastName")} required />
        </Field>
        <Field id="managerPhone" label={t("onboarding.fields.managerPhone_fleet")} error={err("managerPhone")} hint={t("onboarding.fields.login_phone_hint")}>
          <PhoneInput id="managerPhone" placeholder={t("onboarding.fields.phone_placeholder")} invalid={!!e.managerPhone} onChange={on("managerPhone")} required />
        </Field>
        <Field id="managerEmail" label={t("onboarding.fields.managerEmail")} error={err("managerEmail")} hint={t("onboarding.fields.login_email_hint")}>
          <Input id="managerEmail" type="email" autoComplete="email" maxLength={254} invalid={!!e.managerEmail} onChange={on("managerEmail")} required />
        </Field>
      </FormSection>

      <FormSection step={3} title={t("onboarding.sections.fleet_security.title")} description={t("onboarding.sections.fleet_security.description")}>
        <PasswordFields errors={e} onChange={clearError} />
      </FormSection>

      <FormFooter pending={pending} errors={e} serverError={serverError} hasClientErrors={hasClientErrors} onChange={clearError} />
    </form>
  );
}
