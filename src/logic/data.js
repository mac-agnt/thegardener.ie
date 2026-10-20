import { TEAM, PROPERTIES, CUSTOMERS } from "../gardener/fixtures";

/* Demo data and pure helpers for Pulse, re-skinned for theGardener.ie. Everything here is synthetic demo data. */

const INK="var(--ink)", BODY="var(--body)", DIM="var(--dim)", FAINT="var(--faint)";
const LIME="var(--accent)", GREEN="var(--ok)", AMBER="var(--warn)", RED="var(--bad)", NEUTRAL="var(--neutral)";
const MONO="var(--mono)";

const ICONS = {
  navHome:"M12 3.2 3.6 9.1v10a1.5 1.5 0 0 0 1.5 1.5h13.8a1.5 1.5 0 0 0 1.5-1.5v-10L12 3.2Z M8.9 13.1h2l1-2.6 1.5 5 1.1-2.4h1.6",
  navAgents:"M12 2.4v2.3 M12 2.4a.9.9 0 1 0 0-.02 M8.2 6.5h7.6A2.2 2.2 0 0 1 18 8.7v5.1a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 13.8V8.7a2.2 2.2 0 0 1 2.2-2.2Z M9.9 10.6v1.4 M14.1 10.6v1.4 M6 10h-1.9 M18 10h1.9 M9.2 18.6h5.6 M9.2 21.2h5.6",
  navDash:"M4 5.6h7.2v5.1H4V5.6Z M13.6 5.6H20v8.6h-6.4V5.6Z M4 13.1h7.2v5.3H4v-5.3Z M13.6 16.6H20v1.8h-6.4v-1.8Z",
  navWork:"M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v1.1h2.4A1.6 1.6 0 0 1 20 8.5v9.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6V8.5a1.6 1.6 0 0 1 1.6-1.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4Z M8 6.9h8 M9.6 13.3l1.8 1.8 3.4-3.6",
  navRecords:"M12 3.6c3.9 0 7 1.1 7 2.5S15.9 8.6 12 8.6 5 7.5 5 6.1 8.1 3.6 12 3.6Z M5 6.1v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.1 M5 11.8v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5.7",
  navActivity:"M4.6 4.6h14.8A1.6 1.6 0 0 1 21 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 17.8V6.2a1.6 1.6 0 0 1 1.6-1.6Z M6 12.4h2.2l1.5-4.1 2.3 8 1.9-5.4 1.2 1.5H18",
  navAdmin:"M12 2.9 5 5.6v5.9c0 4 2.8 7.1 7 8.6 4.2-1.5 7-4.6 7-8.6V5.6L12 2.9Z M12 8.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z M8.8 16.3a3.6 3.6 0 0 1 6.4 0",
  helios:"M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.9A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M8 12h1.6l1.2-2.6 1.6 5 1.4-2.4H16",
  inbox:"M3 13h4l1.5 3h7l1.5-3h4 M3 13l2.4-7A2 2 0 0 1 7.3 4.6h9.4a2 2 0 0 1 1.9 1.4L21 13v4.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z",
  work:"M6 4.6h12a1.6 1.6 0 0 1 1.6 1.6v12.2A1.6 1.6 0 0 1 18 20H6a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 6 4.6Z M8.4 10.4l1.9 1.9 3.9-3.9 M8.4 15.6h7.2",
  approvals:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  insights:"M4.5 19.5V13 M9.7 19.5V7.5 M14.9 19.5v-8 M20 19.5V5",
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  orgs:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5 M7.5 15.5h2.5",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  locations:"M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  visits:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M9 13.5l1.6 1.6 3.4-3.4",
  autos:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  agents:"M8.5 3.6h7A2.4 2.4 0 0 1 17.9 6v5.6a2.4 2.4 0 0 1-2.4 2.4h-7A2.4 2.4 0 0 1 6.1 11.6V6a2.4 2.4 0 0 1 2.4-2.4Z M9.6 8.2h.01 M14.4 8.2h.01 M12 14v2.6 M7.6 20.4h8.8 M12 16.6c-2.4 0-4.4 1.7-4.4 3.8h8.8c0-2.1-2-3.8-4.4-3.8Z",
  dash:"M4.4 4.4h6v6h-6v-6Z M13.6 4.4h6v3.6h-6V4.4Z M13.6 11.6h6v8h-6v-8Z M4.4 14h6v5.6h-6V14Z",
  files:"M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z",
  pulseLine:"M2.5 12.5h3.6l2.1-6.4 3.2 12.2 2.6-8.4 1.8 2.6h5.7",
  records:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  tree:"M4.5 6h5 M4.5 12h5 M4.5 18h5 M12.5 6h7 M12.5 12h7 M12.5 18h7",
  graph:"M7 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M17.6 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M9.4 21.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M8.6 6.4l7.6 2.6 M15.8 11.4l-5.6 5.2",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  navCharge:"M6.5 3.5h11v17l-2.2-1.5-2.2 1.5-2.1-1.5-2.2 1.5-2.3-1.5V3.5Z M9 8h6 M9 11.5h6 M9 15h3.5",
  navProperty:"M3.8 11 12 4.2l8.2 6.8 M6 9.4v10.1h12V9.4 M10 19.5v-5h4v5"
};

/* Ontology stays first and is never removed (PulseLogic enforces this too). */
const REC_SECTIONS = [
  {id:"ontology", label:"Ontology", blurb:"How every record connects: customer, property, agreement, visit, charge, payment and ledger."},
  {id:"files", label:"Files", blurb:"Agreement summaries, the demo rate card, quotes and visit notes, with local previews."},
  {id:"contacts", label:"Contacts", blurb:"Customer contacts and the people who run the business, in one list."},
  {id:"customers", label:"Customers", blurb:"1,000 registered profiles: 250 active service customers and 750 registration-only."},
  {id:"team", label:"Team", blurb:"Seven people and what each of them owns."}
];

/* Team contacts plus the customers behind today's story properties. Customer
   addresses are fictional example.test addresses; team addresses are demo
   addresses never used for outbound actions. */
const CONTACT_PROPS = [["Birch House","agreement"],["Oak Lodge","needs price"],["Harbour House","paid"],["The Elms","invoice home"],
  ["Manor View","invoice home"],["Laurel Lodge","ad-hoc"],["Willow Court","agreement"],["Hollybank","ad-hoc"]];
const CONTACTS = TEAM.slice(0, 4).map(t => [t.name, t.role, t.email, "theGardener.ie", "team", t.tint])
  .concat(CONTACT_PROPS.map(([n, tag], i) => {
    const p = PROPERTIES.find(x => x.name === n), c = CUSTOMERS.find(x => x.id === p.customerId);
    return [c.name, "Customer · " + n, c.email, n + ", " + p.area, tag, ["#a8e0c0","#f0c04b","#9fd6f0","#e2a08c"][i % 4]];
  }));

