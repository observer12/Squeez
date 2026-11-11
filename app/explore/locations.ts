export type Location = {
  id: string;
  name: string;
  area: string;
  category: "Department store" | "Market";
  coordinates: [longitude: number, latitude: number];
  source: string;
};

export const londonCenter: [number, number] = [-0.121, 51.513];

export const locations: Location[] = [
  { id: "liberty", name: "Liberty London", area: "Soho", category: "Department store", coordinates: [-0.1402, 51.5139], source: "https://www.wikidata.org/wiki/Q3237793" },
  { id: "harrods", name: "Harrods", area: "Knightsbridge", category: "Department store", coordinates: [-0.1635, 51.499611], source: "https://www.wikidata.org/wiki/Q332474" },
  { id: "fortnum", name: "Fortnum & Mason", area: "Piccadilly", category: "Department store", coordinates: [-0.1384, 51.5083], source: "https://www.wikidata.org/wiki/Q498563" },
  { id: "spitalfields", name: "Old Spitalfields Market", area: "Spitalfields", category: "Market", coordinates: [-0.075278, 51.519444], source: "https://www.wikidata.org/wiki/Q43470" },
];
