import "server-only";

import { env } from "#/config/env";
import { StatusCodes } from "#/constants/httpStatus";
import type { RequestContext } from "#/types/api.types";
import { ApiError, type ErrorCode } from "#/utils/ApiError";
import { hashIp, logger } from "#/utils/logger";
import type { MboaEndpoint } from "./endpoints";

/**
 * Client HTTP de l'API Mboa Eat, exécuté uniquement côté serveur.
 * Joue le rôle des « intercepteurs » des standards :
 *  - requête : X-Request-ID, langue, IP client, délai maximal, pas de redirection suivie ;
 *  - réponse : retrait de l'enveloppe { data }, conversion des erreurs en ApiError.
 * Erreurs amont : { statusCode, error, message, details: string[], traceId }.
 */

const MAX_RESPONSE_BYTES = 256 * 1024;

type UpstreamErrorBody = { message?: unknown; details?: unknown; traceId?: unknown };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** class-validator ajoute des messages techniques anglais ("x must be a string") à côté des messages lisibles. */
const isTechnicalDetail = (d: string) => /^[a-zA-Z]+ (must|should) /.test(d);

const readDetails = (body: UpstreamErrorBody): string[] =>
  Array.isArray(body.details)
    ? [...new Set(body.details.filter((d): d is string => typeof d === "string" && !isTechnicalDetail(d)))].slice(0, 10)
    : [];

const unwrap = (body: unknown): unknown =>
  isRecord(body) && "data" in body && Object.keys(body).every((k) => ["data", "meta", "success"].includes(k)) ? body.data : body;

export type UpstreamStatusMap = Partial<Record<number, ErrorCode>>;

/**
 * POST JSON vers une route de la liste blanche.
 * @param statusMap codes amont 4xx à traduire en code métier spécifique (ex. 409 → ACCOUNT_CONFLICT).
 */
export const mboaPost = async <T>(
  endpoint: MboaEndpoint,
  payload: Record<string, unknown>,
  ctx: RequestContext,
  statusMap: UpstreamStatusMap = {},
): Promise<T> => {
  const logBase = { requestId: ctx.requestId, endpoint, ip: hashIp(ctx.clientIp) };

  let response: Response;
  try {
    response = await fetch(new URL(endpoint, env.MBOA_API_BASE_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": ctx.locale,
        "X-Request-ID": ctx.requestId,
        ...(ctx.clientIp !== "unknown" ? { "X-Forwarded-For": ctx.clientIp } : {}),
      },
      body: JSON.stringify(payload),
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
  const traceId = typeof errorBody.traceId === "string" ? errorBody.traceId : undefined;
  logger.warn("upstream.error", { ...logBase, status: response.status, traceId });

  // 5xx : aucun détail interne n'est relayé au navigateur
  if (response.status >= 500) {
    throw new ApiError("Upstream failure", "UPSTREAM_UNAVAILABLE", StatusCodes.BAD_GATEWAY);
  }
  const mapped = statusMap[response.status];
  if (mapped) throw new ApiError(`Upstream ${response.status}`, mapped, response.status);

  if (response.status === StatusCodes.TOO_MANY_REQUESTS) {
    throw ApiError.tooManyRequests(60);
  }
  throw new ApiError(`Upstream ${response.status}`, "UPSTREAM_REJECTED", response.status, { details: readDetails(errorBody) });
};
