import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import { isApiError } from "#/utils/ApiError";
import { parseInput } from "#/utils/guards";
import { hashIp, logger, maskEmail } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { createSession } from "#/utils/session";
import { emailCodeSchema, emailOnlySchema } from "../schemas/auth.schemas";
import type { CodeSentResult, SignedInResult } from "../types/auth.types";

/** Vérifie le code reçu par e-mail ; en cas de succès, le compte est actif et la session ouverte. */
export const verifyEmailCodeFlow = async (input: unknown, ctx: RequestContext): Promise<SignedInResult> => {
  const { email, code } = parseInput(emailCodeSchema, input, ctx);
  enforceRateLimit(`email-verify:${email}`, RATE_LIMITS.emailCodeVerifyPerEmail, { requestId: ctx.requestId });
  enforceRateLimit(`email-verify-ip:${ctx.clientIp}`, RATE_LIMITS.emailCodeVerifyPerIp, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(email) };
  try {
    const signedIn = await partnerGateway.verifyEmailCode(ctx, email, code);
    await createSession(signedIn.ref, signedIn.partnerType);
    logger.info("email.verify.succeeded", log);
    return { signedIn: true };
  } catch (error) {
    if (isApiError(error)) logger.warn("email.verify.failed", { ...log, code: error.code });
    throw error;
  }
};

/** Renvoie un code. Réponse identique que le compte existe ou non (pas d'énumération). */
export const resendEmailCodeFlow = async (input: unknown, ctx: RequestContext): Promise<CodeSentResult> => {
  const { email } = parseInput(emailOnlySchema, input, ctx);
  enforceRateLimit(`email-resend:${email}`, RATE_LIMITS.emailCodeResendPerEmail, { requestId: ctx.requestId });
  enforceRateLimit(`email-resend-ip:${ctx.clientIp}`, RATE_LIMITS.emailCodeResendPerIp, { requestId: ctx.requestId });

  await partnerGateway.requestEmailCode(ctx, email);
  logger.info("email.code_requested", { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(email) });
  return { sent: true };
};
