import { ButtonLink } from "#/components/ui/Button";
import { NumberBadge } from "#/components/ui/NumberBadge";

type Props = { title: string; steps: { title: string; text: string }[]; cta: { href: string; label: string } };

/** Étapes façon Yango : titre condensé, 4 cartes, bouton pilule centré. */
export function StepsChapter({ title, steps, cta }: Props) {
  return (
    <section id="etapes">
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <h2 className="font-poster text-[clamp(2rem,3.8vw,3.5rem)] font-black text-balance">{title}</h2>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col rounded-3xl bg-surface p-8">
              <NumberBadge size="lg">{i + 1}</NumberBadge>
              <h3 className="mt-6 font-poster text-2xl font-extrabold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <ButtonLink href={cta.href} size="lg">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
