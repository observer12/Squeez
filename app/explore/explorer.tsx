"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Layers3, List, Map as MapIcon, MapPin, Search } from "lucide-react";
import BusinessDetails from "./business-details";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type Market } from "./locations";

const BusinessMap = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <p className={styles.mapMessage} role="status">Loading the map…</p>,
});

function samePlace(first: Location, second: Location) {
  const normalize = (name: string) => name.toLowerCase().split(/ · |\(/)[0].replace(/[\p{P}\p{Z}]/gu, "");
  return normalize(first.name) === normalize(second.name) &&
    Math.abs(first.coordinates[0] - second.coordinates[0]) < .002 &&
    Math.abs(first.coordinates[1] - second.coordinates[1]) < .002;
}

export default function Explorer({ market, marketId, initialWebsite }: { market: Market; marketId: string; initialWebsite: "" | "unlisted" }) {
  const { city, country } = market;
  const [communityLocations, setCommunityLocations] = useState<Location[]>([]);
  const [discovery, setDiscovery] = useState<"idle" | "loading" | "ready" | "map" | "error">("idle");
  const readVisibleListings = useRef<(() => Location[]) | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<Location[]>([]);
  const [overviewLocations, setOverviewLocations] = useState<Location[]>([]);
  const directoryLocations = [...market.locations, ...communityLocations];
  const mappedLocations = new Map([...overviewLocations, ...visibleLocations].map(location => [location.id, location]));
  const locations = [...directoryLocations, ...[...mappedLocations.values()].filter(location => !directoryLocations.some(known => samePlace(known, location)))];
  const categories = Array.from(new Set(locations.map(location => location.category))).sort();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState<string>(initialWebsite);
  const [selected, setSelected] = useState<Location>();
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<"3d" | "2d" | "list">("3d");
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setView("2d");
  }, []);

  useEffect(() => {
    if (marketId !== "dhaka") return;
    const request = new AbortController();
    async function loadOverview() {
      try {
        const response = await fetch("/api/discovery/overview", { signal: request.signal });
        if (!response.ok) return;
        const { locations } = await response.json() as { locations: Location[] };
        if (!request.signal.aborted) setOverviewLocations(locations);
      } catch {
        // Street-level map tiles and the curated listings remain available.
      }
    }
    void loadOverview();
    return () => request.abort();
  }, [marketId]);

  function uniqueLocations(incoming: Location[]) {
    return incoming.filter(place => !market.locations.some(known => samePlace(known, place)));
  }

  function selectLocation(id: string) {
    const location = locations.find(place => place.id === id);
    if (!location) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelected(location);
    requestAnimationFrame(() => detailHeading.current?.focus());
  }

  function closeDetails() {
    setSelected(undefined);
    trigger.current?.focus();
  }

  function loadMapListings() {
    const visible = readVisibleListings.current?.() ?? [];
    if (!visible.length) {
      setDiscovery("error");
      return;
    }
    setVisibleLocations(uniqueLocations(visible));
    setDiscovery("map");
  }

  async function loadCommunityLocations() {
    setDiscovery("loading");
    try {
      const response = await fetch(`/api/discovery?city=${encodeURIComponent(marketId)}`);
      if (!response.ok) throw new Error("Listings unavailable");
      const { locations: incoming } = await response.json() as { locations: Location[] };
      setCommunityLocations(uniqueLocations(incoming));
      setDiscovery("ready");
    } catch {
      loadMapListings();
    }
  }

  const terms = query.toLowerCase().trim().split(/\s+/);
  const filtered = locations.filter(location =>
    (!category || location.category === category) &&
    (!website || location.website.status === website) &&
    terms.every(term => `${location.name} ${location.area} ${location.address ?? ""} ${location.category} ${city} ${country}`.toLowerCase().includes(term))
  );
  const active = locations.find(location => location.id === selected?.id) ?? selected;
  const viewOptions = [{ id: "3d", label: "3D", Icon: Layers3 }, { id: "2d", label: "2D", Icon: MapIcon }, { id: "list", label: "List", Icon: List }] as const;

  return <>
    <div className={styles.discoveryAction}>
      {marketId === "dhaka" && <button type="button" aria-pressed={website === "unlisted"} onClick={() => {
        setWebsite(website === "unlisted" ? "" : "unlisted");
        setCategory("");
        setQuery("");
      }}>No website listed</button>}
      {(discovery === "idle" || discovery === "loading" || discovery === "error" || discovery === "map") &&
        <button type="button" disabled={discovery === "loading"} onClick={loadCommunityLocations}>
          {discovery === "loading" ? "Loading businesses…" : discovery === "map" ? "Retry contact links" : discovery === "error" ? "Retry OpenStreetMap listings" : "Load more businesses"}
        </button>}
      {discovery !== "loading" && discovery !== "ready" && view !== "list" && !mapFailed &&
        <button type="button" onClick={loadMapListings}>Search visible map</button>}
      <p role="status">
        {discovery === "ready" || discovery === "map" ? `${discovery === "map" ? visibleLocations.length : communityLocations.length} additional listings from ` : "Additional listings come from "}
        <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>. Coverage and contact details vary.
        {marketId === "dhaka" && " Dhaka businesses appear at the city overview, with more pins as you explore each area."}
        {discovery === "map" && " Contact details depend on the available source."}
        {discovery === "error" && " Listings are unavailable here. Zoom in and search the visible map."}
      </p>
    </div>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Search business name, area or category" placeholder="Search name, area or category" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <select aria-label="Business category" value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">All categories</option>
        {category && !categories.includes(category) && <option>{category}</option>}
        {categories.map(item => <option key={item}>{item}</option>)}
      </select>
      <select aria-label="Website status" value={website} onChange={event => setWebsite(event.target.value)}>
        <option value="">Any website status</option>
        {Object.entries(websiteLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
      </select>
      <div className={styles.viewOptions} role="group" aria-label="Map or list view">
        {viewOptions.map(({id, label, Icon}) => <button type="button" key={id} aria-pressed={view === id} disabled={mapFailed && id !== "list"} onClick={() => setView(id)}>
          <Icon size={16} aria-hidden="true" />{label}
        </button>)}
      </div>
    </div>
    <ul className={styles.legend} aria-label="Website status legend">
      {Object.entries(websiteLabels).map(([status, label]) => <li key={status}>
        <span className={styles.statusDot} data-website={status} aria-hidden="true" />{label}
      </li>)}
    </ul>
    {view === "3d" && <p className={styles.mapHint}>Scroll over the map to zoom. Drag to pan. 3D buildings appear at street zoom.</p>}
    {mapFailed && <p className={styles.notice} role="status">The interactive map is unavailable. You can still search and open every location below.</p>}
    <div className={view === "list" ? styles.listOnly : styles.explorerGrid}>
      <div className={styles.mapColumn} hidden={view === "list" && !active}>
      {view !== "list" && <div className={styles.mapFrame}>
        <BusinessMap readVisibleListings={readVisibleListings} market={market} locations={filtered} selected={active?.id} tilted={view === "3d"} onSelect={selectLocation} onVisibleListings={visible => setVisibleLocations(uniqueLocations(visible))} onUnavailable={() => {
          setMapFailed(true);
          setView("list");
        }} />
      </div>}
      {active && <div className={view === "list" ? undefined : styles.detailsOverlay}>
        <BusinessDetails location={active} heading={detailHeading} close={closeDetails} />
      </div>}
      </div>
      <section className={styles.results} aria-labelledby="results-title">
        <h2 id="results-title">Locations</h2>
        <p role="status">{filtered.length} {filtered.length === 1 ? "location" : "locations"}</p>
        {filtered.length === 0 ? <div className={styles.empty}>
          <p>No locations match your filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory(""); setWebsite(""); }}>Clear filters</button>
        </div> : <ul className={styles.cards}>
          {filtered.map(location => <li key={location.id} className={active?.id === location.id ? styles.activeCard : undefined}>
            <button type="button" aria-pressed={active?.id === location.id} onClick={() => selectLocation(location.id)}>
              <span className={styles.pinIcon}><MapPin size={19} aria-hidden="true" /></span>
              <span><strong>{location.name}</strong><small>{location.area} · {location.category}</small></span>
            </button>
            <div className={styles.websiteStatus}>
              <span className={styles.statusDot} data-website={location.website.status} aria-hidden="true" />
              {websiteLabels[location.website.status]}
            </div>
          </li>)}
        </ul>}
      </section>
    </div>
  </>;
}
