import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "../discovery.module.css";
import Explorer from "./explorer";

export default function Explore() {
  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Squeez home">squeez<span>.</span></Link>
      <nav aria-label="Main navigation"><Link href="/dashboard">CRM preview <ArrowUpRight size={15} aria-hidden="true" /></Link></nav>
    </header>
    <main className={styles.explore}>
      <p className={styles.kicker}>Discovery demo</p>
      <h1>Explore London</h1>
      <p className={styles.intro}>Browse public business locations. Website status and lead suitability have not been assessed.</p>
      <Explorer />
    </main>
  </div>;
}
