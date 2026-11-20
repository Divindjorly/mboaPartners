import "server-only";

import { env } from "#/config/env";
import { StatusCodes } from "#/constants/httpStatus";
import type { RequestContext } from "#/types/api.types";
import { ApiError, type ErrorCode } from "#/utils/ApiError";
import { hashIp, logger } from "#/utils/logger";
import type { MboaEndpoint } from "./endpoints";

/**
 * Client HTTP de l'API Mboa (mboaPlatformBackend), exécuté uniquement côté serveur.
 * Joue le rôle des « intercepteurs » des standards :
 *  - requête : X-Request-ID, langue, IP client, jeton de session, délai maximal, pas de redirection suivie ;
 *  - réponse : retrait de l'enveloppe { success, data }, conversion des erreurs en ApiError.
 * Erreurs amont : { success: false, error: { code, message, details? }, requestId }.
 */
const MAX_RESPONSE_BYTES = 256 * 1024;

type UpstreamErrorBody = { message?: unknown; details?: unknown; traceId?: unknown; requestId?: unknown; error?: unknown };

/** Codes métier de l'API relayés tels quels au site (traduits sous `api_errors.<CODE>`). */
const RELAYED_CODES = new Set<ErrorCode>([
  "ACCOUNT_CONFLICT",
  "OTP_INVALID",
  "OTP_EXPIRED",
  "OTP_SEND_FAILED",
  "INVALID_CREDENTIALS",
  "ACCOUNT_NOT_FOUND",
  "EMAIL_NOT_VERIFIED",
  "ACCOUNT_NOT_APPROVED",
  "UNAUTHENTICATED",
  "APPLICATION_LOCKED",
  "DOCUMENTS_MISSING",
  "RATE_LIMITED",
  "FILE_TOO_LARGE",
  "FILE_TYPE_NOT_ALLOWED",
]);

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** class-validator ajoute des messages techniques anglais ("x must be a string") à côté des messages lisibles. */
const isTechnicalDetail = (d: string) => /^[a-zA-Z]+ (must|should) /.test(d);

const readDetails = (details: unknown): string[] =>
  Array.isArray(details)
    ? [...new Set(details.filter((d): d is string => typeof d === "string" && !isTechnicalDetail(d)))].slice(0, 10)
    : [];

/** Code métier de l'enveloppe d'erreur, s'il fait partie des codes relayés. */
const readCode = (body: UpstreamErrorBody): { code: ErrorCode; details: unknown } | null => {
  if (!isRecord(body.error) || typeof body.error.code !== "string") return null;
  const code = body.error.code as ErrorCode;
  return RELAYED_CODES.has(code) ? { code, details: body.error.details } : null;
};

const unwrap = (body: unknown): unknown =>
  isRecord(body) && "data" in body && Object.keys(body).every((k) => ["data", "meta", "success"].includes(k)) ? body.data : body;

export type UpstreamStatusMap = Partial<Record<number, ErrorCode>>;

type RequestOptions = {
  /** Corps JSON (POST). */
  body?: Record<string, unknown>;
  /** Fichier brut (POST), envoyé avec son type réel ; le nom d'affichage passe par X-File-Name. */
  file?: { bytes: Uint8Array; mimeType: string; fileName: string };
  /** Suffixe déjà validé par l'appelant (`?type=RCCM`, `/<uuid>`). */
  suffix?: string;
  /** Jeton de session partenaire (`PartnerSession.ref`). */
  token?: string;
  /** Codes amont 4xx à traduire en code métier spécifique (ex. 409 → ACCOUNT_CONFLICT). */
  statusMap?: UpstreamStatusMap;
};

const SAFE_SUFFIX = /^(\?type=[A-Z_]{2,30}|\?page=[1-9]\d{0,2}|\/[0-9a-f-]{36}(\/read)?)$/;