const FILE_TREE = [
  {type:"folder", id:"f-agr", name:"Agreements", depth:0},
  {type:"file", id:"fl-1", name:"AGR-001 Birch House summary.pdf", depth:1, parent:"f-agr", indexed:true,
   path:"Agreements / Quarterly", title:"AGR-001 · Birch House",
   facts:[["TYPE","PDF · 1 page"],["ADDED","1 Aug 2026"],["INDEXED","Yes"],["OWNER","Emma Byrne"]],
   body:["Quarterly agreement, every 2 weeks. Demo fee €1,950 for 1 Aug to 31 Oct 2026, paid in advance (DEMO-QTR-001). The next quarterly payment date is 1 Nov 2026, taken through the existing Stripe flow, not by Pulse.",
     "Included: lawn mowing and edging, weeding, hedge trimming to the agreed height, seasonal leaf clearance and green waste removal. Routine visits carry no extra charge, and the fee is never divided per visit."],
   links:[["Birch House","property"],["AGR-001","agreement"],["V-101","visit"]]},
  {type:"file", id:"fl-2", name:"AGR-013 Oak Lodge summary.pdf", depth:1, parent:"f-agr", indexed:true,
   path:"Agreements / Quarterly", title:"AGR-013 · Oak Lodge",
   facts:[["TYPE","PDF · 1 page"],["ADDED","1 Sep 2026"],["INDEXED","Yes"],["OWNER","Emma Byrne"]],
   body:["Weekly quarterly agreement. Hedge trimming is included up to the agreed height of 2 m.",
     "Excluded: hedge reduction or reshaping above the agreed height. Today's boundary hedge reduction (V-120) falls under this exclusion, so it needs its own price before it can be charged."],
   links:[["Oak Lodge","property"],["AGR-013","agreement"],["V-120","visit"]]},
  {type:"file", id:"fl-3", name:"Recurrence terms to clarify.txt", depth:1, parent:"f-agr", indexed:true,
   path:"Agreements / Notes", title:"Recurrence terms to clarify",
   facts:[["TYPE","Text note"],["ADDED","2 Oct 2026"],["INDEXED","Yes"],["OWNER","Kevin Whitty"]],
   body:["Two agreements use the word bi-monthly in the source calendar. That can mean twice a month or every two months, so Pulse does not guess.",
     "Until the interval is confirmed, AGR-022 and AGR-076 show as Needs recurrence clarification."],
   links:[["AGR-022","agreement"],["AGR-076","agreement"]]},
  {type:"folder", id:"f-price", name:"Pricing and quotes", depth:0},
  {type:"file", id:"fl-4", name:"Rate card, demo 2026.pdf", depth:1, parent:"f-price", indexed:true,
   path:"Pricing / Rate card", title:"Rate card (demo)",
   facts:[["TYPE","PDF · 2 pages"],["ADDED","6 Jan 2026"],["INDEXED","Yes"],["OWNER","Kevin Whitty"]],
   body:["Illustrative prices used by this demo only: lawn cut €75, weeding €90, hedge trim €120, leaf clearance €150, lawn care and edging €180, garden tidy €240, full boundary hedge work €360.",
     "These are not Kevin's real prices. A real build would read rates from the Laravel admin or a confirmed price list."],
   links:[["Laurel Lodge","property"],["Manor View","property"],["Daily charge sheet","page"]]},
  {type:"file", id:"fl-5", name:"Q-DEMO-0418 Harbour House.pdf", depth:1, parent:"f-price", indexed:true,
   path:"Pricing / Quotes", title:"Quote Q-DEMO-0418 · Harbour House",
   facts:[["TYPE","PDF · 1 page"],["ADDED","14 Oct 2026"],["INDEXED","Yes"],["OWNER","Kevin Whitty"]],
   body:["Autumn garden tidy, €210, accepted 15 Oct and paid in advance on 18 Oct (DEMO-PAY-021).",
     "Work completed 19 Oct (V-121). Already paid, so it never enters the ready queue. The Sheets ledger row is still missing."],
   links:[["Harbour House","property"],["DEMO-PAY-021","payment"],["V-121","visit"]]},
  {type:"folder", id:"f-notes", name:"Visit notes", depth:0},
  {type:"file", id:"fl-6", name:"V-120 Oak Lodge field note.txt", depth:1, parent:"f-notes", indexed:true,
   path:"Visit notes / 19 Oct", title:"Field note · V-120 Oak Lodge",
   facts:[["TYPE","Text note"],["ADDED","19 Oct 2026, 10:05"],["INDEXED","Yes"],["OWNER","Aoife Nolan"]],
   body:["Routine visit done. Customer asked on site for the boundary hedge to be reduced; done and photographed. Not in the agreed scope.",
     "Submitted by Aoife Nolan. Completion confirmed; price not agreed on site."],
   links:[["Oak Lodge","property"],["V-120","visit"],["Aoife Nolan","person"]]},
  {type:"file", id:"fl-7", name:"Weather deferrals 19 Oct.txt", depth:1, parent:"f-notes", indexed:true,
   path:"Visit notes / 19 Oct", title:"Weather deferrals · 19 Oct",
   facts:[["TYPE","Text note"],["ADDED","19 Oct 2026, 08:05"],["INDEXED","Yes"],["OWNER","Sean Murphy"]],
   body:["Sycamore House (V-122) and Foxglove Cottage (V-123) deferred: ground waterlogged after overnight rain.",
     "Both rebooked for Mon 26 Oct. The original calendar occurrence keys are kept, so neither can appear twice."],
   links:[["Sycamore House","property"],["Foxglove Cottage","property"]]},
  {type:"file", id:"fl-8", name:"Charge sheet 16 Oct (export).csv", depth:1, parent:"f-notes", indexed:false,
   path:"Exports / Charge sheets", title:"Charge sheet export · 16 Oct",
   facts:[["TYPE","CSV · demo export"],["ADDED","16 Oct 2026, 17:34"],["INDEXED","Not indexed"],["OWNER","Emma Byrne"]],
   body:["Friday's processed sheet as exported by Emma. Spreadsheets are stored but not indexed by default.",
     "The amounts Pulse quotes come from the visit and payment records, not from exported files."],
   links:[["Daily charge sheet","page"]]}
];

const ONTO_NODES = [
  ["Customer","entity",500,300,1,"A registered person. One customer can hold several properties."],
  ["Property","entity",300,190,1,"Where the work happens. Area only; no exact address is stored in the demo."],
  ["Agreement","entity",700,190,1,"Quarterly agreement: fee, included scope, effective dates, payment evidence."],
  ["Visit","entity",250,430,1,"One calendar occurrence, keyed so it can never be counted twice."],
  ["Billing line","entity",690,430,1,"Included, chargeable or unpriced. Prices sit here, not on the customer."],
  ["Exception","entity",850,320,0,"Anything a person must decide, with an owner, a due date and a task."],
  ["Payment","ledger",390,95,0,"Read-only Stripe payment evidence, allocated explicitly to lines."],
  ["Ledger entry","ledger",620,95,0,"The Google Sheets row the existing connector writes after a charge."],
  ["Completion","module",860,470,0,"Crew note or a person's confirmation. Time passing is not evidence."],
  ["File","entity",140,300,0,"Agreement summaries, quotes and notes attached to any record."],
  ["holds","predicate",395,240,0,"Customer → Property."],
  ["covered by","predicate",605,240,0,"Property → Agreement."],
  ["scheduled as","predicate",360,370,0,"Property → Visit."],
  ["billed as","predicate",600,370,0,"Visit → Billing line."],
  ["attached to","predicate",140,372,0,"File → anything."]
];

const ONTO_EDGES = [
  [500,300,300,190],[500,300,700,190],[500,300,250,430],[500,300,690,430],
  [500,300,850,320],[500,300,390,95],[500,300,620,95],[500,300,140,300],
  [300,190,250,430],[700,190,860,470],[690,430,850,320],[690,430,860,470],
  [300,190,140,300],[390,95,620,95]
];

const REC_TEMPLATES = [
  ["Field sheet","Records","Labelled fields in a grid, the default for a person, organisation or location.",
   "M5 5.5h14v13H5v-13Z M5 10h14 M12 10v8.5","grid"],
  ["Contact card","Records","A portrait, key fields and every linked record in one compact panel.",
   "M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M5.5 19c.8-3 3.3-4.7 6.5-4.7s5.7 1.7 6.5 4.7","card"],
  ["Directory","Records","A sortable table of many records at once, built for lists.",
   "M4.5 6.5h15 M4.5 12h15 M4.5 17.5h15 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01","rows"],
  ["Timeline","Case work","Ordered events with who did what and when. Good for a case or a claim.",
   "M12 3.5v17 M12 7.5h6 M12 13h-6 M12 18h6","timeline"],
  ["Kanban board","Case work","Cards in columns by status. For anything that moves through stages.",
   "M5 5h4.5v14H5V5Z M9.75 5h4.5v9h-4.5V5Z M14.5 5H19v6h-4.5V5Z","kanban"],
  ["Checklist","Case work","Ticked steps in order, with an owner and a due date on each.",
   "M5 6.5h2l1.4 1.4L11 5.5 M5 12.5h2l1.4 1.4 2.6-2.4 M5 18.5h2l1.4 1.4 2.6-2.4 M15 6.5h4 M15 12.5h4 M15 18.5h4","checklist"],
  ["Ledger","Finance","Rows and running totals. For anything with amounts and dates.",
   "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17","ledger"],
  ["Invoice","Finance","Line items, totals and a status, built to be sent, not just stored.",
   "M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3","invoice"],
  ["Document","Notes","Long-form text with linked records pulled out down the side.",
   "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4","document"],
  ["Gallery","Notes","A wall of images and files with a caption on each, for a site or a job.",
   "M4.5 6h6v6h-6V6Z M13.5 6h6v6h-6V6Z M4.5 14h6v4h-6v-4Z M13.5 14h6v4h-6v-4Z","gallery"],
  ["Map & locations","Ops","A pinboard of places, with the record's fields beside each pin.",
   "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z","map"],
  ["Schedule","Ops","A calendar of bookings against this record, with recurring rules.",
   "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z","schedule"]
];
const REC_TEMPLATE_CATS = ["All","Records","Case work","Finance","Notes","Ops"];

/* ---- admin hub ---- */
/* ---- admin hub: 13 settings areas in five groups ---- */
const PEOPLE = [
  ["Kevin Whitty","Owner / Operations","kevin@thegardener.ie","Rathgar","active","Owner","Now"],
  ["Emma Byrne","Administration & Billing","emma@thegardener.ie","Rathgar","active","Admin","4 min ago"],
  ["Sean Murphy","Field Team Lead","sean@thegardener.ie","Field","active","Field team","1 h ago"],
  ["Aoife Nolan","Senior Gardener","aoife@thegardener.ie","Field","active","Field team","2 h ago"],
  ["Daniel Kelly","Gardener","daniel@thegardener.ie","Field","active","Field team","3 h ago"],
  ["Patrick Doyle","Gardener","patrick@thegardener.ie","Field","active","Field team","3 h ago"],
  ["Niamh Walsh","Gardener","niamh@thegardener.ie","Field","active","Field team","2 h ago"]
];
const ROLE_LEVELS = ["Owner","Admin","Field team"];
const PERM_KEYS = [["view","View records"],["edit","Edit records"],["approve","Decide exceptions"]];
const GRANT_DEFS = [
  ["view","View records","Read anything in scope"],
  ["edit","Edit records","Create and change records"],
  ["approve","Decide exceptions","Prices, moves, scope calls"],
  ["pay","Record payments","Log outcomes of manual charges"],
  ["export","Export data","Download charge sheets"],
  ["agents","Manage agents","Create and grant agents"],
  ["settings","Change settings","Systems, roles, AI controls"],
  ["audit","Read the activity log","Every action, everyone"]
];
const ROLE_SCOPES = ["All records","Assigned visits only","Billing records only"];
const DEFAULT_PERMS = {Owner:{view:true,edit:true,approve:true}, Admin:{view:true,edit:true,approve:false},
  "Field team":{view:true,edit:false,approve:false}};
/* The five systems named on the call plus the unnamed connector. Every status
   is a demo state; there are no live connections or credentials. */
