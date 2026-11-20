export type PartnerKind = "restaurant" | "livraison";

/** Carte Google de l'inscription resto (absente sans clé configurée). La clé est publique (restreinte au domaine). */
export type MapsConfig = { apiKey: string; mapId: string; nonce?: string };

/** Résultat d'une inscription réussie : seule l'adresse à vérifier est renvoyée au navigateur. */
export type SignupResult = { email: string };

export type OnboardingStep = { name: "form" } | { name: "verify"; email: string };
