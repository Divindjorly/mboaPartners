export type SignedInResult = { signedIn: true };
export type CodeSentResult = { sent: true };
export type PasswordResetResult = { reset: true };

/** Informations du mode démonstration, transmises par la page uniquement si PARTNER_DATA_SOURCE=mock. */
export type DemoInfo = {
  code: string;
  password: string;
  accounts: { email: string; partnerType: "MERCHANT" | "DELIVERY_COMPANY" }[];
};
