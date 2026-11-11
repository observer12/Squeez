export const websiteLabels = {
  live: "Website checked live",
  none: "Confirmed no official website",
  unlisted: "No website listed in source",
  unknown: "Website status unknown",
} as const;

export type WebsiteStatus = keyof typeof websiteLabels;

type WebsiteEvidence =
  | { status: "live" | "none"; url: string; checkedOn: string }
  | { status: "unknown" | "unlisted" };

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
  address?: string;
  phone?: string;
  email?: string;
  contactSource?: string;
  hours?: string;
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
  { id: "borough", name: "Borough Market", area: "Southwark", address: "8 Southwark Street, London SE1 1TL", phone: "+44 20 7407 1002", email: "info@boroughmarket.org.uk", contactSource: "https://boroughmarket.org.uk/contact-us/", category: "Market", coordinates: [-0.090833, 51.505556], source: "https://www.wikidata.org/wiki/Q894072", website: liveWebsite("https://boroughmarket.org.uk/") },
];

const dhakaLocations: Location[] = [
  {
    id: "aarong-lalmatia", name: "Aarong · Lalmatia", area: "Lalmatia", category: "Clothing store",
    coordinates: [90.37377, 23.7584], source: "https://mapcarta.com/N2327818076",
    contactSource: "https://www.aarong.com/bgd/contacts", phone: "+880 1973 746946",
    email: "customerservice.aarong@brac.net", website: liveWebsite("https://www.aarong.com/bgd/contacts"),
  },
  {
    id: "star-tech-idb", name: "Star Tech · IDB Bhaban", area: "Agargaon", category: "Electronics store",
    address: "Shops 228 and 229, 2nd floor, IDB Bhaban, Agargaon, Dhaka",
    coordinates: [90.37951, 23.7788], source: "https://bangladesh.worldplaces.me/view-place/48996333-bcs-computer-city.html",
    contactSource: "https://www.startech.com.bd/information/contact", phone: "+880 9678 002003",
    email: "webteam@startechbd.com", website: liveWebsite("https://www.startech.com.bd/information/contact"),
  },
  {
    id: "brac-bank-tejgaon", name: "BRAC Bank · Head Office", area: "Tejgaon", category: "Bank",
    address: "Anik Tower, 220/B Tejgaon–Gulshan Link Road, Dhaka 1208",
    coordinates: [90.40669, 23.77178], source: "https://mapcarta.com/W161528958",
    contactSource: "https://www.bracbank.com/en/contact-us", phone: "+880 9611 223344",
    email: "enquiry@bracbank.com", website: liveWebsite("https://www.bracbank.com/en/contact-us"),
  },
  {
    id: "labaid-specialized", name: "Labaid Specialized Hospital", area: "Dhanmondi", category: "Hospital",
    address: "House 6, Road 4, Dhanmondi, Dhaka 1205",
    coordinates: [90.38304, 23.74199], source: "https://mapcarta.com/W438548318",
    contactSource: "https://www.labaid.com.bd/en/contactUs", phone: "+880 2 58610793",
    email: "info@labaidgroup.com", website: liveWebsite("https://www.labaid.com.bd/en/hospital/labaid-specialized-hospital"),
  },
  {
    id: "brac-university", name: "BRAC University", area: "Merul Badda", category: "University",
    address: "Kha 224, Bir Uttam Rafiqul Islam Avenue, Merul Badda, Dhaka 1212",
    coordinates: [90.4254, 23.7725], source: "https://en.wikipedia.org/wiki/BRAC_University",
    contactSource: "https://www.bracu.ac.bd/sites/default/files/admission/flyer/Admission%20brochure%20%28UG%29%20%281%29.pdf",
    phone: "+880 9638 464646", email: "admissions@bracu.ac.bd",
    website: liveWebsite("https://www.bracu.ac.bd/contact"),
  },
  {
    id: "aura-bailey-road", name: "AURA Beauty Lounge", area: "Bailey Road",
    address: "2nd Floor, Gold Palace, 3 New Bailey Road, Dhaka 1000", category: "Beauty salon",
    coordinates: [90.41004, 23.74197], source: "https://mapcarta.com/N4117103292",
    contactSource: "https://aurabd.com/book-appointment/", phone: "+880 1799 255555",
    email: "aurabeautybd@gmail.com", website: liveWebsite("https://aurabd.com/book-appointment/"),
  },
  {
    id: "persona-banani", name: "Persona · Banani", area: "Banani",
    address: "76/A Road 11, Banani, Dhaka 1212", category: "Beauty salon",
    coordinates: [90.41023, 23.79024], source: "https://mapcarta.com/N3732380032",
    contactSource: "https://persona.com.bd/contacts/", phone: "+880 1847 067969",
    email: "info@persona.com.bd", website: liveWebsite("https://persona.com.bd/contacts/"),
  },
  {
    id: "bistro-e", name: "Bistro E", area: "Gulshan 2",
    address: "Bay’s Edgewater, 1st Floor, NE (N) 12 North Avenue, Gulshan 2, Dhaka 1212",
    category: "Restaurant", coordinates: [90.41753, 23.79608],
    source: "https://mapcarta.com/W403791809", contactSource: "https://bistro-e.com/",
    phone: "+880 1755 693707", email: "reservations@bistro-e.com",
    website: liveWebsite("https://bistro-e.com/"),
  },
  { id: "prive-salon", name: "Privé Salon and Spa", area: "Gulshan 2", address: "House 23B, Road 102, Gulshan 2, Dhaka 1212", category: "Beauty salon", coordinates: [90.4191377, 23.7938612], source: "https://bd.near-place.com/prive-salon-and-spa-ltd-by-nahila-hedayet-gulshan-2-road-102-house-23b-dhaka", contactSource: "https://www.cybo.com/BD-biz/priv%C3%A9-salon-and-spa-ltd-by-nahila", phone: "+880 1926 649646", email: "info.prive.salon@gmail.com", website: { status: "unlisted" } },
  { id: "lakeshore-gulshan", name: "Lakeshore Hotel Gulshan", area: "Gulshan 2", address: "House 46, Road 41, Gulshan 2, Dhaka 1212", category: "Hotel", coordinates: [90.41243, 23.79021], source: "https://mapcarta.com/32927958", contactSource: "https://lakeshorehotel.com.bd/maps-directions/", phone: "+880 9610 111222", email: "info@lakeshorehotel.com.bd", website: liveWebsite("https://lakeshorehotel.com.bd/maps-directions/") },
  { id: "dhaka-regency", name: "Dhaka Regency Hotel & Resort", area: "Nikunja 2", address: "Airport Road, Nikunja 2, Dhaka", category: "Hotel", coordinates: [90.41944, 23.82953], source: "https://bd.near-place.com/dhaka-regency-hotel-resort-airport-road-nikunja-2-dhaka", contactSource: "https://dhakaregency.com/", phone: "+880 1713 332651", email: "info@dhakaregency.com", website: liveWebsite("https://dhakaregency.com/") },
  { id: "bodhua-saj", name: "Bodhua Saj Beauty Parlor", area: "Mirpur 11", address: "20 1/1, Mirpur 11, Dhaka", category: "Beauty salon", coordinates: [90.37534, 23.81797], source: "https://mapcarta.com/N4322832714", website: { status: "unlisted" } },
  { id: "sayna", name: "Sayna Beauty Parlor", area: "Mirpur 11", address: "Mirpur 11, Dhaka", category: "Beauty salon", coordinates: [90.37526, 23.81811], source: "https://mapcarta.com/N4322833072", website: { status: "unlisted" } },
  { id: "tisha", name: "Tisha Beauty Parlor", area: "Mirpur 11", address: "Mirpur 11, Dhaka", category: "Beauty salon", coordinates: [90.37417, 23.81712], source: "https://mapcarta.com/N4331663851", website: { status: "unlisted" } },
  { id: "jamuna", name: "Jamuna Future Park", area: "Kuril", contactSource: "https://jamunafuturepark.com/index.php/contact", category: "Shopping centre", coordinates: [90.424167, 23.813333], source: "https://commons.wikimedia.org/wiki/Category:Jamuna_Future_Park", website: liveWebsite("https://jamunafuturepark.com/") },
  { id: "star-cineplex", name: "Star Cineplex · Bashundhara City", area: "Panthapath", address: "Level 8, Bashundhara City Shopping Mall, Panthapath, Dhaka 1205", contactSource: "https://starcineplex.com/contact", category: "Cinema", coordinates: [90.39052, 23.7515], source: "https://mapcarta.com/N4267753293", website: liveWebsite("https://starcineplex.com/about"), socials: [
    { platform: "Facebook", url: "https://www.facebook.com/MYCINEPLEX" },
    { platform: "Instagram", url: "https://www.instagram.com/mystarcineplex/" },
    { platform: "YouTube", url: "https://www.youtube.com/@mySTARCineplex" },
    { platform: "TikTok", url: "https://www.tiktok.com/@starcineplex" },
  ] },
  { id: "pan-pacific", name: "Pan Pacific Sonargaon Dhaka", area: "Karwan Bazar", address: "107 Kazi Nazrul Islam Avenue, Dhaka 1215", phone: "+880 2 5502 8008", email: "enquiry.ppdac@panpacific.com", contactSource: "https://www.panpacific.com/en/hotels-and-resorts/pp-dhaka/the-hotel.html", category: "Hotel", coordinates: [90.3941, 23.7496], source: "https://commons.wikimedia.org/wiki/Category:Pan_Pacific_Sonargaon", website: liveWebsite("https://www.panpacific.com/en/hotels-and-resorts/pp-dhaka.html") },
  { id: "intercontinental", name: "InterContinental Dhaka", area: "Shahbag", address: "1 Minto Road, Dhaka 1000", phone: "+880 2 55663030", email: "dhaka@intercontinental-dhaka.com", contactSource: "https://www.ihg.com/intercontinental/hotels/us/en/dhaka/dachb/hoteldetail", category: "Hotel", coordinates: [90.3965, 23.741], source: "https://en.wikipedia.org/wiki/InterContinental_Dhaka", website: liveWebsite("https://www.ihg.com/intercontinental/hotels/us/en/dhaka/dachb/hoteldetail") },
  { id: "westin", name: "The Westin Dhaka", area: "Gulshan", address: "Plot 01, Road 45, Main Gulshan Avenue, Gulshan 2, Dhaka 1212", phone: "+880 9638 228811", contactSource: "https://www.marriott.com/en-us/hotels/dacwi-the-westin-dhaka/overview/", category: "Hotel", coordinates: [90.4146, 23.7933], source: "https://en.wikipedia.org/wiki/The_Westin_Dhaka", website: liveWebsite("https://www.marriott.com/en-us/hotels/dacwi-the-westin-dhaka/overview/") },
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
