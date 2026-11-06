import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import { isApiError } from "#/utils/ApiError";
import { parseInput } from "#/utils/guards";
import { hashIp, logger, maskEmail } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { createSession, destroySession } from "#/utils/session";
import { loginSchema } from "../schemas/auth.schemas";
import type { SignedInResult } from "../types/auth.types";

/**
 * Connexion par e-mail + mot de passe.
 * Message unique pour un e-mail inconnu ou un mauvais mot de passe (OWASP A07).
 * EMAIL_NOT_VERIFIED : un nouveau code est envoyé, l'écran bascule sur la saisie du code.
 */
export const loginFlow = async (input: unknown, ctx: RequestContext): Promise<SignedInResult> => {
  const { email, password } = parseInput(loginSchema, input, ctx);
  enforceRateLimit(`login:${email}`, RATE_LIMITS.loginPerEmail, { requestId: ctx.requestId });
  enforceRateLimit(`login-ip:${ctx.clientIp}`, RATE_LIMITS.loginPerIp, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(email) };
  try {
    const signedIn = await partnerGateway.login(ctx, email, password);
    await createSession(signedIn.ref, signedIn.partnerType);
    logger.info("auth.login.succeeded", log);
    return { signedIn: true };
  } catch (error) {
    if (isApiError(error)) logger.warn("auth.login.failed", { ...log, code: error.code });
    throw error;
  }
};

export const logoutFlow = async (_input: unknown, ctx: RequestContext): Promise<{ signedOut: true }> => {
  await destroySession();
  logger.info("auth.logout", { requestId: ctx.requestId, ip: hashIp(ctx.clientIp) });
  return { signedOut: true };
};
