import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import type { Application, PartnerInbox, PartnerProfile } from "#/types/partner.types";
import { isApiError } from "#/utils/ApiError";
import { parseInput } from "#/utils/guards";
import { logger } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { readSession } from "#/utils/session";
import { deleteDocumentSchema, emptySchema, notificationIdSchema } from "../schemas/space.schemas";
import { accountKey, requirePartnerSession } from "./session.guard";

export type SpaceData = { profile: PartnerProfile; application: Application; inbox: PartnerInbox | null };

/** Chargement de l'espace pour la page : null si aucune session exploitable (→ connexion). */
export const loadSpaceFlow = async (ctx: RequestContext): Promise<SpaceData | null> => {
  const session = await readSession();
  if (!session) return null;
  try {
    const [profile, application, inbox] = await Promise.all([
      partnerGateway.getProfile(ctx, session),
      partnerGateway.getApplication(ctx, session),
      // Les notifications ne bloquent jamais l'espace : sans elles, le dossier s'affiche quand même
      partnerGateway.listNotifications(ctx, session, 1).catch((error: unknown) => {
        logger.warn("notifications.load_failed", { requestId: ctx.requestId, code: isApiError(error) ? error.code : "UNKNOWN" });
        return null;
      }),
    ]);
    return { profile, application, inbox };
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


export const markNotificationReadFlow = async (input: unknown, ctx: RequestContext): Promise<{ read: true }> => {
  const { id } = parseInput(notificationIdSchema, input, ctx);
  const session = await writeGuard(ctx);
  await partnerGateway.markNotificationRead(ctx, session, id);
  return { read: true };
};

export const markAllNotificationsReadFlow = async (input: unknown, ctx: RequestContext): Promise<{ read: true }> => {
  parseInput(emptySchema, input, ctx);
  const session = await writeGuard(ctx);
  await partnerGateway.markAllNotificationsRead(ctx, session);
  return { read: true };
};
