export const websiteLabels = {
  live: "Website checked live",
  none: "Confirmed no official website",
  unknown: "Website status unknown",
} as const;

export type WebsiteStatus = keyof typeof websiteLabels;

type WebsiteEvidence =
  | { status: "live" | "none"; url: string; checkedOn: string }
  | { status: "unknown" };

export type Coordinates = [longitude: number, latitude: number];

export type Location = {
  id: string;
  name: string;
  area: string;
  category: string;
  coordinates: Coordinates;
  source: string;
  website: WebsiteEvidence;
  listedWebsite?: string;
  socials?: { platform: string; url: string }[];
};

function liveWebsite(url: string): WebsiteEvidence {
  return { status: "live", url, checkedOn: "2026-11-11" };
}

const londonLocations: Location[] = [
  { id: "liberty", name: "Liberty London", area: "Soho", category: "Department store", coordinates: [-0.1402, 51.5139], source: "https://www.wikidata.org/wiki/Q3237793", website: liveWebsite("https://www.libertylondon.com/") },
  { id: "harrods", name: "Harrods", area: "Knightsbridge", category: "Department store", coordinates: [-0.1635, 51.499611], source: "https://www.wikidata.org/wiki/Q332474", website: liveWebsite("https://www.harrods.com/en-gb") },
  { id: "fortnum", name: "Fortnum & Mason", area: "Piccadilly", category: "Department store", coordinates: [-0.1384, 51.5083], source: "https://www.wikidata.org/wiki/Q498563", website: liveWebsite("https://www.fortnumandmason.com/") },
  { id: "spitalfields", name: "Old Spitalfields Market", area: "Spitalfields", category: "Market", coordinates: [-0.075278, 51.519444], source: "https://www.wikidata.org/wiki/Q43470", website: liveWebsite("https://oldspitalfieldsmarket.com/") },
  { id: "selfridges", name: "Selfridges", area: "Oxford Street", category: "Department store", coordinates: [-0.152704, 51.514344], source: "https://www.wikidata.org/wiki/Q7448348", website: liveWebsite("https://www.selfridges.com/GB/en/") },
  { id: "hamleys", name: "Hamleys", area: "Regent Street", category: "Toy shop", coordinates: [-0.1402, 51.5128], source: "https://www.wikidata.org/wiki/Q60299", website: liveWebsite("https://www.hamleys.com/stores/london-regent-street") },
  { id: "foyles", name: "Foyles", area: "Charing Cross Road", category: "Bookshop", coordinates: [-0.129814, 51.514304], source: "https://www.wikidata.org/wiki/Q126688859", website: liveWebsite("https://www.foyles.co.uk/") },
  { id: "borough", name: "Borough Market", area: "Southwark", category: "Market", coordinates: [-0.090833, 51.505556], source: "https://www.wikidata.org/wiki/Q894072", website: liveWebsite("https://boroughmarket.org.uk/") },
];

const dhakaLocations: Location[] = [
  { id: "jamuna", name: "Jamuna Future Park", area: "Kuril", category: "Shopping centre", coordinates: [90.424167, 23.813333], source: "https://commons.wikimedia.org/wiki/Category:Jamuna_Future_Park", website: liveWebsite("https://jamunafuturepark.com/") },
  { id: "star-cineplex", name: "Star Cineplex · Bashundhara City", area: "Panthapath", category: "Cinema", coordinates: [90.39052, 23.7515], source: "https://mapcarta.com/N4267753293", website: liveWebsite("https://starcineplex.com/about") },
  { id: "pan-pacific", name: "Pan Pacific Sonargaon Dhaka", area: "Karwan Bazar", category: "Hotel", coordinates: [90.3941, 23.7496], source: "https://commons.wikimedia.org/wiki/Category:Pan_Pacific_Sonargaon", website: liveWebsite("https://www.panpacific.com/en/hotels-and-resorts/pp-dhaka.html") },
  { id: "intercontinental", name: "InterContinental Dhaka", area: "Shahbag", category: "Hotel", coordinates: [90.3965, 23.741], source: "https://en.wikipedia.org/wiki/InterContinental_Dhaka", website: liveWebsite("https://www.ihg.com/intercontinental/hotels/us/en/dhaka/dachb/hoteldetail") },
  { id: "westin", name: "The Westin Dhaka", area: "Gulshan", category: "Hotel", coordinates: [90.4146, 23.7933], source: "https://en.wikipedia.org/wiki/The_Westin_Dhaka", website: liveWebsite("https://www.marriott.com/en-us/hotels/dacwi-the-westin-dhaka/overview/") },
];

export type Market = {
  city: string;
  country: string;
  center: Coordinates;
  locations: Location[];
};

export const markets = {
  london: { city: "London", country: "United Kingdom", center: [-0.1402, 51.5139], locations: londonLocations },
  dhaka: { city: "Dhaka", country: "Bangladesh", center: [90.39052, 23.7515], locations: dhakaLocations },
} satisfies Record<string, Market>;
