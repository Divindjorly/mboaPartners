"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { getTranslatedErrorMessage } from "#/i18n/translateError";
import type { ActionResponse } from "#/types/api.types";

type Action<T> = (prev: ActionResponse<T> | null, formData: FormData) => Promise<ActionResponse<T>>;

/**
 * Exécute une action de l'espace puis recharge les données serveur de la page.
 * Session expirée → retour à la connexion.
 */
export const useSpaceAction = <T>(action: Action<T>, loginHref: string) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fields: Record<string, string>, onSuccess?: (data: T) => void) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) formData.set(key, value);
    formData.set("locale", i18n.language);
    setError(null);
    startTransition(async () => {
      const response = await action(null, formData);
      if (response.success) {
        onSuccess?.(response.data);
        router.refresh();
      } else if (response.error.code === "UNAUTHENTICATED") {
        window.location.assign(loginHref);
      } else {
        setError(getTranslatedErrorMessage(t, response));
      }
    });
  };

  return { run, pending, error, clearError: () => setError(null) };
};
