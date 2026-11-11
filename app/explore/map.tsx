"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map, Marker, NavigationControl } from "maplibre-gl";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type Market } from "./locations";

const streetZoom = 16;

function showOverview(instance: Map, locations: Location[]) {
  const bounds = locations.reduce((extent, location) => extent.extend(location.coordinates), new LngLatBounds());
  instance.fitBounds(bounds, { padding: 55, maxZoom: 14, duration: 0 });
}

type Props = {
  market: Market;
  locations: Location[];
  selected?: string;
  tilted: boolean;
  onSelect: (id: string) => void;
  onUnavailable: () => void;
};

export default function BusinessMap({ market, locations, selected, tilted, onSelect, onUnavailable }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const callbacks = useRef({ onSelect, onUnavailable });
  const markers = useRef(new globalThis.Map<string, Marker>());

  useEffect(() => {
    callbacks.current = { onSelect, onUnavailable };
  }, [onSelect, onUnavailable]);

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
    showOverview(instance, market.locations);
    instance.touchZoomRotate.disableRotation();
    instance.addControl(new NavigationControl({ showCompass: false }), "top-right");
    const onContextLost = () => callbacks.current.onUnavailable();
    instance.on("webglcontextlost", onContextLost);
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
    };
  }, [market]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const currentMarkers = markers.current;
    for (const [id, marker] of currentMarkers) {
      if (locations.some(location => location.id === id)) continue;
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
