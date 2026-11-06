import Image from "next/image";
import Link from "next/link";

type Props = { href: string; alt: string; linkLabel: string; className?: string };

export function Logo({ href, alt, linkLabel, className = "h-9 w-auto" }: Props) {
  return (
    <Link href={href} aria-label={linkLabel} className="inline-flex shrink-0">
      <Image src="/logo-wordmark.png" alt={alt} width={724} height={228} priority className={className} />
    </Link>
  );
}
