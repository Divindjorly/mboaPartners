import type { RequestContext } from "#/types/api.types";
import type { Application, DocumentType, PartnerDocument, PartnerInbox, PartnerProfile, PartnerSession, PartnerType } from "#/types/partner.types";
import type { DeliveryCompanyInput, MerchantInput } from "#/modules/onboarding/schemas/onboarding.schemas";

/** Fichier reçu, déjà contrôlé (taille, type réel). */
export type UploadedFile = { fileName: string; mimeType: string; sizeBytes: number; bytes: Uint8Array };

/** Décision simulée de l'équipe Mboa (mode démo uniquement). */
export type ReviewDecision = "approve" | "request_changes" | "reject";

export type SignedIn = { ref: string; partnerType: PartnerType };

/**
 * Contrat d'accès aux données du parcours partenaire (cf. docs/specs/parcours-inscription-partenaires.md).
 * Implémentation : API de la plateforme (`livePartnerGateway.ts`, mboaPlatformBackend sur Neon).
 * Toutes les erreurs sont des ApiError.
 */
export interface PartnerGateway {
  readonly source: "api";
  signupMerchant(ctx: RequestContext, data: MerchantInput): Promise<{ email: string }>;
  signupDeliveryCompany(ctx: RequestContext, data: DeliveryCompanyInput): Promise<{ email: string }>;
  /** Silencieux si le compte n'existe pas (pas d'énumération des comptes). */
  requestEmailCode(ctx: RequestContext, email: string): Promise<void>;
  verifyEmailCode(ctx: RequestContext, email: string, code: string): Promise<SignedIn>;
  login(ctx: RequestContext, email: string, password: string): Promise<SignedIn>;
  /** Ferme la session en cours côté serveur (déconnexion). */
  logout(ctx: RequestContext, token: string): Promise<void>;
  /** Silencieux si le compte n'existe pas. */
  requestPasswordReset(ctx: RequestContext, email: string): Promise<void>;
  confirmPasswordReset(ctx: RequestContext, email: string, code: string, password: string): Promise<void>;
  getProfile(ctx: RequestContext, session: PartnerSession): Promise<PartnerProfile>;
  getApplication(ctx: RequestContext, session: PartnerSession): Promise<Application>;
  uploadDocument(ctx: RequestContext, session: PartnerSession, type: DocumentType, file: UploadedFile): Promise<PartnerDocument>;
  deleteDocument(ctx: RequestContext, session: PartnerSession, documentId: string): Promise<void>;
  submitApplication(ctx: RequestContext, session: PartnerSession): Promise<Application>;
  /** Notifications du compte (20 par page, les plus récentes d'abord) ; l'API ne renvoie que celles de la session. */
  listNotifications(ctx: RequestContext, session: PartnerSession, page: number): Promise<PartnerInbox>;
  /** NOT_FOUND si la notification n'appartient pas au compte. */
  markNotificationRead(ctx: RequestContext, session: PartnerSession, id: string): Promise<void>;
  markAllNotificationsRead(ctx: RequestContext, session: PartnerSession): Promise<void>;
}
