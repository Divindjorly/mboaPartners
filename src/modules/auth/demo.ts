import "server-only";

import { MOCK_DEMO_ACCOUNTS, MOCK_DEMO_PASSWORD, MOCK_EMAIL_CODE } from "#/api/partner/mock/mockData";
import { isMockMode } from "#/config/env";
import type { DemoInfo } from "./types/auth.types";

/** Informations du mode démo à afficher, ou null avec l'API réelle. */
export const getDemoInfo = (): DemoInfo | null =>
  isMockMode
    ? { code: MOCK_EMAIL_CODE, password: MOCK_DEMO_PASSWORD, accounts: MOCK_DEMO_ACCOUNTS.map(({ email, partnerType }) => ({ email, partnerType })) }
    : null;
