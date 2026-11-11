"use client";

import { useEffect, useRef, type RefObject } from "react";
import { LngLatBounds, Map, Marker, NavigationControl } from "maplibre-gl";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type Market } from "./locations";

const streetZoom = 16;

function showOverview(instance: Map, locations: Location[]) {
  const bounds = locations.reduce((extent, location) => extent.extend(location.coordinates), new LngLatBounds());
  instance.fitBounds(bounds, { padding: 55, maxZoom: 14, duration: 0 });
}

const businessClasses = new Set([
  "shop", "grocery", "clothing_store", "restaurant", "fast_food", "cafe", "bar", "pub",
  "lodging", "cinema", "bank", "pharmacy", "laundry", "alcohol_shop",
]);

function visibleBusinesses(instance: Map, market: Market): Location[] {
  if (instance.getZoom() < 13.5) return [];
  const poiLayer = instance.getStyle()?.layers.find(layer => "source-layer" in layer && layer["source-layer"] === "poi");
  if (!poiLayer || !("source" in poiLayer)) return [];

  const features = instance.querySourceFeatures(poiLayer.source, { sourceLayer: "poi" });
  const { clientWidth, clientHeight } = instance.getContainer();
  const places = new globalThis.Map<string, Location>();

  for (const feature of features) {
    if (feature.geometry.type !== "Point" || !businessClasses.has(feature.properties.class)) continue;
    const name = feature.properties["name:en"] || feature.properties.name_en || feature.properties.name;
    if (typeof name !== "string" || !name.trim()) continue;
    const [lon, lat] = feature.geometry.coordinates;
    const { x, y } = instance.project([lon, lat]);
    if (x < 0 || y < 0 || x > clientWidth || y > clientHeight) continue;

    const key = `tile-${name}-${lat.toFixed(5)}-${lon.toFixed(5)}`;
    const kind = String(feature.properties.subclass || feature.properties.class);
    places.set(key, {
      id: key,
      name,
      category: kind.replaceAll("_", " ").replace(/^./, letter => letter.toUpperCase()),
      area: market.city,
      coordinates: [lon, lat],
      source: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`,
      website: { status: "unknown" },
    });
    if (places.size >= 180) break;
  }

  return [...places.values()];
}

type Props = {
  readVisibleListings: RefObject<(() => Location[]) | null>;
  market: Market;
  locations: Location[];
  selected?: string;
  tilted: boolean;
  onSelect: (id: string) => void;
  onVisibleListings?: (locations: Location[]) => void;
  onUnavailable: () => void;
};

export default function BusinessMap({ readVisibleListings, market, locations, selected, tilted, onSelect, onUnavailable, onVisibleListings }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const callbacks = useRef({ onSelect, onUnavailable, onVisibleListings });
  const markers = useRef(new globalThis.Map<string, Marker>());

  useEffect(() => {
    callbacks.current = { onSelect, onUnavailable, onVisibleListings };
  }, [onSelect, onUnavailable, onVisibleListings]);

  useEffect(() => {
    if (!container.current) return;

    let instance: Map;
    try {
      instance = new Map({
        container: container.current,
        style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty",
        center: market.center,
        zoom: 12.4,
        maxPitch: 60,
        scrollZoom: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        keyboard: true,
        attributionControl: { compact: false },
      });
    } catch {
      callbacks.current.onUnavailable();
      return;
    }

    map.current = instance;
    readVisibleListings.current = () => visibleBusinesses(instance, market);
    showOverview(instance, market.locations);
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new NavigationControl({ showCompass: false }), "top-right");
    const onContextLost = () => callbacks.current.onUnavailable();
    instance.on("webglcontextlost", onContextLost);
    let previous = "";
    if (market.city === "Dhaka") instance.on("idle", () => {
      const visible = visibleBusinesses(instance, market);
      const signature = visible.map(location => location.id).sort().join("\\n");
      if (signature === previous) return;
      previous = signature;
      callbacks.current.onVisibleListings?.(visible);
    });
    // Give the style and first viewport time to load on slow connections.
    const timeout = window.setTimeout(() => callbacks.current.onUnavailable(), 18000);
    instance.once("load", () => window.clearTimeout(timeout));
    const currentMarkers = markers.current;

    return () => {
      window.clearTimeout(timeout);
      currentMarkers.forEach(marker => marker.remove());
      currentMarkers.clear();
      instance.remove();
      map.current = null;
      readVisibleListings.current = null;
    };
  }, [market, readVisibleListings]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const currentMarkers = markers.current;
    const visibleIds = new Set(locations.map(location => location.id));
    for (const [id, marker] of currentMarkers) {
      if (visibleIds.has(id)) continue;
      marker.remove();
      currentMarkers.delete(id);
    }
    for (const location of locations) {
      let marker = currentMarkers.get(location.id);
      if (!marker) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = styles.marker;
        button.setAttribute("role", "button");
        button.dataset.website = location.website.status;
        button.setAttribute("aria-label", `Select ${location.name}, ${websiteLabels[location.website.status]}`);
        button.addEventListener("click", () => callbacks.current.onSelect(location.id));
        marker = new Marker({ element: button }).setLngLat(location.coordinates).addTo(instance);
        currentMarkers.set(location.id, marker);
      }
      marker.getElement().setAttribute("aria-pressed", String(location.id === selected));
    }
  }, [locations, selected]);

  const activeLocation = locations.find(location => location.id === selected);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function updateBuildings() {
      for (const layer of instance?.getStyle()?.layers ?? []) {
        if (layer.type === "fill-extrusion") instance?.setLayoutProperty(layer.id, "visibility", tilted ? "visible" : "none");
      }
    }
    updateBuildings();
    instance.once("load", updateBuildings);

    const zoom = instance.getZoom();
    const openStreetView = tilted && zoom < streetZoom;
    instance.easeTo({
      center: activeLocation?.coordinates ?? (openStreetView ? market.center : instance.getCenter()),
      zoom: activeLocation || openStreetView ? Math.max(streetZoom, zoom) : zoom,
      pitch: tilted ? 52 : 0,
      bearing: tilted ? -12 : 0,
      duration: reducedMotion ? 0 : 450,
    });
    return () => { instance.off("load", updateBuildings); };
  }, [activeLocation, market, tilted]);

  return <>
    <div ref={container} className={styles.map} role="region" aria-label={`Interactive map of ${market.city} businesses`} />
    <button className={styles.mapOverview} type="button" onClick={() => {
      if (map.current) showOverview(map.current, locations.length ? locations : market.locations);
    }}>Show all pins</button>
  </>;
}
