import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "../discovery.module.css";
import Explorer from "./explorer";
import { hasBusinessContact } from "./contact";
import { getMarketId, markets } from "./locations";

export default async function Explore({ searchParams }: { searchParams: Promise<{ city?: string; website?: string }> }) {
  const { city, website } = await searchParams;
  const marketId = getMarketId(city);
  const base = markets[marketId];
  const market = { ...base, locations: base.locations.filter(hasBusinessContact) };
  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Squeez home">squeez<span>.</span></Link>
      <nav aria-label="Main navigation"><Link href="/dashboard">CRM preview <ArrowUpRight size={15} aria-hidden="true" /></Link></nav>
    </header>
    <main className={styles.explore}>
      <p className={styles.kicker}>Discovery demo</p>
      <h1>Explore {market.city}</h1>
      <nav className={styles.marketNav} aria-label="Select a market">
        <Link href="/explore" aria-current={marketId === "london" ? "page" : undefined}>London, United Kingdom</Link>
        <Link href="/explore?city=bangladesh" aria-current={marketId === "bangladesh" ? "page" : undefined}>All Bangladesh</Link>
        <Link href="/explore?city=dhaka" aria-current={marketId === "dhaka" ? "page" : undefined}>Dhaka, Bangladesh</Link>
      </nav>
      <p className={styles.intro}>Browse local businesses with both a public email address and a business phone number.</p>
      <Explorer key={`${marketId}-${website === "unlisted"}`} market={market} marketId={marketId} initialWebsite={website === "unlisted" ? "unlisted" : ""} />
    </main>
  </div>;
}
