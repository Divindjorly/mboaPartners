"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCooldown } from "#/hooks/useCooldown";
import { getTranslatedErrorMessage } from "#/i18n/translateError";
import { resendEmailCodeAction } from "../services/auth.actions";

const RESEND_COOLDOWN_SECONDS = 60;

/** Nouvel envoi du code, limité à un toutes les 60 s. */
export const useResendEmailCode = (email: string, alreadySent = true) => {
  const { t, i18n } = useTranslation();
  const [response, dispatch, pending] = useActionState(resendEmailCodeAction, null);
  const { remaining, start } = useCooldown(alreadySent ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (response && !response.success && response.error.retryAfterSec) start(response.error.retryAfterSec);
  }, [response, start]);

  const resend = () => {
    const formData = new FormData();
    formData.set("email", email);
    formData.set("locale", i18n.language);
    start(RESEND_COOLDOWN_SECONDS);
    startTransition(() => dispatch(formData));
  };

  return {
    resend,
    pending,
    cooldown: remaining,
    sent: !!response?.success,
    errorMessage: response && !response.success ? getTranslatedErrorMessage(t, response) : null,
  };
};
