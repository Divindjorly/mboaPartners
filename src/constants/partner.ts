import type { DocumentType, PartnerType } from "#/types/partner.types";

/** Pièces obligatoires du dossier, par type de partenaire (décision du 3 novembre 2026). */
export const REQUIRED_DOCUMENTS: Record<PartnerType, DocumentType[]> = {
  MERCHANT: ["RCCM", "NIU", "ID_CARD", "LOCATION_PLAN", "BUSINESS_LICENSE"],
  DELIVERY_COMPANY: ["RCCM", "NIU", "ID_CARD", "VEHICLE_INSURANCE"],
};

/** Fichiers acceptés : type réel contrôlé côté serveur par signature (« magic bytes »). */
export const UPLOAD_POLICY = {
  maxBytes: 10 * 1024 * 1024,
  accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
  mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  maxFileNameLength: 120,
} as const;

/** Délai d'analyse affiché : 48 h sans compter le samedi ni le dimanche (heure du Congo, UTC+1). */
export const REVIEW_POLICY = { businessHours: 48, utcOffsetHours: 1 } as const;

/** Durée de la session partenaire. */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
