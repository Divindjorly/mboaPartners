import "server-only";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { isLocale, DEFAULT_LOCALE } from "#/i18n/config";
import type { ActionResponse, RequestContext } from "#/types/api.types";
import { isApiError } from "#/utils/ApiError";
import { resolveClientIp } from "#/utils/clientIp";
import { logger } from "#/utils/logger";

type Flow<T> = (input: unknown, ctx: RequestContext) => Promise<T>;

const buildContext = async (locale: unknown): Promise<RequestContext> => {
  const h = await headers();
  return {
    requestId: randomUUID(),
    clientIp: resolveClientIp(h),
    locale: typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE,
  };
};

/**
 * Exécute un flow et renvoie la réponse unifiée `{ success, data | error }`.
 * OWASP A10 — Mishandling of Exceptional Conditions : toute exception inattendue est
 * journalisée côté serveur et remplacée par un code générique (aucune trace ni message
 * interne n'atteint le navigateur ; le traitement échoue « fermé »).
 */
export const runAction = async <T>(flow: Flow<T>, input: unknown, locale: unknown): Promise<ActionResponse<T>> => {
  const ctx = await buildContext(locale);
  try {
    const data = await flow(input, ctx);
    return { success: true, data };
  } catch (error) {
    if (isApiError(error)) {
      return {
        success: false,
        error: {
          code: error.code,
          fieldErrors: error.fieldErrors,
          details: error.details,
          retryAfterSec: error.retryAfterSec,
        },
      };
    }
    logger.error("action.unexpected_error", {
      requestId: ctx.requestId,
      flow: flow.name,
      error: error instanceof Error ? error.name : "unknown",
    });
    return { success: false, error: { code: "INTERNAL_ERROR" } };
  }
};
