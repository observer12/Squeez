"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Map, Marker, NavigationControl } from "maplibre-gl";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type Market } from "./locations";

function showOverview(instance: Map, locations: Location[]) {
  const bounds = locations.reduce((extent, location) => extent.extend(location.coordinates), new LngLatBounds());
  instance.fitBounds(bounds, { padding: 55, maxZoom: 14, duration: 0 });
}

type Props = {
  market: Market;
  locations: Location[];
  tilted: boolean;
  onSelect: (id: string) => void;
  onUnavailable: () => void;
};

export default function BusinessMap({ market, locations, tilted, onSelect, onUnavailable }: Props) {
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
    const scalePins = () => {
      const zoom = instance.getZoom();
      const diameter = Math.max(8, Math.min(36, 9 + (zoom - 10) * 3.5));
      const element = instance.getContainer();
      element.style.setProperty("--map-pin-size", `${diameter.toFixed(2)}px`);
      element.style.setProperty("--map-pin-core", `${Math.max(2, diameter * .26).toFixed(2)}px`);
      element.style.setProperty("--map-pin-stroke", `${Math.max(1, diameter / 11).toFixed(2)}px`);
    };
    scalePins();
    instance.on("zoom", scalePins);
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
        button.setAttribute("aria-label", `View ${location.name}, ${websiteLabels[location.website.status]}`);
        button.addEventListener("click", () => callbacks.current.onSelect(location.id));
        marker = new Marker({ element: button }).setLngLat(location.coordinates).addTo(instance);
        currentMarkers.set(location.id, marker);
      }
    }
  }, [locations]);

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

    instance.easeTo({
      pitch: tilted ? 52 : 0,
      bearing: tilted ? -12 : 0,
      duration: reducedMotion ? 0 : 450,
    });
    return () => { instance.off("load", updateBuildings); };
  }, [tilted]);

  return <>
    <div ref={container} className={styles.map} role="region" aria-label={`Interactive map of ${market.city} businesses`} />
    <button className={styles.mapOverview} type="button" onClick={() => {
      if (map.current) showOverview(map.current, locations.length ? locations : market.locations);
    }}>Show all pins</button>
  </>;
}
