/* Deterministic demo fixtures for theGardener.ie.
   Only Kevin Whitty, the trading brand and the systems he named are sourced
   (17 September call). Every other name, price, recurrence and count here is a
   synthetic demo assumption. Money is integer euro cents throughout. */

export const DEMO = {
  date: "2026-10-19",
  time: "17:15",
  minutes: 17 * 60 + 15,
  tz: "Europe/Dublin",
  weekday: "Monday",
  label: "Demo snapshot · 19 Oct 2026",
  stamp: "Mon 19 Oct 2026, 17:15",
  brand: "theGardener.ie",
};

export type Route = "stripe" | "invoicehome";

export type TeamMember = {
  id: string; name: string; first: string; initials: string; role: string;
  email: string; field: boolean; sourced: boolean; tint: string; duties: string; perm: "Owner" | "Admin" | "Field team";
};

export const TEAM: TeamMember[] = [
  { id: "tm-kevin", name: "Kevin Whitty", first: "Kevin", initials: "KW", role: "Owner / Operations", email: "kevin@thegardener.ie", field: false, sourced: true, tint: "#a7c49d", perm: "Owner",
    duties: "Owns the business, pricing decisions, capacity and anything out of the ordinary." },
  { id: "tm-emma", name: "Emma Byrne", first: "Emma", initials: "EB", role: "Administration & Billing", email: "emma@thegardener.ie", field: false, sourced: false, tint: "#9fd6f0", perm: "Admin",
    duties: "Runs the daily charge sheet, Invoice Home invoices and ledger checks." },
  { id: "tm-sean", name: "Sean Murphy", first: "Sean", initials: "SM", role: "Field Team Lead", email: "sean@thegardener.ie", field: true, sourced: false, tint: "#e6c78a", perm: "Field team",
    duties: "Leads the field crew, confirms completions and handles weather calls." },
  { id: "tm-aoife", name: "Aoife Nolan", first: "Aoife", initials: "AN", role: "Senior Gardener", email: "aoife@thegardener.ie", field: true, sourced: false, tint: "#c8b4f0", perm: "Field team",
    duties: "Senior on hedge and specialist work; flags out-of-scope requests on site." },
  { id: "tm-daniel", name: "Daniel Kelly", first: "Daniel", initials: "DK", role: "Gardener", email: "daniel@thegardener.ie", field: true, sourced: false, tint: "#a8e0c0", perm: "Field team",
    duties: "Routine maintenance and garden tidies." },
  { id: "tm-patrick", name: "Patrick Doyle", first: "Patrick", initials: "PD", role: "Gardener", email: "patrick@thegardener.ie", field: true, sourced: false, tint: "#e2a08c", perm: "Field team",
    duties: "Routine maintenance and seasonal clearance." },
  { id: "tm-niamh", name: "Niamh Walsh", first: "Niamh", initials: "NW", role: "Gardener", email: "niamh@thegardener.ie", field: true, sourced: false, tint: "#f0c04b", perm: "Field team",
    duties: "Lawn care and weeding rounds." },
];
export const FIELD = TEAM.filter(t => t.field);
export const teamById = (id: string) => TEAM.find(t => t.id === id) as TeamMember;

/* Capacity assumption: five field staff × 8 hours × 5 days = 200 field hours. */
export const DAY_CAPACITY_MIN = FIELD.length * 8 * 60;
export const STAFF_DAY_MIN = 8 * 60;
export const TRAVEL_MIN = 15;

export const WEEK = [
  { date: "2026-10-19", dow: 1, short: "Mon", label: "Mon 19 Oct" },
  { date: "2026-10-20", dow: 2, short: "Tue", label: "Tue 20 Oct" },
  { date: "2026-10-21", dow: 3, short: "Wed", label: "Wed 21 Oct" },
  { date: "2026-10-22", dow: 4, short: "Thu", label: "Thu 22 Oct" },
  { date: "2026-10-23", dow: 5, short: "Fri", label: "Fri 23 Oct" },
];
export const LAST_WEEK = [
  { date: "2026-10-12", dow: 1, short: "Mon", label: "Mon 12 Oct" },
  { date: "2026-10-13", dow: 2, short: "Tue", label: "Tue 13 Oct" },
  { date: "2026-10-14", dow: 3, short: "Wed", label: "Wed 14 Oct" },
  { date: "2026-10-15", dow: 4, short: "Thu", label: "Thu 15 Oct" },
  { date: "2026-10-16", dow: 5, short: "Fri", label: "Fri 16 Oct" },
];
/* Booked hours per crew member (minutes). Tuesday leaves two hours free for three
   people and Friday's three flexible visits sit on top of full days, so the
   proposed move lands exactly: Friday 46 → 40 h, Tuesday 33 → 39 h. */
const FLEX_STAFF = ["tm-daniel", "tm-patrick", "tm-niamh"];
const STAFF_TARGETS: Record<string, Record<string, number>> = {
  "2026-10-20": { "tm-sean": 450, "tm-aoife": 450, "tm-daniel": 360, "tm-patrick": 360, "tm-niamh": 360 },
  "2026-10-21": { "tm-sean": 420, "tm-aoife": 420, "tm-daniel": 420, "tm-patrick": 420, "tm-niamh": 420 },
  "2026-10-22": { "tm-sean": 420, "tm-aoife": 420, "tm-daniel": 420, "tm-patrick": 420, "tm-niamh": 360 },
  "2026-10-23": { "tm-sean": 480, "tm-aoife": 480, "tm-daniel": 480, "tm-patrick": 480, "tm-niamh": 480 },
};
/* Booked field hours this week, in minutes. Mon 34 · Tue 33 · Wed 35 · Thu 34 · Fri 46 = 182 h. */
const DAY_TARGET_MIN: Record<string, number> = {
  "2026-10-19": 34 * 60, "2026-10-20": 33 * 60, "2026-10-21": 35 * 60, "2026-10-22": 34 * 60, "2026-10-23": 46 * 60,
};

