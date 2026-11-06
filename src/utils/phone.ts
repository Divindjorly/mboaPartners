/**
 * Numéros congolais (République du Congo, +242).
 * Format national : 9 chiffres commençant par 0 (ex. 06 123 45 67).
 * L'API Mboa Eat attend l'E.164 en conservant le 0 : "+242061234567"
 * (même convention que mboadeliveryBackend/src/utils/phone.ts).
 */
export const CONGO_DIAL_CODE = "+242";

const NATIONAL_PATTERN = /^0[2456]\d{7}$/;
export const E164_CONGO_PATTERN = /^\+2420[2456]\d{7}$/;

/** "+242 06 123 45 67", "00242061234567", "61234567" → "061234567" */
export const toNationalCongo = (input: string): string => {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00242")) digits = digits.slice(5);
  else if (digits.startsWith("242") && digits.length >= 11) digits = digits.slice(3);
  if (digits.length === 8 && /^[2456]/.test(digits)) digits = `0${digits}`;
  return digits;
};

export const isValidCongoPhone = (input: string): boolean => NATIONAL_PATTERN.test(toNationalCongo(input));

export const toE164Congo = (input: string): string => `${CONGO_DIAL_CODE}${toNationalCongo(input)}`;

/** "+242061234567" → "+242 06 123 45 67" */
export const formatCongoPhone = (input: string): string => {
  const n = toNationalCongo(input);
  if (!NATIONAL_PATTERN.test(n)) return input;
  return `${CONGO_DIAL_CODE} ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
};
