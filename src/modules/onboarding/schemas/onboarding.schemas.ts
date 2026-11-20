import { z } from "zod";
import { BUSINESS_TYPES } from "#/constants/businessTypes";
import { CONGO_BOUNDS, CONGO_CITIES, isInCity } from "#/constants/geography";
import { COMMON_PASSWORDS, CONTROL_CHARS, PASSWORD_POLICY } from "#/constants/security";
import { LOCALES } from "#/i18n/config";
import { isValidPhone, nationalDigits, toE164 } from "#/utils/phone";

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
  .max(32, "validation.too_long")
  .refine((v) => isValidPhone(v), "validation.phone")
  .transform((v) => toE164(v) ?? v);

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

/** RIB de la zone CEMAC (23 caractères : banque 5, guichet 5, compte 11, clé 2) ou IBAN congolais ; espaces tolérés. */
export const RIB_PATTERN = /^(\d{10}[0-9A-Z]{11}\d{2}|CG\d{2}\d{10}[0-9A-Z]{11}\d{2})$/;
export const cleanRib = (v: string) => v.replace(/[\s.-]/g, "").toUpperCase();

/**
 * Compte de versement (saisi à l'inscription) : champs à plat du formulaire, contrôlés selon le mode choisi.
 * Mobile Money : opérateur + numéro ; virement : banque + RIB ; titulaire dans les deux cas.
 */
const payoutFields = {
  payoutMethod: z.enum(["MOBILE_MONEY", "BANK"], { error: "validation.required" }),
  payoutOperator: z.string().optional(),
  payoutPhone: z.string().optional(),
  bankName: safeText(80).optional(),
  rib: z.string().max(40, "validation.too_long").optional(),
  payoutHolder: requiredText(150),
};
type PayoutInput = { payoutMethod: "MOBILE_MONEY" | "BANK"; payoutOperator?: string; payoutPhone?: string; bankName?: string; rib?: string };
/**
 * Contrôle selon le mode choisi. Exécuté même si d'autres champs du formulaire sont faux (option `when`), pour que
 * toutes les erreurs du versement s'affichent en une fois ; les champs peuvent donc être absents ici.
 */
const checkPayout = (d: Partial<PayoutInput>, ctx: z.RefinementCtx) => {
  if (d.payoutMethod !== "MOBILE_MONEY" && d.payoutMethod !== "BANK") return;
  if (d.payoutMethod === "MOBILE_MONEY") {
    if (d.payoutOperator !== "MTN" && d.payoutOperator !== "AIRTEL") ctx.addIssue({ code: "custom", path: ["payoutOperator"], message: "validation.required" });
    if (!d.payoutPhone?.trim()) ctx.addIssue({ code: "custom", path: ["payoutPhone"], message: "validation.required" });
    else if (!isValidPhone(d.payoutPhone)) ctx.addIssue({ code: "custom", path: ["payoutPhone"], message: "validation.phone" });
  } else {
    if (!d.bankName?.trim()) ctx.addIssue({ code: "custom", path: ["bankName"], message: "validation.required" });
    if (!d.rib?.trim()) ctx.addIssue({ code: "custom", path: ["rib"], message: "validation.required" });
    else if (!RIB_PATTERN.test(cleanRib(d.rib))) ctx.addIssue({ code: "custom", path: ["rib"], message: "validation.rib" });
  }
};

/** Objet envoyé à l'API (POST /v1/partners/signup/*) à partir des champs du formulaire. */
export const payoutOf = (d: PayoutInput & { payoutHolder: string }) =>
  d.payoutMethod === "MOBILE_MONEY"
    ? { method: "MOBILE_MONEY" as const, operator: d.payoutOperator as "MTN" | "AIRTEL", phone: toE164(d.payoutPhone ?? "") ?? d.payoutPhone ?? "", holder: d.payoutHolder }
    : { method: "BANK" as const, bankName: (d.bankName ?? "").trim(), rib: cleanRib(d.rib ?? ""), holder: d.payoutHolder };

/** Confirmation et absence du numéro dans le mot de passe. */
const checkPassword = (
  data: { password: string; confirmPassword: string; loginPhone: string },
  ctx: z.RefinementCtx,
) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "validation.password_mismatch" });
  }
  const national = nationalDigits(data.loginPhone);
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
    ...payoutFields,
    password: passwordField,
    confirmPassword: z.string().max(PASSWORD_POLICY.maxLength),
    consent,
    website: honeypot,
    locale: localeField,
  })
  .superRefine((d, ctx) => checkPassword({ ...d, loginPhone: d.managerPhone }, ctx))
  .superRefine((d, ctx) => checkPayout(d, ctx), { when: () => true });

export type DeliveryCompanyInput = z.infer<typeof deliveryCompanySchema>;

// ---------------------------------------------------------------------------
// Restaurant / commerce → POST /v1/auth/signup/merchant
// ---------------------------------------------------------------------------
export const merchantSchema = z
  .object({
    businessName: requiredText(150),
    legalName: optionalText(150),
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
    ...payoutFields,
    password: passwordField,
    confirmPassword: z.string().max(PASSWORD_POLICY.maxLength),
    consent,
    website: honeypot,
    locale: localeField,
  })
  .superRefine((d, ctx) => {
    checkPassword({ ...d, loginPhone: d.phoneNumber }, ctx);
    // La position doit être celle de l'établissement, dans la ville choisie (pas celle de la personne ailleurs)
    if (Number.isFinite(d.latitude) && Number.isFinite(d.longitude) && !isInCity(d.city, d)) {
      ctx.addIssue({ code: "custom", path: ["latitude"], message: "validation.far_from_city" });
    }
  })
  .superRefine((d, ctx) => checkPayout(d, ctx), { when: () => true });

export type MerchantInput = z.infer<typeof merchantSchema>;
