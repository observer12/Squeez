import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "../../discovery.module.css";
import { hasBusinessContact } from "../contact";
import { markets } from "../locations";
import Profile from "../business-details";

export default async function BusinessPage({ searchParams }: { searchParams: Promise<{ id?: string; city?: string; website?: string }> }) {
  const params = await searchParams;
  const city = params.city === "dhaka" ? "dhaka" : "london";
  const market = markets[city];
  const id = typeof params.id === "string" ? params.id.slice(0, 320) : "";
  const initial = market.locations.find(location => location.id === id && hasBusinessContact(location));
  const back = city === "dhaka" ? `/explore?city=dhaka${params.website === "unlisted" ? "&website=unlisted" : ""}` : "/explore";

  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Squeez home">squeez<span>.</span></Link>
      <nav aria-label="Main navigation"><Link href={back}>Business explorer</Link></nav>
    </header>
    <main className={styles.profilePage}>
      <Link className={styles.profileBack} href={back}><ArrowLeft size={17} aria-hidden="true" /> Back to {market.city} map</Link>
      <Profile key={`${city}:${id}`} initial={initial} city={city} id={id} marketName={market.city} />
    </main>
  </div>;
}
