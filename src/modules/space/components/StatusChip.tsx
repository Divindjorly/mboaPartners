type Tone = "neutral" | "pending" | "success" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface text-muted",
  pending: "bg-ink/8 text-ink",
  success: "bg-brand/10 text-brand",
  danger: "bg-danger-soft text-danger",
};

/** Pastille d'état (document, livreur). Palette réduite : gris, encre, vert, rouge. */
export function StatusChip({ tone, children }: { tone: Tone; children: string }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}
