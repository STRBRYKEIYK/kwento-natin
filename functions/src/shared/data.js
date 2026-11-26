// Curated date ideas. Every category also offers "Chica's Pick" (a custom place).
//
// Per place:  id, name, area, zone (how far from Rizal), budget (1-3, see TIERS), highlights, and optional `extra`
// checklist items on top of the category's own list.
// The budget is a rough guess for two people, food and entrance included, fare not. Opening days change, so the ticket
// always reminds her to check before going.

export const ZONES = {
  rizal: "Malapit sa Rizal",
  metro: "Metro Manila",
  far: "Day trip"
};

export const TIERS = {
  1: { sign: "₱", label: "Tipid", range: "Hanggang ₱1,500" },
  2: { sign: "₱₱", label: "Katamtaman", range: "₱1,500 – ₱3,500" },
  3: { sign: "₱₱₱", label: "Pa-special", range: "₱3,500 pataas" }
};
export const BUDGET_NOTE = "Tantya lang para sa dalawa, kasama ang pagkain at entrance. Wala pa ang pamasahe.";
export const CHECK_NOTE = "Paki-check ang oras ng bukas bago pumunta.";

export const CATEGORIES = [
  {
    id: "urban",
    short: "City & malls",
    title: "Urban Adventures & Grand Malls",
    vibe: "Bustling, massive variety, bright city lights.",
    glow: "#ff5c8a",
    checklist: ["Cash at GCash", "Powerbank", "Magaan na jacket (malamig sa loob ng mall)", "Komportableng sapatos"],
    places: [
      { id: "moa", name: "SM Mall of Asia (MOA)", area: "Seaside Blvd, Pasay", zone: "metro", budget: 2, highlights: ["Sunset by the bay", "Ice skating", "Food hall"] },
      { id: "bgc", name: "Bonifacio High Street", area: "BGC, Taguig", zone: "metro", budget: 3, highlights: ["Open-air window shopping", "Upscale dining", "Walking the strip"] },
      { id: "megamall", name: "SM Megamall", area: "Ortigas, Mandaluyong", zone: "metro", budget: 2, highlights: ["Mega Fashion Hall", "Ice skating", "Endless food choices"] }
    ]
  },
  {
    id: "chill",
    short: "Chill",
    title: "Chill & Familiar",
    vibe: "Laid-back, nostalgic, easy-going mall dates.",
    glow: "#ffb25b",
    checklist: ["Cash at GCash", "Powerbank", "Magaan na jacket (malamig sa loob ng mall)", "Payong"],
    places: [
      { id: "sta-lucia", name: "Sta. Lucia Mall", area: "Marikina-Infanta Hwy, Cainta", zone: "rizal", budget: 2, highlights: ["Bowling at Phase 1/2", "Casual dining", "Relaxing at iL Centro"] },
      { id: "robinsons-antipolo", name: "Robinsons Antipolo", area: "Sumulong Hwy, Antipolo", zone: "rizal", budget: 2, highlights: ["Quiet movie date", "Transport-friendly", "Breezy alfresco spots"] },
      { id: "up-town", name: "UP Town Center", area: "Katipunan Ave, Quezon City", zone: "metro", budget: 2, highlights: ["Campus vibe", "Great cafes", "Open walkways"] }
    ]
  },
  {
    id: "scenic",
    short: "Nature walks",
    title: "Scenic Walk Trips & Nature Breeze",
    vibe: "Outdoor breeze, walking hand-in-hand, active and relaxed.",
    glow: "#ff8a5b",
    checklist: ["Tubig", "Sunscreen o payong", "Pamalit na damit", "Bug spray", "Cash para sa entrance at pagkain", "Komportableng sapatos"],
    places: [
      { id: "riverbanks", name: "Riverbanks Center", area: "Barangka, Marikina", zone: "rizal", budget: 1, highlights: ["Riverside sunset stroll", "Biking", "Amphitheater picnic"] },
      { id: "taktak", name: "Hinulugang Taktak", area: "Taktak Rd, Antipolo", zone: "rizal", budget: 1, highlights: ["Nature walk", "Waterfalls viewing", "Quiet escape"] },
      { id: "qmc", name: "Quezon Memorial Circle", area: "Elliptical Rd, Diliman", zone: "metro", budget: 1, highlights: ["Rent a tandem bike", "Night market food stalls", "Park picnic"] },
      { id: "pililla", name: "Pililla Wind Farm", area: "Pililla, Rizal", zone: "rizal", budget: 1, highlights: ["Windmills along the Laguna de Bay hills", "Golden hour views", "Open breeze and big sky"], extra: ["Sombrero o payong (walang masisilungan)"] },
      { id: "daranak", name: "Daranak Falls", area: "Tanay, Rizal", zone: "rizal", budget: 1, highlights: ["Cool falls and a swim", "Batlag Falls nearby", "Picnic by the water"], extra: ["Pamalit na damit at tuwalya", "Pang-swimming", "Water shoes o tsinelas"] },
      { id: "tagaytay", name: "Tagaytay Picnic Grove", area: "Tagaytay, Cavite", zone: "far", budget: 2, highlights: ["Taal Volcano view", "Cool breeze", "Zipline and picnic spots"], extra: ["Jacket (malamig sa Tagaytay)", "Agahan sa biyahe (malayo-layo)"] }
    ]
  },
  {
    id: "food",
    short: "Food crawl",
    title: "Cultural & Culinary Food Crawls",
    vibe: "Flavorful walk trips, historic spots, eating all day.",
    glow: "#f7a8d0",
    checklist: ["Gutom na tiyan", "Cash (maliliit na kainan)", "Wet wipes", "Komportableng sapatos", "Powerbank"],
    places: [
      { id: "binondo", name: "Binondo", area: "Manila", zone: "metro", budget: 2, highlights: ["Xiao long bao at Dong Bei", "Fried siopao on Ongpin", "Coffee at 1919 Grand Cafe"] },
      { id: "lilac", name: "Lilac Street", area: "Concepcion Dos, Marikina", zone: "rizal", budget: 2, highlights: ["Suburban food crawl", "Artisan cafes", "Hole-in-the-wall eats"] },
      { id: "kapitolyo", name: "Kapitolyo Food Hub", area: "Pasig", zone: "metro", budget: 2, highlights: ["Trendy gastropubs", "Hidden gems", "Taco and burger spots"] },
      { id: "intramuros", name: "Intramuros", area: "Manila", zone: "metro", budget: 1, highlights: ["Fort Santiago and the old walls", "San Agustin Church and Casa Manila", "A kalesa ride, then merienda"], extra: ["Payong (mainit sa kalye)", "Tubig"] },
      { id: "manam", name: "Manam at The Triangle", area: "Ayala Triangle Gardens, Makati", zone: "metro", budget: 2, highlights: ["Comfort Filipino dishes to share", "Stroll through Ayala Triangle Gardens", "Dessert to end it"] }
    ]
  },
  {
    id: "art",
    short: "Art & quiet",
    title: "Art, Museums & Quiet Corners",
    vibe: "Slow wandering, little galleries, and a coffee after.",
    glow: "#7fb7ff",
    checklist: ["Komportableng sapatos", "Cash o GCash para sa entrance", "Phone na may space para sa litrato", "Powerbank"],
    places: [
      { id: "pinto", name: "Pinto Art Museum", area: "Antipolo, Rizal", zone: "rizal", budget: 2, highlights: ["White Mediterranean-style galleries", "Garden paths and contemporary art", "Photos at every corner"] },
      { id: "cubao-expo", name: "Cubao Expo", area: "Cubao, Quezon City", zone: "metro", budget: 1, highlights: ["Vintage and antique shops", "Indie cafes", "Street art on the walls"] },
      { id: "angono", name: "Angono Art Walk", area: "Angono, Rizal", zone: "rizal", budget: 1, highlights: ["Blanco Family Museum and Nemiranda Arthouse", "Street art around town", "Lakeside merienda"] }
    ]
  },
  {
    id: "intimate",
    short: "Staycation",
    title: "Intimate Escapes & Staycations",
    vibe: "Private, cozy, uninterrupted time together.",
    glow: "#b38cff",
    checklist: ["Valid ID", "Pamalit na damit", "Toiletries", "Powerbank", "Cash at card"],
    places: [
      { id: "ava", name: "Hotel Ava", area: "Pasay or Malate", zone: "metro", budget: 3, highlights: ["Movie marathon", "Ordering room service", "Thematic rooms"] }
    ]
  }
];

