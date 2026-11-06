"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import { getTranslatedErrorMessage } from "#/i18n/translateError";
import type { ActionFailure, ActionResponse } from "#/types/api.types";
import { formDataToObject } from "#/utils/formData";
import { toFieldErrors } from "#/utils/validation";

type FormAction<T> = (prev: ActionResponse<T> | null, formData: FormData) => Promise<ActionResponse<T>>;

/**
 * Flow client générique d'un formulaire relié à une Server Action :
 *  - validation immédiate avec le même schéma Zod que le serveur ;
 *  - envoi dans une transition (les saisies sont conservées en cas d'erreur) ;
 *  - traduction des erreurs (`validation.*` pour les champs, `api_errors.<CODE>` pour le reste) ;
 *  - `onSuccess` appelé une seule fois par réponse réussie.
 */
export const useValidatedAction = <T>(action: FormAction<T>, schema: z.ZodType | null, onSuccess?: (data: T) => void) => {
  const { t, i18n } = useTranslation();
  const [response, dispatch, pending] = useActionState(action, null);
  const [clientErrors, setClientErrors] = useState<Record<string, string[]> | null>(null);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  useEffect(() => {
    if (response?.success) onSuccessRef.current?.(response.data);
  }, [response]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("locale", i18n.language);

    if (schema) {
      const result = schema.safeParse(formDataToObject(formData));
      if (!result.success) {
        const errors = toFieldErrors(result.error);
        setClientErrors(errors);
        focusFirstInvalidField(form, errors);
        return;
      }
    }
    setClientErrors(null);
    startTransition(() => dispatch(formData));
  };

  const failure: ActionFailure | null = response && !response.success ? response : null;
  const fieldErrors = clientErrors ?? failure?.error.fieldErrors ?? {};

  /** Efface l'erreur d'un champ dès que l'utilisateur le corrige. */
  const clearError = (name: string) => {
    if (clientErrors?.[name]) {
      setClientErrors(Object.fromEntries(Object.entries(clientErrors).filter(([key]) => key !== name)));
    }
  };

  return {
    handleSubmit,
    pending,
    fieldErrors,
    clearError,
    failure: clientErrors ? null : failure,
    hasClientErrors: !!clientErrors && Object.keys(clientErrors).length > 0,
    serverError: !clientErrors && failure ? { message: getTranslatedErrorMessage(t, failure), details: failure.error.details ?? [] } : null,
  };
};

const focusFirstInvalidField = (form: HTMLFormElement, errors: Record<string, string[]>) => {
  const first = Array.from(form.elements).find(
    (el): el is HTMLInputElement | HTMLSelectElement =>
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) && Boolean(errors[el.name]),
  );
  first?.focus();
  first?.scrollIntoView({ behavior: "smooth", block: "center" });
};
