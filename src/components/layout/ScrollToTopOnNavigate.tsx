"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Next.js conserve la position de défilement quand la nouvelle page reste visible :
 * un clic depuis le pied de page ouvrait la page suivante… sur son pied de page.
 * On remonte donc en haut à chaque changement de page, sauf :
 * - changement de langue seul (/fr/a-propos → /en/a-propos) : on garde la position ;
 * - lien vers une section (#faq…) : Next.js défile jusqu'à l'ancre ;
 * - retour / avance du navigateur : le navigateur restaure la position.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const page = pathname.split("/").slice(2).join("/");
  const previousPage = useRef(page);
  const fromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      fromHistory.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    if (fromHistory.current) {
      fromHistory.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page]);

  return null;
}
