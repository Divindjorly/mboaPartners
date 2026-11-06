/** En-tête de section : titre condensé, sans numérotation. */
export function ChapterHeading({ title }: { title: string }) {
  return <h2 className="font-poster text-[clamp(2rem,3.8vw,3.5rem)] font-black text-balance">{title}</h2>;
}
