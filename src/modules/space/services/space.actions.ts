"use server";

import type { ActionResponse } from "#/types/api.types";
import type { Application } from "#/types/partner.types";
import { formDataToObject } from "#/utils/formData";
import { runAction } from "#/utils/runAction";
import { deleteDocumentFlow, simulateReviewFlow, submitApplicationFlow } from "../flows/application.flow";

/**
 * Actions de l'espace partenaire. L'authentification est vérifiée dans chaque flow
 * (session chiffrée), jamais côté client. Le dépôt de fichiers passe par
 * la route /api/partenaire/documents (taille de corps dédiée).
 */
type State<T> = ActionResponse<T> | null;

export async function deleteDocumentAction(_prev: State<{ deleted: true }>, formData: FormData): Promise<ActionResponse<{ deleted: true }>> {
  const input = formDataToObject(formData);
  return runAction(deleteDocumentFlow, input, input.locale);
}

export async function submitApplicationAction(_prev: State<Application>, formData: FormData): Promise<ActionResponse<Application>> {
  const input = formDataToObject(formData);
  return runAction(submitApplicationFlow, input, input.locale);
}

export async function simulateReviewAction(_prev: State<Application>, formData: FormData): Promise<ActionResponse<Application>> {
  const input = formDataToObject(formData);
  return runAction(simulateReviewFlow, input, input.locale);
}