export function mulberry(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6d2b79f5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const dayLabel = (iso: string) => {
  const d = new Date(iso + "T12:00:00Z");
  const D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return D + " " + d.getUTCDate() + " " + M;
};
export const longDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00Z");
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return d.getUTCDate() + " " + M + " " + d.getUTCFullYear();
};
export const hhmm = (min: number) => String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");

/* ── Demo rate card (illustrative, not Kevin's prices) ─────────────────────── */
export const RATES: Record<string, { label: string; cents: number; ref: string }> = {
  lawn: { label: "Lawn cut", cents: 7500, ref: "RATE-DEMO-LAWN" },
  weeding: { label: "Weeding, beds and borders", cents: 9000, ref: "RATE-DEMO-WEED" },
  hedge: { label: "Hedge trim", cents: 12000, ref: "RATE-DEMO-HEDGE" },
  leaves: { label: "Leaf clearance", cents: 15000, ref: "RATE-DEMO-LEAF" },
  edging: { label: "Lawn care and edging", cents: 18000, ref: "RATE-DEMO-EDGE" },
  tidy: { label: "Garden tidy", cents: 24000, ref: "RATE-DEMO-TIDY" },
  hedgeLarge: { label: "Hedge work, full boundary", cents: 36000, ref: "RATE-DEMO-HEDGE-XL" },
};
const RATE_KEYS = ["lawn", "weeding", "hedge", "leaves", "edging", "tidy"];

const FLEX_NAMES = ["Juniper Lodge", "Larch Court", "Clover Cottage"];

/* ── Places and people ─────────────────────────────────────────────────────── */
const AREAS = ["Rathgar", "Rathmines", "Terenure", "Dartry", "Milltown", "Ranelagh", "Churchtown", "Dundrum", "Rathfarnham",
  "Clonskeagh", "Donnybrook", "Ballsbridge", "Foxrock", "Cabinteely", "Killiney", "Dalkey", "Blackrock", "Stillorgan",
  "Sandyford", "Kilternan", "Enniskerry", "Glenageary"];

const FIRST = ["Siobhán", "Ciarán", "Orla", "Declan", "Aisling", "Conor", "Gráinne", "Eoin", "Clodagh", "Fergal", "Róisín",
  "Diarmuid", "Sinéad", "Cillian", "Méabh", "Ronan", "Deirdre", "Colm", "Fionnuala", "Pádraig", "Áine", "Donal", "Úna",
  "Brendan", "Caoimhe", "Tadhg", "Nuala", "Shane", "Eimear", "Lorcan", "Maeve", "Fintan", "Saoirse", "Rory", "Bríd", "Oisín",
  "Muireann", "Cathal", "Ailbhe", "Dara", "Ciara", "Killian", "Laoise", "Niall", "Treasa", "Eamon", "Sorcha", "Odhrán",
  "Fiona", "Aidan", "Ruth", "Gerard", "Helen", "Mark", "Claire", "Hugh", "Louise", "Brian", "Karen", "Philip", "Jane", "Simon"];
const LAST = ["O'Brien", "Kavanagh", "Fitzpatrick", "McCarthy", "Gallagher", "Doherty", "Brennan", "Flanagan", "Kennedy", "Lynch",
  "Moran", "Quinn", "Daly", "Hayes", "Ryan", "Costello", "Delaney", "Farrell", "Foley", "Geraghty", "Hennessy", "Keane",
  "Lawlor", "Mahon", "McGrath", "Mulligan", "Nugent", "O'Connell", "O'Donnell", "O'Neill", "O'Sullivan", "Power", "Redmond",
  "Sheridan", "Tierney", "Whelan", "Barry", "Cullen", "Devlin", "Egan", "Fahy", "Grogan", "Hogan", "Joyce", "Kinsella",
  "Lennon", "Maguire", "Nash", "Phelan", "Rooney", "Staunton", "Tobin", "Ward", "Coyle", "Corrigan", "Dolan", "Bergin",
  "Molloy", "Carey", "Harte"];

const PREFIX = ["Linden", "Alder", "Juniper", "Heather", "Bramble", "Thorn", "Larch", "Poplar", "Chestnut", "Hawthorn",
  "Primrose", "Bluebell", "Clover", "Lavender", "Magnolia", "Myrtle", "Rosemary", "Yew", "Aspen", "Woodbine", "Kestrel",
  "Rivermead", "Glebe", "Mount", "Seafield", "Belgrave", "Cypress", "Wisteria", "Fuchsia", "Sorrel", "Bracken", "Gorse",
  "Ardmore", "Knocklyon", "Avondale", "Glenart", "Clareville", "Weston", "Somerton", "Ashgrove"];
const SUFFIX = ["House", "Lodge", "Court", "Cottage", "View", "Hill", "Grove", "Lea", "Mews", "Hall", "Gate", "Croft", "Rise", "Lawn", "Park", "Manor"];

/* The 24 properties with visits today. Order = V-101 … V-124. */
const CANON = [
  ["Birch House", "contract", "stripe", "Rathgar"], ["Willow Court", "contract", "stripe", "Terenure"],
  ["Cedar House", "contract", "stripe", "Dartry"], ["Ashfield", "contract", "stripe", "Rathgar"],
  ["Rosebank", "contract", "stripe", "Milltown"], ["Glenwood", "contract", "stripe", "Churchtown"],
  ["Beech Lodge", "contract", "stripe", "Rathfarnham"], ["Fernhill", "contract", "stripe", "Dundrum"],
  ["Ivy House", "contract", "stripe", "Ranelagh"], ["Maple Court", "contract", "stripe", "Foxrock"],
  ["Hazelwood", "contract", "stripe", "Clonskeagh"], ["Brookfield", "contract", "stripe", "Terenure"],
  ["Laurel Lodge", "adhoc", "stripe", "Rathmines"], ["Rowan House", "adhoc", "stripe", "Rathgar"],
  ["Orchard View", "adhoc", "stripe", "Churchtown"], ["Hollybank", "adhoc", "stripe", "Dundrum"],
  ["Meadow House", "adhoc", "stripe", "Killiney"], ["The Elms", "adhoc", "invoicehome", "Dalkey"],
  ["Manor View", "adhoc", "invoicehome", "Foxrock"], ["Oak Lodge", "contract", "stripe", "Killiney"],
  ["Harbour House", "adhoc", "stripe", "Dalkey"], ["Sycamore House", "contract", "stripe", "Blackrock"],
  ["Foxglove Cottage", "adhoc", "stripe", "Rathfarnham"], ["Parkside", "adhoc", "stripe", "Terenure"],
] as const;

