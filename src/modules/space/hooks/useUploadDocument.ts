"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { UPLOAD_POLICY } from "#/constants/partner";
import { DOCUMENT_UPLOAD_ENDPOINT } from "#/constants/routes";
import { getTranslatedErrorMessage } from "#/i18n/translateError";
import type { ActionResponse } from "#/types/api.types";
import type { DocumentType, PartnerDocument } from "#/types/partner.types";

type State = { status: "idle" } | { status: "uploading"; progress: number } | { status: "error"; message: string };

/**
 * Envoi d'une pièce avec barre de progression (XMLHttpRequest : fetch n'expose pas la progression
 * de l'envoi). Contrôles immédiats de taille et de type ; le serveur revérifie tout.
 */
export const useUploadDocument = (type: DocumentType, loginHref: string) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  const fail = (code: string) => setState({ status: "error", message: getTranslatedErrorMessage(t, { success: false, error: { code: code as never } }) });

  const upload = (file: File) => {
    if (file.size > UPLOAD_POLICY.maxBytes) return fail("FILE_TOO_LARGE");
    if (file.type && !(UPLOAD_POLICY.mimeTypes as readonly string[]).includes(file.type)) return fail("FILE_TYPE_NOT_ALLOWED");

    const body = new FormData();
    body.set("type", type);
    body.set("file", file);
    body.set("locale", i18n.language);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", DOCUMENT_UPLOAD_ENDPOINT);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setState({ status: "uploading", progress: Math.round((e.loaded / e.total) * 100) });
    };
    xhr.onerror = () => fail("UPSTREAM_UNREACHABLE");
    xhr.onload = () => {
      const response = xhr.response as ActionResponse<PartnerDocument> | null;
      if (response?.success) {
        setState({ status: "idle" });
        router.refresh();
      } else if (response?.error.code === "UNAUTHENTICATED") {
        window.location.assign(loginHref);
      } else {
        fail(response?.error.code ?? "UNKNOWN_ERROR");
      }
    };
    setState({ status: "uploading", progress: 0 });
    xhr.send(body);
  };

  return { upload, state, reset: () => setState({ status: "idle" }) };
};
