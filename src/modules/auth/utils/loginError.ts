import type { TFunction } from "i18next";
import type { ActionFailure } from "#/types/api.types";

/** Où afficher l'erreur : sous un champ, ou sur une ligne au-dessus du bouton. */
export type LoginErrorPlace = "email" | "password" | "form";
export type LoginError = { place: LoginErrorPlace; message: string };

/**
 * Échec de connexion → phrase compréhensible pour la personne (jamais le texte brut du serveur), et sa place.
 * Renvoie null quand l'écran gère le cas autrement (erreurs de saisie des champs, e-mail à vérifier, entreprise non validée).
 */
export const loginErrorOf = (t: TFunction, failure: ActionFailure | null | undefined): LoginError | null => {
  if (!failure) return null;
  const { code, retryAfterSec } = failure.error;
  switch (code) {
    case "VALIDATION_ERROR":
    case "EMAIL_NOT_VERIFIED":
      return null;
    case "ACCOUNT_NOT_APPROVED":
      return { place: "form", message: t("login_errors.not_active") };
    case "ACCOUNT_NOT_FOUND":
      return { place: "email", message: t("login_errors.not_found") };
    case "INVALID_CREDENTIALS":
      return { place: "password", message: t("login_errors.wrong_password") };
    case "RATE_LIMITED":
    case "REQUEST_BLOCKED": {
      const minutes = retryAfterSec ? Math.max(1, Math.ceil(retryAfterSec / 60)) : 0;
      return {
        place: "form",
        message: minutes ? t("login_errors.too_many", { count: minutes }) : t("login_errors.too_many_later"),
      };
    }
    case "UPSTREAM_UNREACHABLE":
    case "UPSTREAM_TIMEOUT":
      return { place: "form", message: t("login_errors.offline") };
    case "UPSTREAM_UNAVAILABLE":
    case "INTERNAL_ERROR":
      return { place: "form", message: t("login_errors.unavailable") };
    default:
      return { place: "form", message: t("login_errors.generic") };
  }
};