export type Customer = {
  id: string; name: string; email: string; status: "active" | "registered"; registeredOn: string;
  propertyIds: string[]; journey: string; area: string;
};
export type Property = {
  id: string; name: string; area: string; customerId: string; kind: "contract" | "adhoc"; route: Route;
  agreementId: string | null; window: string; flexible: boolean; size: string; access: string;
};
export type Recurrence = { rule: "weekly" | "2w" | "4w" | "2m" | "unclear"; label: string; sourceText: string };
export type Agreement = {
  id: string; propertyId: string; customerId: string; feeCents: number;
  periodStart: string; periodEnd: string; nextPaymentDate: string; effectiveFrom: string; reviewDate: string;
  recurrence: Recurrence; weekday: number; parity: number; stdMins: number; visitsPerYear: number;
  included: string[]; excluded: string[]; seasonal: string;
  evidence: { status: "paid" | "missing"; ref: string | null; date: string | null; cents: number };
};

const INCLUDED = ["Lawn mowing and edging", "Weeding of beds and borders", "Hedge trimming to the agreed height (up to 2 m)",
  "Seasonal leaf clearance on lawns and paths", "Green waste removal"];
const EXCLUDED = ["Hedge reduction or reshaping above the agreed height", "New planting and plant supply", "Tree surgery",
  "Hard landscaping and paving"];

const RULES: Record<string, Recurrence> = {
  weekly: { rule: "weekly", label: "Every week", sourceText: "weekly" },
  "2w": { rule: "2w", label: "Every 2 weeks", sourceText: "bi-weekly (confirmed as every 2 weeks)" },
  "4w": { rule: "4w", label: "Every 4 weeks", sourceText: "monthly (confirmed as every 4 weeks)" },
  "2m": { rule: "2m", label: "Every 2 months", sourceText: "every two months" },
  unclear: { rule: "unclear", label: "Needs recurrence clarification", sourceText: "bi-monthly" },
};

function slug(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}

