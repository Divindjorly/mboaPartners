/**
 * Modèle du dossier partenaire (contrat de docs/specs/parcours-inscription-partenaires.md).
 * Partagé navigateur / serveur : aucune donnée sensible.
 */
export const PARTNER_TYPES = ["MERCHANT", "DELIVERY_COMPANY"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const APPLICATION_STATUSES = ["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const DOCUMENT_TYPES = ["RCCM", "NIU", "ID_CARD", "LOCATION_PLAN", "BUSINESS_LICENSE", "VEHICLE_INSURANCE"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_STATUSES = ["PENDING", "ACCEPTED", "REFUSED"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export type PartnerDocument = {
  id: string;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  rejectionReason: string | null;
  uploadedAt: string;
};

export type Application = {
  partnerType: PartnerType;
  status: ApplicationStatus;
  submittedAt: string | null;
  reviewDueAt: string | null;
  decidedAt: string | null;
  rejectionReason: string | null;
  requiredDocuments: DocumentType[];
  documents: PartnerDocument[];
  canSubmit: boolean;
};

export type PartnerProfile = {
  displayName: string;
  partnerType: PartnerType;
  email: string;
  phoneNumber: string;
};

/** Contenu (chiffré) du cookie de session. `ref` = jeton d'accès API, ou identifiant du compte simulé. */
export type PartnerSession = {
  ref: string;
  partnerType: PartnerType;
  expiresAt: number;
};
