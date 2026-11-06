import type { RateLimitRule } from "#/utils/rateLimiter";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/** Limites anti-abus (OWASP A06 / A07). Les clés combinent IP, e-mail, téléphone ou compte. */
export const RATE_LIMITS = {
  signupPerIp: { limit: 5, windowMs: TEN_MINUTES },
  signupPerPhone: { limit: 3, windowMs: ONE_HOUR },
  signupPerEmail: { limit: 3, windowMs: ONE_HOUR },
  emailCodeVerifyPerEmail: { limit: 5, windowMs: TEN_MINUTES },
  emailCodeVerifyPerIp: { limit: 20, windowMs: TEN_MINUTES },
  emailCodeResendPerEmail: { limit: 5, windowMs: ONE_HOUR },
  emailCodeResendPerIp: { limit: 10, windowMs: ONE_HOUR },
  loginPerEmail: { limit: 5, windowMs: TEN_MINUTES },
  loginPerIp: { limit: 20, windowMs: TEN_MINUTES },
  passwordResetPerEmail: { limit: 3, windowMs: ONE_HOUR },
  passwordResetPerIp: { limit: 10, windowMs: ONE_HOUR },
  applicationWritePerAccount: { limit: 60, windowMs: TEN_MINUTES },
  uploadPerAccount: { limit: 30, windowMs: TEN_MINUTES },
} satisfies Record<string, RateLimitRule>;

/**
 * Politique de mot de passe alignée sur OWASP ASVS 5 / NIST SP 800-63B :
 * longueur minimale élevée, pas de règles de composition arbitraires,
 * refus des mots de passe courants et de ceux contenant le numéro.
 */
export const PASSWORD_POLICY = { minLength: 12, maxLength: 128 } as const;

/** Extrait des mots de passe les plus fréquents (comparaison insensible à la casse). */
export const COMMON_PASSWORDS = new Set([
  "123456789012",
  "1234567890123",
  "azertyuiop12",
  "azertyuiopqs",
  "qwertyuiop12",
  "motdepasse12",
  "motdepasse123",
  "password1234",
  "password12345",
  "passwordpassword",
  "aaaaaaaaaaaa",
  "000000000000",
  "111111111111",
  "mboadelivery",
  "mboadelivery1",
  "mboadelivery123",
  "brazzaville12",
  "brazzaville123",
  "pointenoire123",
  "congobrazzaville",
  "iloveyou1234",
  "bienvenue123",
  "bonjour12345",
  "administrator",
]);

/** Caractères de contrôle interdits dans les champs texte (hors tab/retour). */
export const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
