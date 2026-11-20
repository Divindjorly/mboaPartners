"use client";

import { useState } from "react";

export type Coordinates = { latitude: string; longitude: string };

/** Nombre décimal valide (coordonnée saisie à la main), sinon null. */
const toNumber = (v: string): number | null => (v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * Position de l'établissement : repère posé sur la carte (toucher, glisser, recherche d'adresse) ou coordonnées
 * saisies à la main. Les deux restent synchronisées ; la position n'est envoyée qu'avec le formulaire.
 */
export const useLocationPicker = (onChange: () => void, manualByDefault: boolean) => {
  const [coords, setCoords] = useState<Coordinates>({ latitude: "", longitude: "" });
  const [manual, setManual] = useState(manualByDefault);
  const [follow, setFollow] = useState(0);

  const update = (next: Coordinates) => {
    setCoords(next);
    onChange();
  };

  /** Point choisi sur la carte : 6 décimales (≈ 10 cm), assez pour une porte d'entrée. */
  const setPoint = (lat: number, lng: number) => update({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });

  const setManualValue = (key: keyof Coordinates, value: string) => {
    update({ ...coords, [key]: value.replace(",", ".").replace(/[^\d.-]/g, "").slice(0, 12) });
    setFollow((n) => n + 1);
  };

  const lat = toNumber(coords.latitude);
  const lng = toNumber(coords.longitude);

  return {
    coords,
    point: lat !== null && lng !== null ? { lat, lng } : null,
    manual,
    follow,
    toggleManual: () => setManual((m) => !m),
    setPoint,
    setManualValue,
  };
};
