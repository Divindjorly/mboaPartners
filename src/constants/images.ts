/**
 * Catalogue des photos du site.
 *
 * Pour ajouter une image :
 *   1. déposez le fichier dans src/assets/ (nom sans espace ni accent) ;
 *   2. importez-le ci-dessous et renseignez-le dans `src`.
 *
 * Tant que `src` vaut null, un aplat papier sobre s'affiche.
 * Le texte alternatif est traduit sous `images.<clé>` dans src/locales.
 * Images locales uniquement (pas de domaine externe : CSP img-src 'self').
 */
import type { StaticImageData } from "next/image";
import cheffeCuisiniere from "#/assets/cheffe-cuisiniere.jpg";
import fastFood from "#/assets/fast-food.jpg";
import moto from "#/assets/moto.png";
import plat from "#/assets/plat.jpg";

export type SiteImage = {
  /** Import statique depuis src/assets (recommandé) ou chemin sous public/. */
  src: StaticImageData | string | null;
  /** Format conseillé, pour préparer les fichiers. */
  recommended: string;
  /** Cadrage dans le recadrage (classe Tailwind object-position), ex. "object-[50%_30%]". */
  focus?: string;
};

export const IMAGES = {
  /** Premier écran (moitié droite, plein cadre). */
  hero: { src: cheffeCuisiniere, recommended: "≥ 1400 px de large, portrait ou paysage, sujet centré", focus: "object-[60%_35%]" },
  /** Chapitre 01 — Restaurants et commerces (grand format) + page d'inscription restaurant. */
  restaurant: { src: plat, recommended: "≥ 1800 px de large, paysage : plats", focus: "object-[55%_50%]" },
  /** Page d'inscription restaurant (colonne de gauche). */
  signupRestaurant: { src: fastFood, recommended: "≥ 1200 px de large : salle de restaurant", focus: "object-[45%_50%]" },
  /** Chapitre 02 — Entreprises de livraison (grand format) + page d'inscription livraison. */
  fleet: { src: moto, recommended: "≥ 1800 px de large, paysage : livreur / motos en ville", focus: "object-[62%_50%]" },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
