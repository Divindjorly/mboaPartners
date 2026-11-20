/**
 * Liste blanche des routes amont appelables (OWASP A01 / SSRF).
 * Aucun chemin n'est construit à partir d'une saisie utilisateur.
 * API : mboaPlatformBackend (module partenaires).
 */
export const MBOA_ENDPOINTS = {
  signupMerchant: "/v1/partners/signup/merchant",
  signupDeliveryCompany: "/v1/partners/signup/delivery-company",
  emailCodeRequest: "/v1/partners/email/verification/request",
  emailCodeConfirm: "/v1/partners/email/verification/confirm",
  login: "/v1/partners/login",
  logout: "/v1/partners/logout",
  passwordResetRequest: "/v1/partners/password/reset/request",
  passwordResetConfirm: "/v1/partners/password/reset/confirm",
  me: "/v1/partners/me",
  application: "/v1/partners/me/application",
  submitApplication: "/v1/partners/me/application/submit",
  /** Suffixes autorisés : `?type=<DocumentType>` (dépôt) et `/<uuid>` (suppression), validés avant l'appel. */
  documents: "/v1/partners/me/documents",
  /** Notifications du compte. Suffixes autorisés : `?page=<n>` (liste) et `/<uuid>/read` (lecture d'une notification). */
  notifications: "/v1/partners/me/notifications",
  notificationsReadAll: "/v1/partners/me/notifications/read-all",
} as const;

export type MboaEndpoint = (typeof MBOA_ENDPOINTS)[keyof typeof MBOA_ENDPOINTS];
