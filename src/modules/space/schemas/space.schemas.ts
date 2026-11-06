import { z } from "zod";
import { localeField } from "#/modules/onboarding/schemas/onboarding.schemas";
import { DOCUMENT_TYPES } from "#/types/partner.types";

/** Schémas partagés navigateur / serveur de l'espace partenaire. */

/** Texte facultatif : "" ou absent → undefined (le livreur déjà enregistré revient sans ces clés). */
export const documentTypeSchema = z.enum(DOCUMENT_TYPES, { error: "validation.required" });

export const deleteDocumentSchema = z.object({ documentId: z.uuid("validation.required"), locale: localeField });

export const simulateReviewSchema = z.object({
  decision: z.enum(["approve", "request_changes", "reject"]),
  locale: localeField,
});

export const emptySchema = z.object({ locale: localeField });
