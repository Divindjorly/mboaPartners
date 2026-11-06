"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { UPLOAD_POLICY } from "#/constants/partner";
import type { Application, DocumentType } from "#/types/partner.types";
import { deleteDocumentAction } from "../services/space.actions";
import { useSpaceAction } from "../hooks/useSpaceAction";
import { useUploadDocument } from "../hooks/useUploadDocument";
import { findDocument, formatBytes, formatDate, isDocumentEditable } from "../utils/applicationRules";
import { StatusChip } from "./StatusChip";

type Props = { application: Application; type: DocumentType; loginHref: string };

/** Une pièce du dossier : état, fichier déposé, motif de refus, ajout / remplacement / suppression. */
export function DocumentRow({ application, type, loginHref }: Props) {
  const { t, i18n } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const doc = findDocument(application, type);
  const editable = isDocumentEditable(application, type);
  const { upload, state } = useUploadDocument(type, loginHref);
  const remove = useSpaceAction(deleteDocumentAction, loginHref);
  const busy = state.status === "uploading" || remove.pending;
  const inputId = `file-${type}`;

  const chip = !doc ? (
    <StatusChip tone="neutral">{t("space.documents.status.MISSING")}</StatusChip>
  ) : doc.status === "ACCEPTED" ? (
    <StatusChip tone="success">{t("space.documents.status.ACCEPTED")}</StatusChip>
  ) : doc.status === "REFUSED" ? (
    <StatusChip tone="danger">{t("space.documents.status.REFUSED")}</StatusChip>
  ) : (
    <StatusChip tone="pending">{t(application.status === "IN_REVIEW" ? "space.documents.status.IN_REVIEW" : "space.documents.status.UPLOADED")}</StatusChip>
  );

  return (
    <li className="py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{t(`space.documents.types.${type}.title`)}</p>
            {chip}
          </div>
          <p className="mt-1 text-sm text-muted">{t(`space.documents.types.${type}.hint`)}</p>
          {doc && (
            <p className="mt-2 text-sm break-all text-ink">
              {doc.fileName} <span className="text-muted">· {formatBytes(doc.sizeBytes, i18n.language)} · {formatDate(doc.uploadedAt, i18n.language)}</span>
            </p>
          )}
          {doc?.status === "REFUSED" && doc.rejectionReason && (
            <p className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
              <span className="font-semibold">{t("space.documents.refused_reason")}</span> {doc.rejectionReason}
            </p>
          )}
        </div>

        {editable && (
          <div className="flex shrink-0 items-center gap-4">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={UPLOAD_POLICY.accept}
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              aria-describedby={`${inputId}-hint`}
              className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 font-poster text-lg font-extrabold transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
            >
              {doc ? t("space.documents.replace") : t("space.documents.add")}
            </button>
            {doc && (
              <button
                type="button"
                disabled={busy}
                onClick={() => remove.run({ documentId: doc.id })}
                className="text-sm text-muted underline-offset-4 hover:text-danger hover:underline disabled:opacity-50"
              >
                {t("space.documents.delete")}
              </button>
            )}
            <span id={`${inputId}-hint`} className="sr-only">
              {t("space.documents.file_rules")}
            </span>
          </div>
        )}
      </div>

      {state.status === "uploading" && (
        <div className="mt-3" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${state.progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">{t("space.documents.uploading", { progress: state.progress })}</p>
        </div>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {state.message}
        </p>
      )}
      {remove.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {remove.error}
        </p>
      )}
    </li>
  );
}
