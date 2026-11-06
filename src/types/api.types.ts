import type { ErrorCode, FieldErrors } from "#/utils/ApiError";

/**
 * Réponse unifiée de toutes les Server Actions (même contrat que les backends) :
 *   succès : { success: true, data }
 *   échec  : { success: false, error: { code, ... } }
 * Le message affiché est obtenu côté client via `api_errors.<code>`.
 */
export type ActionSuccess<T> = { success: true; data: T };

export type ActionFailure = {
  success: false;
  error: {
    code: ErrorCode;
    fieldErrors?: FieldErrors;
    details?: string[];
    retryAfterSec?: number;
  };
};

export type ActionResponse<T> = ActionSuccess<T> | ActionFailure;

/** Contexte de requête transmis aux flows (équivalent de `req` côté Express). */
export type RequestContext = {
  requestId: string;
  clientIp: string;
  locale: string;
};
