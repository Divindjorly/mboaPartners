import "server-only";

import { ApiError } from "#/utils/ApiError";
import { logger } from "#/utils/logger";

/**
 * Limiteur à fenêtre fixe en mémoire (OWASP A06 Insecure Design / A07 Authentication Failures).
 * Suffisant pour une instance unique ; à remplacer par Redis si le site est répliqué.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 50_000;
let lastSweep = Date.now();

const sweep = (now: number) => {
  if (now - lastSweep < 60_000 && buckets.size < MAX_BUCKETS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
};

export type RateLimitRule = { limit: number; windowMs: number };

/** Consomme un jeton ; lance `ApiError.tooManyRequests` si la limite est atteinte. */
export const enforceRateLimit = (key: string, rule: RateLimitRule, logContext: Record<string, string> = {}): void => {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return;
  }
  if (bucket.count >= rule.limit) {
    const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
    logger.warn("security.rate_limited", { key: key.split(":")[0], retryAfterSec, ...logContext });
    throw ApiError.tooManyRequests(retryAfterSec);
  }
  bucket.count += 1;
};
