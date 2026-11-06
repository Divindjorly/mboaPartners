import { ImageSlot } from "#/components/ImageSlot";
import { ButtonLink } from "#/components/ui/Button";
import type { ImageKey } from "#/constants/images";
import { ChapterHeading } from "./ChapterHeading";

type Props = {
  id: string;
  title: string;
  lead: string;
  caption: string;
  points: { title: string; text: string }[];
  image: { name: ImageKey; alt: string; devHint: string };
  cta: { href: string; label: string };
  /** Fond gris clair et photo à droite, pour alterner avec la section précédente. */
  alternate?: boolean;
};

/** Section d'argumentaire : titre, photo arrondie, accroche + bouton, 4 arguments. */
export function FeatureChapter({ id, title, lead, caption, points, image, cta, alternate = false }: Props) {
  return (
    <section id={id} className={alternate ? "bg-surface" : ""}>
      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-24">
        <ChapterHeading title={title} />

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
          <figure className={`lg:col-span-7 ${alternate ? "lg:order-2" : ""}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <ImageSlot name={image.name} alt={image.alt} devHint={image.devHint} sizes="(min-width: 1024px) 55vw, 100vw" />
            </div>
            <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
          </figure>

          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="font-poster text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.05] font-extrabold">{lead}</p>
            <ButtonLink href={cta.href} size="lg" className="mt-8 self-start">
              {cta.label}
            </ButtonLink>
          </div>
        </div>

        <ul className="mt-14 grid gap-x-10 gap-y-8 border-t border-rule pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <li key={point.title}>
              <p className="font-poster text-xl font-extrabold">{point.title}</p>
              <p className="mt-2 leading-relaxed text-muted">{point.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
