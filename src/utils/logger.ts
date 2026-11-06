import "server-only";

import { createHash } from "node:crypto";

/**
 * Journal structuré (JSON, une ligne par événement) — OWASP A09 Logging & Alerting Failures.
 * Règles :
 *  - jamais de mot de passe, code OTP, jeton ou corps de requête complet ;
 *  - téléphones masqués, IP pseudonymisées (hash tronqué) ;
 *  - chaque événement porte le requestId pour la corrélation avec l'API amont.
 */
type Level = "info" | "warn" | "error";

export type SecurityEvent =
  | "signup.submitted"
  | "signup.succeeded"
  | "signup.rejected"
  | "email.verify.succeeded"
  | "email.verify.failed"
  | "email.code_requested"
  | "auth.login.succeeded"
  | "auth.login.failed"
  | "auth.logout"
  | "auth.password_reset.requested"
  | "auth.password_reset.succeeded"
  | "auth.password_reset.failed"
  | "application.document_uploaded"
  | "application.document_rejected"
  | "application.document_deleted"
  | "application.submitted"
  | "application.review_simulated"
  | "security.csrf_blocked"
  | "security.session_invalid"
  | "security.rate_limited"
  | "security.bot_detected"
  | "security.validation_failed"
  | "upstream.error"
  | "upstream.unreachable"
  | "action.unexpected_error";

type LogFields = Record<string, string | number | boolean | undefined>;

const SENSITIVE_KEYS = /pass|otp|code|token|secret|authorization|cookie/i;

const sanitize = (fields: LogFields): LogFields =>
  Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, SENSITIVE_KEYS.test(k) ? "[REDACTED]" : v]));

/** "+242061234567" → "+242******67" */
export const maskPhone = (phone: string): string =>
  phone.length <= 6 ? "***" : `${phone.slice(0, 4)}${"*".repeat(phone.length - 6)}${phone.slice(-2)}`;

/** "jean.kouka@speed.cg" → "j***@speed.cg" */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  return domain ? `${local.slice(0, 1)}***@${domain}` : "***";
};

/** IP pseudonymisée : permet de corréler sans stocker l'adresse. */
export const hashIp = (ip: string): string => createHash("sha256").update(`mboa-partners:${ip}`).digest("hex").slice(0, 16);

const write = (level: Level, event: SecurityEvent, fields: LogFields) => {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...sanitize(fields) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
};

export const logger = {
  info: (event: SecurityEvent, fields: LogFields = {}) => write("info", event, fields),
  warn: (event: SecurityEvent, fields: LogFields = {}) => write("warn", event, fields),
  error: (event: SecurityEvent, fields: LogFields = {}) => write("error", event, fields),
};
