"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CITY_CENTERS, CONGO_CITIES, type CongoCity } from "#/constants/geography";
import { useLocationPicker } from "../hooks/useLocationPicker";
import type { MapsConfig } from "../types/onboarding.types";
import { LocationMap } from "./LocationMap";

type Props = { maps: MapsConfig | null; city: string; error?: string; onChange: () => void };

const isCity = (v: string): v is CongoCity => (CONGO_CITIES as readonly string[]).includes(v);

/**
 * Position GPS de l'établissement (obligatoire pour l'API : distances et rayon de livraison), au choix :
 * recherche d'adresse sur la carte, repère posé ou glissé sur la carte, ou coordonnées saisies à la main.
 * Sans clé Google Maps (ou carte refusée), seule la saisie reste proposée.
 */
export function LocationField({ maps, city, error, onChange }: Props) {
  const { t } = useTranslation();
  const [mapFailed, setMapFailed] = useState(false);
  const withMap = maps !== null && !mapFailed;
  const { coords, point, follow, manual, toggleManual, setPoint, setManualValue } = useLocationPicker(onChange, maps === null);
  const showManual = manual || !withMap;

  // Objet stable par ville (évite de recentrer la carte à chaque rendu)
  const area = useMemo(() => {
    const c = CITY_CENTERS[isCity(city) ? city : "Brazzaville"];
    return { center: { lat: c.latitude, lng: c.longitude }, radiusM: c.radiusKm * 1000 };
  }, [city]);

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-semibold">{t("onboarding.location.label")}</p>
      <div className={`rounded-2xl border bg-surface p-4 sm:p-5 ${error ? "border-danger" : "border-transparent"}`}>
        {withMap ? (
          <LocationMap maps={maps} center={area.center} radiusM={area.radiusM} point={point} follow={follow} onPick={setPoint} onUnavailable={() => setMapFailed(true)} />
        ) : (
          <p className="text-[13px] text-muted">{maps && mapFailed ? t("onboarding.location.map_unavailable") : t("onboarding.location.manual_only")}</p>
        )}

        {withMap && (
          <button type="button" className="link-underline mt-4 text-sm text-muted" aria-expanded={manual} onClick={toggleManual}>
            {manual ? t("onboarding.location.manual_hide") : t("onboarding.location.manual_show")}
          </button>
        )}

        {/* Toujours dans le formulaire (masquées quand la carte suffit) : ce sont elles qui sont envoyées */}
        <div className={showManual ? "mt-4 grid gap-4 sm:grid-cols-2" : "hidden"}>
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
          <p className="text-[13px] text-muted sm:col-span-2">{t("onboarding.location.manual_hint")}</p>
        </div>

        {withMap && point && !showManual && (
          <p className="mt-3 text-[13px] text-ink tabular-nums">
            ✓ {t("onboarding.location.saved")} · {coords.latitude}, {coords.longitude}
          </p>
        )}
      </div>
      {error && <p className="mt-2 text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
