"use client";

import { useEffect, useState } from "react";

/** Compte à rebours en secondes, relançable via `restart()`. */
export const useCountdown = (durationSec: number) => {
  const [endsAt, setEndsAt] = useState(() => Date.now() + durationSec * 1000);
  const [now, setNow] = useState(() => Date.now());
  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [remaining, now]);

  const restart = () => {
    const start = Date.now();
    setNow(start);
    setEndsAt(start + durationSec * 1000);
  };

  return { remaining, restart };
};
