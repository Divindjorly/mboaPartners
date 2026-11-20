import "server-only";

import { StatusCodes } from "#/constants/httpStatus";
import type { Application, PartnerDocument, PartnerInbox, PartnerProfile } from "#/types/partner.types";
import { MBOA_ENDPOINTS } from "../endpoints";
import { mboaDelete, mboaGet, mboaPost, mboaPostTo, mboaUpload } from "../mboaClient";
import { payoutOf } from "#/modules/onboarding/schemas/onboarding.schemas";
import type { PartnerGateway, SignedIn } from "./partnerGateway";

/**
 * Implémentation sur l'API Mboa (mboaPlatformBackend, module partenaires).
 * Tout est branché : inscription, code e-mail, connexion, mot de passe oublié, profil, dossier, pièces et soumission.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const CONFLICT = { [StatusCodes.CONFLICT]: "ACCOUNT_CONFLICT" } as const;

const toSignedIn = ({ ref, partnerType }: SignedIn): SignedIn => ({ ref, partnerType });

export const livePartnerGateway: PartnerGateway = {
  source: "api",

  async signupMerchant(ctx, data) {
    return mboaPost<{ email: string }>(
      MBOA_ENDPOINTS.signupMerchant,
      {
        businessName: data.businessName,
        legalName: data.legalName,
        businessType: data.businessType,
        rccmNumber: data.rccmNumber,
        taxId: data.taxId,
        phoneNumber: data.phoneNumber,
        email: data.email,
        addressLine: data.addressLine,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        managerFullName: data.managerFullName,
        managerPhone: data.managerPhone,
        payout: payoutOf(data),
        password: data.password,
      },
      ctx,
      CONFLICT,
    );
  },

  async signupDeliveryCompany(ctx, data) {
    return mboaPost<{ email: string }>(
      MBOA_ENDPOINTS.signupDeliveryCompany,
      {
        companyName: data.companyName,
        rccmNumber: data.rccmNumber,
        taxId: data.taxId,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        addressLine: data.addressLine,
        city: data.city,
        managerFirstName: data.managerFirstName,
        managerLastName: data.managerLastName,
        managerPhone: data.managerPhone,
        managerEmail: data.managerEmail,
        payout: payoutOf(data),
        password: data.password,
      },
      ctx,
      CONFLICT,
    );
  },

  async requestEmailCode(ctx, email) {
    await mboaPost(MBOA_ENDPOINTS.emailCodeRequest, { email }, ctx);
  },

  async verifyEmailCode(ctx, email, code) {
    return toSignedIn(await mboaPost<SignedIn>(MBOA_ENDPOINTS.emailCodeConfirm, { email, code }, ctx));
  },

  async logout(ctx, token) {
    await mboaPost(MBOA_ENDPOINTS.logout, {}, ctx, {}, token);
  },
  async login(ctx, email, password) {
    return toSignedIn(await mboaPost<SignedIn>(MBOA_ENDPOINTS.login, { email, password }, ctx));
  },

  getProfile: (ctx, session) => mboaGet<PartnerProfile>(MBOA_ENDPOINTS.me, ctx, session.ref),
  getApplication: (ctx, session) => mboaGet<Application>(MBOA_ENDPOINTS.application, ctx, session.ref),

  // Mot de passe oublié : code par e-mail (réponse identique pour une adresse inconnue), puis nouveau mot de passe
  async requestPasswordReset(ctx, email) {
    await mboaPost(MBOA_ENDPOINTS.passwordResetRequest, { email }, ctx);
  },
  async confirmPasswordReset(ctx, email, code, password) {
    await mboaPost(MBOA_ENDPOINTS.passwordResetConfirm, { email, code, password }, ctx);
  },

  uploadDocument: (ctx, session, type, file) =>
    mboaUpload<PartnerDocument>(MBOA_ENDPOINTS.documents, `?type=${type}`, file, ctx, session.ref),

  async deleteDocument(ctx, session, documentId) {
    if (!UUID.test(documentId)) return; // identifiant inconnu : rien à retirer
    await mboaDelete(MBOA_ENDPOINTS.documents, `/${documentId}`, ctx, session.ref);
  },

  submitApplication: (ctx, session) => mboaPost<Application>(MBOA_ENDPOINTS.submitApplication, {}, ctx, {}, session.ref),

  listNotifications: (ctx, session, page) =>
    mboaGet<PartnerInbox>(MBOA_ENDPOINTS.notifications, ctx, session.ref, page > 1 ? `?page=${Math.min(999, Math.trunc(page))}` : undefined),
  async markNotificationRead(ctx, session, id) {
    if (!UUID.test(id)) return; // identifiant inconnu : rien à marquer
    await mboaPostTo(MBOA_ENDPOINTS.notifications, `/${id}/read`, ctx, session.ref);
  },
  async markAllNotificationsRead(ctx, session) {
    await mboaPostTo(MBOA_ENDPOINTS.notificationsReadAll, undefined, ctx, session.ref);
  },
};
