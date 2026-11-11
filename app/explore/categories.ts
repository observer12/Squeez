type CategoryGroup = {
  label: string;
  entries: Record<string, [key: string, ...values: string[]]>;
};

export const categoryGroups: CategoryGroup[] = [
  { label: "Food and hospitality", entries: {
    Restaurant: ["amenity", "restaurant", "fast_food", "food_court"],
    Cafe: ["amenity", "cafe"],
    Bakery: ["shop", "bakery", "confectionery"],
    Hotel: ["tourism", "hotel", "guest_house", "hostel", "motel", "resort"],
    Catering: ["craft", "caterer"],
  }},
  { label: "Retail and wholesale", entries: {
    "Clothing store": ["shop", "clothes", "shoes", "boutique", "fashion", "fabric"],
    "Electronics store": ["shop", "electronics", "computer", "mobile_phone", "appliance"],
    "Grocery store": ["shop", "supermarket", "convenience", "greengrocer", "butcher"],
    "Department store": ["shop", "department_store"],
    "Shopping centre": ["shop", "mall"],
    Market: ["amenity", "marketplace"],
    "Home and hardware": ["shop", "furniture", "hardware", "doityourself", "interior_decoration"],
    "Book and stationery shop": ["shop", "books", "stationery"],
    "Jewellery shop": ["shop", "jewelry", "watches"],
    Wholesale: ["shop", "wholesale", "trade"],
  }},
  { label: "Health, beauty and fitness", entries: {
    "Beauty salon": ["shop", "beauty", "hairdresser", "cosmetics", "massage", "nails"],
    "Fitness centre": ["leisure", "fitness_centre", "sports_centre"],
    Hospital: ["amenity", "hospital"],
    "Clinic and diagnostics": ["healthcare", "clinic", "laboratory", "diagnostics", "doctor"],
    Dentist: ["amenity", "dentist"],
    Pharmacy: ["amenity", "pharmacy"],
    Veterinary: ["amenity", "veterinary"],
  }},
  { label: "Finance, education and professional services", entries: {
    Bank: ["amenity", "bank"],
    "Insurance and finance": ["office", "insurance", "financial", "financial_advisor", "money_lender"],
    "School and training centre": ["amenity", "school", "college", "language_school", "training"],
    University: ["amenity", "university"],
    "Legal and accounting": ["office", "lawyer", "notary", "accountant", "tax_advisor"],
    "Real estate": ["office", "estate_agent", "property_management"],
    "Technology services": ["office", "it", "telecommunication", "web_design"],
    "Marketing and design": ["office", "advertising_agency", "marketing", "graphic_design"],
    "Engineering and construction": ["office", "engineer", "architect", "construction_company"],
  }},
  { label: "Travel, transport and industry", entries: {
    "Travel agency": ["shop", "travel_agency"],
    "Courier and logistics": ["office", "courier", "logistics", "moving_company"],
    "Vehicle sales and repair": ["shop", "car", "car_repair", "car_parts", "motorcycle", "tyres"],
    "Home repair and trades": ["craft", "carpenter", "electrician", "plumber", "painter", "hvac", "welder"],
    "Factory and manufacturing": ["industrial", "factory", "manufacturing", "warehouse"],
    "Agricultural supplies": ["shop", "agrarian", "farm"],
    Cinema: ["amenity", "cinema"],
    "Events and venues": ["amenity", "events_venue", "conference_centre", "banquet_hall"],
  }},
];

const definitions = categoryGroups.flatMap(group => Object.entries(group.entries));

export function directoryCategory(tags: Record<string, string>) {
  return definitions.find(([, [key, ...values]]) => values.includes(tags[key]))?.[0];
}

export function directorySelectors() {
  const keys = new Map<string, string[]>();
  for (const [, [key, ...values]] of definitions) {
    keys.set(key, [...(keys.get(key) ?? []), ...values]);
  }
  return [...keys].map(([key, values]) => `["${key}"~"^(${values.join("|")})$"]`);
}
