"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import type { MapsConfig } from "../types/onboarding.types";
import { latLngOf, loadGoogleMaps, type GMap, type GMarker, type GoogleNS, type LatLngLiteral, type PlacePrediction } from "../utils/googleMaps";

type Props = {
  maps: MapsConfig;
  /** Centre de la ville choisie (la carte s'y place tant qu'aucun repère n'est posé). */
  center: LatLngLiteral;
  /** Rayon de la ville (m) : les résultats de recherche proches sont privilégiés. */
  radiusM: number;
  point: LatLngLiteral | null;
  /** Change à chaque saisie manuelle : la carte se recentre sur le repère. */
  follow: number;
  onPick: (lat: number, lng: number) => void;
  /** Carte indisponible (clé refusée, réseau) : le champ bascule sur la saisie des coordonnées. */
  onUnavailable: () => void;
};

const SEARCH_MIN_CHARS = 3;
const SEARCH_DELAY_MS = 300;
const PLACE_ZOOM = 18;

/**
 * Carte Google de l'inscription resto : rechercher une adresse ou un lieu, toucher la carte pour poser le repère,
 * le glisser pour l'ajuster. « cooperative » : sur téléphone, un seul doigt fait défiler la page, deux déplacent la carte.
 */
export function LocationMap({ maps, center, radiusM, point, follow, onPick, onUnavailable }: Props) {
  const { t, i18n } = useTranslation();
  const elRef = useRef<HTMLDivElement>(null);
  const [g, setG] = useState<GoogleNS | null>(null);
  const mapRef = useRef<GMap | null>(null);
  const markerRef = useRef<GMarker | null>(null);
  // Rappels toujours à jour sans recréer la carte
  const onPickRef = useRef(onPick);
  const onUnavailableRef = useRef(onUnavailable);
  useEffect(() => {
    onPickRef.current = onPick;
    onUnavailableRef.current = onUnavailable;
  });
  // Le nonce change à chaque rendu serveur : seul le premier sert à charger le script
  const init = useRef({ ...maps, center, language: i18n.language });

  useEffect(() => {
    const { apiKey, mapId, nonce, center: c, language } = init.current;
    let cancelled = false;
    // Clé refusée par Google (domaine non autorisé, API non activée) : rappel global de la Maps JavaScript API
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => onUnavailableRef.current();
    loadGoogleMaps(apiKey, language, nonce)
      .then((google) => {
        if (cancelled || !elRef.current) return;
        const map = new google.maps.Map(elRef.current, {
          center: c,
          zoom: 13,
          mapId,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          clickableIcons: false,
          gestureHandling: "cooperative",
        });
        map.addListener("click", (ev) => {
          if (ev.latLng) onPickRef.current(ev.latLng.lat(), ev.latLng.lng());
        });
        mapRef.current = map;
        setG(google);
      })
      .catch(() => {
        if (!cancelled) onUnavailableRef.current();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Repère : créé au premier point, déplacé ensuite (carte, glisser, recherche ou saisie manuelle)
  useEffect(() => {
    const map = mapRef.current;
    if (!g || !map) return;
    if (!point) {
      if (markerRef.current) markerRef.current.map = null;
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      const marker = new g.maps.marker.AdvancedMarkerElement({ map, position: point, gmpDraggable: true, title: t("onboarding.location.marker_title") });
      marker.addListener("dragend", () => {
        if (marker.position) {
          const p = latLngOf(marker.position);
          onPickRef.current(p.lat, p.lng);
        }
      });
      markerRef.current = marker;
    } else {
      markerRef.current.position = point;
      markerRef.current.map = map;
    }
  }, [g, point, t]);

  // Coordonnées tapées à la main : la carte va au repère
  const pointRef = useRef(point);
  useEffect(() => {
    pointRef.current = point;
  });
  useEffect(() => {
    if (follow > 0 && pointRef.current) mapRef.current?.panTo(pointRef.current);
  }, [follow]);

  // Changement de ville sans repère posé : la carte suit la ville
  const hasPoint = point !== null;
  useEffect(() => {
    if (mapRef.current && !hasPoint) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(13);
    }
  }, [g, center, hasPoint]);

  const goTo = (p: LatLngLiteral) => {
    onPickRef.current(p.lat, p.lng);
    mapRef.current?.panTo(p);
    mapRef.current?.setZoom(PLACE_ZOOM);
  };

  return (
    <div className="space-y-3">
      {g && <PlaceSearch google={g} center={center} radiusM={radiusM} onPlace={goTo} />}
      <div
        ref={elRef}
        role="region"
        aria-label={t("onboarding.location.map_label")}
        className="h-72 w-full overflow-hidden rounded-xl border border-ink/15 bg-paper sm:h-80"
      />
      <p className="text-[13px] text-muted">{point ? t("onboarding.location.map_adjust") : t("onboarding.location.map_hint")}</p>
    </div>
  );
}

type SearchProps = { google: GoogleNS; center: LatLngLiteral; radiusM: number; onPlace: (p: LatLngLiteral) => void };

/** Recherche d'adresse ou de lieu (Places API « New »), limitée au Congo et orientée vers la ville choisie. */
function PlaceSearch({ google, center, radiusM, onPlace }: SearchProps) {
  const { t, i18n } = useTranslation();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState<"idle" | "searching" | "empty" | "error">("idle");
  // Un jeton par recherche (de la frappe au choix) : Google facture la session, pas chaque lettre
  const session = useRef<object | null>(null);
  // Texte du lieu choisi : déjà résolu, ne relance pas de recherche
  const picked = useRef<string | null>(null);

  useEffect(() => {
    const input = query.trim();
    if (input.length < SEARCH_MIN_CHARS || query === picked.current) return;
    let stale = false;
    const timer = setTimeout(async () => {
      setStatus("searching");
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = await google.maps.importLibrary("places");
        session.current ??= new AutocompleteSessionToken();
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: session.current,
          includedRegionCodes: ["cg"],
          locationBias: { center, radius: radiusM },
          language: i18n.language,
        });
        if (stale) return;
        const found = suggestions.map((s) => s.placePrediction).filter((p): p is PlacePrediction => p !== null).slice(0, 5);
        setResults(found);
        setActive(-1);
        setOpen(true);
        setStatus(found.length ? "idle" : "empty");
      } catch {
        if (!stale) setStatus("error");
      }
    }, SEARCH_DELAY_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, google, center, radiusM, i18n.language]);

  const choose = async (p: PlacePrediction) => {
    picked.current = p.text.text;
    setQuery(p.text.text);
    setResults([]);
    setOpen(false);
    try {
      const place = p.toPlace();
      await place.fetchFields({ fields: ["location"] });
      session.current = null;
      if (place.location) onPlace({ lat: place.location.lat(), lng: place.location.lng() });
    } catch {
      setStatus("error");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Entrée ne doit jamais envoyer le formulaire depuis la recherche
    if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[active] ?? results[0];
      if (open && pick) void choose(pick);
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && query.trim().length >= SEARCH_MIN_CHARS && (results.length > 0 || status === "empty");

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        {t("onboarding.location.search_label")}
      </label>
      <input
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        enterKeyHint="search"
        maxLength={120}
        value={query}
        placeholder={t("onboarding.location.search_placeholder")}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim().length < SEARCH_MIN_CHARS) {
            setResults([]);
            setStatus("idle");
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        className="block h-12 w-full rounded-xl border border-ink/20 bg-paper px-4 text-[15px] text-ink placeholder:text-muted/70 hover:border-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
      />
      {showList && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-ink/15 bg-paper shadow-lg">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">{t("onboarding.location.search_empty")}</li>
          ) : (
            results.map((p, i) => (
              <li
                key={p.placeId}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown : le choix passe avant la perte du focus du champ
                onMouseDown={(e) => {
                  e.preventDefault();
                  void choose(p);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm ${i === active ? "bg-surface" : "hover:bg-surface"}`}
              >
                <span className="block font-medium text-ink">{p.mainText?.text ?? p.text.text}</span>
                {p.secondaryText?.text && <span className="block truncate text-[13px] text-muted">{p.secondaryText.text}</span>}
              </li>
            ))
          )}
        </ul>
      )}
      {status === "error" && <p className="mt-2 text-[13px] text-danger">{t("onboarding.location.search_error")}</p>}
    </div>
  );
}
