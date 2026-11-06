"use client";

import { useValidatedAction } from "#/hooks/useValidatedAction";
import { emailCodeSchema } from "../schemas/auth.schemas";
import { verifyEmailCodeAction } from "../services/auth.actions";

/** Saisie du code à 6 chiffres reçu par e-mail ; ouvre la session en cas de succès. */
export const useVerifyEmailCode = (onVerified: () => void) => useValidatedAction(verifyEmailCodeAction, emailCodeSchema, onVerified);
