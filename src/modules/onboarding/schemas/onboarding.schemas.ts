import { z } from "zod";
import { BUSINESS_TYPES } from "#/constants/businessTypes";
import { CONGO_BOUNDS, CONGO_CITIES } from "#/constants/geography";
import { COMMON_PASSWORDS, CONTROL_CHARS, PASSWORD_POLICY } from "#/constants/security";
import { LOCALES } from "#/i18n/config";
import { isValidCongoPhone, toE164Congo, toNationalCongo } from "#/utils/phone";

/**
 * Schémas partagés navigateur (retour immédiat) / serveur (source de vérité, OWASP A05).
 * Les messages sont des clés de traduction `validation.*` (cf. src/locales).
 * Les entrées viennent d'un FormData : tout est chaîne, "" = champ vide.
 */

export const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "validation.too_long")
    .refine((v) => !CONTROL_CHARS.test(v), "validation.invalid_characters");

export const requiredText = (max = 150) => safeText(max).pipe(z.string().min(1, "validation.required"));

const optionalText = (max = 150) =>
  safeText(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "validation.required")
  .max(254, "validation.too_long")
  .pipe(z.email("validation.email"));

export const phoneField = z
  .string()
  .trim()
  .min(1, "validation.required")
  .max(30, "validation.too_long")
  .refine(isValidCongoPhone, "validation.phone")
  .transform(toE164Congo);

/** OWASP ASVS 5 / NIST 800-63B : longueur, pas de composition imposée, liste noire. */
export const passwordField = z
  .string()
  .min(PASSWORD_POLICY.minLength, "validation.password_min")
  .max(PASSWORD_POLICY.maxLength, "validation.password_max")
  .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), "validation.password_common")
  .refine((v) => new Set(v).size >= 4, "validation.password_common");

const consent = z.literal("on", { error: "validation.consent" });

const city = z.enum(CONGO_CITIES, { error: "validation.city" });

/** Anti-robot : champ caché qui doit rester vide (contrôlé dans le flow). */
const honeypot = z.string().optional();

export const localeField = z.enum(LOCALES).optional();

/** "" → absent (sinon Number("") vaudrait 0, une latitude valide). */
const coordinate = (bounds: { min: number; max: number }) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce
      .number({ error: "validation.coordinates_required" })
      .refine(Number.isFinite, "validation.coordinates_required")
      .refine((n) => n >= bounds.min && n <= bounds.max, "validation.out_of_congo"),
  );

/** Confirmation et absence du numéro dans le mot de passe. */
const checkPassword = (
  data: { password: string; confirmPassword: string; loginPhone: string },
  ctx: z.RefinementCtx,
) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "validation.password_mismatch" });
  }
  const national = toNationalCongo(data.loginPhone).replace(/^0/, "");
  if (national.length >= 8 && data.password.replace(/\D/g, "").includes(national)) {
    ctx.addIssue({ code: "custom", path: ["password"], message: "validation.password_contains_phone" });
  }
};

// ---------------------------------------------------------------------------
// Entreprise de livraison → POST /v1/auth/signup/delivery-company
// ---------------------------------------------------------------------------
export const deliveryCompanySchema = z
  .object({
    companyName: requiredText(150),
    rccmNumber: optionalText(100),
    taxId: optionalText(100),
    contactPhone: phoneField,
    contactEmail: emailField,
    addressLine: requiredText(255),
    city,
    managerFirstName: requiredText(100),
    managerLastName: requiredText(100),
    managerPhone: phoneField,
    managerEmail: emailField,
    password: passwordField,
    confirmPassword: z.string().max(PASSWORD_POLICY.maxLength),
    consent,
    website: honeypot,
    locale: localeField,
  })
  .superRefine((d, ctx) => checkPassword({ ...d, loginPhone: d.managerPhone }, ctx));

export type DeliveryCompanyInput = z.infer<typeof deliveryCompanySchema>;

// ---------------------------------------------------------------------------
// Restaurant / commerce → POST /v1/auth/signup/merchant
// ---------------------------------------------------------------------------
export const merchantSchema = z
  .object({
    businessName: requiredText(150),
    legalName: optionalText(200),
    businessType: z.enum(BUSINESS_TYPES, { error: "validation.business_type" }),
    rccmNumber: optionalText(100),
    taxId: optionalText(100),
    phoneNumber: phoneField,
    email: emailField,
    addressLine: requiredText(255),
    city,
    latitude: coordinate(CONGO_BOUNDS.latitude),
    longitude: coordinate(CONGO_BOUNDS.longitude),
    managerFullName: requiredText(150),
    managerPhone: phoneField,
    password: passwordField,
    confirmPassword: z.string().max(PASSWORD_POLICY.maxLength),
    consent,
    website: honeypot,
    locale: localeField,
  })
  .superRefine((d, ctx) => checkPassword({ ...d, loginPhone: d.phoneNumber }, ctx));

export type MerchantInput = z.infer<typeof merchantSchema>;
