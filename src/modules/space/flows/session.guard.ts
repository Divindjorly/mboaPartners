import "server-only";

import type { RequestContext } from "#/types/api.types";
import type { PartnerSession } from "#/types/partner.types";
import { ApiError } from "#/utils/ApiError";
import { hashIp, logger } from "#/utils/logger";
import { readSession } from "#/utils/session";

/** Toute action de l'espace exige une session valide (OWASP A01 — contrôle d'accès côté serveur). */
export const requirePartnerSession = async (ctx: RequestContext): Promise<PartnerSession> => {
  const session = await readSession();
  if (!session) {
    logger.warn("security.session_invalid", { requestId: ctx.requestId, ip: hashIp(ctx.clientIp) });
    throw ApiError.unauthenticated();
  }
  return session;
};

/** Clé de limitation par compte, sans exposer la référence de session dans les journaux. */
export const accountKey = (session: PartnerSession) => session.ref.slice(0, 64);
