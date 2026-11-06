/**
 * Valeurs du mode démonstration (PARTNER_DATA_SOURCE=mock). Affichées à l'écran en mode démo
 * pour pouvoir tester le parcours ; jamais utilisées avec l'API réelle.
 */
export const MOCK_EMAIL_CODE = "123456";

export const MOCK_DEMO_PASSWORD = "Demo-Mboa-2026";

export const MOCK_DEMO_ACCOUNTS = [
  {
    email: "demo.restaurant@mboa.cg",
    partnerType: "MERCHANT",
    displayName: "Chez Mama Ngouabi",
    phoneNumber: "+242061234567",
  },
  {
    email: "demo.flotte@mboa.cg",
    partnerType: "DELIVERY_COMPANY",
    displayName: "Speed Coursiers Brazza",
    phoneNumber: "+242051234567",
  },
] as const;

/** Motifs utilisés par la simulation de l'analyse. */
export const MOCK_REVIEW_REASONS = {
  documentRefused: "Photo floue : le numéro de la pièce est illisible.",
  applicationRejected: "Activité non éligible à la plateforme (simulation).",
} as const;
