import { getCountries, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";

/**
 * Téléphones de tous les pays (règles de numérotation de chaque pays, libphonenumber), Congo par défaut.
 * Format envoyé à l'API : E.164 (« +242061234567 » ; pour le Congo, le 0 fait partie du numéro national).
 * Mêmes règles que le backend (mboaPlatformBackend/src/utils/phone.ts).
 */
export type { CountryCode };
export const DEFAULT_COUNTRY: CountryCode = "CG";

const clean = (v: string) => v.trim().replace(/[\s().-]/g, "").replace(/^00/, "+");

/** E.164 si le numéro est valide pour son pays (indicatif tapé, sinon `country`), sinon null. */
export const toE164 = (input: string, country: CountryCode = DEFAULT_COUNTRY): string | null => {
  let v = clean(input);
  if (!v) return null;
  if (!v.startsWith("+") && country === "CG" && /^[2456]\d{7}$/.test(v)) v = `0${v}`; // 0 oublié
  const n = parsePhoneNumberFromString(v, v.startsWith("+") ? undefined : country);
  return n?.isValid() ? n.number : null;
};

export const isValidPhone = (input: string, country: CountryCode = DEFAULT_COUNTRY) => toE164(input, country) !== null;

/** « +242 06 123 4567 », « +33 6 12 34 56 78 » ; texte d'origine si illisible. */
export const formatPhone = (input: string | null | undefined): string => {
  if (!input) return "";
  return parsePhoneNumberFromString(clean(input), DEFAULT_COUNTRY)?.formatInternational() ?? input;
};

/** Pays et numéro national (« 06 123 4567 ») d'un numéro enregistré, pour préremplir un champ. */
export const splitPhone = (input: string | null | undefined): { country: CountryCode; national: string } => {
  const n = input ? parsePhoneNumberFromString(clean(input), DEFAULT_COUNTRY) : undefined;
  return n?.country ? { country: n.country, national: n.formatNational() } : { country: DEFAULT_COUNTRY, national: input ?? "" };
};

/** Chiffres du numéro national (sans indicatif ni 0 de tête) : pour refuser un mot de passe qui le contient. */
export const nationalDigits = (input: string): string => {
  const n = parsePhoneNumberFromString(clean(input), DEFAULT_COUNTRY);
  return (n ? String(n.nationalNumber) : input.replace(/\D/g, "")).replace(/^0+/, "");
};

export const dialCodeOf = (country: CountryCode) => `+${getCountryCallingCode(country)}`;

/** Exemple de numéro mobile du pays, au format national (placeholder du champ). */
export const examplePhone = (country: CountryCode) => getExampleNumber(country, examples)?.formatNational() ?? "";

const flagOf = (country: string) => String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

/** Congo d'abord, puis les pays voisins, puis tous les autres par ordre alphabétique (dans la langue de l'écran). */
const FIRST: CountryCode[] = ["CG", "CD", "CM", "GA", "CF", "AO", "TD", "GQ"];

export type PhoneCountry = { code: CountryCode; name: string; flag: string; dialCode: string };
export const phoneCountries = (lang: string): PhoneCountry[] => {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([lang], { type: "region" });
  } catch {
    names = null;
  }
  const all = getCountries().map((code) => ({ code, name: names?.of(code) ?? code, flag: flagOf(code), dialCode: dialCodeOf(code) }));
  const first = FIRST.flatMap((c) => all.filter((x) => x.code === c));
  const rest = all.filter((x) => !FIRST.includes(x.code)).sort((a, b) => a.name.localeCompare(b.name, lang));
  return [...first, ...rest];
};
