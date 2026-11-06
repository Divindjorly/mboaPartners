import type { z } from "zod";

/** Erreurs Zod → { champ: [clés de traduction `validation.*`] }. Partagé navigateur / serveur. */
export const toFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message.startsWith("validation.") ? issue.message : "validation.required");
  }
  return out;
};
