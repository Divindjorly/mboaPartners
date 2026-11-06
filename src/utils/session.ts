import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { isProduction, sessionSecret } from "#/config/env";
import { SESSION_TTL_SECONDS } from "#/constants/partner";
import { PARTNER_TYPES, type PartnerSession, type PartnerType } from "#/types/partner.types";

/**
 * Session partenaire sans stockage serveur : cookie chiffré et authentifié (AES-256-GCM).
 * OWASP A07 — cookie HttpOnly (illisible en JavaScript), SameSite=Lax (CSRF), Secure en production,
 * expiration côté serveur ; A04 — le jeton d'accès API n'est jamais exposé au navigateur.
 */
const COOKIE_NAME = isProduction ? "__Host-mboa_session" : "mboa_session";
const AAD = Buffer.from("mboa-partner-session-v1");
const key = createHash("sha256").update(sessionSecret).digest();

const seal = (session: PartnerSession): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(AAD);
  const body = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
};

const isSession = (v: unknown): v is PartnerSession => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.ref === "string" && typeof s.expiresAt === "number" && PARTNER_TYPES.includes(s.partnerType as PartnerType);
};

const unseal = (token: string): PartnerSession | null => {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 29 || raw.length > 4096) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
    decipher.setAAD(AAD);
    decipher.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const session: unknown = JSON.parse(json);
    return isSession(session) && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null; // cookie altéré, clé changée ou format invalide : session ignorée
  }
};

/** Attributs identiques à l'écriture et à l'effacement (le préfixe __Host- exige Secure et Path=/). */
const cookieOptions = (maxAge: number) => ({ httpOnly: true, secure: isProduction, sameSite: "lax" as const, path: "/", maxAge });

export const createSession = async (ref: string, partnerType: PartnerType): Promise<void> => {
  const session: PartnerSession = { ref, partnerType, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 };
  (await cookies()).set(COOKIE_NAME, seal(session), cookieOptions(SESSION_TTL_SECONDS));
};

export const readSession = async (): Promise<PartnerSession | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? unseal(token) : null;
};

export const destroySession = async (): Promise<void> => {
  (await cookies()).set(COOKIE_NAME, "", cookieOptions(0));
};
