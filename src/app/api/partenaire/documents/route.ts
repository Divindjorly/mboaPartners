import { NextResponse, type NextRequest } from "next/server";
import { StatusCodes } from "#/constants/httpStatus";
import { UPLOAD_POLICY } from "#/constants/partner";
import { uploadDocumentFlow } from "#/modules/space/flows/uploadDocument.flow";
import type { ActionResponse } from "#/types/api.types";
import type { PartnerDocument } from "#/types/partner.types";
import { logger } from "#/utils/logger";
import { runAction } from "#/utils/runAction";

/**
 * Dépôt d'une pièce du dossier (multipart : `type`, `file`, `locale`).
 * Route dédiée plutôt qu'une Server Action : limite de corps propre (10 Mo + marge)
 * sans élargir celle des formulaires texte. Exclue du proxy (pas de mise en tampon).
 */
const MAX_BODY_BYTES = UPLOAD_POLICY.maxBytes + 64 * 1024;

const allowedOrigins = (process.env.SERVER_ACTIONS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/** OWASP A01 (CSRF) : la requête doit venir du site lui-même. */
const isSameOrigin = (request: NextRequest): boolean => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return host === request.headers.get("host") || allowedOrigins.includes(host);
  } catch {
    return false;
  }
};

const fail = (code: "REQUEST_BLOCKED" | "FILE_TOO_LARGE" | "VALIDATION_ERROR", status: number) =>
  NextResponse.json<ActionResponse<never>>({ success: false, error: { code } }, { status });

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    logger.warn("security.csrf_blocked", { route: "documents" });
    return fail("REQUEST_BLOCKED", StatusCodes.FORBIDDEN);
  }
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return fail("VALIDATION_ERROR", StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  }
  const length = Number(request.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return fail("VALIDATION_ERROR", StatusCodes.LENGTH_REQUIRED);
  if (length > MAX_BODY_BYTES) return fail("FILE_TOO_LARGE", StatusCodes.PAYLOAD_TOO_LARGE);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("VALIDATION_ERROR", StatusCodes.BAD_REQUEST);
  }

  const locale = form.get("locale");
  const result: ActionResponse<PartnerDocument> = await runAction(uploadDocumentFlow, { type: form.get("type"), file: form.get("file") }, locale);
  const status = result.success ? StatusCodes.CREATED : statusOf(result.error.code);
  return NextResponse.json(result, { status, headers: { "Cache-Control": "no-store" } });
}

const statusOf = (code: string): number =>
  ({
    UNAUTHENTICATED: StatusCodes.UNAUTHORIZED,
    RATE_LIMITED: StatusCodes.TOO_MANY_REQUESTS,
    FILE_TOO_LARGE: StatusCodes.PAYLOAD_TOO_LARGE,
    FILE_TYPE_NOT_ALLOWED: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
    APPLICATION_LOCKED: StatusCodes.CONFLICT,
    VALIDATION_ERROR: StatusCodes.BAD_REQUEST,
    NOT_AVAILABLE: StatusCodes.SERVICE_UNAVAILABLE,
  })[code] ?? StatusCodes.INTERNAL_SERVER_ERROR;
