/** Villes proposées dans les formulaires (République du Congo). */
export const CONGO_CITIES = [
  "Brazzaville",
  "Pointe-Noire",
  "Dolisie",
  "Nkayi",
  "Ouesso",
  "Owando",
  "Oyo",
  "Impfondo",
  "Madingou",
  "Sibiti",
] as const;

export type CongoCity = (typeof CONGO_CITIES)[number];

/** Emprise large du territoire, pour rejeter les positions GPS aberrantes. */
export const CONGO_BOUNDS = {
  latitude: { min: -5.2, max: 3.8 },
  longitude: { min: 11, max: 18.7 },
} as const;

/** Nom du pays transmis à l'API. */
export const COUNTRY_NAME = "Congo";

/**
 * Centre et rayon de chaque ville : une position GPS trop loin de la ville choisie est refusée (le bouton
 * « utiliser ma position » donne la position de la personne, pas forcément celle de l'établissement).
 * Même table côté API (mboaPlatformBackend, partners.geography.ts).
 */
export const CITY_CENTERS: Record<CongoCity, { latitude: number; longitude: number; radiusKm: number }> = {
  Brazzaville: { latitude: -4.2634, longitude: 15.2429, radiusKm: 30 },
  "Pointe-Noire": { latitude: -4.7761, longitude: 11.8635, radiusKm: 30 },
  Dolisie: { latitude: -4.199, longitude: 12.6666, radiusKm: 20 },
  Nkayi: { latitude: -4.183, longitude: 13.286, radiusKm: 20 },
  Ouesso: { latitude: 1.6136, longitude: 16.0517, radiusKm: 20 },
  Owando: { latitude: -0.4819, longitude: 15.8999, radiusKm: 20 },
  Oyo: { latitude: -1.1667, longitude: 15.9833, radiusKm: 20 },
  Impfondo: { latitude: 1.6181, longitude: 18.0628, radiusKm: 20 },
  Madingou: { latitude: -4.1536, longitude: 13.55, radiusKm: 20 },
  Sibiti: { latitude: -3.6819, longitude: 13.3499, radiusKm: 20 },
};

/** Distance à vol d'oiseau (km), formule de haversine. */
export const distanceKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export const isInCity = (city: CongoCity, point: { latitude: number; longitude: number }) => {
  const c = CITY_CENTERS[city];
  return distanceKm(c, point) <= c.radiusKm;
};
