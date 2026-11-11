"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Layers3, List, Map as MapIcon, MapPin, Search } from "lucide-react";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type Market } from "./locations";

const BusinessMap = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <p className={styles.mapMessage} role="status">Loading the map…</p>,
});

export default function Explorer({ market, marketId }: { market: Market; marketId: string }) {
  const { city, country } = market;
  const [communityLocations, setCommunityLocations] = useState<Location[]>([]);
  const [discovery, setDiscovery] = useState<"idle" | "loading" | "ready" | "map" | "error">("idle");
  const readVisibleListings = useRef<(() => Location[]) | null>(null);
  const locations = [...market.locations, ...communityLocations];
  const categories = Array.from(new Set(locations.map(location => location.category))).sort();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [selected, setSelected] = useState<string>();
  const [view, setView] = useState<"3d" | "2d" | "list">("3d");
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setView("2d");
  }, []);

  function showCommunityLocations(incoming: Location[]) {
    const normalize = (name: string) => name.toLowerCase().split(" · ")[0].replace(/[\p{P}\p{Z}]/gu, "");
    setCommunityLocations(incoming.filter(place => !market.locations.some(known =>
      normalize(place.name) === normalize(known.name) &&
      Math.abs(place.coordinates[0] - known.coordinates[0]) < .002 &&
      Math.abs(place.coordinates[1] - known.coordinates[1]) < .002
    )));
  }

  function loadMapListings() {
    const visible = readVisibleListings.current?.() ?? [];
    if (!visible.length) {
      setDiscovery("error");
      return;
    }
    showCommunityLocations(visible);
    setDiscovery("map");
  }

  async function loadCommunityLocations() {
    setDiscovery("loading");
    try {
      const response = await fetch(`/api/discovery?city=${encodeURIComponent(marketId)}`);
      if (!response.ok) throw new Error("Listings unavailable");
      const { locations: incoming } = await response.json() as { locations: Location[] };
      showCommunityLocations(incoming);
      setDiscovery("ready");
    } catch {
      loadMapListings();
    }
  }

  const terms = query.toLowerCase().trim().split(/\s+/);
  const filtered = locations.filter(location =>
    (!category || location.category === category) &&
    (!website || location.website.status === website) &&
    terms.every(term => `${location.name} ${location.area} ${location.category} ${city} ${country}`.toLowerCase().includes(term))
  );
  const active = filtered.find(location => location.id === selected);
  const viewOptions = [{ id: "3d", label: "3D", Icon: Layers3 }, { id: "2d", label: "2D", Icon: MapIcon }, { id: "list", label: "List", Icon: List }] as const;

  return <>
    <div className={styles.discoveryAction}>
      {(discovery === "idle" || discovery === "loading" || discovery === "error" || discovery === "map") &&
        <button type="button" disabled={discovery === "loading"} onClick={loadCommunityLocations}>
          {discovery === "loading" ? "Loading businesses…" : discovery === "map" ? "Retry contact links" : discovery === "error" ? "Retry OpenStreetMap listings" : "Load more businesses"}
        </button>}
      {discovery !== "loading" && discovery !== "ready" && view !== "list" && !mapFailed &&
        <button type="button" onClick={loadMapListings}>Search visible map</button>}
      <p role="status">
        {discovery === "ready" || discovery === "map" ? `${communityLocations.length} additional listings from ` : "Additional listings come from "}
        <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>. Coverage and contact details vary.
        {discovery === "map" && " Showing the current map area. Contact links require the business feed."}
        {discovery === "error" && " Listings are unavailable here. Zoom in and search the visible map."}
      </p>
    </div>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Search business name, area or category" placeholder="Search name, area or category" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <select aria-label="Business category" value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">All categories</option>
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
      {view !== "list" && <div className={styles.mapFrame}>
        <BusinessMap readVisibleListings={readVisibleListings} market={market} locations={filtered} selected={active?.id} tilted={view === "3d"} onSelect={setSelected} onUnavailable={() => {
          setMapFailed(true);
          setView("list");
        }} />
      </div>}
      <section className={styles.results} aria-labelledby="results-title">
        <h2 id="results-title">Locations</h2>
        <p role="status">{filtered.length} {filtered.length === 1 ? "location" : "locations"}</p>
        {active && <p className={styles.selection} role="status">Selected: {active.name}</p>}
        {filtered.length === 0 ? <div className={styles.empty}>
          <p>No locations match your filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory(""); setWebsite(""); }}>Clear filters</button>
        </div> : <ul className={styles.cards}>
          {filtered.map(location => <li key={location.id} className={active?.id === location.id ? styles.activeCard : undefined}>
            <button type="button" aria-pressed={active?.id === location.id} onClick={() => setSelected(location.id)}>
              <span className={styles.pinIcon}><MapPin size={19} aria-hidden="true" /></span>
              <span><strong>{location.name}</strong><small>{location.area} · {location.category}</small></span>
            </button>
            <div className={styles.websiteStatus}>
              <span className={styles.statusDot} data-website={location.website.status} aria-hidden="true" />
              {websiteLabels[location.website.status]}
            </div>
            {location.website.status !== "unknown" && <div className={styles.evidence}>
              <a href={location.website.url}>
                {location.website.status === "live" ? "Official website" : "Website status evidence"} <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <small>Checked <time dateTime={location.website.checkedOn}>{location.website.checkedOn}</time></small>
            </div>}
            {(location.listedWebsite || Boolean(location.socials?.length)) && <div className={styles.evidence}>
              <small>{location.website.status === "live" ? "Social links from the official site" : "Community-listed links · unverified"}</small>
              <div className={styles.communityLinks}>
                {location.listedWebsite && <a href={location.listedWebsite} rel="nofollow noreferrer">Listed website <ArrowUpRight size={14} aria-hidden="true" /></a>}
                {location.socials?.map(({ platform, url }) => <a href={url} key={platform} rel="nofollow noreferrer">{platform} <ArrowUpRight size={14} aria-hidden="true" /></a>)}
              </div>
            </div>}
            <a href={location.source} aria-label={`Location source for ${location.name}`}>Location source <ArrowUpRight size={14} aria-hidden="true" /></a>
          </li>)}
        </ul>}
      </section>
    </div>
  </>;
}
