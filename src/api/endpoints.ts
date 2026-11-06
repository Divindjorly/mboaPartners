/**
 * Liste blanche des routes amont appelables (OWASP A01 / SSRF).
 * Aucun chemin n'est construit à partir d'une saisie utilisateur.
 */
export const MBOA_ENDPOINTS = {
  signupMerchant: "/v1/auth/signup/merchant",
  signupDeliveryCompany: "/v1/auth/signup/delivery-company",
} as const;

export type MboaEndpoint = (typeof MBOA_ENDPOINTS)[keyof typeof MBOA_ENDPOINTS];
