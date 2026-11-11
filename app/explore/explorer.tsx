"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowUpRight, Layers3, List, Map as MapIcon, MapPin, Search } from "lucide-react";
import styles from "../discovery.module.css";
import { locations } from "./locations";

const BusinessMap = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <p className={styles.mapMessage} role="status">Loading the map…</p>,
});

const categories = Array.from(new Set(locations.map(location => location.category)));

export default function Explorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string>();
  const [view, setView] = useState<"3d" | "2d" | "list">("3d");
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setView("2d");
  }, []);

  const terms = query.toLowerCase().trim().split(/\s+/);
  const filtered = locations.filter(location =>
    (!category || location.category === category) &&
    terms.every(term => `${location.name} ${location.area} ${location.category} London`.toLowerCase().includes(term))
  );
  const active = filtered.find(location => location.id === selected);
  const viewOptions = [{ id: "3d", label: "Tilted", Icon: Layers3 }, { id: "2d", label: "2D", Icon: MapIcon }, { id: "list", label: "List", Icon: List }] as const;

  return <>
    <div className={styles.toolbar}>
      <label className={styles.search}><Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Search business name, area or category" placeholder="Search name, area or category" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <select aria-label="Business category" value={category} onChange={event => setCategory(event.target.value)}>
        <option value="">All categories</option>
        {categories.map(item => <option key={item}>{item}</option>)}
      </select>
      <div className={styles.viewOptions} role="group" aria-label="Map or list view">
        {viewOptions.map(({id, label, Icon}) => <button type="button" key={id} aria-pressed={view === id} disabled={mapFailed && id !== "list"} onClick={() => setView(id)}>
          <Icon size={16} aria-hidden="true" />{label}
        </button>)}
      </div>
    </div>
    {mapFailed && <p className={styles.notice} role="status">The interactive map is unavailable. You can still search and open every location below.</p>}
    <div className={view === "list" ? styles.listOnly : styles.explorerGrid}>
      {view !== "list" && <div className={styles.mapFrame}>
        <BusinessMap locations={filtered} selected={active?.id} tilted={view === "3d"} onSelect={setSelected} onUnavailable={() => {
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
          <button type="button" onClick={() => { setQuery(""); setCategory(""); }}>Clear filters</button>
        </div> : <ul className={styles.cards}>
          {filtered.map(location => <li key={location.id} className={active?.id === location.id ? styles.activeCard : undefined}>
            <button type="button" aria-pressed={active?.id === location.id} onClick={() => setSelected(location.id)}>
              <span className={styles.pinIcon}><MapPin size={19} aria-hidden="true" /></span>
              <span><strong>{location.name}</strong><small>{location.area} · {location.category}</small></span>
            </button>
            <a href={location.source} aria-label={`Location source for ${location.name} on Wikidata`}>Location source <ArrowUpRight size={14} aria-hidden="true" /></a>
          </li>)}
        </ul>}
      </section>
    </div>
  </>;
}
