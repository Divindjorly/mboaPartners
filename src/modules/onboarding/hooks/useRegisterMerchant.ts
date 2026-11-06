"use client";

import { useState } from "react";
import { merchantSchema } from "../schemas/onboarding.schemas";
import { registerMerchantAction } from "../services/onboarding.actions";
import { useSignupForm } from "./useSignupForm";

/** Inscription d'un restaurant : formulaire + recopie optionnelle du téléphone vers le gérant. */
export const useRegisterMerchant = (onSuccess: (email: string) => void) => {
  const form = useSignupForm(registerMerchantAction, merchantSchema, onSuccess);
  const [businessPhone, setBusinessPhone] = useState("");
  const [managerUsesBusinessPhone, setManagerUsesBusinessPhone] = useState(true);

  return { ...form, businessPhone, setBusinessPhone, managerUsesBusinessPhone, setManagerUsesBusinessPhone };
};
