"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Layers3, List, Map as MapIcon, Mail, MapPin, Phone, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { businessEmail, businessPhone, hasBusinessContact, phoneHref } from "./contact";
import { categoryGroups } from "./categories";
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
  const [discovery, setDiscovery] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [nextOffset, setNextOffset] = useState<number | null>(0);
  const locations = [...market.locations, ...communityLocations].filter(hasBusinessContact);
  const categoryCounts = new Map<string, number>();
  for (const location of locations) categoryCounts.set(location.category, (categoryCounts.get(location.category) ?? 0) + 1);
  const included = new Set(categoryGroups.flatMap(group => Object.keys(group.entries)));
  const otherCategories = [...categoryCounts.keys()].filter(name => !included.has(name)).sort();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState<string>(initialWebsite);
  const router = useRouter();
  const [view, setView] = useState<"3d" | "2d" | "list">("3d");
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setView("2d");
  }, []);

  function uniqueLocations(incoming: Location[]) {
    return incoming.filter(place => !market.locations.some(known => samePlace(known, place)));
  }

  function selectLocation(id: string) {
    const location = locations.find(place => place.id === id);
    if (!location) return;
    const params = new URLSearchParams({ city: marketId, id });
    if (website === "unlisted") params.set("website", "unlisted");
    try {
      sessionStorage.setItem("squeez:selected-business", JSON.stringify({ city: marketId, location }));
    } catch {
      // Curated and directory listings can still load by ID.
    }
    router.push(`/explore/business?${params}`);
  }

  async function loadCommunityLocations() {
    setDiscovery("loading");
    try {
      const response = await fetch(`/api/discovery?city=${encodeURIComponent(marketId)}&offset=${nextOffset ?? 0}`);
      if (!response.ok) throw new Error("Listings unavailable");
      const { locations: incoming, nextOffset: next } = await response.json() as { locations: Location[]; nextOffset?: number | null };
      setCommunityLocations(previous => [...previous, ...uniqueLocations(incoming.filter(hasBusinessContact))]);
      setNextOffset(next ?? null);
      setDiscovery("ready");
    } catch {
      setDiscovery("error");
    }
  }

  const terms = query.toLowerCase().trim().split(/\s+/);
  const filtered = locations.filter(location =>
    (!category || location.category === category) &&
    (!website || location.website.status === website) &&
    terms.every(term => `${location.name} ${location.area} ${location.address ?? ""} ${location.category} ${city} ${country}`.toLowerCase().includes(term))
  );
  const viewOptions = [{ id: "3d", label: "3D", Icon: Layers3 }, { id: "2d", label: "2D", Icon: MapIcon }, { id: "list", label: "List", Icon: List }] as const;

  return <>
    <div className={styles.discoveryAction}>
      {marketId !== "london" && <button type="button" aria-pressed={website === "unlisted"} onClick={() => {
        setWebsite(website === "unlisted" ? "" : "unlisted");
        setCategory("");
        setQuery("");
      }}>No website listed</button>}
      {(discovery === "idle" || discovery === "loading" || discovery === "error" || (discovery === "ready" && nextOffset !== null)) &&
        <button type="button" disabled={discovery === "loading"} onClick={loadCommunityLocations}>
          {discovery === "loading" ? "Loading businesses…" : discovery === "error" ? "Retry OpenStreetMap listings" : marketId === "bangladesh" ? "Load Bangladesh listings" : "Load more businesses"}
        </button>}
      <p role="status">
        {discovery === "ready" ? `${communityLocations.length} additional businesses with email and phone from ` : "Additional listings are sourced from "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>. Coverage and contact details vary.
        {discovery === "error" && " The directory feed is unavailable. The listed businesses still have public contact details."}
      </p>
    </div>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Search business name, area or category" placeholder="Search name, area or category" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <select aria-label="Business category" value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">All categories</option>
        {categoryGroups.map(group => <optgroup label={group.label} key={group.label}>
          {Object.keys(group.entries).map(name => <option key={name} value={name}>{name} ({categoryCounts.get(name) ?? 0})</option>)}
        </optgroup>)}
        {otherCategories.length > 0 && <optgroup label="Other categories">
          {otherCategories.map(name => <option key={name} value={name}>{name} ({categoryCounts.get(name)})</option>)}
        </optgroup>}
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
        <BusinessMap market={market} locations={filtered} tilted={view === "3d"} onSelect={selectLocation} onUnavailable={() => {
          setMapFailed(true);
          setView("list");
        }} />
      </div>}
      <section className={styles.results} aria-labelledby="results-title">
        <h2 id="results-title">Locations</h2>
        <p role="status">{filtered.length} {filtered.length === 1 ? "location" : "locations"}</p>
        {filtered.length === 0 ? <div className={styles.empty}>
          <p>No loaded businesses with both public contact details match these filters.</p>
          <button type="button" onClick={() => { setQuery(""); setCategory(""); setWebsite(""); }}>Clear filters</button>
        </div> : <ul className={styles.cards}>
          {filtered.map(location => {
            const phone = businessPhone(location.phone);
            const email = businessEmail(location.email);
            return <li key={location.id}>
            <button type="button" onClick={() => selectLocation(location.id)}>
              <span className={styles.pinIcon}><MapPin size={19} aria-hidden="true" /></span>
              <span><strong>{location.name}</strong><small>{location.area} · {location.category}</small></span>
            </button>
            <div className={styles.websiteStatus}>
              <span className={styles.statusDot} data-website={location.website.status} aria-hidden="true" />
              {websiteLabels[location.website.status]}
            </div>
            {phone && email && <div className={styles.resultContacts}>
              <a href={phoneHref(phone)} aria-label={`Call ${location.name}`}><Phone size={15} aria-hidden="true" /> {phone}</a>
              <a href={`mailto:${email}`} aria-label={`Email ${location.name}`}><Mail size={15} aria-hidden="true" /> {email}</a>
            </div>}
          </li>})}
        </ul>}
      </section>
    </div>
  </>;
}
