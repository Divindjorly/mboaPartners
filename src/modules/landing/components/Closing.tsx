import { ButtonLink } from "#/components/ui/Button";

type Props = {
  title: [string, string];
  text: string;
  restaurant: { href: string; label: string };
  fleet: { href: string; label: string };
};

/** Bandeau final jaune (rappel de la page de garde). */
export function Closing({ title, text, restaurant, fleet }: Props) {
  return (
    <section className="px-3 pt-12 pb-16 sm:px-4 sm:pt-16">
      <div className="mx-auto grid max-w-[90rem] items-center gap-10 rounded-[2rem] bg-accent-soft px-5 py-12 sm:rounded-[2.5rem] sm:px-14 sm:py-20 lg:grid-cols-12">
        <h2 className="font-poster text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.95] font-black text-ink lg:col-span-7">
          {title[0]} <span className="text-brand">{title[1]}</span>
        </h2>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
          <p className="text-lg font-medium text-ink/80 sm:text-xl">{text}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={restaurant.href} size="lg">
              {restaurant.label}
            </ButtonLink>
            <ButtonLink href={fleet.href} size="lg" variant="outline">
              {fleet.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
