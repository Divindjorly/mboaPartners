"use client";

import { useTranslation } from "react-i18next";
import { Checkbox, Field, FormSection, Input, PhoneInput, Select } from "#/components/ui/Form";
import { BUSINESS_TYPES } from "#/constants/businessTypes";
import { translateFieldError } from "#/i18n/translateError";
import { useRegisterMerchant } from "../hooks/useRegisterMerchant";
import { CitySelect } from "./CitySelect";
import { FormFooter } from "./FormFooter";
import { LocationField } from "./LocationField";
import { PasswordFields } from "./PasswordFields";

export function MerchantForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const { t } = useTranslation();
  const {
    handleSubmit,
    pending,
    fieldErrors: e,
    serverError,
    clearError,
    hasClientErrors,
    businessPhone,
    setBusinessPhone,
    managerUsesBusinessPhone,
    setManagerUsesBusinessPhone,
  } = useRegisterMerchant(onSuccess);
  const err = (name: string) => translateFieldError(t, e[name]);
  const on = (name: string) => () => clearError(name);
  const optional = t("common.optional");

  return (
    <form onSubmit={handleSubmit} noValidate className="relative space-y-6">
      <FormSection step={1} title={t("onboarding.sections.business.title")} description={t("onboarding.sections.business.description")}>
        <Field id="businessName" label={t("onboarding.fields.businessName")} error={err("businessName")}>
          <Input id="businessName" autoComplete="organization" maxLength={150} placeholder={t("onboarding.fields.businessName_placeholder")} invalid={!!e.businessName} onChange={on("businessName")} required />
        </Field>
        <Field id="businessType" label={t("onboarding.fields.businessType")} error={err("businessType")}>
          <Select id="businessType" defaultValue="restaurant" invalid={!!e.businessType} onChange={on("businessType")}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`onboarding.business_types.${type}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="phoneNumber" label={t("onboarding.fields.phoneNumber")} error={err("phoneNumber")} hint={t("onboarding.fields.login_phone_hint")}>
          <PhoneInput
            id="phoneNumber"
            placeholder={t("onboarding.fields.phone_placeholder")}
            invalid={!!e.phoneNumber}
            value={businessPhone}
            onChange={(ev) => {
              setBusinessPhone(ev.target.value);
              clearError("phoneNumber");
            }}
            required
          />
        </Field>
        <Field id="email" label={t("onboarding.fields.email")} error={err("email")} hint={t("onboarding.fields.login_email_hint")}>
          <Input id="email" type="email" autoComplete="email" maxLength={254} placeholder="contact@restaurant.cg" invalid={!!e.email} onChange={on("email")} required />
        </Field>
      </FormSection>

      <FormSection step={2} title={t("onboarding.sections.address.title")} description={t("onboarding.sections.address.description")}>
        <Field id="addressLine" label={t("onboarding.fields.addressLine")} error={err("addressLine")} className="sm:col-span-2" hint={t("onboarding.fields.addressLine_hint")}>
          <Input id="addressLine" autoComplete="street-address" maxLength={255} placeholder={t("onboarding.fields.addressLine_placeholder")} invalid={!!e.addressLine} onChange={on("addressLine")} required />
        </Field>
        <CitySelect error={err("city")} onChange={on("city")} />
        <div className="hidden sm:block" />
        <LocationField
          error={err("latitude") ?? err("longitude")}
          onChange={() => {
            clearError("latitude");
            clearError("longitude");
          }}
        />
      </FormSection>

      <FormSection step={3} title={t("onboarding.sections.legal.title")} description={t("onboarding.sections.legal.description")}>
        <Field id="legalName" label={t("onboarding.fields.legalName")} optionalLabel={optional} error={err("legalName")} className="sm:col-span-2">
          <Input id="legalName" maxLength={200} placeholder={t("onboarding.fields.legalName_placeholder")} invalid={!!e.legalName} onChange={on("legalName")} />
        </Field>
        <Field id="rccmNumber" label={t("onboarding.fields.rccmNumber")} optionalLabel={optional} error={err("rccmNumber")}>
          <Input id="rccmNumber" maxLength={100} placeholder="CG-BZV-01-2024-B12-00000" invalid={!!e.rccmNumber} onChange={on("rccmNumber")} />
        </Field>
        <Field id="taxId" label={t("onboarding.fields.taxId")} optionalLabel={optional} error={err("taxId")}>
          <Input id="taxId" maxLength={100} placeholder="M2024000000000X" invalid={!!e.taxId} onChange={on("taxId")} />
        </Field>
      </FormSection>

      <FormSection step={4} title={t("onboarding.sections.owner.title")} description={t("onboarding.sections.owner.description")}>
        <Field id="managerFullName" label={t("onboarding.fields.managerFullName")} error={err("managerFullName")} className="sm:col-span-2">
          <Input id="managerFullName" autoComplete="name" maxLength={150} placeholder={t("onboarding.fields.managerFullName_placeholder")} invalid={!!e.managerFullName} onChange={on("managerFullName")} required />
        </Field>
        <div className="sm:col-span-2">
          <Checkbox id="samePhoneToggle" name="" checked={managerUsesBusinessPhone} onChange={(ev) => setManagerUsesBusinessPhone(ev.target.checked)}>
            {t("onboarding.fields.samePhone")}
          </Checkbox>
        </div>
        {managerUsesBusinessPhone ? (
          <input type="hidden" name="managerPhone" value={businessPhone} />
        ) : (
          <Field id="managerPhone" label={t("onboarding.fields.managerPhone")} error={err("managerPhone")} className="sm:col-span-2">
            <PhoneInput id="managerPhone" placeholder={t("onboarding.fields.phone_placeholder")} invalid={!!e.managerPhone} onChange={on("managerPhone")} required />
          </Field>
        )}
        {managerUsesBusinessPhone && e.managerPhone && !e.phoneNumber && (
          <p className="text-[13px] text-danger sm:col-span-2">{err("managerPhone")}</p>
        )}
        <PasswordFields errors={e} onChange={clearError} />
      </FormSection>

      <FormFooter pending={pending} errors={e} serverError={serverError} hasClientErrors={hasClientErrors} onChange={clearError} />
    </form>
  );
}
