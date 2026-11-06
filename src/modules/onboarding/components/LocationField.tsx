"use client";

import { useTranslation } from "react-i18next";
import { Button } from "#/components/ui/Button";
import { useGeolocation } from "../hooks/useGeolocation";

type Props = { error?: string; onChange: () => void };

/** Position GPS de l'établissement (obligatoire pour l'API : distances et rayon de livraison). */
export function LocationField({ error, onChange }: Props) {
  const { t } = useTranslation();
  const { coords, status, manual, toggleManual, locate, setManualValue, mapUrl } = useGeolocation(onChange);

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-semibold">{t("onboarding.location.label")}</p>
      <div className={`rounded-2xl border bg-surface p-5 ${error ? "border-danger" : "border-transparent"}`}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button type="button" variant="outline" onClick={locate} disabled={status === "locating"}>
            {status === "located" ? `✓ ${t("onboarding.location.saved")}` : t("onboarding.location.use_current")}
          </Button>
          <button type="button" className="link-underline text-sm text-muted" onClick={toggleManual}>
            {manual ? t("onboarding.location.manual_hide") : t("onboarding.location.manual_show")}
          </button>
        </div>

        <p className="mt-4 text-[13px] text-muted">{status === "denied" ? t("onboarding.location.denied") : t("onboarding.location.hint")}</p>

        <div className={manual ? "mt-5 grid gap-4 sm:grid-cols-2" : "hidden"}>
          {(["latitude", "longitude"] as const).map((key) => (
            <label key={key} className="text-[13px] text-muted">
              {t(`onboarding.location.${key}`)}
              <input
                name={key}
                inputMode="decimal"
                maxLength={12}
                placeholder={key === "latitude" ? "-4.263600" : "15.242900"}
                value={coords[key]}
                onChange={(e) => setManualValue(key, e.target.value)}
                className="mt-1.5 block h-11 w-full rounded-xl border border-ink/20 bg-paper px-3 text-[15px] text-ink tabular-nums focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              />
            </label>
          ))}
        </div>

        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="link-underline mt-4 inline-block text-[13px] text-ink">
            {t("onboarding.location.check_map", { lat: coords.latitude, lng: coords.longitude })} ↗
          </a>
        )}
      </div>
      {error && <p className="mt-2 text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