function build() {
  const rnd = mulberry(20261019);

  /* names */
  const used = new Set<string>((CANON.map(c => c[0]) as string[]).concat(FLEX_NAMES, ["Primrose Hill"]));
  const genNames: string[] = [];
  let pi = 0;
  while (genNames.length < 226) {
    const n = PREFIX[pi % PREFIX.length] + " " + SUFFIX[(pi * 7 + Math.floor(pi / PREFIX.length)) % SUFFIX.length];
    pi++;
    if (used.has(n)) continue;
    used.add(n); genNames.push(n);
  }
  // k = 27 among the generated contract agreements is the Friday weekly visit with
  // missing completion evidence last week. Give it a name that reads well in the story.
  const PRIMROSE_K = 27;
  genNames[PRIMROSE_K] = "Primrose Hill";

  /* customers: 1,000 profiles. Pairs walk the name grid deterministically. */
  const customers: Customer[] = [];
  const seen = new Set<string>();
  let ci = 0;
  while (customers.length < 1000) {
    const f = FIRST[(ci * 17) % FIRST.length], l = LAST[(ci * 29 + Math.floor(ci / FIRST.length) * 3) % LAST.length];
    ci++;
    const name = f + " " + l;
    if (seen.has(name)) continue;
    seen.add(name);
    const n = customers.length + 1;
    const active = n <= 250;
    const mo = active ? 1 + Math.floor(rnd() * 108) : Math.floor(rnd() * 70);
    const regDate = new Date(Date.UTC(2026, 9, 12) - mo * 30.4 * 864e5).toISOString().slice(0, 10);
    const journeys = ["Registered, no consultation booked", "Consultation requested", "Consultation held, no plan chosen", "Registered via referral"];
    customers.push({
      id: "C-" + String(n).padStart(4, "0"), name, email: slug(f) + "." + slug(l) + "@example.test",
      status: active ? "active" : "registered", registeredOn: regDate, propertyIds: [],
      journey: active ? "Active service customer" : journeys[n % journeys.length], area: AREAS[(n * 5) % AREAS.length],
    });
  }

  /* properties: 250 active, one per active customer */
  const properties: Property[] = [];
  const sizes = ["Large garden", "Walled garden", "Front and rear gardens", "Extensive grounds", "Mature garden", "Courtyard and lawn"];
  const access = ["Side gate, key with customer", "Gate code held by customer (not stored)", "Rear lane access", "Driveway access", "Call on arrival"];
  for (let i = 0; i < 250; i++) {
    const id = "P-" + String(i + 1).padStart(3, "0");
    let name: string, kind: "contract" | "adhoc", route: Route, area: string;
    if (i < 24) { name = CANON[i][0]; kind = CANON[i][1]; route = CANON[i][2]; area = CANON[i][3]; }
    else if (i < 160) { name = genNames[i - 24]; kind = "contract"; route = "stripe"; area = AREAS[(i * 7) % AREAS.length]; }
    else { name = genNames[i - 24]; kind = "adhoc"; route = i % 8 === 3 ? "invoicehome" : "stripe"; area = AREAS[(i * 11) % AREAS.length]; }
    const cust = customers[i];
    cust.propertyIds.push(id);
    properties.push({ id, name, area, customerId: cust.id, kind, route, agreementId: null,
      window: kind === "contract" ? "Agreed weekday" : (i % 3 === 0 ? "Tue–Fri" : "Mon–Fri"), flexible: false,
      size: sizes[i % sizes.length], access: access[i % access.length] });
  }

  /* agreements: 150, one per contract property */
  const agreements: Agreement[] = [];
  const CANON_RULE: Record<string, "weekly" | "2w"> = {
    "Birch House": "2w", "Willow Court": "weekly", "Cedar House": "2w", "Ashfield": "weekly", "Rosebank": "2w",
    "Glenwood": "weekly", "Beech Lodge": "2w", "Fernhill": "weekly", "Ivy House": "2w", "Maple Court": "weekly",
    "Hazelwood": "2w", "Brookfield": "2w", "Oak Lodge": "weekly", "Sycamore House": "2w",
  };
  const CANON_MINS: Record<string, number> = {
    "Birch House": 75, "Willow Court": 60, "Cedar House": 60, "Ashfield": 45, "Rosebank": 75, "Glenwood": 60,
    "Beech Lodge": 60, "Fernhill": 45, "Ivy House": 60, "Maple Court": 75, "Hazelwood": 45, "Brookfield": 60,
    "Oak Lodge": 60, "Sycamore House": 45,
  };
  const QUARTERS = [
    { start: "2026-08-01", end: "2026-10-31", next: "2026-11-01", paid: "2026-08-01" },
    { start: "2026-09-01", end: "2026-11-30", next: "2026-12-01", paid: "2026-09-01" },
    { start: "2026-10-01", end: "2026-12-31", next: "2027-01-01", paid: "2026-10-01" },
  ];
  const contractProps = properties.filter(p => p.kind === "contract");
  contractProps.forEach((p, idx) => {
    const n = idx + 1;
    const id = "AGR-" + String(n).padStart(3, "0");
    const k = idx - 14; // index among generated agreements
    let rule: Recurrence["rule"], weekday: number, parity: number, stdMins: number;
    if (k < 0) { rule = CANON_RULE[p.name]; weekday = 1; parity = 1; stdMins = CANON_MINS[p.name]; }
    else {
      rule = (k === 7 || k === 61) ? "unclear" : k % 45 === 22 ? "2m" : k % 13 === 6 ? "4w" : (k % 9 === 0 || k % 9 === 4) ? "weekly" : "2w";
      weekday = 2 + (k % 4); parity = Math.floor(k / 4) % 2; stdMins = [60, 75, 45, 90, 60][k % 5];
    }
    const q = n === 1 ? QUARTERS[0] : QUARTERS[n % 3];
    const fee = n === 1 ? 195000
      : rule === "weekly" ? 240000 + (n % 7) * 15000
      : rule === "2w" ? 120000 + (n % 6) * 15000
      : rule === "4w" ? 65000 + (n % 3) * 12500 : rule === "2m" ? 45000 : 60000;
    const effYear = 2019 + (n % 7);
    const effMonth = q.start.slice(5, 7);
    const effectiveFrom = effYear + "-" + effMonth + "-01";
    // Annual review on the anniversary, next one from today.
    const monthIdx = (Number(effMonth) - 1 + ((n * 5) % 12)) % 12;
    let reviewDate = new Date(Date.UTC(2026, monthIdx, 1 + (n % 27))).toISOString().slice(0, 10);
    if (reviewDate < DEMO.date) reviewDate = new Date(Date.UTC(2027, monthIdx, 1 + (n % 27))).toISOString().slice(0, 10);
    const missing = n === 47 || n === 112;
    const evidence = missing
      ? { status: "missing" as const, ref: null, date: null, cents: fee }
      : { status: "paid" as const, ref: "DEMO-QTR-" + String(n).padStart(3, "0"), date: q.paid, cents: fee };
    const excluded = EXCLUDED.slice();
    agreements.push({
      id, propertyId: p.id, customerId: p.customerId, feeCents: fee,
      periodStart: q.start, periodEnd: q.end, nextPaymentDate: q.next, effectiveFrom, reviewDate,
      recurrence: RULES[rule], weekday, parity, stdMins,
      visitsPerYear: rule === "weekly" ? 50 : rule === "2w" ? 25 : rule === "4w" ? 13 : rule === "2m" ? 6 : 0,
      included: INCLUDED.slice(), excluded,
      seasonal: rule === "weekly" ? "Weekly Mar–Nov, every 2 weeks Dec–Feb (demo plan)"
        : rule === "unclear" ? "Plan held until the interval is confirmed" : "Leaf clearance included Oct–Nov (demo plan)",
      evidence,
    });
    p.agreementId = id;
  });

  return { customers, properties, agreements };
}

const BUILT = build();
export const CUSTOMERS = BUILT.customers;
export const PROPERTIES = BUILT.properties;
export const AGREEMENTS = BUILT.agreements;
export const propById = (id: string) => PROPERTIES.find(p => p.id === id) as Property;
export const propByName = (n: string) => PROPERTIES.find(p => p.name === n) as Property;
export const custById = (id: string) => CUSTOMERS.find(c => c.id === id) as Customer;
export const agrById = (id: string | null) => (id ? AGREEMENTS.find(a => a.id === id) || null : null);

/* ── Visits ────────────────────────────────────────────────────────────────── */
export type LineDef = {
  id: string; label: string; basis: "included" | "chargeable" | "unpriced";
  cents: number | null; evidence: string; evidenceRef: string | null;
};
export type Visit = {
  id: string; occurrenceKey: string; seriesId: string; propertyId: string; date: string; originalDate: string;
  staffId: string; order: number; serviceMins: number; travelMins: number; service: string;
  kind: "contract" | "adhoc"; outcome: "scheduled" | "completed" | "rescheduled" | "cancelled";
  outcomeNote: string; rescheduledTo: string | null; flexible: boolean; lines: LineDef[];
  completion: { by: string; at: string; note: string; confirmedBy: string; method: string } | null;
};

