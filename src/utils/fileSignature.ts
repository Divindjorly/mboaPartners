/**
 * Type réel d'un fichier d'après ses premiers octets (OWASP A05 / A08) :
 * l'extension et le Content-Type envoyés par le navigateur ne sont pas fiables.
 */
const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // %PDF-
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

export const detectMimeType = (head: Uint8Array): string | null =>
  SIGNATURES.find((s) => s.bytes.every((b, i) => head[i] === b))?.mime ?? null;

const EXTENSION: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" };

/**
 * Nom d'affichage sûr : sans chemin, sans caractère de contrôle, longueur bornée,
 * extension forcée selon le type réel. Le fichier n'est jamais stocké sous ce nom.
 */
export const safeFileName = (name: string, mimeType: string, maxLength: number): string => {
  const base = (name.split(/[\\/]/).pop() ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.[a-z0-9]{1,5}$/i, "");
  const ext = EXTENSION[mimeType] ?? "bin";
  return `${(base || "document").slice(0, maxLength - ext.length - 1)}.${ext}`;
};
