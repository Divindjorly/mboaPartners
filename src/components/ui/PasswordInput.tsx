"use client";

import { useState, type ComponentProps } from "react";
import { Input } from "./Form";

type Props = Omit<ComponentProps<typeof Input>, "type"> & { showLabel: string; hideLabel: string; showShort: string; hideShort: string };

/** Champ mot de passe avec bouton Afficher / Masquer (libellés déjà traduits). */
export function PasswordInput({ showLabel, hideLabel, showShort, hideShort, className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={`pr-24 ${className}`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-muted hover:text-ink"
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? hideShort : showShort}
      </button>
    </div>
  );
}
