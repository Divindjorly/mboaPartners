import "server-only";

import { COUNTRY_NAME } from "#/constants/geography";
import { StatusCodes } from "#/constants/httpStatus";
import { ApiError } from "#/utils/ApiError";
import { MBOA_ENDPOINTS } from "../endpoints";
import { mboaPost } from "../mboaClient";
import type { PartnerGateway } from "./partnerGateway";

/**
 * Implémentation sur l'API Mboa Eat.
 * Les inscriptions existent déjà ; les autres méthodes attendent les endpoints décrits dans
 * docs/specs/parcours-inscription-partenaires.md et répondent NOT_AVAILABLE d'ici là.
 */
const notAvailable = (): never => {
  throw new ApiError("Endpoint not available yet", "NOT_AVAILABLE", StatusCodes.SERVICE_UNAVAILABLE);
};

export const livePartnerGateway: PartnerGateway = {
  source: "api",

  async signupMerchant(ctx, data) {
    await mboaPost(
      MBOA_ENDPOINTS.signupMerchant,
      {
        phoneNumber: data.phoneNumber,
        businessName: data.businessName,
        legalName: data.legalName,
        businessType: data.businessType,
        rccmNumber: data.rccmNumber,
        taxId: data.taxId,
        email: data.email,
        addressLine: data.addressLine,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        managerFullName: data.managerFullName,
        managerPhone: data.managerPhone,
        password: data.password,
      },
      ctx,
      { [StatusCodes.CONFLICT]: "ACCOUNT_CONFLICT" },
    );
    return { email: data.email };
  },

  async signupDeliveryCompany(ctx, data) {
    await mboaPost(
      MBOA_ENDPOINTS.signupDeliveryCompany,
      {
        companyName: data.companyName,
        rccmNumber: data.rccmNumber,
        taxId: data.taxId,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        addressLine: data.addressLine,
        city: data.city,
        country: COUNTRY_NAME,
        managerFirstName: data.managerFirstName,
        managerLastName: data.managerLastName,
        managerPhone: data.managerPhone,
        managerEmail: data.managerEmail,
        password: data.password,
      },
      ctx,
      { [StatusCodes.CONFLICT]: "ACCOUNT_CONFLICT" },
    );
    return { email: data.managerEmail };
  },

  // À brancher sur la spec (section 3) : /v1/auth/email/verification/*, login par e-mail, reset par e-mail
  requestEmailCode: async () => notAvailable(),
  verifyEmailCode: async () => notAvailable(),
  login: async () => notAvailable(),
  requestPasswordReset: async () => notAvailable(),
  confirmPasswordReset: async () => notAvailable(),

  // À brancher sur la spec (sections 4 à 6) : /v1/users/me/merchant/* et /v1/fleet/*
  getProfile: async () => notAvailable(),
  getApplication: async () => notAvailable(),
  uploadDocument: async () => notAvailable(),
  deleteDocument: async () => notAvailable(),
  submitApplication: async () => notAvailable(),
};