const INTEGRATIONS = [
  {name:"Google Calendar", blurb:"Source of scheduled visits, recurrence and crew. Pulse reads occurrences; completion still comes from a person.", tint:"#4285f4", status:"simulated sync", statusKind:"warn",
   glyph:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z",
   lastSync:"12:30 (simulated)", usage:"25 rows today · 1 duplicate", auth:"Not connected (demo)", scopes:["Read"]},
  {name:"Laravel admin", blurb:"Kevin's existing custom admin, kept as is. The demo stands in for its customers, properties and prices; fields and access are unverified.", tint:"#ff2d20", status:"not connected", statusKind:"off",
   glyph:"M4 7.5 12 4l8 3.5-8 3.5L4 7.5Z M4 12l8 3.5 8-3.5 M4 16.5 12 20l8-3.5",
   lastSync:"—", usage:"Customers, properties, rates (demo copies)", auth:"Integration access unverified", scopes:[]},
  {name:"Stripe", blurb:"Existing payment flow. Pulse shows read-only mock payment records and never creates a charge.", tint:"#635bff", status:"read only (mock)", statusKind:"warn",
   glyph:"M14.5 7.5c-.8-.6-1.9-1-3.1-1-2 0-3.4 1-3.4 2.5 0 3.6 6.6 2 6.6 5.5 0 1.6-1.5 2.8-3.7 2.8-1.4 0-2.8-.5-3.7-1.3 M12 4v2.5 M12 17.3V20",
   lastSync:"17:00 (mock)", usage:"Payment evidence only", auth:"No keys stored", scopes:["Read"]},
  {name:"Google Sheets ledger", blurb:"The ledger the existing connector fills after each Stripe charge. Pulse compares it with payment evidence.", tint:"#0f9d58", status:"read only (mock)", statusKind:"warn",
   glyph:"M6 3.5h8l4 4v13H6v-17Z M8.5 11h7 M8.5 14h7 M8.5 17h7 M11.5 11v6",
   lastSync:"09:00 (mock)", usage:"1 row missing · 1 amount mismatch", auth:"Not connected (demo)", scopes:["Read"]},
  {name:"Stripe → Sheets connector", blurb:"Existing connector, provider unconfirmed. It writes a ledger row after a Stripe charge; the demo simulates its lag.", tint:"var(--accent)", status:"provider unconfirmed", statusKind:"warn",
   glyph:"M4 12h5 M15 12h5 M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M17 9l3 3-3 3",
   lastSync:"Simulated", usage:"Lag on DEMO-PAY-021", auth:"Unknown", scopes:["Write (outside Pulse)"]},
  {name:"Invoice Home", blurb:"Existing manual invoice tool for customers outside the Stripe flow. Pulse prepares copyable details and records the invoice number by hand.", tint:"#f0994b", status:"manual only", statusKind:"off",
   glyph:"M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3",
   lastSync:"—", usage:"2 invoices to prepare today", auth:"No API assumed", scopes:[]}
];

/* Background catalogue. Each entry is pure CSS so a tile is the real thing at
   thumbnail size, not a picture of it. */
const BG_DEFS = [
  {id:"bloom", name:"Bloom", cat:"Signature",
   css:"background:radial-gradient(60% 48% at 50% 34%, var(--accent-faint), transparent 72%), radial-gradient(44% 38% at 16% 84%, rgba(255,255,255,.05), transparent 70%)",
   thumb:"background:radial-gradient(62% 58% at 46% 34%, var(--accent-soft), transparent 74%), radial-gradient(50% 46% at 82% 84%, rgba(255,255,255,.08), transparent 72%), var(--surface-2)"},
  {id:"mist", name:"Mist", cat:"Signature",
   css:"background:radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,.07), transparent 70%), radial-gradient(56% 46% at 80% 76%, rgba(255,255,255,.05), transparent 72%)",
   thumb:"background:radial-gradient(58% 52% at 24% 22%, rgba(255,255,255,.16), transparent 72%), radial-gradient(60% 54% at 82% 78%, rgba(255,255,255,.10), transparent 74%), var(--surface-2)"},
  {id:"grid", name:"Grid", cat:"Signature",
   css:"background-image:linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%);-webkit-mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%)",
   thumb:"background-color:var(--surface-2);background-image:linear-gradient(var(--border-strong) 1px, transparent 1px),linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);background-size:14px 14px"},
  {id:"none", name:"None", cat:"Signature", css:"", thumb:"background:var(--surface-2)"},

  {id:"aurora", name:"Aurora", cat:"Gradient",
   css:"background:radial-gradient(70% 52% at 18% 8%, var(--bloom-a), transparent 66%), radial-gradient(64% 48% at 84% 22%, var(--bloom-b), transparent 68%), radial-gradient(70% 60% at 50% 104%, var(--bloom-c), transparent 70%);filter:blur(24px)",
   thumb:"background:radial-gradient(72% 60% at 16% 6%, var(--bloom-a), transparent 68%), radial-gradient(66% 54% at 86% 24%, var(--bloom-b), transparent 70%), radial-gradient(74% 66% at 50% 108%, var(--bloom-c), transparent 72%), var(--surface-2)"},
  {id:"horizon", name:"Horizon", cat:"Gradient",
   css:"background:linear-gradient(180deg, transparent 0%, var(--accent-faint) 58%, transparent 100%), radial-gradient(90% 40% at 50% 72%, var(--accent-soft), transparent 70%)",
   thumb:"background:linear-gradient(180deg, var(--surface-2) 0%, var(--accent-faint) 58%, var(--surface-2) 100%), radial-gradient(90% 44% at 50% 74%, var(--accent-soft), transparent 70%)"},
  {id:"dusk", name:"Dusk", cat:"Gradient",
   css:"background:linear-gradient(200deg, var(--bloom-c) -10%, transparent 46%), linear-gradient(20deg, var(--bloom-b) -10%, transparent 52%);opacity:.5",
   thumb:"background:linear-gradient(200deg, var(--bloom-c) -12%, transparent 48%), linear-gradient(20deg, var(--bloom-b) -12%, transparent 54%), var(--surface-2)"},
  {id:"ember", name:"Ember", cat:"Gradient",
   css:"background:radial-gradient(60% 70% at 84% 96%, var(--bloom-a), transparent 64%), radial-gradient(50% 60% at 10% 96%, var(--bloom-c), transparent 66%)",
   thumb:"background:radial-gradient(64% 76% at 84% 100%, var(--bloom-a), transparent 66%), radial-gradient(54% 66% at 8% 100%, var(--bloom-c), transparent 68%), var(--surface-2)"},

  {id:"mesh", name:"Mesh", cat:"Abstract",
   css:"background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:22px 22px;mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%);-webkit-mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%)",
   thumb:"background-color:var(--surface-2);background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:8px 8px"},
  {id:"contour", name:"Contour", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 30% 110%, transparent 0 22px, var(--border) 22px 23px);mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%);-webkit-mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%)",
   thumb:"background:repeating-radial-gradient(circle at 26% 116%, var(--surface-2) 0 9px, var(--border-strong) 9px 10px)"},
  {id:"weave", name:"Weave", cat:"Abstract",
   css:"background:repeating-linear-gradient(48deg, transparent 0 16px, var(--border) 16px 17px), repeating-linear-gradient(-48deg, transparent 0 16px, var(--border) 16px 17px);opacity:.7",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(48deg, transparent 0 7px, var(--border-strong) 7px 8px), repeating-linear-gradient(-48deg, transparent 0 7px, var(--border-strong) 7px 8px)"},
  {id:"halo", name:"Halo", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 50% 50%, transparent 0 46px, var(--accent-line) 46px 47px);mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%);-webkit-mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%)",
   thumb:"background:repeating-radial-gradient(circle at 50% 50%, var(--surface-2) 0 11px, var(--accent-line) 11px 12px)"},
  {id:"drift", name:"Drift", cat:"Abstract",
   css:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%);filter:blur(30px);opacity:.6",
   thumb:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%), var(--surface-2)"},
  {id:"scan", name:"Scanlines", cat:"Abstract",
   css:"background:repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 7px);mask-image:linear-gradient(180deg, #000, transparent 88%);-webkit-mask-image:linear-gradient(180deg, #000, transparent 88%)",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(0deg, var(--border-strong) 0 1px, transparent 1px 5px)"}
];

const THEMES = [
  {id:"dark", label:"Dark", group:"Dark", bg:"#0b0c0b", surface:"#1a1c19", ink:"#f2f3ef", accent:"#c8f04b"},
  {id:"indigo", label:"Indigo", group:"Dark", bg:"#0a0b13", surface:"#1a1b26", ink:"#f0f1fa", accent:"#8b93ff"},
  {id:"slate", label:"Slate", group:"Dark", bg:"#100e0c", surface:"#211c17", ink:"#f4f0ea", accent:"#e8a14a"},
  {id:"plum", label:"Plum", group:"Dark", bg:"#100a10", surface:"#20151f", ink:"#f6eef4", accent:"#f077b0"},
  {id:"ember", label:"Ember", group:"Dark", bg:"#0b0b0b", surface:"#1c1714", ink:"#f7f3ef", accent:"#f4561a"},
  {id:"harbour", label:"Harbour", group:"Dark", bg:"#0b0e10", surface:"#13171a", ink:"#f3f5f4", accent:"#5ee79a"},
  {id:"cargo", label:"Cargo", group:"Dark", bg:"#0a0a0a", surface:"#1a1c1a", ink:"#f2f5f2", accent:"#4ade80"},
  {id:"ocean", label:"Ocean", group:"Dark", bg:"#080e12", surface:"#141f25", ink:"#eaf4f8", accent:"#4fd4d0"},
  {id:"graphite", label:"Graphite", group:"Dark", bg:"#111112", surface:"#212124", ink:"#f4f4f5", accent:"#f4f4f5"},
  {id:"light", label:"Cream", group:"Light", bg:"#f4f2ed", surface:"#ffffff", ink:"#16181c", accent:"#0071e3"},
  {id:"warm", label:"Warm paper", group:"Light", bg:"#faf5ec", surface:"#fffdf9", ink:"#2a2016", accent:"#c9683f"},
  {id:"mist", label:"Mist", group:"Light", bg:"#eef1f4", surface:"#ffffff", ink:"#141e20", accent:"#0e9f6e"},
  {id:"sand", label:"Sand", group:"Light", bg:"#f6f1e6", surface:"#fffdf7", ink:"#221d12", accent:"#7d5fd6"}
];

