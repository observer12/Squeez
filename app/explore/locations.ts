export const websiteLabels = {
  live: "Website checked live",
  none: "Confirmed no official website",
  unknown: "Website status unknown",
} as const;

export type WebsiteStatus = keyof typeof websiteLabels;

type WebsiteEvidence =
  | { status: "live" | "none"; url: string; checkedOn: string }
  | { status: "unknown" };

export type Location = {
  id: string;
  name: string;
  area: string;
  category: "Department store" | "Market" | "Toy shop" | "Bookshop";
  coordinates: [longitude: number, latitude: number];
  source: string;
  website: WebsiteEvidence;
};

export const londonCenter: [number, number] = [-0.1402, 51.5139];

function liveWebsite(url: string): WebsiteEvidence {
  return { status: "live", url, checkedOn: "2026-11-11" };
}

export const locations: Location[] = [
  { id: "liberty", name: "Liberty London", area: "Soho", category: "Department store", coordinates: [-0.1402, 51.5139], source: "https://www.wikidata.org/wiki/Q3237793", website: liveWebsite("https://www.libertylondon.com/") },
  { id: "harrods", name: "Harrods", area: "Knightsbridge", category: "Department store", coordinates: [-0.1635, 51.499611], source: "https://www.wikidata.org/wiki/Q332474", website: liveWebsite("https://www.harrods.com/en-gb") },
  { id: "fortnum", name: "Fortnum & Mason", area: "Piccadilly", category: "Department store", coordinates: [-0.1384, 51.5083], source: "https://www.wikidata.org/wiki/Q498563", website: liveWebsite("https://www.fortnumandmason.com/") },
  { id: "spitalfields", name: "Old Spitalfields Market", area: "Spitalfields", category: "Market", coordinates: [-0.075278, 51.519444], source: "https://www.wikidata.org/wiki/Q43470", website: liveWebsite("https://oldspitalfieldsmarket.com/") },
  { id: "selfridges", name: "Selfridges", area: "Oxford Street", category: "Department store", coordinates: [-0.152704, 51.514344], source: "https://www.wikidata.org/wiki/Q7448348", website: liveWebsite("https://www.selfridges.com/GB/en/") },
  { id: "hamleys", name: "Hamleys", area: "Regent Street", category: "Toy shop", coordinates: [-0.1402, 51.5128], source: "https://www.wikidata.org/wiki/Q60299", website: liveWebsite("https://www.hamleys.com/stores/london-regent-street") },
  { id: "foyles", name: "Foyles", area: "Charing Cross Road", category: "Bookshop", coordinates: [-0.129814, 51.514304], source: "https://www.wikidata.org/wiki/Q126688859", website: liveWebsite("https://www.foyles.co.uk/") },
  { id: "borough", name: "Borough Market", area: "Southwark", category: "Market", coordinates: [-0.090833, 51.505556], source: "https://www.wikidata.org/wiki/Q894072", website: liveWebsite("https://boroughmarket.org.uk/") },
];
