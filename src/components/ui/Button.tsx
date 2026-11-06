import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Bouton unique du site, style « pilule » (inspiré de Yango) : capitales condensées,
 * coins entièrement arrondis, légère inclinaison au survol (désactivée si l'utilisateur
 * a demandé moins d'animations). Deux variantes seulement pour garder la palette courte.
 */
type Variant = "primary" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center leading-[1.05] font-poster font-extrabold text-balance transition-[scale,rotate,background-color,color] duration-150 motion-safe:hover:scale-[1.03] motion-safe:hover:-rotate-1 motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  /** Vert Mboa : action principale. */
  primary: "bg-brand text-paper hover:bg-brand-deep",
  /** Contour encre : action secondaire, lisible sur blanc comme sur jaune. */
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-5 py-1.5 text-lg",
  md: "min-h-12 px-7 py-2 text-xl",
  lg: "min-h-14 px-7 py-2.5 text-xl sm:px-8 sm:text-2xl",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

export const buttonClass = ({ variant = "primary", size = "md", className = "" }: StyleProps = {}) =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & StyleProps) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}
