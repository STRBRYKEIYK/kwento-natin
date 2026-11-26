// Writes public/places.json from src/data.js, so the Library calendar (a different project) can show the same
// highlights, budget and checklist for a date without keeping its own copy of the places.
import { writeFileSync, mkdirSync } from "node:fs";
import { CATEGORIES, ALL_PLACES, TIERS, ZONES, BUDGET_NOTE, CHECK_NOTE, checklistFor, GENERIC_CHECKLIST } from "../src/data.js";

const places = {};
for (const p of ALL_PLACES) {
  const cat = CATEGORIES.find((c) => c.id === p.catId);
  places[p.id] = {
    name: p.name, area: p.area, zone: ZONES[p.zone] || "", cat: cat.title, vibe: cat.vibe,
    highlights: p.highlights, budget: p.budget, checklist: checklistFor({ pid: p.id })
  };
}
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/places.json", import.meta.url), JSON.stringify({ v: 1, tiers: TIERS, budgetNote: BUDGET_NOTE, checkNote: CHECK_NOTE, generic: GENERIC_CHECKLIST, places }, null, 1) + "\n");
console.log(`places.json: ${Object.keys(places).length} places`);
