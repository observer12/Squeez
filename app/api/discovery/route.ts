import { readFile } from "node:fs/promises";
import path from "node:path";
import { directoryCategory, directorySelectors } from "../../explore/categories";
import { businessEmail, businessPhone } from "../../explore/contact";
import type { Location } from "../../explore/locations";

const bounds = {
  dhaka: "23.735,90.375,23.821,90.436",
  london: "51.47,-0.22,51.56,0.02",
} as const;

type City = keyof typeof bounds | "bangladesh";
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

const cache = new Map<string, { expires: number; results: Promise<Location[]> }>();

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
  const category = tags && directoryCategory(tags);
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

  const listedWebsite = publicLink(tags["contact:website"]) ?? publicLink(tags.website);
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", ");

  return [{
    id: `osm-${place.type}-${place.id}`,
    name: name.slice(0, 160),
    category,
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

async function fetchPlaces(city: City, category: string) {
  const region = city === "bangladesh" ? "(area.bd)" : `(${bounds[city]})`;
  const selectors = directorySelectors(category || undefined).map(tags => `nwr["name"]${tags}${region};`).join("");
  const area = city === "bangladesh" ? 'area["ISO3166-1"="BD"]["admin_level"="2"]->.bd;' : "";
  const timeout = city === "bangladesh" ? 18 : 25;
  const query = `[out:json][timeout:${timeout}][maxsize:67108864];${area}(${selectors});out center 180;`;
  const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
  for (const endpoint of endpoints) {
    try {
      const url = new URL(endpoint);
      url.searchParams.set("data", query);
      const response = await fetch(url, { signal: AbortSignal.timeout(city === "bangladesh" ? 20_000 : 30_000), cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json() as { elements?: OsmPlace[]; remark?: string };
      if (!data.remark && Array.isArray(data.elements)) return data.elements.slice(0, 1200).flatMap(readPlace).slice(0, 500);
    } catch {
      // Try the other public instance before falling back to the basemap in the explorer.
    }
  }
  throw new Error("OpenStreetMap data unavailable");
}

let countrySnapshot: Promise<Location[]> | undefined;

function readCountrySnapshot() {
  countrySnapshot ??= readFile(path.join(process.cwd(), "data", "bangladesh-businesses.json"), "utf8")
    .then(raw => JSON.parse(raw) as Location[])
    .catch(() => []);
  return countrySnapshot;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  if (city !== "dhaka" && city !== "london" && city !== "bangladesh") return Response.json({ error: "Unknown market" }, { status: 400 });

  const id = searchParams.get("id");
  const category = searchParams.get("category") ?? "";
  if (category && directorySelectors(category).length === 0) return Response.json({ error: "Unknown category" }, { status: 400 });
  if (city === "bangladesh") {
    const allRecords = await readCountrySnapshot();
    const snapshot = category ? allRecords.filter(place => place.category === category) : allRecords;
    if (allRecords.length) {
      if (id) return Response.json({ locations: snapshot.filter(place => place.id === id) });
      const requested = Number(searchParams.get("offset"));
      const offset = Number.isSafeInteger(requested) && requested > 0 ? requested : 0;
      const limit = 200;
      return Response.json({
        locations: snapshot.slice(offset, offset + limit),
        nextOffset: offset + limit < snapshot.length ? offset + limit : null,
      }, { headers: { "Cache-Control": "public, max-age=300" } });
    }
  }

  const cacheKey = `${city}:${category}`;
  let entry = cache.get(cacheKey);
  if (!entry || entry.expires <= Date.now()) {
    const results: Promise<Location[]> = fetchPlaces(city, category).catch(error => {
      const failed = cache.get(cacheKey);
      if (failed?.results === results) failed.expires = Date.now() + 30_000;
      throw error;
    });
    entry = { results, expires: Date.now() + 30 * 60_000 };
    cache.set(cacheKey, entry);
  }

  try {
    const locations = await entry.results;
    return Response.json({ locations: id ? locations.filter(place => place.id === id) : locations, nextOffset: null }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return Response.json({ error: "OpenStreetMap listings are temporarily unavailable." }, { status: 503 });
  }
}
