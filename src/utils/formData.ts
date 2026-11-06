/** Taille maximale d'un champ texte reçu (défense en profondeur avant Zod). */
const MAX_FIELD_LENGTH = 2000;
const MAX_FIELDS = 50;

/**
 * Convertit un FormData en objet de chaînes.
 * Ignore les champs internes de Next ($ACTION_*), les fichiers, et tronque les valeurs
 * anormalement longues (OWASP A05 / A06 : entrées non fiables bornées).
 */
export const formDataToObject = (formData: FormData): Record<string, string> => {
  const out: Record<string, string> = {};
  let count = 0;
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$ACTION") || typeof value !== "string") continue;
    if (++count > MAX_FIELDS) break;
    out[key] = value.slice(0, MAX_FIELD_LENGTH);
  }
  return out;
};
