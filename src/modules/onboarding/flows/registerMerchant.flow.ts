import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import { hashIp, logger, maskEmail } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { merchantSchema } from "../schemas/onboarding.schemas";
import type { SignupResult } from "../types/onboarding.types";
import { assertHuman, parseInput } from "#/utils/guards";

/**
 * Inscription d'un restaurant / commerce. L'e-mail sert d'identifiant de connexion
 * et reçoit le code de vérification.
 */
export const registerMerchantFlow = async (input: unknown, ctx: RequestContext): Promise<SignupResult> => {
  const data = parseInput(merchantSchema, input, ctx);
  assertHuman(data.website, ctx);

  enforceRateLimit(`signup-ip:${ctx.clientIp}`, RATE_LIMITS.signupPerIp, { requestId: ctx.requestId });
  enforceRateLimit(`signup-phone:${data.phoneNumber}`, RATE_LIMITS.signupPerPhone, { requestId: ctx.requestId });
  enforceRateLimit(`signup-email:${data.email}`, RATE_LIMITS.signupPerEmail, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(data.email), kind: "merchant" };
  logger.info("signup.submitted", log);
  const { email } = await partnerGateway.signupMerchant(ctx, data);
  logger.info("signup.succeeded", log);
  return { email };
};
