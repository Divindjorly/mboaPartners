"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Compte à rebours en secondes basé sur une échéance (aucun setState synchrone dans l'effet).
 * @param initialSeconds délai déjà en cours au montage (ex. code envoyé juste avant).
 */
export const useCooldown = (initialSeconds = 0) => {
  const [until, setUntil] = useState(() => Date.now() + initialSeconds * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (until <= now) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [until, now]);

  const start = useCallback((seconds: number) => {
    const t = Date.now();
    setNow(t);
    setUntil(t + seconds * 1000);
  }, []);

  return { remaining: Math.max(0, Math.ceil((until - now) / 1000)), start };
};
