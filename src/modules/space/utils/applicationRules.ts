import type { Application, DocumentType, PartnerDocument } from "#/types/partner.types";

/** Règles d'affichage dérivées du statut (le serveur reste seul juge, cf. spec section 2). */
export const isApplicationEditable = (app: Application) => app.status === "DRAFT" || app.status === "CHANGES_REQUESTED";

export const findDocument = (app: Application, type: DocumentType): PartnerDocument | undefined => app.documents.find((d) => d.type === type);

/** En correction, seules les pièces refusées ou manquantes se remplacent. */
export const isDocumentEditable = (app: Application, type: DocumentType) => {
  if (!isApplicationEditable(app)) return false;
  const doc = findDocument(app, type);
  return app.status === "DRAFT" || !doc || doc.status === "REFUSED";
};

/** Pièces encore manquantes ou refusées pour pouvoir soumettre. */
export const missingItems = (app: Application): DocumentType[] =>
  app.requiredDocuments.filter((type) => {
    const doc = findDocument(app, type);
    return !doc || doc.status === "REFUSED";
  });

export const formatBytes = (bytes: number, locale: string) =>
  bytes >= 1024 * 1024
    ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`;

/** Dates affichées à l'heure du Congo. */
export const formatDateTime = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Brazzaville" }).format(
    new Date(iso),
  );

export const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Brazzaville" }).format(new Date(iso));