type CanonVisit = [string, number, string, string, number, number]; // id, propIdx, staff, outcome, serviceMins, order
const CANON_VISITS: CanonVisit[] = [
  ["V-119", 18, "tm-sean", "completed", 150, 0], ["V-110", 9, "tm-sean", "completed", 75, 1], ["V-101", 0, "tm-sean", "completed", 75, 2], ["V-122", 21, "tm-sean", "rescheduled", 45, 3],
  ["V-120", 19, "tm-aoife", "completed", 105, 0], ["V-117", 16, "tm-aoife", "completed", 105, 1], ["V-105", 4, "tm-aoife", "completed", 75, 2], ["V-102", 1, "tm-aoife", "completed", 60, 3],
  ["V-118", 17, "tm-daniel", "completed", 120, 0], ["V-116", 15, "tm-daniel", "completed", 90, 1], ["V-103", 2, "tm-daniel", "completed", 60, 2], ["V-106", 5, "tm-daniel", "completed", 60, 3], ["V-124", 23, "tm-daniel", "cancelled", 30, 4],
  ["V-121", 20, "tm-patrick", "completed", 90, 0], ["V-115", 14, "tm-patrick", "completed", 75, 1], ["V-107", 6, "tm-patrick", "completed", 60, 2], ["V-109", 8, "tm-patrick", "completed", 60, 3], ["V-104", 3, "tm-patrick", "completed", 45, 4],
  ["V-114", 13, "tm-niamh", "completed", 60, 0], ["V-113", 12, "tm-niamh", "completed", 45, 1], ["V-108", 7, "tm-niamh", "completed", 45, 2], ["V-111", 10, "tm-niamh", "completed", 45, 3], ["V-112", 11, "tm-niamh", "completed", 60, 4], ["V-123", 22, "tm-niamh", "rescheduled", 45, 5],
];

const ROUTINE = "Routine maintenance (lawn, beds, edging)";
const NOTES = ["Lawn cut and edged, beds weeded, clippings removed.", "Leaves cleared from lawn and paths, beds tidied.",
  "Edges strimmed, borders weeded, green waste taken away.", "Lawn cut, hedges checked, paths swept."];

function canonLines(v: CanonVisit, p: Property): { service: string; lines: LineDef[] } {
  const id = v[0];
  const agr = p.agreementId;
  const incl = (label: string): LineDef => ({ id: id + "-L1", label, basis: "included", cents: 0,
    evidence: "Included in " + agr + " routine scope", evidenceRef: agr });
  const rate = (key: string): LineDef => ({ id: id + "-L1", label: RATES[key].label, basis: "chargeable", cents: RATES[key].cents,
    evidence: "Demo rate card", evidenceRef: RATES[key].ref });
  switch (id) {
    case "V-113": return { service: RATES.lawn.label, lines: [rate("lawn")] };
    case "V-114": return { service: RATES.weeding.label, lines: [rate("weeding")] };
    case "V-115": return { service: RATES.hedge.label, lines: [rate("hedge")] };
    case "V-116": return { service: RATES.leaves.label, lines: [rate("leaves")] };
    case "V-117": return { service: RATES.edging.label, lines: [rate("edging")] };
    case "V-118": return { service: RATES.tidy.label, lines: [rate("tidy")] };
    case "V-119": return { service: RATES.hedgeLarge.label, lines: [rate("hedgeLarge")] };
    case "V-120": return { service: ROUTINE + " + extra hedge work", lines: [
      incl(ROUTINE),
      { id: "V-120-L2", label: "Extra hedge work: boundary hedge reduced below agreed height", basis: "unpriced", cents: null,
        evidence: "Outside " + agr + " scope (hedge reduction excluded). No quote or rate on file.", evidenceRef: null },
    ] };
    case "V-121": return { service: "Autumn garden tidy", lines: [{ id: "V-121-L1", label: "Autumn garden tidy", basis: "chargeable",
      cents: 21000, evidence: "Accepted demo quote", evidenceRef: "Q-DEMO-0418" }] };
    case "V-123": return { service: RATES.lawn.label, lines: [rate("lawn")] };
    case "V-124": return { service: RATES.hedge.label + ", front", lines: [rate("hedge")] };
    default: return { service: ROUTINE, lines: [incl(ROUTINE)] };
  }
}

