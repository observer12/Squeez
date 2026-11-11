"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, Globe, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { businessEmail, businessPhone, hasBusinessContact, phoneHref } from "./contact";
import styles from "../discovery.module.css";
import { websiteLabels, type Location, type MarketId } from "./locations";

const newTab = { target: "_blank", rel: "noopener noreferrer" } as const;

function webLink(value?: string) {
  try {
    if (!value) return;
    const url = new URL(value);
    if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) return url.href;
  } catch {
    return;
  }
}

export default function Profile({ initial, city, id, marketName }: {
  initial?: Location;
  city: MarketId;
  id: string;
  marketName: string;
}) {
  const [location, setLocation] = useState(initial);
  const [loading, setLoading] = useState(!initial && Boolean(id));

  useEffect(() => {
    if (initial || !id) return;
    const request = new AbortController();

    async function loadLocation() {
      try {
        const saved = JSON.parse(sessionStorage.getItem("squeez:selected-business") || "null") as { city: string; location: Location } | null;
        if (saved?.city === city && saved.location?.id === id && hasBusinessContact(saved.location)) {
          setLocation(saved.location);
          setLoading(false);
          return;
        }
      } catch {
        // Try the public listing source if browser storage is unavailable.
      }

      const endpoint = id.startsWith("osm-") ? `/api/discovery?city=${city}&id=${encodeURIComponent(id)}` : undefined;
      try {
        if (!endpoint) return;
        const response = await fetch(endpoint, { signal: request.signal });
        if (!response.ok) return;
        const { locations } = await response.json() as { locations: Location[] };
        if (!request.signal.aborted) setLocation(locations.find(place => place.id === id && hasBusinessContact(place)));
      } catch {
        // The map provides a way back to the original listing.
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }

    void loadLocation();
    return () => request.abort();
  }, [city, id, initial]);

  if (!location) return <section className={styles.profileCard} aria-live="polite">
    <h1>{loading ? "Loading business details…" : "Business details unavailable"}</h1>
    {!loading && <p>Return to the map and select the business again.</p>}
  </section>;

  const { website } = location;
  const evidence = "url" in website ? website : undefined;
  const evidenceUrl = webLink(evidence?.url);
  const officialWebsite = website.status === "live" ? evidenceUrl : undefined;
  const listedWebsite = webLink(location.listedWebsite);
  const publicSource = webLink(location.source);
  const contactSource = webLink(location.contactSource);
  const phone = businessPhone(location.phone);
  const tel = phone ? phoneHref(phone) : undefined;
  const email = businessEmail(location.email);
  const socials = (location.socials ?? []).flatMap(({ platform, url }) => {
    const safe = webLink(url);
    return safe ? [{ platform, url: safe }] : [];
  });
  const [lon, lat] = location.coordinates;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lon}`)}`;
  const contactActions = [
    { label: "Call business", value: phone, url: tel, icon: Phone },
    { label: "Send email", value: email, url: email ? `mailto:${email}` : undefined, icon: Mail },
    { label: "Visit official website", url: officialWebsite, icon: Globe },
    { label: "Open contact source", url: contactSource !== officialWebsite ? contactSource : undefined, icon: ArrowUpRight },
    { label: "Get directions", value: location.address || location.area || marketName, url: directions, icon: Navigation },
  ];

  return <div className={styles.profileGrid}>
    <section className={styles.profileCard} aria-labelledby="profile-title">
      <div className={styles.profileIdentity}>
        <span className={styles.profileGlyph}><MapPin size={24} aria-hidden="true" /></span>
        <p>{location.category} · {marketName}</p>
        <h1 id="profile-title">{location.name}</h1>
      </div>
      <dl className={styles.profileFacts}>
        <div><dt><MapPin size={17} aria-hidden="true" /> Location</dt><dd><a href={directions} {...newTab}>{location.address || location.area || marketName} <ArrowUpRight size={14} aria-hidden="true" /></a></dd></div>
        <div><dt><Phone size={17} aria-hidden="true" /> Phone</dt><dd>{tel ? <a href={tel}>{phone}</a> : "Unavailable"}</dd></div>
        <div><dt><Mail size={17} aria-hidden="true" /> Email</dt><dd>{email ? <a href={`mailto:${email}`}>{email}</a> : "Unavailable"}</dd></div>
        {location.hours && <div><dt><Clock size={17} aria-hidden="true" /> Listed hours</dt><dd>{location.hours}</dd></div>}
        {(officialWebsite || listedWebsite) && <div><dt><Globe size={17} aria-hidden="true" /> Website</dt><dd><a href={officialWebsite || listedWebsite} {...newTab} rel="nofollow noopener noreferrer">{new URL((officialWebsite || listedWebsite)!).hostname} <ArrowUpRight size={14} aria-hidden="true" /></a></dd></div>}
      </dl>
      <div className={styles.profileStatus} data-website={website.status}>
        <span className={styles.statusDot} data-website={website.status} aria-hidden="true" />{websiteLabels[website.status]}
      </div>
      {evidence && <p className={styles.profileNote}>Checked <time dateTime={evidence.checkedOn}>{evidence.checkedOn}</time>.</p>}
    </section>
    <div className={styles.profileSections}>
      <section className={styles.profileCard} aria-labelledby="contact-title">
        <h2 id="contact-title">Contact and directions</h2>
        <div className={styles.profileActions}>
          {contactActions.map(({ label, value, url, icon: Icon }) => url && <a key={label} href={url} {...(url.startsWith("http") ? newTab : {})}>
            <span className={styles.profileActionIcon}><Icon size={20} aria-hidden="true" /></span><span><strong>{label}</strong>{value && <small>{value}</small>}</span>
          </a>)}
        </div>
        {!tel && !email && <p className={styles.profileNote}>This listing has no public phone or email available.</p>}
      </section>
      {socials.length > 0 && <section className={styles.profileCard} aria-labelledby="social-title">
        <h2 id="social-title">Social profiles</h2>
        <div className={styles.profileLinks}>{socials.map(({ platform, url }) => <a key={platform} href={url} {...newTab} rel="nofollow noopener noreferrer">{platform} <ArrowUpRight size={16} aria-hidden="true" /></a>)}</div>
        <p className={styles.profileNote}>{website.status === "live" ? "Links published by the business." : "Community-listed profiles. Check them before contacting."}</p>
      </section>}
      <section className={styles.profileCard} aria-labelledby="source-title">
        <h2 id="source-title">Listing sources</h2>
        {website.status === "unlisted" && <p className={styles.profileNote}>The source does not list a website. Check that the business is still operating and whether it has an official site.</p>}
        {website.status === "unknown" && <p className={styles.profileNote}>The available source does not establish the website status.</p>}
        <div className={styles.profileLinks}>
          {publicSource && <a href={publicSource} {...newTab}>Location record <ArrowUpRight size={16} aria-hidden="true" /></a>}
          {contactSource && <a href={contactSource} {...newTab}>Contact record <ArrowUpRight size={16} aria-hidden="true" /></a>}
          {evidenceUrl && website.status === "none" && <a href={evidenceUrl} {...newTab}>Website status evidence <ArrowUpRight size={16} aria-hidden="true" /></a>}
          {listedWebsite && <a href={listedWebsite} {...newTab} rel="nofollow noopener noreferrer">Listed website · unverified <ArrowUpRight size={16} aria-hidden="true" /></a>}
        </div>
      </section>
    </div>
  </div>;
}
