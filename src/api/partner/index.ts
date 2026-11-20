import "server-only";

import { livePartnerGateway } from "./livePartnerGateway";
import type { PartnerGateway } from "./partnerGateway";

/** Parcours partenaire et authentification : toujours l'API de la plateforme (base Neon), jamais de comptes simulés. */
export const partnerGateway: PartnerGateway = livePartnerGateway;

export type { PartnerGateway, UploadedFile } from "./partnerGateway";
