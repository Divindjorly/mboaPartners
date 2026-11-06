/** Types d'établissement (libellés traduits sous `onboarding.business_types.<valeur>`). */
export const BUSINESS_TYPES = ["restaurant", "fast_food", "bakery", "grocery", "caterer"] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];
