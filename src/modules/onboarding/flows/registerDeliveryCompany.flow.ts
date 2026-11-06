import "server-only";

import { partnerGateway } from "#/api/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import { hashIp, logger, maskEmail } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { deliveryCompanySchema } from "../schemas/onboarding.schemas";
import type { SignupResult } from "../types/onboarding.types";
import { assertHuman, parseInput } from "#/utils/guards";

/**
 * Inscription d'une entreprise de livraison. L'e-mail du responsable sert d'identifiant
 * de connexion et reçoit le code de vérification.
 */
export const registerDeliveryCompanyFlow = async (input: unknown, ctx: RequestContext): Promise<SignupResult> => {
  const data = parseInput(deliveryCompanySchema, input, ctx);
  assertHuman(data.website, ctx);

  enforceRateLimit(`signup-ip:${ctx.clientIp}`, RATE_LIMITS.signupPerIp, { requestId: ctx.requestId });
  enforceRateLimit(`signup-phone:${data.managerPhone}`, RATE_LIMITS.signupPerPhone, { requestId: ctx.requestId });
  enforceRateLimit(`signup-email:${data.managerEmail}`, RATE_LIMITS.signupPerEmail, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), email: maskEmail(data.managerEmail), kind: "delivery_company" };
  logger.info("signup.submitted", log);
  const { email } = await partnerGateway.signupDeliveryCompany(ctx, data);
  logger.info("signup.succeeded", log);
  return { email };
};
