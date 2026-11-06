"use client";

import { deliveryCompanySchema } from "../schemas/onboarding.schemas";
import { registerDeliveryCompanyAction } from "../services/onboarding.actions";
import { useSignupForm } from "./useSignupForm";

/** Inscription d'une entreprise de livraison. */
export const useRegisterDeliveryCompany = (onSuccess: (email: string) => void) =>
  useSignupForm(registerDeliveryCompanyAction, deliveryCompanySchema, onSuccess);