function buildVisits() {
  const visits: Visit[] = [];
  /* Monday: the 24 canonical visits. */
  CANON_VISITS.forEach((cv, i) => {
    const p = PROPERTIES[cv[1]];
    const { service, lines } = canonLines(cv, p);
    const series = "gcal-ser-" + p.id.toLowerCase();
    const outcome = cv[3] as Visit["outcome"];
    const note = cv[0] === "V-120" ? "Routine visit done. Customer asked on site for the boundary hedge to be reduced; done and photographed. Not in the agreed scope."
      : cv[0] === "V-121" ? "Autumn tidy finished. Customer paid the accepted quote in advance on 18 Oct."
      : NOTES[i % NOTES.length];
    visits.push({
      id: cv[0], occurrenceKey: series + "_20261019", seriesId: series, propertyId: p.id, date: DEMO.date, originalDate: DEMO.date,
      staffId: cv[2], order: cv[5], serviceMins: cv[4], travelMins: TRAVEL_MIN, service, kind: p.kind, outcome,
      outcomeNote: outcome === "rescheduled" ? "Weather deferral: waterlogged ground after overnight rain. Moved by Sean Murphy at 08:05."
        : outcome === "cancelled" ? "Customer cancelled by phone at 08:40 (logged by Emma Byrne). No call-out charge in this demo." : "",
      rescheduledTo: cv[0] === "V-122" ? "2026-10-26 10:00" : cv[0] === "V-123" ? "2026-10-26 14:00" : null,
      flexible: false, lines,
      completion: outcome === "completed" ? { by: cv[2], at: "", note, confirmedBy: cv[2], method: "Field completion note (demo)" } : null,
    });
  });

  /* Tue–Fri and last week: contract occurrences from the agreements, ad-hoc work to fill the booked hours. */
  const adhoc = PROPERTIES.filter(p => p.kind === "adhoc" && Number(p.id.slice(2)) > 24);
  let adhocCursor = 0;
  const occurs = (a: Agreement, weekParity: number) =>
    a.recurrence.rule === "weekly" ? true
    : a.recurrence.rule === "2w" ? a.parity === weekParity
    : a.recurrence.rule === "4w" ? (Number(a.id.slice(4)) % 4) === (weekParity ? 3 : 1)
    : a.recurrence.rule === "2m" ? (Number(a.id.slice(4)) % 2) === weekParity
    : (Number(a.id.slice(4)) % 2) === weekParity;

  const genDay = (day: { date: string; dow: number }, weekParity: number, target: number | null, past: boolean) => {
    const tag = day.date.slice(5, 7) + day.date.slice(8, 10);
    let n = 0;
    const out: Visit[] = [];
    const mk = (p: Property, serviceMins: number, service: string, lines: LineDef[], flexible: boolean): Visit => {
      n++;
      const id = "V-" + tag + "-" + String(n).padStart(2, "0");
      const series = "gcal-ser-" + p.id.toLowerCase();
      return { id, occurrenceKey: series + "_" + day.date.replace(/-/g, ""), seriesId: series, propertyId: p.id, date: day.date,
        originalDate: day.date, staffId: "", order: n, serviceMins, travelMins: TRAVEL_MIN, service, kind: p.kind,
        outcome: past ? "completed" : "scheduled", outcomeNote: "", rescheduledTo: null, flexible, lines,
        completion: past ? { by: "", at: "", note: NOTES[n % NOTES.length], confirmedBy: "", method: "Field completion note (demo)" } : null };
    };
    if (!(day.dow === 1 && !past)) {
      AGREEMENTS.filter(a => a.weekday === day.dow && occurs(a, weekParity) && (past || Number(a.id.slice(4)) > 14)).forEach(a => {
        const p = propById(a.propertyId);
        out.push(mk(p, a.stdMins, ROUTINE, [{ id: "", label: ROUTINE, basis: "included", cents: 0, evidence: "Included in " + a.id + " routine scope", evidenceRef: a.id }], false));
      });
    }
    const adhocLine = (p: Property, key: string): LineDef[] => [{ id: "", label: RATES[key].label, basis: "chargeable", cents: RATES[key].cents, evidence: "Demo rate card", evidenceRef: RATES[key].ref }];
    const caps = target ? STAFF_TARGETS[day.date] : null;
    const load: Record<string, number> = {}; FIELD.forEach(f => (load[f.id] = 0));
    const put = (v: Visit, staff: string) => {
      v.staffId = staff; load[staff] += v.serviceMins + v.travelMins;
      if (v.completion) { v.completion.by = staff; v.completion.confirmedBy = staff; }
    };
    if (caps) {
      // Contract occurrences first, longest first, onto whoever has the most room left.
      out.slice().sort((a, b) => (b.serviceMins - a.serviceMins) || (a.order - b.order)).forEach(v => {
        const room = (id: string) => caps[id] - load[id];
        const fits = FIELD.filter(f => { const r = room(f.id) - v.serviceMins - v.travelMins; return r === 0 || r >= 60; });
        const pick = (fits.length ? fits : FIELD).slice().sort((a, b) => room(b.id) - room(a.id))[0];
        put(v, pick.id);
      });
      // Then each crew member's day is topped up with ad-hoc work to their booked hours.
      const cycle = [60, 90, 75, 105, 45, 120];
      let c = 0;
      FIELD.forEach(f => {
        let remaining = caps[f.id] - load[f.id];
        if (remaining < 0) throw new Error("fixture overflow " + day.date + " " + f.id);
        while (remaining > 0) {
          const p = adhoc[adhocCursor % 80]; adhocCursor++;
          let block = cycle[c++ % cycle.length] + TRAVEL_MIN;
          if (remaining - block < 60) block = remaining;
          const key = RATE_KEYS[(adhocCursor + c) % RATE_KEYS.length];
          const v = mk(p, block - TRAVEL_MIN, RATES[key].label, adhocLine(p, key), false);
          out.push(v); put(v, f.id);
          remaining -= block;
        }
      });
      // Friday's three flexible visits sit at the end of three crew days, so moving
      // them never shifts a contracted slot.
      if (day.date === "2026-10-23") {
        FLEX_NAMES.forEach((nm, fi) => {
          const p = adhoc[80 + fi];
          p.name = nm; p.window = "Tue–Fri"; p.flexible = true;
          const key = ["hedge", "tidy", "edging"][fi];
          const v = mk(p, 105, RATES[key].label + " (flexible)", adhocLine(p, key), true);
          v.order = 99; out.push(v); put(v, FLEX_STAFF[fi]);
        });
      }
    } else {
      for (let k = 0; k < 5; k++) {
        const p = adhoc[adhocCursor % 80]; adhocCursor++;
        const key = RATE_KEYS[(adhocCursor + k) % RATE_KEYS.length];
        out.push(mk(p, [60, 75, 90, 45, 105][k], RATES[key].label, adhocLine(p, key), false));
      }
      out.slice().sort((a, b) => (b.serviceMins - a.serviceMins) || (a.order - b.order)).forEach(v => {
        put(v, FIELD.slice().sort((a, b) => load[a.id] - load[b.id])[0].id);
      });
    }
    const seq: Record<string, number> = {};
    out.slice().sort((a, b) => a.order - b.order).forEach(v => { seq[v.staffId] = (seq[v.staffId] || 0) + 1; v.order = seq[v.staffId]; });
    out.forEach(v => v.lines.forEach((l, li) => (l.id = v.id + "-L" + (li + 1))));
    return out;
  };

  WEEK.slice(1).forEach(d => visits.push(...genDay(d, 1, DAY_TARGET_MIN[d.date], false)));
  const history: Visit[] = [];
  LAST_WEEK.forEach(d => history.push(...genDay(d, 0, null, true)));
  // Last week's exceptions: one weather deferral, one cancellation, one completion with no note.
  const hv = (date: string, nth: number) => history.filter(v => v.date === date)[nth];
  const d1 = hv("2026-10-13", 3); d1.outcome = "rescheduled"; d1.completion = null; d1.outcomeNote = "Weather deferral, rebooked for Tue 20 Oct."; d1.rescheduledTo = "2026-10-20";
  const d2 = hv("2026-10-15", 5); d2.outcome = "cancelled"; d2.completion = null; d2.outcomeNote = "Customer away; cancelled the day before.";
  const prim = history.find(v => v.date === "2026-10-16" && propById(v.propertyId).name === "Primrose Hill");
  if (prim) { prim.completion = null; prim.outcome = "scheduled"; prim.outcomeNote = "No completion note was submitted. Calendar shows the booking only."; }
  return { visits, history, primroseId: prim ? prim.id : "" };
}

