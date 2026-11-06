import "server-only";

import { randomBytes } from "node:crypto";
import { z } from "zod";

/**
 * Configuration serveur validée au démarrage (OWASP A02 — Security Misconfiguration).
 * Une configuration invalide fait échouer le démarrage plutôt que de tourner en mode dégradé.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    MBOA_API_BASE_URL: z.url().default("https://api.mboaeat.tech"),
    MBOA_API_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(15000),
    /** Nombre de proxys de confiance devant l'application (lecture sûre de X-Forwarded-For). */
    TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
    /**
     * Source des données du parcours partenaire :
     * - "mock" : données simulées en mémoire (tant que les endpoints de la spec n'existent pas) ;
     * - "api"  : API Mboa Eat.
     */
    PARTNER_DATA_SOURCE: z.enum(["mock", "api"]).default("mock"),
    /** Clé de chiffrement du cookie de session (≥ 32 caractères, obligatoire en production). */
    SESSION_SECRET: z.string().min(32).optional(),
    /** Destinations après approbation du dossier. */
    MERCHANT_PLATFORM_URL: z.url().default("https://marchand.mboaeat.tech"),
    FLEET_PANEL_URL: z.url().default("https://flotte.mboaeat.tech"),
  })
  .superRefine((env, ctx) => {
    // OWASP A04 — Cryptographic Failures : jamais d'appel en clair vers l'API en production
    if (env.NODE_ENV === "production" && !env.MBOA_API_BASE_URL.startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["MBOA_API_BASE_URL"], message: "HTTPS obligatoire en production" });
    }
    // OWASP A07 : une clé de session aléatoire par démarrage déconnecterait tout le monde à chaque déploiement
    if (env.NODE_ENV === "production" && !env.SESSION_SECRET) {
      ctx.addIssue({ code: "custom", path: ["SESSION_SECRET"], message: "SESSION_SECRET obligatoire en production" });
    }
  });

export type ServerEnv = z.infer<typeof envSchema>;

export const env: ServerEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  MBOA_API_BASE_URL: process.env.MBOA_API_BASE_URL || undefined,
  MBOA_API_TIMEOUT_MS: process.env.MBOA_API_TIMEOUT_MS || undefined,
  TRUSTED_PROXY_HOPS: process.env.TRUSTED_PROXY_HOPS || undefined,
  PARTNER_DATA_SOURCE: process.env.PARTNER_DATA_SOURCE || undefined,
  SESSION_SECRET: process.env.SESSION_SECRET || undefined,
  MERCHANT_PLATFORM_URL: process.env.MERCHANT_PLATFORM_URL || undefined,
  FLEET_PANEL_URL: process.env.FLEET_PANEL_URL || undefined,
});

export const isProduction = env.NODE_ENV === "production";

export const isMockMode = env.PARTNER_DATA_SOURCE === "mock";

/** En développement sans SESSION_SECRET : clé éphémère (les sessions tombent au redémarrage). */
export const sessionSecret = env.SESSION_SECRET ?? randomBytes(32).toString("base64");
