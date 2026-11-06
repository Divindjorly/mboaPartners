import { ChapterHeading } from "./ChapterHeading";

type Props = { title: string; items: { q: string; a: string }[] };

/** Accordéon natif : une seule question ouverte à la fois (attribut `name`). */
export function FaqChapter({ title, items }: Props) {
  return (
    <section id="faq" className="bg-surface">
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <ChapterHeading title={title} />
        <div className="mt-10 max-w-4xl divide-y divide-rule border-y border-rule">
          {items.map((item) => (
            <details key={item.q} name="faq" className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold transition-colors hover:text-brand">
                {item.q}
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-current text-xl leading-none transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-3xl pb-7 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
