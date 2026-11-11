import type { Location } from "./locations";

const businessClasses = new Set([
  "shop", "grocery", "clothing_store", "restaurant", "fast_food", "cafe", "bar", "pub",
  "lodging", "cinema", "bank", "pharmacy", "laundry", "alcohol_shop",
]);

export function mapListing(properties: Record<string, unknown>, coordinates: number[], city: string): Location | undefined {
  if (typeof properties.class !== "string" || !businessClasses.has(properties.class)) return;
  const name = properties["name:en"] || properties.name_en || properties.name;
  if (typeof name !== "string" || !name.trim()) return;
  const [lon, lat] = coordinates;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
  const key = `tile-${name}-${lat.toFixed(5)}-${lon.toFixed(5)}`;
  const kind = String(properties.subclass || properties.class);
  return {
    id: key,
    name,
    category: kind.replaceAll("_", " ").replace(/^./, letter => letter.toUpperCase()),
    area: city,
    coordinates: [lon, lat],
    source: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`,
    website: { status: "unknown" },
  };
}
