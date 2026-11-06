import "server-only";

import { isMockMode } from "#/config/env";
import { livePartnerGateway } from "./livePartnerGateway";
import { mockPartnerGateway } from "./mock/mockPartnerGateway";
import type { PartnerGateway } from "./partnerGateway";

/** Source des données du parcours partenaire, choisie par PARTNER_DATA_SOURCE. */
export const partnerGateway: PartnerGateway = isMockMode ? mockPartnerGateway : livePartnerGateway;

export type { PartnerGateway, ReviewDecision, UploadedFile } from "./partnerGateway";
