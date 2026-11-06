"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { buttonClass } from "#/components/ui/Button";

type Props = {
  items: { href: string; label: string; current?: boolean }[];
  cta: { href: string; label: string };
  labels: { open: string; close: string; nav: string };
  /** Classe de fond du panneau, identique à celle de l'en-tête. */
  surface: string;
};

/** Menu des écrans < 1024 px : bouton burger, panneau déroulant sous l'en-tête. */
export function MobileMenu({ items, cta, labels, surface }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((v) => !v)}
        className="-mr-2 grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <div id={panelId} hidden={!open} className={`absolute inset-x-0 top-full border-b border-rule shadow-[0_12px_24px_-16px_rgb(19_39_28/0.35)] ${surface}`}>
        <nav aria-label={labels.nav} className="mx-auto max-w-[90rem] px-5 pt-2 pb-6 sm:px-10">
          <ul className="divide-y divide-rule">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={item.current ? "page" : undefined}
                  className="flex min-h-12 items-center py-3 text-lg font-semibold text-ink aria-[current=page]:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={cta.href} onClick={close} className={buttonClass({ size: "md", className: "mt-4 w-full sm:hidden" })}>
            {cta.label}
          </Link>
        </nav>
      </div>
    </div>
  );
}