const ADMIN_ICONS = {
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  structure:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
  shield:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  agent:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5",
  flow:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  plug:"M9 3.5v5 M15 3.5v5 M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z M12 17v3.5",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  lock:"M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  audit:"M8 3.5h8l3.5 3.5v13a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5h2Z M9 12h6 M9 16h4",
  brand:"M12 3.5 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9 12 3.5Z",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  data:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
};

const ADMIN_CARDS = [
  {id:"structure", group:"ORGANISATION", title:"Organisation", icon:"structure", tint:"#a7c49d",
   blurb:"Trading brand, owner and operating context.",
   tags:["theGardener.ie","EUR","Europe/Dublin"],
   listLabel:"WHAT IS ON FILE",
   rows:[["Trading brand","theGardener.ie"],["Owner","Kevin Whitty"],["Operating context","Garden maintenance, Dublin (catchment unverified)"],
     ["Base mentioned on the call","Rathgar"],["Legal entity","Unverified, not invented"],["Registered address","Unverified, not invented"],
     ["Currency","EUR, integer cents"],["Timezone","Europe/Dublin"],["Demo clock","Mon 19 Oct 2026, 17:15"]]},
  {id:"people", group:"ORGANISATION", title:"People", icon:"people", tint:"#6ad0f0",
   blurb:"The seven people in the business and their demo accounts.",
   tags:["7 people","1 owner","5 field"],
   footer:"Demo addresses only; nothing is sent", action:"Review people",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Add or remove people","mock only"],["Assign a role","Owner · Admin · Field team"],["Field crew","5 people, 40 h a week each (assumption)"],["Last activity","tracked per person"]]},

  {id:"teams", group:"TEAMS & PERMISSIONS", title:"Roles & permissions", icon:"shield", tint:"var(--accent)",
   blurb:"What the owner, the administrator and the field team can reach.",
   tags:["3 roles","8 grants","3 scopes"],
   heroLabel:"THE QUESTION THIS ANSWERS", heroAction:"Show me what someone can access",
   heroText:"Pick a person and see what they can read, change, decide and export. Mock permissions only; there is no authentication in this demo.",
   footer:"Mock permissions, no auth implementation", action:"Open preview",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Owner","everything, including exception decisions"],["Admin","charge sheet, invoices, reconciliation"],
     ["Field team","assigned visits and completion notes"],["Decide prices and schedule moves","Owner only"],["Record payments","Owner and Admin"]]},
  {id:"notif", group:"TEAMS & PERMISSIONS", title:"Notifications", icon:"bell", tint:"#f0994b",
   blurb:"Which events reach which person, inside Pulse only.",
   tags:["In-app only","No email","No WhatsApp"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["New exception","owner of the exception", true],["Charge sheet ready","Emma, 17:00", true],["Capacity over 40 h","Kevin", true],
     ["Ledger lag over 24 h","Emma", true],["Outbound email or messages","not part of this demo", false]]},

  {id:"integrations", group:"SYSTEMS", title:"Systems", icon:"plug", tint:"#6ad0f0",
   blurb:"Google Calendar, Laravel admin, Stripe, Google Sheets, Invoice Home and the connector between them.",
   tags:["6 systems","0 live","all simulated"], badge:"Demo only", badgeKind:"warn",
   footer:"Refresh runs the known local simulation only", action:"Review systems",
   listLabel:"SYSTEMS",
   rows:[["Google Calendar","simulated sync"],["Laravel admin","retained, not connected"],["Stripe","read-only mock"],["Google Sheets","read-only mock"],
     ["Stripe → Sheets connector","provider unconfirmed"],["Invoice Home","manual only"]]},
  {id:"health", group:"SYSTEMS", title:"Data health", icon:"health", tint:"#e2705c",
   blurb:"What is inconsistent between the systems, and the fix.",
   tags:["4 issue types","demo data"], badge:"1 ledger lag", badgeKind:"warn",
   footer:"Checked at 17:00", action:"Open reconciliation",
   listLabel:"ISSUES FOUND",
   trend:[9,8,7,7,6,5,4],
   bySeverity:[["High","1",RED],["Medium","2",AMBER],["Low","3",DIM]],
   issues:[["Duplicate calendar rows","1","low","Excluded by occurrence key","Review"],
     ["Paid, no ledger row","1","medium","Harbour House DEMO-PAY-021","Review"],
     ["Ledger amount mismatch","1","low","One Sheets row typed at a tenth of the amount","Review"],
     ["Ambiguous recurrence","2","low","“Bi-monthly” on AGR-022 and AGR-076","Review"],
     ["Missing completion note","1","medium","Primrose Hill, Fri 16 Oct","Review"],
     ["Missing agreement payment evidence","2","medium","AGR-047, AGR-112","Review"]],
   rows:[]},

  {id:"audit", group:"GOVERNANCE", title:"Traceability", icon:"audit", tint:"#9d8cf5",
   blurb:"Every charge line traces to a calendar occurrence, evidence and a price source.",
   tags:["Source-linked","Append-only log"],
   footer:"Activity history cannot be edited", action:"Open activity",
   listLabel:"WHAT IS RECORDED",
   rows:[["Occurrence key per visit","always"],["Completion evidence","crew note or named confirmation"],["Price source","rate card, quote or confirmed price"],
     ["Payments and invoices","reference, amount, date, who recorded it"],["Exclusions and edits","kept in the activity log"]]},
  {id:"datamgmt", group:"GOVERNANCE", title:"Manual charging & review", icon:"data", tint:"#5fe0a8",
   blurb:"How money is handled: by people, in their own tools.",
   tags:["Manual only","Exceptions reviewed"],
   footer:"Pulse never moves money", action:"Reset demo data",
   listLabel:"RULES",
   rows:[["Charges","processed by a person in Stripe or Invoice Home"],["Batch actions","copy and export only"],
     ["Exception review","prices, evidence, matches, scope"],["Repeated imports","idempotent, no new charges"],["Reset demo","restores the 19 Oct story"]]},

  {id:"agents", group:"AI CONTROLS", title:"AI controls", icon:"agent", tint:"var(--accent)",
   blurb:"Assistance only. Agents explain, match and propose; people decide.",
   tags:["6 agents","assist only","no payments"],
   heroLabel:"GLOBAL CONTROL", heroAction:"Pause every agent",
   heroText:"One switch stops every agent. They only read the demo records and propose; none of them can charge, invoice, write to the calendar or send anything.",
   footer:"No autonomous payments, prices or completions", action:"Review limits",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Autonomous payments","never", false],["Invent prices","never", false],["Confirm completions","never, a person confirms", false],
     ["Propose schedule moves","yes, Kevin approves", true],["Explain charge eligibility","yes", true],["Model connection","none, deterministic demo answers"]]},
  {id:"wf", group:"AI CONTROLS", title:"Workflow guardrails", icon:"flow", tint:"#9d8cf5",
   blurb:"The limits on the simulated routines under Work.",
   tags:["Proposes, never sends","Human gates"],
   footer:"Building workflows happens in Work", action:"Open Work",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Maximum autonomy","prepare and flag only", true],["Human gate","before any money or schedule change"],["Failure handling","flag to the owner"],["Global pause","all routines", true]]},

  {id:"brand", group:"EXPERIENCE", title:"Branding", icon:"brand", tint:"var(--accent)",
   blurb:"theGardener.ie wordmark and the proposed demo palette.",
   tags:["Wordmark","Demo palette"],
   listLabel:"WHAT IS USED",
   rows:[["Wordmark","public logo asset, proportions kept"],["Brand ink","#151A17"],["Warm ivory","#F4F3EB"],["Botanical accent","#58765C"],
     ["Dark-mode accent","#A7C49D"],["Official palette","not verified; demo proposal"]]},
  {id:"appearance", group:"EXPERIENCE", title:"Appearance & accessibility", icon:"brand", tint:"#6ad0f0",
   blurb:"Light or dark theme, and how Pulse looks to you.",
   tags:["Dark","Light"],
   listLabel:"THEMES", rows:[]}
];

const ADMIN_GROUPS = [
  ["ORGANISATION", "repeat(2,1fr)"],
  ["TEAMS & PERMISSIONS", "repeat(2,1fr)"],
  ["SYSTEMS", "repeat(2,1fr)"],
  ["GOVERNANCE", "repeat(2,1fr)"],
  ["AI CONTROLS", "repeat(2,1fr)"],
  ["EXPERIENCE", "repeat(2,1fr)"]
];

