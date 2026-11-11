import { ArrowUpRight, Clock, Globe, MapPin, Phone, X } from "lucide-react";
import type { RefObject } from "react";
import styles from "../discovery.module.css";
import { websiteLabels, type Location } from "./locations";

export default function BusinessDetails({ location, heading, close }: {
  location: Location;
  heading: RefObject<HTMLHeadingElement | null>;
  close: () => void;
}) {
  const { website } = location;
  const evidence = "url" in website ? website : undefined;
  const phoneNumber = location.phone?.replace(/[^\d+]/g, "");
  return <aside className={styles.businessDetails} aria-labelledby="business-name" onKeyDown={event => {
    if (event.key === "Escape") close();
  }}>
    <div className={styles.businessDetailsHeader}>
      <div>
        <h2 id="business-name" ref={heading} tabIndex={-1}>{location.name}</h2>
        <p>{location.category}</p>
      </div>
      <button type="button" aria-label="Close business details" onClick={close}><X size={18} aria-hidden="true" /></button>
    </div>
    <ul className={styles.businessFacts}>
      <li><MapPin size={16} aria-hidden="true" /><span>{location.address || location.area || "Address unavailable"}</span></li>
      {location.phone && <li><Phone size={16} aria-hidden="true" />{phoneNumber && /^\+?\d{5,18}$/.test(phoneNumber) ? <a href={`tel:${phoneNumber}`}>{location.phone}</a> : <span>{location.phone}</span>}</li>}
      {location.hours && <li><Clock size={16} aria-hidden="true" /><span>{location.hours}</span></li>}
    </ul>
    <div className={styles.businessStatus} data-website={website.status}>
      <span className={styles.statusDot} data-website={website.status} aria-hidden="true" />
      {websiteLabels[website.status]}
    </div>
    {evidence && <small>Checked <time dateTime={evidence.checkedOn}>{evidence.checkedOn}</time></small>}
    {website.status === "unlisted" && <small>The source does not list a website. Check that the business is still operating and whether it has an official site.</small>}
    {website.status === "unknown" && !location.listedWebsite && <small>This source does not establish whether the business has a website.</small>}
    <div className={styles.businessActions}>
      {evidence && <a href={evidence.url}><Globe size={16} aria-hidden="true" />{website.status === "live" ? "Official website" : "Website status evidence"}</a>}
      {location.listedWebsite && <a href={location.listedWebsite} rel="nofollow noreferrer"><Globe size={16} aria-hidden="true" />Listed website · unverified</a>}
      <a href={location.source}>View location source <ArrowUpRight size={15} aria-hidden="true" /></a>
    </div>
    {Boolean(location.socials?.length) && <div className={styles.businessSocials}>
      <small>{website.status === "live" ? "Social links from the official site" : "Community-listed social links"}</small>
      <div className={styles.businessActions}>{location.socials?.map(({ platform, url }) =>
        <a href={url} key={platform} rel="nofollow noreferrer">{platform} <ArrowUpRight size={14} aria-hidden="true" /></a>
      )}</div>
    </div>}
  </aside>;
}
