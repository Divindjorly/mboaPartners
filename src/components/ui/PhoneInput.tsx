"use client";

import { useMemo, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_COUNTRY, examplePhone, phoneCountries, splitPhone, toE164, type CountryCode } from "#/utils/phone";
import { Input } from "./Form";

const noopSubscribe = () => () => {};

type Props = {
  id: string;
  /** Numéro enregistré (E.164) ou national : pays et numéro sont préremplis. */
  defaultValue?: string | null;
  invalid?: boolean;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  /** Reçoit la valeur envoyée au formulaire (E.164 si valide, sinon la saisie avec son indicatif). */
  onChange?: (value: string) => void;
};

/**
 * Téléphone de n'importe quel pays : drapeau + indicatif (Congo par défaut) et numéro national.
 * Le formulaire reçoit, sous le nom `id`, le numéro au format international (E.164) quand il est valide pour le pays
 * choisi, sinon la saisie brute avec son indicatif (le serveur la refusera avec le message « numéro invalide »).
 * Un numéro collé avec son indicatif (« +33 6 … ») change le pays tout seul.
 */
export function PhoneInput({ id, defaultValue, invalid = false, required, placeholder, autoComplete = "tel-national", onChange }: Props) {
  const { t, i18n } = useTranslation();
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [national, setNational] = useState(initial.national);
  const countries = useMemo(() => phoneCountries(i18n.language), [i18n.language]);
  const current = countries.find((c) => c.code === country) ?? countries.find((c) => c.code === DEFAULT_COUNTRY)!;
  // Liste complète seulement dans le navigateur : noms et ordre des pays dépendent de la version d'ICU (serveur ≠ navigateur)
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const valueOf = (num: string, cc: CountryCode) => {
    const typed = num.trim();
    if (!typed) return "";
    const dial = countries.find((c) => c.code === cc)?.dialCode ?? current.dialCode;
    return toE164(typed, cc) ?? (typed.startsWith("+") ? typed : `${dial} ${typed}`);
  };
  const value = valueOf(national, country);

  const onNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // Numéro international collé : on en déduit le pays et on garde le numéro national
    if (/^\s*(\+|00)/.test(v)) {
      const e164 = toE164(v, country);
      if (e164) {
        const split = splitPhone(e164);
        setCountry(split.country);
        setNational(split.national);
        onChange?.(e164);
        return;
      }
    }
    setNational(v);
    onChange?.(valueOf(v, country));
  };

  return (
    <div className="flex">
      <label className="relative shrink-0">
        <span className="sr-only">{t("phone.country")}</span>
        <span
          aria-hidden
          className={`pointer-events-none inline-flex h-12 items-center gap-1.5 rounded-l-xl border border-r-0 bg-surface pr-6 pl-3 font-semibold text-ink tabular-nums ${invalid ? "border-danger" : "border-ink/20"}`}
        >
          <span className="text-lg leading-none">{current.flag}</span>
          {current.dialCode}
        </span>
        <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m2 4 4 4 4-4" />
        </svg>
        <select
          aria-label={t("phone.country")}
          value={country}
          onChange={(e) => {
            const cc = e.target.value as CountryCode;
            setCountry(cc);
            onChange?.(valueOf(national, cc));
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {(hydrated ? countries : [current]).map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.dialCode})
            </option>
          ))}
        </select>
      </label>
      <Input
        id={id}
        name={`${id}__national`}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        maxLength={24}
        invalid={invalid}
        required={required}
        placeholder={placeholder ?? examplePhone(country)}
        value={national}
        onChange={onNumber}
        className="min-w-0 rounded-l-none tabular-nums"
      />
      <input type="hidden" name={id} value={value} />
    </div>
  );
}
