import { REVIEW_POLICY } from "#/constants/partner";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Ajoute des heures « ouvrées » à une date : les heures tombant un samedi ou un dimanche
 * (heure du Congo, UTC+1, sans heure d'été) ne sont pas comptées. Les jours fériés comptent.
 * Ex. vendredi 15 h + 48 h → mardi 15 h.
 */
export const addBusinessHours = (from: Date, hours: number = REVIEW_POLICY.businessHours): Date => {
  const offsetMs = REVIEW_POLICY.utcOffsetHours * HOUR_MS;
  let t = from.getTime();
  let remaining = hours;
  while (remaining > 0) {
    t += HOUR_MS;
    const day = new Date(t - HOUR_MS / 2 + offsetMs).getUTCDay(); // jour de l'heure qui vient de s'écouler
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return new Date(t);
};
