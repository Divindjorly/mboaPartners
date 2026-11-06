import "server-only";

import { partnerGateway } from "#/api/partner";
import { StatusCodes } from "#/constants/httpStatus";
import { UPLOAD_POLICY } from "#/constants/partner";
import { RATE_LIMITS } from "#/constants/security";
import type { RequestContext } from "#/types/api.types";
import type { PartnerDocument } from "#/types/partner.types";
import { ApiError } from "#/utils/ApiError";
import { detectMimeType, safeFileName } from "#/utils/fileSignature";
import { parseInput } from "#/utils/guards";
import { hashIp, logger } from "#/utils/logger";
import { enforceRateLimit } from "#/utils/rateLimiter";
import { documentTypeSchema } from "../schemas/space.schemas";
import { accountKey, requirePartnerSession } from "./session.guard";

export type UploadInput = { type: unknown; file: unknown };

/**
 * Dépôt d'une pièce du dossier.
 * Contrôles (OWASP A01, A05, A06) : session, débit par compte, type de pièce attendu,
 * taille, type RÉEL du fichier (signature), nom d'affichage assaini.
 */
export const uploadDocumentFlow = async (input: unknown, ctx: RequestContext): Promise<PartnerDocument> => {
  const { type: rawType, file } = input as UploadInput;
  const type = parseInput(documentTypeSchema, rawType, ctx);
  const session = await requirePartnerSession(ctx);
  enforceRateLimit(`upload:${accountKey(session)}`, RATE_LIMITS.uploadPerAccount, { requestId: ctx.requestId });

  const log = { requestId: ctx.requestId, ip: hashIp(ctx.clientIp), type };
  const reject = (code: "FILE_TOO_LARGE" | "FILE_TYPE_NOT_ALLOWED", status: number) => {
    logger.warn("application.document_rejected", { ...log, code });
    return new ApiError("File rejected", code, status);
  };

  if (!(file instanceof File) || file.size === 0) throw reject("FILE_TYPE_NOT_ALLOWED", StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  if (file.size > UPLOAD_POLICY.maxBytes) throw reject("FILE_TOO_LARGE", StatusCodes.PAYLOAD_TOO_LARGE);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectMimeType(bytes.subarray(0, 16));
  if (!mimeType || !(UPLOAD_POLICY.mimeTypes as readonly string[]).includes(mimeType)) {
    throw reject("FILE_TYPE_NOT_ALLOWED", StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  }

  const document = await partnerGateway.uploadDocument(ctx, session, type, {
    fileName: safeFileName(file.name, mimeType, UPLOAD_POLICY.maxFileNameLength),
    mimeType,
    sizeBytes: file.size,
    bytes,
  });
  logger.info("application.document_uploaded", { ...log, sizeBytes: file.size, mimeType });
  return document;
};
