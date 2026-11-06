import "server-only";

import type { z } from "zod";
import type { RequestContext } from "#/types/api.types";
import { ApiError } from "#/utils/ApiError";
import { hashIp, logger } from "#/utils/logger";
import { toFieldErrors } from "#/utils/validation";

/**
 * Validation en première ligne de chaque flow (standard « Validation préalable »).
 * Lance ApiError VALIDATION_ERROR avec les erreurs de champ traduisibles.
 */
export const parseInput = <S extends z.ZodType>(schema: S, input: unknown, ctx: RequestContext): z.infer<S> => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors = toFieldErrors(result.error);
    logger.info("security.validation_failed", {
      requestId: ctx.requestId,
      ip: hashIp(ctx.clientIp),
      fields: Object.keys(fieldErrors).join(","),
    });
    throw ApiError.validation(fieldErrors);
  }
  return result.data;
};

/** Champ piège rempli → requête automatisée : rejet générique, l'API n'est jamais appelée. */
export const assertHuman = (honeypot: string | undefined, ctx: RequestContext): void => {
  if (honeypot) {
    logger.warn("security.bot_detected", { requestId: ctx.requestId, ip: hashIp(ctx.clientIp) });
    throw ApiError.blocked("Honeypot filled");
  }
};
