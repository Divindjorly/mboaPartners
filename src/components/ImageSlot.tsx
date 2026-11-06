import Image from "next/image";
import { IMAGES, type ImageKey, type SiteImage } from "#/constants/images";

type Props = {
  name: ImageKey;
  /** Texte alternatif traduit (`images.<clé>`). */
  alt: string;
  /** Repère affiché en développement tant que l'image manque. */
  devHint?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Emplacement photo : image du catalogue (src/constants/images.ts) ou, tant qu'elle
 * n'est pas fournie, un aplat papier sobre.
 * Le parent doit être positionné (relative) et dimensionné.
 */
export function ImageSlot({ name, alt, devHint, className = "", sizes = "100vw", priority }: Props) {
  const image: SiteImage = IMAGES[name];

  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder={typeof image.src === "string" ? "empty" : "blur"}
        className={`object-cover ${image.focus ?? ""} ${className}`}
      />
    );
  }

  return (
    <div role="img" aria-label={alt} className={`absolute inset-0 bg-surface ${className}`}>
      <div className={`absolute inset-4 rounded-[1.5rem] border border-ink/15`} />
      {process.env.NODE_ENV === "development" && devHint && (
        <p className={`absolute bottom-6 left-6 max-w-xs text-xs italic text-muted`}>{devHint}</p>
      )}
    </div>
  );
}
