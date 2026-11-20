/**
 * Chargement de la Maps JavaScript API (repères avancés + Places API « New ») et types minimaux utilisés par
 * l'inscription resto. Déclarés ici pour ne pas ajouter de dépendance (même approche que le panel flotte).
 */
export type LatLngLiteral = { lat: number; lng: number };
type LatLngLike = LatLngLiteral | { lat(): number; lng(): number };

export type GMap = {
  panTo(p: LatLngLiteral): void;
  setZoom(z: number): void;
  getZoom(): number | undefined;
  addListener(e: "click", cb: (ev: { latLng: { lat(): number; lng(): number } | null }) => void): { remove(): void };
};
export type GMarker = {
  map: GMap | null;
  position: LatLngLike | null;
  addListener(e: "dragend", cb: () => void): { remove(): void };
};

export type PlacePrediction = {
  placeId: string;
  text: { text: string };
  mainText?: { text: string } | null;
  secondaryText?: { text: string } | null;
  toPlace(): { fetchFields(o: { fields: string[] }): Promise<unknown>; location?: { lat(): number; lng(): number } | null };
};
type PlacesLib = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions(req: Record<string, unknown>): Promise<{ suggestions: { placePrediction: PlacePrediction | null }[] }>;
  };
};

export type GoogleNS = {
  maps: {
    importLibrary(name: "places"): Promise<PlacesLib>;
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GMap;
    marker: { AdvancedMarkerElement: new (opts: Record<string, unknown>) => GMarker };
  };
};

export const latLngOf = (p: LatLngLike): LatLngLiteral =>
  typeof p.lat === "function" ? { lat: (p as { lat(): number }).lat(), lng: (p as { lng(): number }).lng() } : (p as LatLngLiteral);

const CALLBACK = "__mboaMapsReady";
let loading: Promise<GoogleNS> | null = null;

/** Un seul chargement par page ; le nonce CSP de la requête autorise le script (strict-dynamic pour ses dépendances). */
export const loadGoogleMaps = (apiKey: string, language: string, nonce?: string): Promise<GoogleNS> => {
  const w = window as unknown as Record<string, unknown> & { google?: GoogleNS };
  if (w.google?.maps?.marker) return Promise.resolve(w.google);
  loading ??= new Promise<GoogleNS>((resolve, reject) => {
    w[CALLBACK] = () => resolve(w.google as GoogleNS);
    const script = document.createElement("script");
    const q = new URLSearchParams({ key: apiKey, v: "weekly", loading: "async", libraries: "marker,places", language, region: "CG", callback: CALLBACK });
    script.src = `https://maps.googleapis.com/maps/api/js?${q}`;
    script.async = true;
    if (nonce) script.nonce = nonce;
    script.onerror = () => {
      loading = null;
      reject(new Error("maps"));
    };
    document.head.appendChild(script);
  });
  return loading;
};
