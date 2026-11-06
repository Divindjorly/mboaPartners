import "server-only";

import { env } from "#/config/env";

const IP_PATTERN = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * IP du client fiable derrière N proxys de confiance (OWASP A01/A06).
 * X-Forwarded-For est contrôlable par le client : on ne lit que l'entrée ajoutée
 * par notre dernier proxy de confiance (position `longueur - TRUSTED_PROXY_HOPS`),
 * jamais la première valeur.
 */
export const resolveClientIp = (headers: Headers): string => {
  const hops = env.TRUSTED_PROXY_HOPS;
  if (hops > 0) {
    const chain = (headers.get("x-forwarded-for") ?? "")
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);
    const candidate = chain[chain.length - hops];
    if (candidate && IP_PATTERN.test(candidate)) return candidate;

    const realIp = headers.get("x-real-ip")?.trim();
    if (realIp && IP_PATTERN.test(realIp)) return realIp;
  }
  return "unknown";
};