const BV = buildVisits();
export const VISITS: Visit[] = BV.visits;
export const HISTORY_VISITS: Visit[] = BV.history;
export const PRIMROSE_VISIT = BV.primroseId;
export const FLEX_IDS = VISITS.filter(v => v.flexible).map(v => v.id);
export const visitById = (id: string) => VISITS.find(v => v.id === id) || HISTORY_VISITS.find(v => v.id === id) || null;

/* Day sheets: sequential times per crew member from 08:00. */
export function layoutDay(list: Visit[]) {
  const by: Record<string, Visit[]> = {};
  list.forEach(v => { (by[v.staffId] = by[v.staffId] || []).push(v); });
  const out: Record<string, { start: number; serviceStart: number; end: number }> = {};
  Object.keys(by).forEach(s => {
    let t = 8 * 60;
    by[s].sort((a, b) => a.order - b.order).forEach(v => {
      out[v.id] = { start: t, serviceStart: t + v.travelMins, end: t + v.travelMins + v.serviceMins };
      t += v.travelMins + v.serviceMins;
    });
  });
  return out;
}
// Completion times for Monday and last week come from the crew sheets.
(() => {
  const all = VISITS.concat(HISTORY_VISITS);
  const days = Array.from(new Set(all.map(v => v.date)));
  days.forEach(d => {
    const t = layoutDay(all.filter(v => v.date === d));
    all.filter(v => v.date === d && v.completion).forEach(v => { if (v.completion) v.completion.at = hhmm(t[v.id].end); });
  });
})();

/* ── Google Calendar import rows (simulated): 25 rows → 24 unique visits ──── */
export type RawImport = { rawId: string; batch: string; importedAt: string; occurrenceKey: string; title: string; start: string; note: string };
export const RAW_IMPORTS: RawImport[] = (() => {
  const t = layoutDay(VISITS.filter(v => v.date === DEMO.date));
  const rows: RawImport[] = VISITS.filter(v => v.date === DEMO.date).sort((a, b) => a.id.localeCompare(b.id)).map((v, i) => ({
    rawId: "CAL-RAW-" + String(i + 1).padStart(4, "0"), batch: "IMP-1019-0730", importedAt: "07:30",
    occurrenceKey: v.occurrenceKey, title: propById(v.propertyId).name + " · " + v.service, start: hhmm(t[v.id].serviceStart), note: "",
  }));
  const dup = rows.find(r => r.title.startsWith("Laurel Lodge")) as RawImport;
  rows.push({ rawId: "CAL-RAW-0025", batch: "IMP-1019-0745", importedAt: "07:45", occurrenceKey: dup.occurrenceKey,
    title: "Laurel Lodge · Lawn cut (event edited)", start: dup.start,
    note: "Same occurrence key as " + dup.rawId + ". The event was edited after the 07:30 import, so it came through twice." });
  return rows;
})();

/* ── Payments, ledger and invoices: history and the seeded state ────────── */
export type Payment = { id: string; ref: string; cents: number; date: string; method: "stripe" | "invoicehome";
  allocations: { lineId: string; cents: number }[]; recordedBy: string; recordedAt: string; simulated: boolean; note: string };
export type LedgerRow = { id: string; paymentRef: string; cents: number; date: string; addedAt: string };
export type Invoice = { id: string; ref: string; lineId: string; cents: number; issuedOn: string; dueOn: string;
  status: "awaiting" | "paid"; recordedBy: string; recordedAt: string; propertyId: string };
export type Sheet = { date: string; items: { lineId: string; propertyId: string; label: string; cents: number; route: Route; status: string; ref: string }[];
  exportedAt: string; exportedBy: string; processedBy: string; decisions: string[] };

export const HISTORY = (() => {
  const payments: Payment[] = [];
  const ledger: LedgerRow[] = [];
  const invoices: Invoice[] = [];
  const sheets: Sheet[] = [];
  let pn = 0, inv = 180;
  LAST_WEEK.forEach((d, di) => {
    const lines = HISTORY_VISITS.filter(v => v.date === d.date && v.outcome === "completed")
      .flatMap(v => v.lines.filter(l => l.basis === "chargeable").map(l => ({ v, l })));
    const items: Sheet["items"] = [];
    lines.forEach(({ v, l }, li) => {
      const p = propById(v.propertyId);
      if (p.route === "stripe") {
        pn++;
        const ref = "DEMO-PAY-H" + String(pn).padStart(3, "0");
        payments.push({ id: "PAY-H" + pn, ref, cents: l.cents as number, date: d.date, method: "stripe",
          allocations: [{ lineId: l.id, cents: l.cents as number }], recordedBy: "tm-emma", recordedAt: d.date + " 17:4" + (li % 10), simulated: true, note: "" });
        const lag = di === 4 && li === 0;
        ledger.push({ id: "LED-H" + pn, paymentRef: ref, cents: l.cents as number, date: lag ? LAST_WEEK[4].date : d.date,
          addedAt: lag ? "2026-10-17 09:12" : d.date + " 17:5" + (li % 10) });
        items.push({ lineId: l.id, propertyId: p.id, label: l.label, cents: l.cents as number, route: "stripe", status: "Payment recorded · ledger matched", ref });
      } else {
        inv++;
        const ref = "IH-DEMO-" + String(inv).padStart(4, "0");
        const paid = di < 3;
        invoices.push({ id: "INV-H" + inv, ref, lineId: l.id, cents: l.cents as number, issuedOn: d.date,
          dueOn: new Date(Date.parse(d.date + "T12:00:00Z") + 14 * 864e5).toISOString().slice(0, 10),
          status: paid ? "paid" : "awaiting", recordedBy: "tm-emma", recordedAt: d.date + " 17:35", propertyId: p.id });
        if (paid) {
          pn++;
          payments.push({ id: "PAY-H" + pn, ref: "DEMO-BANK-" + String(pn).padStart(3, "0"), cents: l.cents as number,
            date: new Date(Date.parse(d.date + "T12:00:00Z") + 3 * 864e5).toISOString().slice(0, 10), method: "invoicehome",
            allocations: [{ lineId: l.id, cents: l.cents as number }], recordedBy: "tm-emma", recordedAt: d.date, simulated: true, note: "Bank transfer against " + ref });
        }
        items.push({ lineId: l.id, propertyId: p.id, label: l.label, cents: l.cents as number, route: "invoicehome",
          status: paid ? "Invoice recorded · paid" : "Invoice recorded · awaiting payment", ref });
      }
    });
    sheets.push({ date: d.date, items, exportedAt: "17:3" + di, exportedBy: "tm-emma", processedBy: "tm-emma",
      decisions: di === 1 ? ["Weather deferral excluded from the sheet (rebooked Tue 20 Oct)"]
        : di === 3 ? ["Cancelled visit excluded, no call-out charge"]
        : di === 4 ? ["Primrose Hill held: no completion note (contract visit, nothing to charge)"] : [] });
  });
  // One Sheets row was typed with the wrong amount, so the ledger has a mismatch to show.
  const mm = ledger[5];
  if (mm) mm.cents = Math.round(mm.cents / 10);
  // Harbour House: paid in advance on 18 Oct, no ledger row yet.
  payments.push({ id: "PAY-021", ref: "DEMO-PAY-021", cents: 21000, date: "2026-10-18", method: "stripe",
    allocations: [{ lineId: "V-121-L1", cents: 21000 }], recordedBy: "tm-emma", recordedAt: "2026-10-18 19:02", simulated: true,
    note: "Accepted quote Q-DEMO-0418 paid in advance through the existing Stripe flow." });
  return { payments, ledger, invoices, sheets };
})();