/* ---- activity feeds ---- */
const SRC_TINT = {"Google Calendar":"#6ad0f0", Pulse:"var(--accent)", Stripe:"#9d8cf5", "Google Sheets":"#5fe0a8",
  "Invoice Home":"#f0994b", Field:"#e6c78a", Agent:"var(--accent)"};

const SRC_ABBR = {"Google Calendar":"GC", Pulse:"PL", Stripe:"ST", "Google Sheets":"GS", "Invoice Home":"IH", Field:"FD", Agent:"AI"};

const DATA_EVENTS = [];

const PEOPLE_EVENTS = [];

const AI_EVENTS = [];

const STREAM_DEFS = [
  {id:"data", title:"Imports and systems", sub:"Simulated calendar, payment and ledger events", pool:DATA_EVENTS, every:3200,
   tint:"#6ad0f0", icon:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"},
  {id:"people", title:"People", sub:"Completions, decisions and recorded outcomes", pool:PEOPLE_EVENTS, every:6400,
   tint:"#f0c04b", icon:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9"},
  {id:"ai", title:"Agents", sub:"Simulated checks and proposals", pool:AI_EVENTS, every:4600,
   tint:"var(--accent)", icon:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5"}
];

const NAV = [
  {label:"Home", icon:"helios", page:"Home"},
  {label:"Agents", icon:"navAgents", page:"Agents"},
  {label:"Dashboard", icon:"navDash", page:"Dashboard"},
  {label:"Schedule", icon:"visits", page:"Schedule"},
  {label:"Charge Desk", icon:"navCharge", page:"Charge Desk", dot:true},
  {label:"Properties", icon:"navProperty", page:"Properties"},
  {label:"Contracts", icon:"records", page:"Contracts"},
  {label:"Work", icon:"navWork", page:"Work"},
  {label:"Records", icon:"navRecords", page:"Records"},
  {label:"Activity", icon:"pulseLine", page:"Activity"}
];

/* Inbox items follow the real InboxItem shape: what happened, why it matters, what I can do. */
/* The Home inbox is built from the shared exception list at render time. */
const ITEMS = {};
const ORDER = [];

const ANSWERS = {};

// Turns a plain-English filter name into a full dashboard area — the "primitive
// vibe-coding" bit: no real backend, just a seeded generator so the same phrase
// always produces the same numbers, with direction and vocabulary nudged by
// keywords in the text (expansion/growth trends up, risk/issue trends down, a
// region/cost/people/ops/customer word picks which metrics show).
function synthesizeCustomArea(name){
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  let seed = 0;
  for (let i = 0; i < trimmed.length; i++) seed = (seed * 31 + trimmed.charCodeAt(i)) >>> 0;
  const rnd = (n) => (((seed >>> (n % 24)) ^ (seed << ((n * 7) % 13))) >>> 0) % 997 / 997;
  const low = trimmed.toLowerCase();
  const has = (...words) => words.some(w => low.indexOf(w) > -1);
  const growth = has("expansion","growth","launch","scale","pilot","new site","open","opening","grow");
  const risk = has("risk","issue","delay","problem","complaint","fault","incident","churn","decline");
  const dir = risk ? -1 : (growth ? 1 : (rnd(2) > 0.45 ? 1 : -1));

  let vocab = "generic";
  if (has("scotland","ireland","wales","england","region","dublin","belfast","cork","galway","london","glasgow","edinburgh"))
    vocab = "region";
  else if (has("cost","spend","budget","saving","margin")) vocab = "cost";
  else if (has("staff","hiring","team","recruit","headcount")) vocab = "people";
  else if (has("supplier","stock","inventory","warehouse","fleet")) vocab = "ops";
  else if (has("customer","client","retention","account")) vocab = "customer";

  const V = {
    region:   {labels:["New enquiries","Orders won","Revenue","Site coverage"], unit:"EUR — 30 DAYS"},
    cost:     {labels:["Spend","Cost per job","Savings found","Budget used"], unit:"EUR — 30 DAYS"},
    people:   {labels:["Headcount","Open roles","Time to hire","Retention"], unit:"PEOPLE"},
    ops:      {labels:["Stock cover","Lead time","Stockouts","Reorders raised"], unit:"DAYS"},
    customer: {labels:["Active accounts","Repeat rate","Churn","NPS"], unit:"ACCOUNTS"},
    generic:  {labels:["Volume","Rate","Cost","Coverage"], unit:"ACTIVITY — 30 DAYS"}
  }[vocab];

  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  let v0 = 40 + Math.floor(rnd(1) * 220);
  const chart = months.map((m, i) => {
    v0 = Math.max(8, Math.round(v0 * (1 + dir * (0.03 + rnd(i + 3) * 0.07))));
    return [m, v0, String(v0)];
  });
  const metrics = V.labels.map((label, i) => {
    const val = 20 + Math.floor(rnd(i + 5) * 400);
    const pct = 2 + Math.round(rnd(i + 9) * 18);
    const up = dir > 0 ? rnd(i + 12) > 0.25 : rnd(i + 12) > 0.7;
    const bars = [0,1,2,3,4,5,6,7,8].map(k => 0.3 + rnd(i * 3 + k) * 0.7);
    return [label, i === 1 ? pct + "%" : String(val), (up ? "+" : "\u2212") + pct + (i === 1 ? "pt" : "%"), up ? "up" : "down", "vs last month", bars];
  });
  const capName = trimmed.replace(/\b\w/g, c => c.toUpperCase());
  const split = [
    [capName + " \u2014 direct", String(Math.round(v0 * 0.5)), "48%", 1],
    ["Existing pipeline", String(Math.round(v0 * 0.3)), "31%", 0],
    ["Everything else", String(Math.round(v0 * 0.2)), "21%", 0]
  ];
  const table = [1,2,3].map(w => [capName + " \u2014 week " + w, String(20 + Math.floor(rnd(20 + w) * 200)),
    (dir > 0 ? "+" : "\u2212") + (3 + Math.floor(rnd(23 + w) * 14)) + "%", "Auto-tagged from records mentioning \u201c" + low + "\u201d"]);
  table.push(["Everything else", String(20 + Math.floor(rnd(30) * 200)), "\u2014", "Baseline"]);
  return {
    id: trimmed, label: capName, color: "var(--accent)", owner: "CUSTOM FILTER",
    description: "Generated from \u201c" + trimmed + "\u201d \u2014 a plain-English filter, not a registered metric set. Refine it and Pulse will tighten this up.",
    kind: "columns", chartTitle: capName + " over time", chartUnit: V.unit,
    chart, splitTitle: "Where \u201c" + low + "\u201d shows up", split,
    tableCols: ["Item","Value","Change","Note"], table,
    metrics, legend: [capName, "Pipeline", "Other"]
  };
}

function pickAnswer(q){
  return {tool:"demo.limits", effect:"read", text:"This demo answers from its own seeded records. Ask about today's charge sheet, decisions, covered visits, Friday's capacity or ledger gaps.", actions:[]};
}

const ORGS = [];
const TEAMS = [];
const LOCATIONS = [];

/* Six assistance-only agents. Threads are seeded for the 19 Oct story; the
   afternoon lines that quote totals are added at render time from the store. */
const AGENT_DEFS = [
  {id:"briefing", name:"Briefing", shape:"crown-pebble", tint:"#191c1f", state:"complete", role:"Concise daily priorities and answers grounded in the shared records",
   when:"17:15", preview:"seven items ready, one extra unpriced, friday over.",
   thread:[
     {kind:"stamp", text:"Today 08:00 · morning snapshot"},
     {kind:"routine", text:"Ran routine", routine:"Morning briefing"},
     {kind:"agent", text:"morning snapshot:", lines:[
       {k:"Visits", v:"24 scheduled today"},
       {k:"Capacity", v:"Friday 46 field hours booked against 40"},
       {k:"Ledger", v:"Harbour House's earlier €210 payment still missing from the Sheets ledger"}]},
     {kind:"agent", text:"the €210 is prior payment evidence from 18 Oct, not a payment collected this morning."}
   ]},
  {id:"ops", name:"Ops Watchdog", shape:"shield", tint:"#2b1b1e", state:"attention", role:"Flags overloads, deferrals, stale completion evidence and commitments at risk",
   when:"07:46", preview:"friday 46/40. three flexible visits can move.",
   thread:[
     {kind:"stamp", text:"Today 07:46"},
     {kind:"agent", text:"friday 23 oct is booked at 46 field hours against 40. the week is 182 of 200, so the average hides it."},
     {kind:"agent", text:"three flexible ad-hoc visits on friday have tue–fri windows. moving them to tuesday clears it without touching a contracted slot. handed to the capacity planner."},
     {kind:"stamp", text:"Today 08:05"},
     {kind:"agent", text:"sean deferred sycamore house and foxglove cottage for waterlogged ground. both rebooked for mon 26 oct with their original occurrence keys."},
     {kind:"agent", text:"primrose hill (fri 16 oct) still has no completion note. it is a contract visit, so nothing to charge, but the record is incomplete. task with sean."}
   ]},
  {id:"charge", name:"Charge Sheet Assistant", shape:"executive-capsule", tint:"#2a2118", state:"waiting", role:"Explains the proposed charge sheet and surfaces missing evidence. Cannot collect money.",
   when:"17:00", preview:"sheet ready for manual processing.",
   thread:[
     {kind:"stamp", text:"Today 17:00"},
     {kind:"routine", text:"Ran routine", routine:"Daily charge sheet"},
     {kind:"agent", text:"25 calendar rows became 24 unique visits. one row repeated laurel lodge's occurrence key, so it is excluded: one visit, one €75 line."},
     {kind:"agent", text:"i can explain any line and copy its details. i cannot charge, invoice or record a payment on my own; those are yours to do in stripe and invoice home."}
   ]},
  {id:"contract", name:"Contract Guard", shape:"low-dome", tint:"#241b2e", state:"waiting", role:"Compares agreement scope and effective dates with each visit. Never invents terms.",
   when:"10:02", preview:"birch house covered. oak lodge extra unpriced.",
   thread:[
     {kind:"stamp", text:"Today 10:02"},
     {kind:"agent", text:"birch house (v-101) is routine work inside agr-001, current period 1 aug – 31 oct, paid. €0 extra. the quarterly fee is not divided per visit."},
     {kind:"agent", text:"oak lodge (v-120) had extra hedge work: a boundary reduction below the agreed height. agr-013 excludes that, and there is no quote or rate. held as unpriced, not €0. task with emma."},
     {kind:"agent", text:"agr-022 and agr-076 say “bi-monthly”. i won't guess the interval."}
   ]},
  {id:"ledger", name:"Ledger Checker", shape:"control-cube", tint:"#16241f", state:"thinking", role:"Finds unmatched payments, ledger lag and duplicate imports. Never recommends charging twice.",
   when:"09:00", preview:"harbour house €210 paid, no sheets row.",
   thread:[
     {kind:"stamp", text:"Today 09:00"},
     {kind:"agent", text:"demo-pay-021, €210 for harbour house, was paid in stripe on 18 oct. there is no matching google sheets row yet. that is connector lag, not non-payment."},
     {kind:"agent", text:"harbour house stays out of the ready queue. one older sheets row also shows a tenth of its stripe amount; flagged for emma to correct."}
   ]},
  {id:"capacity", name:"Capacity Planner", shape:"offset-pebble", tint:"#1b2430", state:"waiting", role:"Proposes feasible schedule moves that keep contracted visits where they are",
   when:"07:50", preview:"move 6 h friday → tuesday. waiting on kevin.",
   thread:[
     {kind:"stamp", text:"Today 07:50"},
     {kind:"agent", text:"proposal: move juniper lodge, larch court and clover cottage from friday to tuesday. six field hours, all inside their tue–fri windows."},
     {kind:"agent", text:"friday goes 46 → 40 and tuesday 33 → 39. the week stays at 182. daniel, patrick and niamh each have two free hours on tuesday, so nobody goes past 8 h."},
     {kind:"agent", text:"friday will be exactly full, with no buffer. nothing moves until kevin approves, and there is no calendar write in this demo."}
   ]}
];

/* Labels only; values are computed from the shared store at render time. */
const KPI_DEFS = {
  ready:{label:"Ready to process"}, visits:{label:"Visits completed"}, hours:{label:"Field hours this week"},
  friday:{label:"Friday capacity"}, unrec:{label:"Paid, not in ledger"}, invoices:{label:"Invoice Home queue"},
  review:{label:"Held for review"}, included:{label:"Covered by agreements"}
};

const ASPECT_DEFS = [
  {id:"ops", label:"Operations", color:"var(--accent)", owner:"SEAN MURPHY", description:"Visits, field hours and exceptions.",
   kind:"columns", chartTitle:"", chartUnit:"", chart:[["Mon",1,"1"]], splitTitle:"", split:[], tableCols:[], table:[], metrics:[]}
];

const FILTER_GROUPS = [
  {title:"AREA", items:["Operations","Billing","Service Quality"]},
  {title:"TIME", items:["Today","This week"]}
];

/* Simulated Pulse routines. These are run times for Pulse itself, not the
   customer visit calendar. Statuses that depend on the story are adjusted at
   render time from the store. */
const OPS_DEFS = [
  {id:"o1", name:"Calendar import", kind:"automation", owner:"Calendar import", ownerKind:"agent", initials:"CI",
   trigger:"Daily, 07:30 · 12:30 · 17:00", triggerKind:"schedule", next:"Tomorrow 07:30", last:"25 rows → 24 visits", status:"healthy", rate:100, on:true,
   what:"Reads the day's Google Calendar occurrences (simulated) and turns each unique occurrence key into one visit record.",
   why:"Matching on titles alone would let an edited event create a second visit.",
   saved:"",
   steps:[["Trigger","07:30, 12:30 and 17:00"],["Find","Occurrences for the day from the calendar series"],["Check","Deduplicate by occurrence key, not title"],["Update","Create or update one visit per occurrence"]],
   runs:[["Today 12:30","3s","ok","25 rows · 0 new","—"],["Today 07:30","4s","ok","25 rows · 24 visits · 1 duplicate","—"],["Fri 17:00","3s","ok","21 rows · 0 new","—"]]},
  {id:"o2", name:"Daily charge sheet", kind:"routine", owner:"Charge Sheet Assistant", ownerKind:"agent", initials:"CS",
   trigger:"Weekdays, 17:00", triggerKind:"schedule", next:"Tomorrow 17:00", last:"7 ready · €1,215", status:"healthy", rate:100, on:true,
   what:"Builds the source-linked charge sheet from completed visits, agreements, prices and existing payments.",
   why:"Cross-checking the calendar against the admin system by hand took the end of every day.",
   saved:"",
   steps:[["Trigger","Every weekday at 17:00"],["Find","Completed visits with confirmed evidence"],["Check","Agreement scope and effective dates"],["Check","Price from the rate card or an accepted quote"],["Check","Payments or invoices already linked"],["Draft","Route each line: Stripe flow or Invoice Home"],["Approval","A person processes each charge in its own tool","gate"]],
   runs:[["Today 17:00","6s","ok","24 visits · 7 ready","—"],["Fri 17:00","5s","ok","22 visits · 6 ready","—"],["Thu 17:00","5s","ok","23 visits · 5 ready","—"]]},
  {id:"o3", name:"Exception routing", kind:"automation", owner:"Contract Guard", ownerKind:"agent", initials:"CG",
   trigger:"When an exception is found", triggerKind:"event", next:"Event-based", last:"Oak Lodge price → Emma", status:"approval", rate:100, on:true,
   what:"Turns anything that blocks a charge into an owned, dated task: a missing price, missing evidence, an unclear match or a scope question.",
   why:"Held items used to wait in someone's head until the next time they looked.",
   saved:"",
   steps:[["Trigger","An exception is raised on a visit or agreement"],["Find","The right owner for that kind of exception"],["Update","Create the task with its linked records"],["Approval","The owner decides","gate"]],
   runs:[["Today 10:02","1s","ok","1 task · Emma","—"],["Today 08:05","1s","ok","Weather deferrals logged","—"]]},
  {id:"o4", name:"Ledger reconciliation", kind:"automation", owner:"Ledger Checker", ownerKind:"agent", initials:"LC",
   trigger:"Daily, 09:00 · 18:00", triggerKind:"schedule", next:"18:00", last:"1 payment awaiting Sheets row", status:"healthy", rate:100, on:true,
   what:"Compares Stripe payment evidence with the Google Sheets ledger and flags lag or mismatched amounts.",
   why:"A ledger lag can look like non-payment and lead to a second charge.",
   saved:"",
   steps:[["Trigger","09:00 and 18:00"],["Find","Recorded Stripe payments"],["Check","A matching Sheets row with the same amount"],["Update","Mark matched, pending or mismatch"]],
   runs:[["Today 09:00","2s","ok","1 pending · 1 mismatch","—"],["Fri 18:00","2s","ok","All matched after 1 day","—"]]},
  {id:"o5", name:"Morning briefing", kind:"routine", owner:"Briefing", ownerKind:"agent", initials:"BR",
   trigger:"Weekdays, 08:00", triggerKind:"schedule", next:"Tomorrow 08:00", last:"Posted 08:00", status:"healthy", rate:100, on:true,
   what:"Posts the 08:00 snapshot: what is scheduled, capacity risks and anything left over from yesterday.",
   why:"Kevin wanted the day's shape before the crew was out.",
   saved:"",
   steps:[["Trigger","Every weekday at 08:00"],["Find","Today's visits, capacity and open exceptions"],["Draft","Write the snapshot"],["Send","Post to Home (in Pulse only)"]],
   runs:[["Today 08:00","2s","ok","1 briefing","—"],["Fri 08:00","2s","ok","1 briefing","—"]]},
  {id:"o6", name:"Capacity check", kind:"routine", owner:"Capacity Planner", ownerKind:"agent", initials:"CP",
   trigger:"Weekdays, 07:45", triggerKind:"schedule", next:"Tomorrow 07:45", last:"Friday 46/40 · move proposed", status:"approval", rate:100, on:true,
   what:"Checks booked field hours per day and per person, and proposes moves that keep contracted visits fixed.",
   why:"Growth spikes overloaded particular days and service for long-standing customers dipped.",
   saved:"",
   steps:[["Trigger","Every weekday at 07:45"],["Find","Booked hours per day and per crew member"],["Check","Flexible visits and their service windows"],["Draft","Propose a move with a before/after preview"],["Approval","Kevin approves","gate"]],
   runs:[["Today 07:45","3s","ok","1 proposal","—"],["Fri 07:45","3s","ok","No conflicts","—"]]},
  {id:"o7", name:"Completion evidence check", kind:"routine", owner:"Ops Watchdog", ownerKind:"agent", initials:"OW",
   trigger:"Weekdays, 18:00", triggerKind:"schedule", next:"18:00", last:"Primrose Hill · no note", status:"approval", rate:96, on:true,
   what:"Finds visits whose time has passed with no completion note, and asks a person to confirm.",
   why:"A passed slot is not proof of work, and charging for unfinished work would damage trust.",
   saved:"",
   steps:[["Trigger","Every weekday at 18:00"],["Find","Visits with no completion evidence"],["Update","Task to the field lead"],["Approval","A person confirms","gate"]],
   runs:[["Fri 18:00","2s","partial","1 missing note","—","Primrose Hill, 16 Oct: no completion note"],["Thu 18:00","2s","ok","All confirmed","—"]]},
  {id:"o8", name:"Agreement payment evidence", kind:"task", owner:"Contract Guard", ownerKind:"agent", initials:"CG",
   trigger:"1st of the month, 08:00", triggerKind:"schedule", next:"1 Nov 08:00", last:"2 agreements without evidence", status:"healthy", rate:100, on:true,
   what:"Checks every active agreement has payment evidence for its current quarter.",
   why:"An unclear contract payment must be followed up, not turned into per-visit charges.",
   saved:"",
   steps:[["Trigger","First of the month"],["Find","Agreements in their current quarter"],["Check","Payment evidence on file"],["Update","Task to Emma for any gaps"]],
   runs:[["1 Oct 08:00","4s","ok","2 gaps · AGR-047, AGR-112","—"]]},
  {id:"o9", name:"Renewal review list", kind:"task", owner:"Contract Guard", ownerKind:"agent", initials:"CG",
   trigger:"Mondays, 08:30", triggerKind:"schedule", next:"Mon 26 Oct", last:"Next 60 days listed", status:"healthy", rate:100, on:true,
   what:"Lists agreements with a review date in the next 60 days so none lapse quietly.",
   why:"Reviews were remembered rather than scheduled.",
   saved:"",
   steps:[["Trigger","Every Monday at 08:30"],["Find","Review dates in the next 60 days"],["Update","Refresh Kevin's review task"]],
   runs:[["Today 08:30","1s","ok","Reviews listed","—"]]}
];

const OPS_FILTERS = [
  ["all","All"], ["routine","Agent routines"], ["automation","Automations"],
  ["task","Recurring checks"], ["approval","Needs a person"], ["failed","Failed"]
];

const WORK_SECTIONS = [
  {id:"tasks", label:"Tasks", blurb:"Owned, dated work linked to the records it touches.",
   views:["All tasks","Due tasks","Review","Done"], filters:["Due date","Any status","Anyone","Any area"]},
  {id:"approvals", label:"Approvals", blurb:"Only the exceptions that need a person: an unpriced extra or a schedule change. Ordinary charges never wait here.",
   views:["Awaiting you","Awaiting others","Decided"], filters:["Raised date","Anyone"]},
  {id:"workflows", label:"Workflows", blurb:"Simulated routines: how the sheet is prepared, how exceptions are routed and how payments are reconciled.",
   views:[], filters:[]},
  {id:"schedules", label:"Schedules", blurb:"When Pulse's own routines run. Not the customer visit calendar, which lives under Schedule.",
   views:[], filters:[]}
];

const WORK_TASKS = [];

const WORKFLOWS = [];

const SCHEDULES = [
  {id:"s1", name:"Calendar import", cadence:"Daily · 07:30, 12:30, 17:00", next:"Tomorrow 07:30", owner:"Calendar import", on:true, day:1},
  {id:"s2", name:"Capacity check", cadence:"Weekdays · 07:45", next:"Tomorrow 07:45", owner:"Capacity Planner", on:true, day:1},
  {id:"s3", name:"Morning briefing", cadence:"Weekdays · 08:00", next:"Tomorrow 08:00", owner:"Briefing", on:true, day:1},
  {id:"s4", name:"Ledger reconciliation", cadence:"Daily · 09:00, 18:00", next:"Today 18:00", owner:"Ledger Checker", on:true, day:0},
  {id:"s5", name:"Daily charge sheet", cadence:"Weekdays · 17:00", next:"Tomorrow 17:00", owner:"Charge Sheet Assistant", on:true, day:1}
];

const WIDGET_DEFS = [["brief","Briefing"],["inbox","Needs a decision"],["work","My work"],["activity","Activity"],["kpi","Today's numbers"],["visits","Visits today"]];

const WORK_WIDGETS = [
  {id:"queue", label:"My queue", value:"—", hint:"assigned to you", icon:"work", queue:"mine"},
  {id:"late", label:"Running late", value:"—", hint:"past their due date", icon:"health", queue:"overdue"}
];

const PERSONALITIES = ["Straight-talking","Warm","Formal","Dry"];
const ANSWER_STYLES = ["Short answers","Show the working","Ask before acting"];
/* Every context source and every registered tool the agent could be granted —
   the builder shows the whole catalogue, grouped, rather than a sample. */
const CONTEXT_DEFS = [
  ["Properties","records","Areas, customers, service windows"],
  ["Customers","records","Registered profiles and contacts"],
  ["Agreements","records","Fees, scope, dates, evidence"],
  ["Files","records","Agreement summaries, quotes, notes"],
  ["Visits","work","Occurrences, crew, completion"],
  ["Tasks","work","Owners, due dates, linked records"],
  ["Exceptions","work","What waits on a person"],
  ["Charge lines","money","Included, chargeable, unpriced"],
  ["Payments","money","Stripe evidence (mock)"],
  ["Ledger","money","Google Sheets rows (mock)"],
  ["Activity log","system","Every event, agent and human"],
  ["Capacity","system","Field hours by day and person"]
];

const CONTEXT_SOURCES = CONTEXT_DEFS.map(c => c[0]);
const SKILL_DEFS = [
  ["Search records","read"],["Summarise activity","read"],["Read charge lines","read"],
  ["Read visits","read"],["Check agreement scope","read"],["Compare ledger","read"],
  ["Draft a note","write"],["Create task","write"],["Propose schedule move","write"],
  ["Flag an exception","write"],
  ["Charge a card","external"],["Create an invoice","external"],["Write to calendar","external"],["Send email","external"]
];

/* The two questions the agent asks back once it knows the job. */
const TRAIN_PHASES = [
  ["Reading the whole ontology", "1,000 customers · 250 properties"],
  ["Learning how this business words things", "visit, agreement, charge sheet"],
  ["Reading the agreement scopes", "150 agreements"],
  ["Writing its own system prompt", "assist-only rules"]
];

const BRIEF_QUESTIONS = [
  {title:"What should it cover?", sub:"Pick as many as you like.",
   options:[["Charge sheet","What is ready, held or already paid"],["Capacity","Field hours by day and person"],
            ["Agreements","Scope, renewals and evidence"],["Ledger","Payments missing from Sheets"],
            ["Something else","Tell me in the next message"]]},
  {title:"When should it land?", sub:"One is enough to start.",
   options:[["Weekdays 08:00","Before the crew is out"],["Weekdays 17:00","When the sheet is ready"],
            ["Only when something changes","Event-driven, no noise"],["On demand","When you ask for it"]]}
];

/* The words under a name, keyed to the same state the face lights with. */
const STATE_LABELS = {working:"working", thinking:"thinking", waiting:"waiting on you",
  complete:"up to date", attention:"needs you", idle:"idle"};

const FACE_SHAPES = [
  ["crown-pebble","Crown pebble"],["executive-capsule","Executive capsule"],["shield","Shield"],
  ["glass-visor","Glass visor"],["control-cube","Control cube"],["low-dome","Low dome"],
  ["offset-pebble","Offset pebble"],["rim-capsule","Rim capsule"],["wide-eyed","Wide-eyed"],
  ["precision-brow","Precision brow"],["tall-unit","Tall unit"],["soft-asymmetric","Soft asymmetric"]
];
/* Shell colours only — deliberately desaturated so none of them reads as a
   state. The eyes, rim and dots always carry the state colour. */
const FACE_TINTS = [
  ["#191c1f","Graphite"],["#1b2430","Slate"],["#241b2e","Aubergine"],
  ["#2a2118","Bronze"],["#16241f","Pine"],["#2b1b1e","Oxblood"]
];

/* ---- ontology graph: generation, Dijkstra traversal, canvas render ---- */
const CLUSTERS = [
  ["Customers",     "#a7c49d", 0.00, 0.62, 46],
  ["Properties",    "#6ad0f0", 0.90, 0.70, 52],
  ["Agreements",    "#b06cf0", 1.75, 0.66, 58],
  ["Visits",        "#f0c04b", 2.55, 0.72, 44],
  ["Billing lines", "#f0567f", 3.35, 0.60, 38],
  ["Payments",      "#5fe0a8", 4.15, 0.70, 40],
  ["Team",          "#f0803a", 4.95, 0.64, 30],
  ["Exceptions",    "#5f7cf0", 5.65, 0.72, 34]
];

function mulberry(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Hub-and-spoke clusters around a dense phyllotaxis core, in unit space
   (-1..1 on both axes) so the layout is resolution independent. */
const _hexCache = {};
function hexRGB(hex){
  if (_hexCache[hex]) return _hexCache[hex];
  const h = hex.replace("#", "");
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _hexCache[hex] = v;
  return v;
}


function buildGraph(){
  const rnd = mulberry(20260902);
  const nodes = [], edges = [], adj = [];
  const add = (x, y, z, r, cluster, kind) => {
    nodes.push({x, y, z, r, cluster, kind}); adj.push([]); return nodes.length - 1;
  };
  const link = (a, b) => {
    const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
    const w = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.004;
    const id = edges.length;
    edges.push({a, b, w});
    adj[a].push([b, w, id]); adj[b].push([a, w, id]);
  };

  // the core is a filled sphere on a Fibonacci lattice, not a disc
  const CORE = 880, coreIds = [];
  for (let i = 0; i < CORE; i++){
    const t = (i + 0.5) / CORE;
    const phi = Math.acos(1 - 2 * t);
    const theta = i * 2.39996;
    const shell = 0.16 + 0.28 * Math.pow(rnd(), 0.5);
    const grade = rnd();
    coreIds.push(add(
      Math.sin(phi) * Math.cos(theta) * shell * 1.04,
      Math.cos(phi) * shell * 0.96,
      Math.sin(phi) * Math.sin(theta) * shell,
      grade < 0.06 ? 3.4 + rnd() * 1.4 : grade < 0.3 ? 2.1 + rnd() * 0.7 : 1.0 + rnd() * 0.8, 0, "core"));
  }
  // lattice neighbours plus a mesh of chords, so the sphere reads as a volume
  for (let i = 1; i < coreIds.length; i++){
    link(coreIds[i], coreIds[i - 1]);
    if (i >= 13) link(coreIds[i], coreIds[i - 13]);
    if (i >= 21 && i % 2 === 0) link(coreIds[i], coreIds[i - 21]);
    if (i >= 34 && i % 3 === 0) link(coreIds[i], coreIds[i - 34]);
    if (i >= 55 && i % 4 === 0) link(coreIds[i], coreIds[i - 55]);
    if (i >= 89 && i % 5 === 0) link(coreIds[i], coreIds[i - 89]);
    if (i % 6 === 0) link(coreIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // a mid shell between the nucleus and the lobes: the layer that makes it
  // read as a network rather than a ball with satellites
  const MID = 560, midIds = [];
  for (let i = 0; i < MID; i++){
    const t = (i + 0.5) / MID;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996 + 0.7;
    const d = 0.52 + 0.16 * Math.pow(rnd(), 0.6);
    const g2 = rnd();
    midIds.push(add(
      Math.sin(phi) * Math.cos(theta) * d * 1.02,
      Math.cos(phi) * d * 0.96,
      Math.sin(phi) * Math.sin(theta) * d,
      g2 < 0.05 ? 2.6 + rnd() * 1.0 : g2 < 0.3 ? 1.6 + rnd() * 0.6 : 0.8 + rnd() * 0.7, 0, "core"));
  }
  for (let i = 0; i < midIds.length; i++){
    if (i >= 1) link(midIds[i], midIds[i - 1]);
    if (i >= 17) link(midIds[i], midIds[i - 17]);
    if (i >= 29 && i % 2 === 0) link(midIds[i], midIds[i - 29]);
    // radial spokes tying the shell to the nucleus
    if (i % 2 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
    if (i % 9 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // clusters ride a sphere: each hub gets its own latitude as well as longitude
  const hubs = [], clusterLeaves = [];
  const onSphere = (lon, lat, d0) => { const d = d0 * 1.22;
    return [Math.cos(lat) * Math.cos(lon) * d * 1.02, Math.sin(lat) * d * 0.96, Math.cos(lat) * Math.sin(lon) * d]; };
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist, leaves] = c;
    const lat = (ci % 2 ? 1 : -1) * (0.26 + rnd() * 0.5);
    const wob = 1.06 + rnd() * 0.16;
    const hp = onSphere(ang, lat, dist * wob);
    const hub = add(hp[0], hp[1], hp[2], 5.4, ci, "hub");
    hubs.push(hub);
    const mine = [];
    clusterLeaves.push(mine);
    for (let k = 0; k < 3; k++) link(hub, coreIds[Math.floor(rnd() * coreIds.length)]);
    for (let k = 0; k < 5; k++) link(hub, midIds[Math.floor(rnd() * midIds.length)]);

    const subs = 5 + Math.floor(rnd() * 4);
    const subIds = [];
    for (let s = 0; s < subs; s++){
      const sa = ang + (rnd() - 0.5) * 0.52, sl = lat + (rnd() - 0.5) * 0.3;
      const sd = dist + 0.08 + rnd() * 0.18;
      const sp = onSphere(sa, sl, sd);
      const sub = add(sp[0], sp[1], sp[2], 3.2, ci, "sub");
      subIds.push(sub);
      link(sub, hub);
      if (s > 0 && rnd() < 0.7) link(sub, subIds[s - 1]);
      const fan = Math.floor((leaves * 7.4) / subs);
      const spread = 0.17 + rnd() * 0.2;
      let prev = -1;
      for (let l = 0; l < fan; l++){
        const la = sa + (rnd() - 0.5) * spread * 2 + (rnd() - 0.5) * 0.06;
        const ll = sl + (rnd() - 0.5) * spread * 1.1;
        const ld = sd + 0.03 + Math.pow(rnd(), 0.8) * 0.17;
        const lp = onSphere(la, ll, ld);
        const lg = rnd();
        const leaf = add(lp[0], lp[1], lp[2],
          lg < 0.08 ? 2.8 + rnd() * 1.2 : lg < 0.34 ? 1.8 + rnd() * 0.6 : 1.0 + rnd() * 0.7, ci, "leaf");
        link(leaf, sub);
        mine.push(leaf);
        if (rnd() < 0.14) link(leaf, hub);
        if (prev >= 0 && rnd() < 0.34) link(leaf, prev);
        if (rnd() < 0.16) link(leaf, midIds[Math.floor(rnd() * midIds.length)]);
        prev = leaf;
      }
    }
  });
  // far satellites hanging off the outer leaves
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist] = c;
    for (let s = 0; s < 7; s++){
      const sa = ang + (rnd() - 0.5) * 1.5, sl = (rnd() - 0.5) * 1.3;
      const sd = dist + 0.42 + rnd() * 0.22;
      const ap = onSphere(sa, sl, sd);
      const anchor = add(ap[0], ap[1], ap[2], 2.4, ci, "sub");
      link(anchor, hubs[ci]);
      const n = 14 + Math.floor(rnd() * 18);
      for (let l = 0; l < n; l++){
        const la = sa + (rnd() - 0.5) * 0.9, ll = sl + (rnd() - 0.5) * 0.7;
        const ld = sd + 0.02 + Math.pow(rnd(), 0.8) * 0.18;
        const p = onSphere(la, ll, ld);
        const leaf = add(p[0], p[1], p[2], 0.8 + rnd() * 0.9, ci, "leaf");
        link(leaf, anchor);
        clusterLeaves[ci].push(leaf);
      }
    }
  });

  // two hub rings and long chords across the sphere
  hubs.forEach((h, i) => {
    link(h, hubs[(i + 1) % hubs.length]);
    link(h, hubs[(i + 2) % hubs.length]);
    if (i % 3 === 0) link(h, hubs[(i + 4) % hubs.length]);
  });
  // neighbouring clusters share records, so their leaves cross-link
  for (let ci = 0; ci < clusterLeaves.length; ci++){
    const a = clusterLeaves[ci], b = clusterLeaves[(ci + 1) % clusterLeaves.length];
    const n = 26 + Math.floor(rnd() * 16);
    for (let k = 0; k < n; k++){
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)]);
    }
    // and a good number reach right across to the far side
    for (let k = 0; k < 12; k++){
      const far = clusterLeaves[(ci + 3) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
    for (let k = 0; k < 8; k++){
      const far = clusterLeaves[(ci + 4) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
  }

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
  for (const n of nodes){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
    if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
  }
  const bounds = {minX, maxX, minY, maxY, cx:(minX + maxX) / 2, cy:(minY + maxY) / 2,
    cz:(minZ + maxZ) / 2, w:maxX - minX, h:maxY - minY, d:maxZ - minZ,
    radius: Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2,
    reach: nodes.reduce((m, n) => Math.max(m, Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)), 0)};
  return {nodes, edges, adj, hubs, coreIds, bounds};
}

export {
  INK,
  BODY,
  DIM,
  FAINT,
  LIME,
  GREEN,
  AMBER,
  RED,
  NEUTRAL,
  MONO,
  ICONS,
  REC_SECTIONS,
  CONTACTS,
  FILE_TREE,
  ONTO_NODES,
  ONTO_EDGES,
  REC_TEMPLATES,
  REC_TEMPLATE_CATS,
  PEOPLE,
  ROLE_LEVELS,
  PERM_KEYS,
  GRANT_DEFS,
  ROLE_SCOPES,
  DEFAULT_PERMS,
  INTEGRATIONS,
  BG_DEFS,
  THEMES,
  ADMIN_ICONS,
  ADMIN_CARDS,
  ADMIN_GROUPS,
  SRC_TINT,
  SRC_ABBR,
  DATA_EVENTS,
  PEOPLE_EVENTS,
  AI_EVENTS,
  STREAM_DEFS,
  NAV,
  ITEMS,
  ORDER,
  ANSWERS,
  synthesizeCustomArea,
  pickAnswer,
  ORGS,
  TEAMS,
  LOCATIONS,
  AGENT_DEFS,
  KPI_DEFS,
  ASPECT_DEFS,
  FILTER_GROUPS,
  OPS_DEFS,
  OPS_FILTERS,
  WORK_SECTIONS,
  WORK_TASKS,
  WORKFLOWS,
  SCHEDULES,
  WIDGET_DEFS,
  WORK_WIDGETS,
  PERSONALITIES,
  ANSWER_STYLES,
  CONTEXT_DEFS,
  CONTEXT_SOURCES,
  SKILL_DEFS,
  TRAIN_PHASES,
  BRIEF_QUESTIONS,
  STATE_LABELS,
  FACE_SHAPES,
  FACE_TINTS,
  CLUSTERS,
  mulberry,
  _hexCache,
  hexRGB,
  buildGraph
};
