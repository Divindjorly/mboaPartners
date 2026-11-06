import type { TFunction } from "i18next";
import type { ActionFailure } from "#/types/api.types";

/**
 * Message d'erreur traduit à partir d'une réponse d'action en échec
 * (équivalent web de `getTranslatedErrorMessage` de l'app mobile).
 */
export const getTranslatedErrorMessage = (t: TFunction, failure: ActionFailure | null | undefined): string => {
  if (!failure) return "";
  const key = `api_errors.${failure.error.code}`;
  const message = t(key);
  return message === key ? t("api_errors.UNKNOWN_ERROR") : message;
};

/** Traduit une liste de clés de validation (`validation.*`) renvoyées pour un champ. */
export const translateFieldError = (t: TFunction, keys: string[] | undefined): string | undefined => {
  const first = keys?.[0];
  if (!first) return undefined;
  const message = t(first);
  return message === first ? t("validation.required") : message;
};