/* ── Files (local previews, no downloads) ─────────────────────────────────── */
export const FILES = [
  { id: "fl-rate", folder: "Pricing", name: "Rate card, demo 2026.pdf", title: "Rate card (demo)", type: "PDF · 2 pages", added: "6 Jan 2026", owner: "tm-kevin",
    body: ["Illustrative prices used by this demo only: lawn cut €75, weeding €90, hedge trim €120, leaf clearance €150, lawn care and edging €180, garden tidy €240, full boundary hedge work €360.",
      "These are not Kevin's real prices. A real build would read rates from the Laravel admin or a confirmed price list."],
    links: ["Laurel Lodge", "Manor View", "Daily charge sheet"] },
  { id: "fl-agr001", folder: "Agreements", name: "AGR-001 Birch House summary.pdf", title: "AGR-001 · Birch House", type: "PDF · 1 page", added: "1 Aug 2026", owner: "tm-emma",
    body: ["Quarterly agreement, every 2 weeks. Demo fee €1,950 for 1 Aug to 31 Oct 2026, paid in advance (DEMO-QTR-001). Next quarterly payment date 1 Nov 2026, collected through the existing Stripe flow, not by Pulse.",
      "Included: lawn mowing and edging, weeding, hedge trimming to the agreed height, seasonal leaf clearance, green waste removal. Routine visits carry no extra charge."],
    links: ["Birch House", "AGR-001", "V-101"] },
  { id: "fl-agr013", folder: "Agreements", name: "AGR-013 Oak Lodge summary.pdf", title: "AGR-013 · Oak Lodge", type: "PDF · 1 page", added: "1 Sep 2026", owner: "tm-emma",
    body: ["Weekly quarterly agreement. Hedge trimming is included up to the agreed height of 2 m.",
      "Excluded: hedge reduction or reshaping above the agreed height. Today's boundary hedge reduction (V-120) falls under this exclusion, so it needs its own price."],
    links: ["Oak Lodge", "AGR-013", "V-120"] },
  { id: "fl-q0418", folder: "Quotes", name: "Q-DEMO-0418 Harbour House.pdf", title: "Quote Q-DEMO-0418 · Harbour House", type: "PDF · 1 page", added: "14 Oct 2026", owner: "tm-kevin",
    body: ["Autumn garden tidy, €210, accepted 15 Oct and paid in advance on 18 Oct (DEMO-PAY-021).",
      "Work completed 19 Oct (V-121). Already paid, so it never enters the ready queue."],
    links: ["Harbour House", "DEMO-PAY-021", "V-121"] },
  { id: "fl-notes", folder: "Visit notes", name: "V-120 Oak Lodge field note.txt", title: "Field note · V-120 Oak Lodge", type: "Text note", added: "19 Oct 2026, 10:05", owner: "tm-aoife",
    body: ["Routine visit done. Customer asked on site for the boundary hedge to be reduced; done and photographed. Not in the agreed scope.",
      "Submitted by Aoife Nolan from the field. Completion confirmed; price not agreed on site."],
    links: ["Oak Lodge", "V-120", "Aoife Nolan"] },
  { id: "fl-weather", folder: "Visit notes", name: "Weather deferrals 19 Oct.txt", title: "Weather deferrals · 19 Oct", type: "Text note", added: "19 Oct 2026, 08:05", owner: "tm-sean",
    body: ["Sycamore House (V-122) and Foxglove Cottage (V-123) deferred: ground waterlogged after overnight rain.",
      "Both rebooked for Mon 26 Oct. The original calendar occurrence keys are kept, so neither appears twice."],
    links: ["Sycamore House", "Foxglove Cottage", "V-122", "V-123"] },
  { id: "fl-recur", folder: "Agreements", name: "Recurrence terms, needs clarification.txt", title: "Recurrence terms to clarify", type: "Text note", added: "2 Oct 2026", owner: "tm-kevin",
    body: ["Two agreements use the word bi-monthly in the source calendar. That can mean twice a month or every two months, so Pulse does not guess.",
      "Until Kevin confirms the interval, those series show as Needs recurrence clarification."],
    links: ["AGR-022", "AGR-076"] },
];
