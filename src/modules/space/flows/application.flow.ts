import "server-only";

import { partnerGateway } from "#/api/partner";
import { isMockMode } from "#/config/env";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import type { Application, PartnerProfile } from "#/types/partner.types";
import { ApiError, isApiError } from "#/utils/ApiError";
import { parseInput } from "#/utils/guards";
import { logger } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { readSession } from "#/utils/session";
import { deleteDocumentSchema, emptySchema, simulateReviewSchema } from "../schemas/space.schemas";
import { accountKey, requirePartnerSession } from "./session.guard";

export type SpaceData = { profile: PartnerProfile; application: Application };

/** Chargement de l'espace pour la page : null si aucune session exploitable (→ connexion). */
export const loadSpaceFlow = async (ctx: RequestContext): Promise<SpaceData | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    const [profile, application] = await Promise.all([partnerGateway.getProfile(ctx, session), partnerGateway.getApplication(ctx, session)]);
    return { profile, application };
  } catch (error) {
    if (isApiError(error) && error.code === "UNAUTHENTICATED") return null;
    throw error;
  }
};

const writeGuard = async (ctx: RequestContext) => {
  const session = await requirePartnerSession(ctx);
  enforceRateLimit(`app-write:${accountKey(session)}`, RATE_LIMITS.applicationWritePerAccount, { requestId: ctx.requestId });
  return session;
};

export const deleteDocumentFlow = async (input: unknown, ctx: RequestContext): Promise<{ deleted: true }> => {
  const { documentId } = parseInput(deleteDocumentSchema, input, ctx);
  const session = await writeGuard(ctx);
  await partnerGateway.deleteDocument(ctx, session, documentId);
  logger.info("application.document_deleted", { requestId: ctx.requestId });
  return { deleted: true };
};

export const submitApplicationFlow = async (input: unknown, ctx: RequestContext): Promise<Application> => {
  parseInput(emptySchema, input, ctx);
  const session = await writeGuard(ctx);
  const application = await partnerGateway.submitApplication(ctx, session);
  logger.info("application.submitted", { requestId: ctx.requestId, partnerType: session.partnerType });
  return application;
};

/** Mode démo uniquement : simule la décision de l'équipe Mboa. */
export const simulateReviewFlow = async (input: unknown, ctx: RequestContext): Promise<Application> => {
  const { decision } = parseInput(simulateReviewSchema, input, ctx);
  if (!isMockMode || !partnerGateway.simulateReview) throw ApiError.blocked("Simulation disabled");
  const session = await writeGuard(ctx);
  const application = await partnerGateway.simulateReview(ctx, session, decision);
  logger.info("application.review_simulated", { requestId: ctx.requestId, decision });
  return application;
};
