/** Bord arrondi entre deux sections (signature Glovo). Couleur = currentColor. */
export function Wave({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 1440 90" preserveAspectRatio="none" className={`block h-12 w-full sm:h-20 ${flip ? "rotate-180" : ""} ${className}`}>
      <path fill="currentColor" d="M0 90V58C240 18 480 0 760 6s480 34 680 64v20z" />
    </svg>
  );
}
