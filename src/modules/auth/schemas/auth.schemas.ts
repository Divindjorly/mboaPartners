import { z } from "zod";
import { PASSWORD_POLICY } from "#/constants/security";
import { emailField, localeField, passwordField } from "#/modules/onboarding/schemas/onboarding.schemas";

/** Schémas partagés navigateur / serveur du module d'authentification. */

const code = z.string().trim().regex(/^\d{6}$/, "validation.otp_format");

export const emailOnlySchema = z.object({ email: emailField, locale: localeField });

export const emailCodeSchema = z.object({ email: emailField, code, locale: localeField });

export const loginSchema = z.object({
  email: emailField,
  // Pas de politique de complexité à la connexion : seulement des bornes (anciens mots de passe acceptés)
  password: z.string().min(1, "validation.required").max(PASSWORD_POLICY.maxLength, "validation.password_max"),
  locale: localeField,
});

export const passwordResetConfirmSchema = z
  .object({
    email: emailField,
    code,
    password: passwordField,
    confirmPassword: z.string().max(PASSWORD_POLICY.maxLength),
    locale: localeField,
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "validation.password_mismatch" });
