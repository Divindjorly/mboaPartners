export type PartnerKind = "restaurant" | "livraison";

/** Résultat d'une inscription réussie : seule l'adresse à vérifier est renvoyée au navigateur. */
export type SignupResult = { email: string };

export type OnboardingStep = { name: "form" } | { name: "verify"; email: string };
