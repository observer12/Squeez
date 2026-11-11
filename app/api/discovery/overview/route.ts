import { gunzipSync } from "node:zlib";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import { unstable_cache } from "next/cache";
import { mapListing } from "../../../explore/map-listings";
import type { Location } from "../../../explore/locations";

const zoom = 14;
const world = 2 ** zoom;
const extent = { west: 90.375, east: 90.436, south: 23.735, north: 23.821 };
const maxListings = 300;
const tileX = (longitude: number) => Math.floor((longitude + 180) / 360 * world);
const tileY = (latitude: number) => {
  const radians = latitude * Math.PI / 180;
  return Math.floor((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 * world);
};

async function readTile(x: number, y: number, limit: number) {
  const url = `https://tiles.openfreemap.org/planet/latest/${zoom}/${x}/${y}.pbf`;
  const response = await fetch(url, { next: { revalidate: 86_400 }, signal: AbortSignal.timeout(9000) });
  if (!response.ok) return [];
  const bytes = new Uint8Array(await response.arrayBuffer());
  const buffer = bytes[0] === 31 && bytes[1] === 139 ? gunzipSync(bytes) : bytes;
  const layer = new VectorTile(new PbfReader(buffer)).layers.poi;
  if (!layer) return [];

  const listings: Location[] = [];
  for (let index = 0; index < layer.length && listings.length < limit; index++) {
    const feature = layer.feature(index);
    if (feature.type !== 1) continue;
    const { geometry, properties } = feature.toGeoJSON(x, y, zoom);
    if (geometry.type !== "Point") continue;
    const [lon, lat] = geometry.coordinates;
    if (lon < extent.west || lon > extent.east || lat < extent.south || lat > extent.north) continue;
    // Drop buffered features that belong to another tile.
    if (tileX(lon) !== x || tileY(lat) !== y) continue;
    const listing = mapListing(properties ?? {}, geometry.coordinates, "Dhaka");
    if (listing) listings.push(listing);
  }
  return listings;
}

const readOverview = unstable_cache(async () => {
  const tiles: [number, number][] = [];
  for (let x = tileX(extent.west); x <= tileX(extent.east); x++) {
    for (let y = tileY(extent.north); y <= tileY(extent.south); y++) tiles.push([x, y]);
  }
  const perTile = Math.ceil(maxListings / tiles.length);
  const results = await Promise.allSettled(tiles.map(([x, y]) => readTile(x, y, perTile)));
  const unique = new Map<string, Location>();
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const listing of result.value) unique.set(listing.id, listing);
  }
  if (!unique.size) throw new Error("No Dhaka overview listings");
  return [...unique.values()].slice(0, maxListings);
}, ["dhaka-business-overview"], { revalidate: 86_400 });

export async function GET() {
  try {
    return Response.json({ locations: await readOverview() }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ locations: [] }, { status: 503 });
  }
}
