import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers3, MapPin, Search } from "lucide-react";
import styles from "./discovery.module.css";

const steps = [
  { icon: Search, title: "Narrow your search", description: "Filter by business name, neighbourhood or category." },
  { icon: Layers3, title: "See the market in context", description: "Switch between a tilted map, a flat map and a keyboard-friendly list." },
  { icon: MapPin, title: "Check the source", description: "Open the public location record behind each pin." },
];

export default function Home() {
  return <div className={styles.shell}>
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Squeez home">squeez<span>.</span></Link>
      <nav aria-label="Main navigation">
        <a href="#how">How it works</a>
        <Link href="/dashboard">CRM preview <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </nav>
    </header>
    <main>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><MapPin size={16} aria-hidden="true" /> Business discovery</p>
          <h1>Find your next<br />local <em>opportunity.</em></h1>
          <p>Explore businesses on a street map and open the source behind every location. Choose a market to explore a curated selection in London or Dhaka.</p>
          <div className={styles.marketNav}>
            <Link className={styles.primary} href="/explore">Explore London <ArrowRight size={20} aria-hidden="true" /></Link>
            <Link href="/explore?city=dhaka">Explore Dhaka <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <Link className={styles.preview} href="/explore" aria-label="Open the London map demo">
          <span className={styles.previewTop}><span>London, United Kingdom</span><span>Map demo</span></span>
          <Image src="/illustrations/map-pin-city.svg" alt="" width={1000} height={1000} priority unoptimized />
          <span className={styles.previewBottom}><span>Open the map</span><ArrowUpRight size={23} aria-hidden="true" /></span>
        </Link>
      </section>
      <section id="how" className={styles.how} aria-labelledby="how-title">
        <h2 id="how-title">From map to source</h2>
        <div className={styles.steps}>
          {steps.map(({icon: Icon, title, description}) => <article key={title}>
            <Icon size={24} aria-hidden="true" /><h3>{title}</h3><p>{description}</p>
          </article>)}
        </div>
      </section>
    </main>
    <footer className={styles.footer}><span>Squeez · Product preview</span><Link href="/explore">London map demo <ArrowRight size={16} aria-hidden="true" /></Link></footer>
  </div>;
}
