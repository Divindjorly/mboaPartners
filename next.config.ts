import type { NextConfig } from "next";

/**
 * En-têtes de sécurité statiques (OWASP A02 Security Misconfiguration).
 * La Content-Security-Policy, qui porte un nonce par requête, est posée dans src/proxy.ts.
 */
const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  // A04 : HTTPS forcé (2 ans, sous-domaines) — uniquement en production
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

/** Domaines autorisés à appeler les Server Actions derrière un proxy/CDN (contrôle CSRF). */
const allowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Ne pas révéler la technologie serveur
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Formulaires texte uniquement (la liste de 500 livreurs tient en ~150 ko) : corps limité (A06).
      // Les fichiers passent par /api/partenaire/documents, qui a sa propre limite.
      bodySizeLimit: "256kb",
      ...(allowedOrigins.length ? { allowedOrigins } : {}),
    },
  },
  images: {
    // Images locales uniquement : pas d'optimiseur ouvert vers des domaines tiers (SSRF)
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
