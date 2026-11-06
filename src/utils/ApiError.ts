import { StatusCodes } from "#/constants/httpStatus";

/** Codes d'erreur métier — chacun est traduit sous `api_errors.<CODE>` dans src/locales. */
export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UPSTREAM_REJECTED",
  "ACCOUNT_CONFLICT",
  "RATE_LIMITED",
  "REQUEST_BLOCKED",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "OTP_SEND_FAILED",
  "INVALID_CREDENTIALS",
  "EMAIL_NOT_VERIFIED",
  "UNAUTHENTICATED",
  "APPLICATION_LOCKED",
  "DOCUMENTS_MISSING",
  "FILE_TOO_LARGE",
  "FILE_TYPE_NOT_ALLOWED",
  "NOT_AVAILABLE",
  "UPSTREAM_UNAVAILABLE",
  "UPSTREAM_UNREACHABLE",
  "UPSTREAM_TIMEOUT",
  "INTERNAL_ERROR",
  "UNKNOWN_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Erreurs de champ : nom du champ → clés de traduction `validation.*`. */
export type FieldErrors = Record<string, string[]>;

type ApiErrorOptions = {
  fieldErrors?: FieldErrors;
  /** Détails lisibles renvoyés par l'API amont (déjà localisés). */
  details?: string[];
  retryAfterSec?: number;
};

/**
 * Erreur métier unique de l'application (même contrat que sungaplusBackend / mboadeliveryBackend).
 * Les flows lancent exclusivement des ApiError ; `runAction` les convertit en réponse unifiée.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly fieldErrors?: FieldErrors;
  readonly details?: string[];
  readonly retryAfterSec?: number;

  constructor(message: string, code: ErrorCode, statusCode: number, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = options.fieldErrors;
    this.details = options.details;
    this.retryAfterSec = options.retryAfterSec;
  }

  static validation(fieldErrors: FieldErrors): ApiError {
    return new ApiError("Validation failed", "VALIDATION_ERROR", StatusCodes.BAD_REQUEST, { fieldErrors });
  }

  static tooManyRequests(retryAfterSec: number): ApiError {
    return new ApiError("Rate limit exceeded", "RATE_LIMITED", StatusCodes.TOO_MANY_REQUESTS, { retryAfterSec });
  }

  static blocked(reason: string): ApiError {
    return new ApiError(reason, "REQUEST_BLOCKED", StatusCodes.FORBIDDEN);
  }

  static unauthenticated(): ApiError {
    return new ApiError("Not signed in", "UNAUTHENTICATED", StatusCodes.UNAUTHORIZED);
  }

  static internal(message = "Internal error"): ApiError {
    return new ApiError(message, "INTERNAL_ERROR", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;
