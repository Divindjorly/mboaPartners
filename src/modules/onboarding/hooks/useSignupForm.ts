"use client";

import type { z } from "zod";
import { useValidatedAction } from "#/hooks/useValidatedAction";
import type { ActionResponse } from "#/types/api.types";
import type { SignupResult } from "../types/onboarding.types";

type SignupAction = (prev: ActionResponse<SignupResult> | null, formData: FormData) => Promise<ActionResponse<SignupResult>>;

/** Formulaire d'inscription : renvoie l'adresse e-mail à vérifier une fois le compte créé. */
export const useSignupForm = (action: SignupAction, schema: z.ZodType, onSuccess: (email: string) => void) =>
  useValidatedAction(action, schema, (data) => onSuccess(data.email));
