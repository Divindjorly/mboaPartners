"use client";

import { useTranslation } from "react-i18next";
import { Field, Select } from "#/components/ui/Form";
import { CONGO_CITIES } from "#/constants/geography";

type Props = { error?: string; onChange: (city: string) => void };

export function CitySelect({ error, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <Field id="city" label={t("onboarding.fields.city")} error={error}>
      <Select id="city" defaultValue="" invalid={!!error} onChange={(e) => onChange(e.target.value)} required>
        <option value="" disabled>
          {t("onboarding.fields.city_placeholder")}
        </option>
        {CONGO_CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
    </Field>
  );
}
