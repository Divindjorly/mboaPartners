"use client";

import { useState, type FormEvent } from "react";
import { useValidatedAction } from "#/hooks/useValidatedAction";
import { loginSchema } from "../schemas/auth.schemas";
import { loginAction } from "../services/auth.actions";

/**
 * Connexion par e-mail + mot de passe.
 * Si le compte n'a pas encore vérifié son e-mail, `needsVerification` passe à vrai :
 * l'écran bascule sur la saisie du code (un nouveau code vient d'être envoyé).
 */
export const useLogin = (onSignedIn: () => void) => {
  const [email, setEmail] = useState("");
  const form = useValidatedAction(loginAction, loginSchema, onSignedIn);
  const needsVerification = form.failure?.error.code === "EMAIL_NOT_VERIFIED";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setEmail(String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase());
    form.handleSubmit(event);
  };

  return { ...form, handleSubmit, email, needsVerification, serverError: needsVerification ? null : form.serverError };
};
