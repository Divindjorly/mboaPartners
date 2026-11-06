"use client";

import { useState, type FormEvent } from "react";
import { useValidatedAction } from "#/hooks/useValidatedAction";
import { emailOnlySchema, passwordResetConfirmSchema } from "../schemas/auth.schemas";
import { confirmPasswordResetAction, requestPasswordResetAction } from "../services/auth.actions";

type Step = "request" | "confirm" | "done";

/** Mot de passe oublié : e-mail → code + nouveau mot de passe → confirmation. */
export const usePasswordReset = () => {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");

  const request = useValidatedAction(requestPasswordResetAction, emailOnlySchema, () => setStep("confirm"));
  const confirm = useValidatedAction(confirmPasswordResetAction, passwordResetConfirmSchema, () => setStep("done"));

  const handleRequest = (event: FormEvent<HTMLFormElement>) => {
    setEmail(String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase());
    request.handleSubmit(event);
  };

  return { step, email, request: { ...request, handleSubmit: handleRequest }, confirm, restart: () => setStep("request") };
};
