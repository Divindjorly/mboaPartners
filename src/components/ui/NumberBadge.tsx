import type { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "size-7 text-base",
  md: "size-10 text-xl",
  lg: "size-12 text-2xl",
};

/** Pastille numérotée unique du site (étapes, sections, listes) : rond vert, chiffre blanc. */
export function NumberBadge({ children, size = "md" }: { children: ReactNode; size?: Size }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full bg-brand font-poster font-black text-paper ${sizes[size]}`}>
      {children}
    </span>
  );
}
