import type { ComponentProps, ReactNode } from "react";
import { NumberBadge } from "./NumberBadge";

/**
 * Primitives de formulaire (UI pure, coins arrondis). Les textes arrivent déjà traduits.
 */

const controlBase =
  "block w-full rounded-xl border bg-paper px-4 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-surface";

const controlState = (invalid: boolean) =>
  invalid ? "border-danger focus:ring-danger/30" : "border-ink/20 hover:border-ink/40 focus:border-brand focus:ring-brand/20";

type FieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ id, label, hint, error, optionalLabel, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-2 text-sm font-semibold text-ink">
        <span>{label}</span>
        {optionalLabel && <span className="text-xs font-normal text-muted italic">{optionalLabel}</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[13px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type ControlExtra = { invalid?: boolean };

export function Input({ invalid = false, className = "", id, ...props }: ComponentProps<"input"> & ControlExtra) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : `${id}-hint`}
      className={`${controlBase} h-12 ${controlState(invalid)} ${className}`}
      {...props}
    />
  );
}

export function Select({ invalid = false, className = "", id, children, ...props }: ComponentProps<"select"> & ControlExtra) {
  return (
    <select
      id={id}
      name={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={`${controlBase} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'%20fill='none'%20stroke='%23121212'%20stroke-width='1.5'%3E%3Cpath%20d='m2%204%204%204%204-4'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10 ${controlState(invalid)} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

/** Champ téléphone avec indicatif +242 fixe. */
export function PhoneInput({ invalid = false, id, ...props }: ComponentProps<"input"> & ControlExtra) {
  return (
    <div className="flex">
      <span className="inline-flex h-12 items-center rounded-l-xl border border-r-0 border-ink/20 bg-surface px-3 font-semibold text-ink tabular-nums">
        +242
      </span>
      <Input id={id} type="tel" inputMode="tel" autoComplete="tel-national" maxLength={20} invalid={invalid} className="rounded-l-none tabular-nums" {...props} />
    </div>
  );
}

export function Checkbox({ id, invalid = false, children, error, ...props }: ComponentProps<"input"> & ControlExtra & { error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          id={id}
          name={id}
          type="checkbox"
          aria-invalid={invalid || undefined}
          className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-brand"
          {...props}
        />
        <span>{children}</span>
      </label>
      {error && <p className="mt-2 pl-[30px] text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}

/** Section de formulaire : carte blanche, pastille numérotée + titre. */
export function FormSection({ step, title, description, children }: { step: number; title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-3xl bg-paper p-5 sm:p-9">
      <legend className="sr-only">{title}</legend>
      <div className="mb-7 flex items-center gap-4">
        <NumberBadge>{step}</NumberBadge>
        <div>
          <h2 className="font-poster text-2xl font-extrabold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Alert({ title, items, tone = "error" }: { title: string; items?: string[]; tone?: "error" | "success" }) {
  const styles = tone === "error" ? "border-danger bg-danger-soft text-danger" : "border-brand bg-paper text-ink";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border-l-4 px-5 py-4 text-sm ${styles}`}>
      <p className="font-semibold">{title}</p>
      {items && items.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
