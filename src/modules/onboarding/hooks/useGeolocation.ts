"use client";

import { useState } from "react";

export type Coordinates = { latitude: string; longitude: string };
export type GeolocationStatus = "idle" | "locating" | "located" | "denied";

const GEO_OPTIONS: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

/**
 * Position GPS de l'établissement : via le navigateur (permission explicite de l'utilisateur)
 * ou saisie manuelle. La position n'est envoyée qu'avec le formulaire.
 */
export const useGeolocation = (onChange: () => void) => {
  const [coords, setCoords] = useState<Coordinates>({ latitude: "", longitude: "" });
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [manual, setManual] = useState(false);

  const update = (next: Coordinates) => {
    setCoords(next);
    onChange();
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setStatus("denied");
      setManual(true);
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({ latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) });
        setStatus("located");
      },
      () => {
        setStatus("denied");
        setManual(true);
      },
      GEO_OPTIONS,
    );
  };

  const setManualValue = (key: keyof Coordinates, value: string) =>
    update({ ...coords, [key]: value.replace(",", ".").replace(/[^\d.-]/g, "").slice(0, 12) });

  const hasCoords = coords.latitude !== "" && coords.longitude !== "";

  return {
    coords,
    status,
    manual,
    toggleManual: () => setManual((m) => !m),
    locate,
    setManualValue,
    mapUrl: hasCoords
      ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(coords.latitude)}&mlon=${encodeURIComponent(coords.longitude)}#map=18/${encodeURIComponent(coords.latitude)}/${encodeURIComponent(coords.longitude)}`
      : null,
  };
};
