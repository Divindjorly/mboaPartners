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
