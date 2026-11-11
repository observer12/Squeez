import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "../discovery.module.css";
import Explorer from "./explorer";
import { markets } from "./locations";

export default async function Explore({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const { city } = await searchParams;
  const marketId = city === "dhaka" ? "dhaka" : "london";
  const market = markets[marketId];
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
        <Link href="/explore?city=dhaka" aria-current={marketId === "dhaka" ? "page" : undefined}>Dhaka, Bangladesh</Link>
      </nav>
      <p className={styles.intro}>Browse a source-linked selection of local businesses and markets. Website labels reflect the last recorded check.</p>
      <Explorer key={marketId} market={market} marketId={marketId} />
    </main>
  </div>;
}
