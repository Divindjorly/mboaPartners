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
  /** Adresse inconnue : le formulaire invite à s'inscrire au lieu d'afficher une simple erreur. */
  const accountNotFound = form.failure?.error.code === "ACCOUNT_NOT_FOUND";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setEmail(String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase());
    form.handleSubmit(event);
  };

  return {
    ...form,
    handleSubmit,
    email,
    needsVerification,
    accountNotFound,
    serverError: needsVerification || accountNotFound ? null : form.serverError,
  };
};
