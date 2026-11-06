"use server";

import type { ActionResponse } from "#/types/api.types";
import { formDataToObject } from "#/utils/formData";
import { runAction } from "#/utils/runAction";
import { resendEmailCodeFlow, verifyEmailCodeFlow } from "../flows/emailVerification.flow";
import { confirmPasswordResetFlow, requestPasswordResetFlow } from "../flows/passwordReset.flow";
import { loginFlow, logoutFlow } from "../flows/session.flow";
import type { CodeSentResult, PasswordResetResult, SignedInResult } from "../types/auth.types";

/** Points d'entrée publics : conversion FormData → flow → réponse unifiée, sans logique. */
type State<T> = ActionResponse<T> | null;

export async function verifyEmailCodeAction(_prev: State<SignedInResult>, formData: FormData): Promise<ActionResponse<SignedInResult>> {
  const input = formDataToObject(formData);
  return runAction(verifyEmailCodeFlow, input, input.locale);
}

export async function resendEmailCodeAction(_prev: State<CodeSentResult>, formData: FormData): Promise<ActionResponse<CodeSentResult>> {
  const input = formDataToObject(formData);
  return runAction(resendEmailCodeFlow, input, input.locale);
}

export async function loginAction(_prev: State<SignedInResult>, formData: FormData): Promise<ActionResponse<SignedInResult>> {
  const input = formDataToObject(formData);
  return runAction(loginFlow, input, input.locale);
}

export async function logoutAction(_prev: State<{ signedOut: true }>, formData: FormData): Promise<ActionResponse<{ signedOut: true }>> {
  const input = formDataToObject(formData);
  return runAction(logoutFlow, input, input.locale);
}

export async function requestPasswordResetAction(_prev: State<CodeSentResult>, formData: FormData): Promise<ActionResponse<CodeSentResult>> {
  const input = formDataToObject(formData);
  return runAction(requestPasswordResetFlow, input, input.locale);
}

export async function confirmPasswordResetAction(_prev: State<PasswordResetResult>, formData: FormData): Promise<ActionResponse<PasswordResetResult>> {
  const input = formDataToObject(formData);
  return runAction(confirmPasswordResetFlow, input, input.locale);
}
