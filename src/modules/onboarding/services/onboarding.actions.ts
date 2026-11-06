"use server";

import type { ActionResponse } from "#/types/api.types";
import { formDataToObject } from "#/utils/formData";
import { runAction } from "#/utils/runAction";
import { registerDeliveryCompanyFlow } from "../flows/registerDeliveryCompany.flow";
import { registerMerchantFlow } from "../flows/registerMerchant.flow";
import type { SignupResult } from "../types/onboarding.types";

/**
 * Points d'entrée publics (Server Actions) : ils ne contiennent aucune logique,
 * seulement la conversion FormData → flow → réponse unifiée.
 * Pas d'authentification (inscriptions publiques) : la protection repose sur
 * la validation, le champ piège, la limitation de débit et le contrôle d'origine
 * CSRF intégré à Next (OWASP A01).
 */
type State<T> = ActionResponse<T> | null;

export async function registerDeliveryCompanyAction(_prev: State<SignupResult>, formData: FormData): Promise<ActionResponse<SignupResult>> {
  const input = formDataToObject(formData);
  return runAction(registerDeliveryCompanyFlow, input, input.locale);
}

export async function registerMerchantAction(_prev: State<SignupResult>, formData: FormData): Promise<ActionResponse<SignupResult>> {
  const input = formDataToObject(formData);
  return runAction(registerMerchantFlow, input, input.locale);
}
