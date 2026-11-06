import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import { isApiError } from "#/utils/ApiError";
import { parseInput } from "#/utils/guards";
import { hashIp, logger, maskEmail } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { emailOnlySchema, passwordResetConfirmSchema } from "../schemas/auth.schemas";
import type { CodeSentResult, PasswordResetResult } from "../types/auth.types";

/** Demande de réinitialisation : réponse identique que le compte existe ou non. */
export const requestPasswordResetFlow = async (input: unknown, ctx: RequestContext): Promise<CodeSentResult> => {
  const { email } = parseInput(emailOnlySchema, input, ctx);
  enforceRateLimit(`pwd-reset:${email}`, RATE_LIMITS.passwordResetPerEmail, { requestId: ctx.requestId });
  enforceRateLimit(`pwd-reset-ip:${ctx.clientIp}`, RATE_LIMITS.passwordResetPerIp, { requestId: ctx.requestId });

  await partnerGateway.requestPasswordReset(ctx, email);
  logger.info("auth.password_reset.requested", { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(email) });
  return { sent: true };
};

/** Nouveau mot de passe avec le code reçu par e-mail. */
export const confirmPasswordResetFlow = async (input: unknown, ctx: RequestContext): Promise<PasswordResetResult> => {
  const { email, code, password } = parseInput(passwordResetConfirmSchema, input, ctx);
  enforceRateLimit(`email-verify:${email}`, RATE_LIMITS.emailCodeVerifyPerEmail, { requestId: ctx.requestId });
  enforceRateLimit(`email-verify-ip:${ctx.clientIp}`, RATE_LIMITS.emailCodeVerifyPerIp, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(email) };
  try {
    await partnerGateway.confirmPasswordReset(ctx, email, code, password);
    logger.info("auth.password_reset.succeeded", log);
    return { reset: true };
  } catch (error) {
    if (isApiError(error)) logger.warn("auth.password_reset.failed", { ...log, code: error.code });
    throw error;
  }
};