export const ALL_PLACES = CATEGORIES.flatMap((c) => c.places.map((p) => ({ ...p, catId: c.id, catTitle: c.title })));

const norm = (s) => String(s || "").trim().toLowerCase();

// The curated place behind a plan: by its id when we have it, else by its name.
export function findPlace(plan) {
  if (!plan) return null;
  const byId = plan.pid ? ALL_PLACES.find((p) => p.id === plan.pid) : null;
  const p = byId || ALL_PLACES.find((x) => norm(x.name) === norm(plan.place));
  if (!p) return null;
  const cat = CATEGORIES.find((c) => c.id === p.catId);
  return { place: p, cat };
}

// What to bring: the category's list plus the place's own extras. A custom place gets a short general list.
export const GENERIC_CHECKLIST = ["Cash at GCash", "Powerbank", "Payong o jacket", "Komportableng sapatos"];
export function checklistFor(plan) {
  const f = findPlace(plan);
  if (!f) return GENERIC_CHECKLIST;
  return [...f.cat.checklist, ...(f.place.extra || [])];
}

export const budgetFor = (plan) => {
  const f = findPlace(plan);
  return f ? { tier: f.place.budget, ...TIERS[f.place.budget] } : null;
};

function buildTimes() {
  const out = [];
  for (let m = 9 * 60; m <= 22 * 60; m += 30) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    out.push(`${h12}:${min === 0 ? "00" : "30"} ${h24 < 12 ? "AM" : "PM"}`);
  }
  return out;
}
export const TIMES = buildTimes();
