import { businessEmail, businessPhone } from "../../explore/contact";
import type { Location } from "../../explore/locations";

const bounds = {
  dhaka: "23.735,90.375,23.821,90.436",
  london: "51.496,-0.166,51.526,-0.072",
} as const;

type City = keyof typeof bounds;
type Coordinate = { lat?: number; lon?: number };
type OsmPlace = Coordinate & {
  type: "node" | "way" | "relation";
  id: number;
  center?: Coordinate;
  tags?: Record<string, string>;
};

const platforms = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
} as const;

const cache = new Map<City, { expires: number; results: Promise<Location[]> }>();

function publicLink(value?: string): string | undefined {
  if (!value || value.length > 1024) return;
  try {
    const url = new URL(value.trim());
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    return;
  }
}

function readPlace(place: OsmPlace): Location[] {
  const tags = place.tags;
  const name = (tags?.["name:en"] || tags?.name)?.trim();
  const category = tags?.shop || tags?.amenity || tags?.tourism || tags?.office;
  const { lat, lon } = place.center ?? place;
  if (!tags || !name || !category || typeof lat !== "number" || typeof lon !== "number" ||
    !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 ||
    !["node", "way", "relation"].includes(place.type) || !Number.isSafeInteger(place.id)) return [];

  const socials = Object.entries(platforms).flatMap(([key, platform]) => {
    const url = publicLink(tags[`contact:${key}`]) ?? publicLink(tags[key]);
    return url ? [{ platform, url }] : [];
  });

  const phone = businessPhone(tags["contact:phone"]) ?? businessPhone(tags.phone);
  const email = businessEmail(tags["contact:email"]) ?? businessEmail(tags.email);
  if (!phone || !email) return [];

  const listedWebsite = publicLink(tags["contact:website"]) ?? publicLink(tags.website);
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", ");

  return [{
    id: `osm-${place.type}-${place.id}`,
    name: name.slice(0, 160),
    category: category.replaceAll("_", " ").replace(/^./, letter => letter.toUpperCase()).slice(0, 64),
    area: (tags["addr:suburb"] || tags["addr:street"] || tags["addr:city"] || "").slice(0, 120),
    coordinates: [lon, lat],
    source: `https://www.openstreetmap.org/${place.type}/${place.id}`,
    website: { status: listedWebsite ? "unknown" : "unlisted" },
    listedWebsite,
    address: address.slice(0, 200) || undefined,
    phone,
    email,
    hours: tags.opening_hours?.slice(0, 200),
    socials,
  }];
}

async function fetchPlaces(city: City) {
  const box = bounds[city];
  const businesses = [
    '["shop"]["shop"!~"^(vacant|closed|no)$"]',
    '["amenity"~"^(restaurant|cafe|fast_food|bar|pub|bank|pharmacy|cinema|marketplace)$"]',
    '["tourism"~"^(hotel|guest_house|hostel)$"]',
  ];
  const selectors = businesses.map(tags => `nwr["name"][~"^(contact:)?phone$"~"."][~"^(contact:)?email$"~"."]${tags}(${box});`).join("");
  const query = `[out:json][timeout:6][maxsize:33554432];(${selectors});out center 180;`;
  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const response = await fetch(url, { signal: AbortSignal.timeout(7000), cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json() as { elements?: OsmPlace[]; remark?: string };
      if (!data.remark && Array.isArray(data.elements)) return data.elements.slice(0, 180).flatMap(readPlace);
    } catch {
      // Try the other public instance before falling back to the basemap in the explorer.
    }
  }
  throw new Error("OpenStreetMap data unavailable");
}

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city");
  if (city !== "dhaka" && city !== "london") return Response.json({ error: "Unknown market" }, { status: 400 });

  let entry = cache.get(city);
  if (!entry || entry.expires <= Date.now()) {
    const results: Promise<Location[]> = fetchPlaces(city).catch(error => {
      const failed = cache.get(city);
      if (failed?.results === results) failed.expires = Date.now() + 30_000;
      throw error;
    });
    entry = { results, expires: Date.now() + 30 * 60_000 };
    cache.set(city, entry);
  }

  try {
    return Response.json({ locations: await entry.results }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return Response.json({ error: "OpenStreetMap listings are temporarily unavailable." }, { status: 503 });
  }
}