const mboaRequest = async <T>(method: "GET" | "POST" | "DELETE", endpoint: MboaEndpoint, ctx: RequestContext, options: RequestOptions = {}): Promise<T> => {
  // OWASP A01 / SSRF : le chemin reste dans la liste blanche, seuls des suffixes au format strict sont acceptés.
  if (options.suffix && !SAFE_SUFFIX.test(options.suffix)) throw ApiError.internal("Invalid endpoint suffix");
  const logBase = { requestId: ctx.requestId, endpoint, ip: hashIp(ctx.clientIp) };

  let response: Response;
  try {
    response = await fetch(new URL(`${endpoint}${options.suffix ?? ""}`, env.MBOA_API_BASE_URL), {
      method,
      headers: {
        Accept: "application/json",
        "Accept-Language": ctx.locale,
        "X-Request-ID": ctx.requestId,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.file ? { "Content-Type": options.file.mimeType, "X-File-Name": encodeURIComponent(options.file.fileName) } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(ctx.clientIp !== "unknown" ? { "X-Forwarded-For": ctx.clientIp } : {}),
        // Derrière l'hébergeur, l'API voit l'adresse du panel : elle croit celle du visiteur seulement avec ce secret
        ...(ctx.clientIp !== "unknown" && env.PANEL_PROXY_SECRET ? { "X-Mboa-Client-IP": ctx.clientIp, "X-Mboa-Proxy-Secret": env.PANEL_PROXY_SECRET } : {}),
        // Navigateur du visiteur : nomme la session côté backend (« Chrome · macOS »)
        ...(ctx.userAgent ? { "User-Agent": ctx.userAgent } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : options.file ? Buffer.from(options.file.bytes) : undefined,
      signal: AbortSignal.timeout(env.MBOA_API_TIMEOUT_MS),
      redirect: "error",
      cache: "no-store",
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    logger.error("upstream.unreachable", { ...logBase, reason: timedOut ? "timeout" : "network" });
    throw timedOut
      ? new ApiError("Upstream timeout", "UPSTREAM_TIMEOUT", StatusCodes.GATEWAY_TIMEOUT)
      : new ApiError("Upstream unreachable", "UPSTREAM_UNREACHABLE", StatusCodes.BAD_GATEWAY);
  }

  const text = (await response.text()).slice(0, MAX_RESPONSE_BYTES);
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null; // corps non JSON : traité comme vide, le statut HTTP fait foi
  }

  if (response.ok) return unwrap(body) as T;

  const errorBody: UpstreamErrorBody = isRecord(body) ? body : {};
  const traceId = [errorBody.traceId, errorBody.requestId].find((v): v is string => typeof v === "string");
  logger.warn("upstream.error", { ...logBase, status: response.status, traceId });

  const relayed = readCode(errorBody);
  if (relayed?.code === "RATE_LIMITED" || response.status === StatusCodes.TOO_MANY_REQUESTS) {
    const retryAfter = Number(response.headers.get("retry-after"));
    throw ApiError.tooManyRequests(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 3600) : 60);
  }
  if (relayed) throw new ApiError(`Upstream ${response.status}`, relayed.code, response.status, { details: readDetails(relayed.details) });
  if (response.status === StatusCodes.PAYLOAD_TOO_LARGE) throw new ApiError("Upstream 413", "FILE_TOO_LARGE", response.status);
  if (response.status === StatusCodes.UNSUPPORTED_MEDIA_TYPE) throw new ApiError("Upstream 415", "FILE_TYPE_NOT_ALLOWED", response.status);

  // 5xx : aucun détail interne n'est relayé au navigateur
  if (response.status >= 500) {
    throw new ApiError("Upstream failure", "UPSTREAM_UNAVAILABLE", StatusCodes.BAD_GATEWAY);
  }
  const mapped = options.statusMap?.[response.status];
  if (mapped) throw new ApiError(`Upstream ${response.status}`, mapped, response.status);

  throw new ApiError(`Upstream ${response.status}`, "UPSTREAM_REJECTED", response.status, { details: readDetails(errorBody.details) });
};

/** POST JSON vers une route de la liste blanche. */
export const mboaPost = <T>(
  endpoint: MboaEndpoint,
  payload: Record<string, unknown>,
  ctx: RequestContext,
  statusMap: UpstreamStatusMap = {},
  token?: string,
): Promise<T> => mboaRequest<T>("POST", endpoint, ctx, { body: payload, statusMap, token });

/** GET authentifié vers une route de la liste blanche. */
export const mboaGet = <T>(endpoint: MboaEndpoint, ctx: RequestContext, token: string, suffix?: string): Promise<T> =>
  mboaRequest<T>("GET", endpoint, ctx, { token, suffix });

/** POST authentifié sans corps, avec un suffixe validé (`/<uuid>/read`). */
export const mboaPostTo = <T>(endpoint: MboaEndpoint, suffix: string | undefined, ctx: RequestContext, token: string): Promise<T> =>
  mboaRequest<T>("POST", endpoint, ctx, { body: {}, suffix, token });

/** Dépôt d'un fichier brut (déjà contrôlé par le site : taille, type réel, nom assaini). */
export const mboaUpload = <T>(
  endpoint: MboaEndpoint,
  suffix: string,
  file: { bytes: Uint8Array; mimeType: string; fileName: string },
  ctx: RequestContext,
  token: string,
): Promise<T> => mboaRequest<T>("POST", endpoint, ctx, { file, suffix, token });

/** DELETE authentifié (suffixe `/<uuid>` validé). */
export const mboaDelete = (endpoint: MboaEndpoint, suffix: string, ctx: RequestContext, token: string): Promise<unknown> =>
  mboaRequest("DELETE", endpoint, ctx, { suffix, token });
