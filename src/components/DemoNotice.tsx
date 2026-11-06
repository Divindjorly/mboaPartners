import type { ReactNode } from "react";

/** Encadré du mode démonstration (données simulées) : n'apparaît jamais avec l'API réelle. */
export function DemoNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="rounded-2xl border-2 border-dashed border-ink/25 bg-paper px-5 py-4 text-sm text-muted">
      <p className="font-poster text-base font-extrabold text-ink">{title}</p>
      <div className="mt-1 space-y-1">{children}</div>
    </aside>
  );
}
