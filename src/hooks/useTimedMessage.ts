"use client";

import { useEffect, useState } from "react";

/** Durée d'affichage d'un message de connexion (erreur, session expirée) : assez pour le lire, puis il s'efface. */
export const MESSAGE_DURATION_MS = 7000;

/**
 * Vrai tant que le message identifié par `key` doit rester affiché. `key` change à chaque nouveau message
 * (ex. chaque réponse en échec) : le délai repart de zéro. `key` nul ou faux : rien à afficher.
 */
export const useTimedMessage = (key: unknown, durationMs = MESSAGE_DURATION_MS): boolean => {
  const [expiredKey, setExpiredKey] = useState<unknown>(null);
  useEffect(() => {
    if (!key) return;
    const timer = setTimeout(() => setExpiredKey(key), durationMs);
    return () => clearTimeout(timer);
  }, [key, durationMs]);
  return Boolean(key) && expiredKey !== key;
};
