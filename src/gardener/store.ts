/* One shared, local store for the theGardener.ie demo. Every page, the Home
   chat, the agents and the exports read the same state through the selectors
   in selectors.ts, so a recorded payment or a resolved price shows up
   everywhere at once. Nothing here talks to a real system. */
import { useSyncExternalStore } from "react";
import {
  DEMO, HISTORY, PRIMROSE_VISIT, VISITS, hhmm,
  type Payment, type LedgerRow, type Invoice,
} from "./fixtures";

export type GEvent = {
  id: string; date: string; at: string; stream: "data" | "people" | "ai";
  title: string; note: string; actor: string; related: string[]; source: string;
  status: "completed" | "awaiting" | "failed" | "working"; simulated: boolean;
};

export type Drawer = { kind: "visit" | "property" | "agreement"; id: string; tab?: string } | null;
export type Modal = { kind: "payment" | "invoice" | "invoicePaid" | "price" | "move" | "reset" | "confirm"; id: string } | null;

export type UI = {
  tabs: Record<string, string>;
  charge: { date: string; filter: string; q: string; sort: string; dir: 1 | -1; selected: string[]; reviewCat: string };
  props: { q: string; status: string; area: string; page: number; historyQ: string; historyOutcome: string };
  contracts: { q: string; rule: string; page: number };
  schedule: { day: string; staff: string; recurQ: string };
  records: { q: string; status: string; page: number };
  drawer: Drawer;
  modal: Modal;
  toast: { text: string; n: number } | null;
};

export type GState = {
  clock: number;
  payments: Payment[];
  ledger: LedgerRow[];
  invoices: Invoice[];
  prices: Record<string, { cents: number; ref: string; by: string; at: string }>;
  confirmations: Record<string, { by: string; at: string; note: string }>;
  moved: boolean;
  importRuns: { at: string; rows: number; matched: number; created: number; duplicates: number }[];
  ledgerRuns: { at: string; added: string[] }[];
  exports: { at: string; date: string; kind: string; rows: number; file: string }[];
  copies: { at: string; what: string }[];
  events: GEvent[];
  taskToggles: Record<string, boolean>;
  ui: UI;
};

const ME = "tm-kevin";

const SEED_EVENTS: GEvent[] = [
  ["07:30", "data", "Calendar import (simulated)", "25 rows read from Google Calendar for 19 Oct. 24 unique visit occurrences; 1 duplicate row excluded.", "Calendar import", ["IMP-1019-0730"], "Google Calendar · simulated", "completed"],
  ["07:45", "data", "Duplicate import excluded", "CAL-RAW-0025 has the same occurrence key as CAL-RAW-0013 (Laurel Lodge). Kept in the audit trail; no second visit or charge.", "Calendar import", ["V-113", "CAL-RAW-0025"], "Google Calendar · simulated", "completed"],
  ["07:46", "ai", "Ops Watchdog flagged Friday", "Friday 23 Oct has 46 field hours booked against 40 available. The week overall is 182 of 200.", "Ops Watchdog", ["Fri 23 Oct"], "Agent", "completed"],
  ["07:50", "ai", "Capacity Planner proposed a move", "Three flexible ad-hoc visits (6 field hours) can move from Friday to Tuesday inside their Tue–Fri windows. Waiting for Kevin.", "Capacity Planner", ["Juniper Lodge", "Larch Court", "Clover Cottage"], "Agent", "awaiting"],
  ["08:00", "ai", "Briefing posted the 08:00 snapshot", "24 visits scheduled; Friday 46/40 hours; Harbour House's earlier €210 payment still missing from the ledger.", "Briefing", ["Kevin Whitty"], "Agent", "completed"],
  ["08:05", "people", "Sean deferred two visits for weather", "Sycamore House and Foxglove Cottage moved to Mon 26 Oct. Original occurrence keys kept.", "Sean Murphy", ["V-122", "V-123"], "Pulse", "completed"],
  ["08:40", "people", "Emma logged a cancellation", "Parkside cancelled by phone. Excluded from the sheet; no call-out charge in this demo.", "Emma Byrne", ["V-124", "Parkside"], "Pulse", "completed"],
  ["09:00", "ai", "Ledger Checker found a lag", "DEMO-PAY-021 (€210, Harbour House, 18 Oct) is in Stripe but has no Google Sheets row yet. Already paid; never charge again.", "Ledger Checker", ["DEMO-PAY-021", "Harbour House"], "Google Sheets · mock", "awaiting"],
  ["09:45", "people", "Patrick completed Harbour House", "Autumn tidy finished. Paid in advance against Q-DEMO-0418.", "Patrick Doyle", ["V-121"], "Field note · demo", "completed"],
  ["10:00", "people", "Aoife completed Oak Lodge", "Routine visit plus a boundary hedge reduction the customer asked for on site. Outside the agreed scope.", "Aoife Nolan", ["V-120", "Oak Lodge"], "Field note · demo", "completed"],
  ["10:02", "ai", "Contract Guard held an extra", "V-120 extra hedge work is excluded from AGR-013 scope and has no price. Held for review; task sent to Emma.", "Contract Guard", ["V-120", "AGR-013"], "Agent", "awaiting"],
  ["12:30", "data", "Calendar import (simulated)", "Midday refresh: 25 rows, 0 new occurrences, nothing changed.", "Calendar import", ["IMP-1019-1230"], "Google Calendar · simulated", "completed"],
  ["13:45", "people", "Sean completed Birch House", "Routine visit. Covered by AGR-001; no extra charge.", "Sean Murphy", ["V-101", "AGR-001"], "Field note · demo", "completed"],
  ["14:45", "people", "Last completion note of the day", "Willow Court and Ashfield closed. 21 of 24 visits completed.", "Aoife Nolan", ["V-102", "V-104"], "Field note · demo", "completed"],
  ["17:00", "ai", "Charge Sheet Assistant prepared the sheet", "7 items ready to process manually: €615 through the Stripe flow, €600 through Invoice Home. 1 extra unpriced.", "Charge Sheet Assistant", ["Daily charge sheet"], "Agent", "completed"],
].map((e, i) => ({ id: "ev-seed-" + i, date: DEMO.date, at: e[0] as string, stream: e[1] as GEvent["stream"], title: e[2] as string,
  note: e[3] as string, actor: e[4] as string, related: e[5] as string[], source: e[6] as string, status: e[7] as GEvent["status"], simulated: true }));

function initial(): GState {
  return {
    clock: DEMO.minutes,
    payments: HISTORY.payments.map(p => ({ ...p, allocations: p.allocations.slice() })),
    ledger: HISTORY.ledger.slice(),
    invoices: HISTORY.invoices.slice(),
    prices: {},
    confirmations: {},
    moved: false,
    importRuns: [{ at: "07:30", rows: 25, matched: 24, created: 24, duplicates: 1 }, { at: "12:30", rows: 25, matched: 25, created: 0, duplicates: 1 }],
    ledgerRuns: [],
    exports: [],
    copies: [],
    events: SEED_EVENTS.slice().reverse(),
    taskToggles: {},
    ui: {
      tabs: { Dashboard: "ops", Schedule: "today", "Charge Desk": "sheet", Properties: "directory", Contracts: "overview" },
      charge: { date: DEMO.date, filter: "ready", q: "", sort: "property", dir: 1, selected: [], reviewCat: "all" },
      props: { q: "", status: "all", area: "all", page: 0, historyQ: "", historyOutcome: "all" },
      contracts: { q: "", rule: "all", page: 0 },
      schedule: { day: DEMO.date, staff: "all", recurQ: "" },
      records: { q: "", status: "all", page: 0 },
      drawer: null, modal: null, toast: null,
    },
  };
}

let state: GState = initial();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const getState = () => state;
export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function useGardener(): GState { return useSyncExternalStore(subscribe, getState, getState); }

function set(patch: Partial<GState> | ((s: GState) => Partial<GState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
}
export function setUi(patch: Partial<UI> | ((u: UI) => Partial<UI>)) {
  set(s => ({ ui: { ...s.ui, ...(typeof patch === "function" ? patch(s.ui) : patch) } }));
}
export function setSub<K extends "charge" | "props" | "contracts" | "schedule" | "records">(key: K, patch: Partial<UI[K]>) {
  set(s => ({ ui: { ...s.ui, [key]: { ...s.ui[key], ...patch } } }));
}
export function setTab(page: string, tab: string) {
  set(s => ({ ui: { ...s.ui, tabs: { ...s.ui.tabs, [page]: tab } } }));
}

/* Each action moves the demo clock on one minute, so the activity trail keeps
   an honest order without ever leaving the 19 Oct afternoon snapshot. */
function tick(s: GState) { return s.clock + 1; }
function ev(s: GState, clock: number, e: Omit<GEvent, "id" | "date" | "at" | "simulated"> & { simulated?: boolean }): GEvent[] {
  return [{ id: "ev-" + clock + "-" + s.events.length, date: DEMO.date, at: hhmm(clock), simulated: true, ...e }].concat(s.events);
}
export function toast(text: string) { set(s => ({ ui: { ...s.ui, toast: { text, n: (s.ui.toast?.n || 0) + 1 } } })); }

/* ── Navigation bridge: PulseLogic registers the page switcher. ──────────── */
let navigator: ((page: string) => void) | null = null;
export function registerNavigator(fn: (page: string) => void) { navigator = fn; }
export function go(page: string, tab?: string, extra?: { filter?: string; drawer?: Drawer; reviewCat?: string }) {
  set(s => {
    const ui: UI = { ...s.ui, modal: null };
    if (tab) ui.tabs = { ...ui.tabs, [page]: tab };
    if (extra?.filter) ui.charge = { ...ui.charge, filter: extra.filter, date: DEMO.date };
    if (extra?.reviewCat) ui.charge = { ...ui.charge, reviewCat: extra.reviewCat };
    ui.drawer = extra && "drawer" in extra ? extra.drawer || null : null;
    return { ui };
  });
  if (navigator) navigator(page);
}
export function openDrawer(d: Drawer) { setUi({ drawer: d }); }
export function closeDrawer() { setUi({ drawer: null }); }
export function openModal(m: Modal) { setUi({ modal: m }); }
export function closeModal() { setUi({ modal: null }); }

/* ── Actions ────────────────────────────────────────────────────────────── */
export type Result = { ok: true } | { ok: false; error: string };

export function recordPayment(visitId: string, lineIds: string[], outstanding: number, input: { ref: string; cents: number; date: string }): Result {
  const ref = input.ref.trim();
  if (!ref) return { ok: false, error: "Enter the payment reference from Stripe." };
  if (!Number.isInteger(input.cents) || input.cents <= 0) return { ok: false, error: "Enter the amount that was paid." };
  if (input.cents !== outstanding) return { ok: false, error: "Amount must match the outstanding €" + (outstanding / 100).toFixed(2) + " for this visit. Partial payments are not part of this demo." };
  if (!input.date) return { ok: false, error: "Enter the payment date." };
  if (state.payments.some(p => p.ref.toLowerCase() === ref.toLowerCase())) return { ok: false, error: "Reference " + ref + " is already recorded. The same payment cannot be recorded twice." };
  if (state.payments.some(p => p.allocations.some(a => lineIds.indexOf(a.lineId) > -1))) return { ok: false, error: "A payment is already recorded against this visit." };
  set(s => {
    const c = tick(s);
    const pay: Payment = { id: "PAY-" + c, ref, cents: input.cents, date: input.date, method: "stripe",
      allocations: lineIds.map(id => ({ lineId: id, cents: 0 })), recordedBy: ME, recordedAt: DEMO.date + " " + hhmm(c), simulated: true,
      note: "Recorded after manual processing in the existing Stripe flow (demo). Pulse did not move money." };
    // Allocate explicitly, line by line, in line order.
    let left = input.cents;
    pay.allocations = lineIds.map(id => {
      const want = lineCents(id);
      const take = Math.min(left, want); left -= take; return { lineId: id, cents: take };
    });
    return { clock: c, payments: s.payments.concat([pay]),
      events: ev(s, c, { stream: "people", title: "Kevin recorded a manual payment (demo)", note: ref + " for €" + (input.cents / 100).toFixed(2) + " against " + visitId + ". Recorded only; no money moved in Pulse.",
        actor: "Kevin Whitty", related: [visitId, ref], source: "Pulse · simulated", status: "completed" }) };
  });
  toast("Payment " + ref + " recorded (demo). Ledger match pending.");
  return { ok: true };
}

/* Line amount lookup for allocation; resolved prices win over unpriced. */
function lineCents(lineId: string) {
  const r = state.prices[lineId];
  if (r) return r.cents;
  for (const v of VISITS) for (const l of v.lines) if (l.id === lineId) return l.cents || 0;
  return 0;
}

export function recordInvoice(visitId: string, lineId: string, cents: number, propertyId: string, input: { ref: string; dueOn: string }): Result {
  const ref = input.ref.trim();
  if (!ref) return { ok: false, error: "Enter the Invoice Home invoice number." };
  if (!input.dueOn) return { ok: false, error: "Enter the due date shown on the invoice." };
  if (state.invoices.some(i => i.ref.toLowerCase() === ref.toLowerCase())) return { ok: false, error: "Invoice " + ref + " is already recorded." };
  if (state.invoices.some(i => i.lineId === lineId)) return { ok: false, error: "An invoice already exists for this visit. It cannot be prepared again." };
  set(s => {
    const c = tick(s);
    const inv: Invoice = { id: "INV-" + c, ref, lineId, cents, issuedOn: DEMO.date, dueOn: input.dueOn, status: "awaiting",
      recordedBy: ME, recordedAt: DEMO.date + " " + hhmm(c), propertyId };
    return { clock: c, invoices: s.invoices.concat([inv]),
      events: ev(s, c, { stream: "people", title: "Kevin recorded an Invoice Home invoice (demo)", note: ref + " for €" + (cents / 100).toFixed(2) + " against " + visitId + ". Awaiting payment; nothing is marked paid.",
        actor: "Kevin Whitty", related: [visitId, ref], source: "Invoice Home · recorded manually", status: "completed" }) };
  });
  toast("Invoice " + ref + " recorded. Payment still outstanding.");
  return { ok: true };
}

export function recordInvoicePayment(invoiceId: string, input: { ref: string; date: string }): Result {
  const inv = state.invoices.find(i => i.id === invoiceId);
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (inv.status === "paid") return { ok: false, error: "This invoice is already marked paid." };
  const ref = input.ref.trim();
  if (!ref) return { ok: false, error: "Enter the bank or payment reference." };
  if (state.payments.some(p => p.ref.toLowerCase() === ref.toLowerCase())) return { ok: false, error: "Reference " + ref + " is already recorded." };
  set(s => {
    const c = tick(s);
    const pay: Payment = { id: "PAY-" + c, ref, cents: inv.cents, date: input.date || DEMO.date, method: "invoicehome",
      allocations: [{ lineId: inv.lineId, cents: inv.cents }], recordedBy: ME, recordedAt: DEMO.date + " " + hhmm(c), simulated: true,
      note: "Payment against " + inv.ref + " recorded manually (demo)." };
    return { clock: c, payments: s.payments.concat([pay]),
      invoices: s.invoices.map(i => i.id === invoiceId ? { ...i, status: "paid" as const } : i),
      events: ev(s, c, { stream: "people", title: "Invoice payment recorded (demo)", note: inv.ref + " marked paid with " + ref + ".",
        actor: "Kevin Whitty", related: [inv.ref, ref], source: "Pulse · simulated", status: "completed" }) };
  });
  toast("Invoice payment recorded (demo).");
  return { ok: true };
}

export function resolvePrice(lineId: string, visitId: string, input: { cents: number; ref: string }): Result {
  if (!Number.isInteger(input.cents) || input.cents <= 0) return { ok: false, error: "Enter the agreed price." };
  if (!input.ref.trim()) return { ok: false, error: "Enter the quote or source reference the price comes from." };
  if (state.prices[lineId]) return { ok: false, error: "A price is already confirmed for this line." };
  set(s => {
    const c = tick(s);
    return { clock: c, prices: { ...s.prices, [lineId]: { cents: input.cents, ref: input.ref.trim(), by: ME, at: hhmm(c) } },
      events: ev(s, c, { stream: "people", title: "Kevin confirmed a price", note: "€" + (input.cents / 100).toFixed(2) + " for " + lineId + " from " + input.ref.trim() + ". The item is now ready for manual processing; nothing has been charged.",
        actor: "Kevin Whitty", related: [visitId, input.ref.trim()], source: "Pulse", status: "completed" }) };
  });
  toast("Price confirmed. Item moved to Ready; no payment taken.");
  return { ok: true };
}

export function confirmCompletion(visitId: string, note: string): Result {
  if (!note.trim()) return { ok: false, error: "Describe what was done, as the crew reported it." };
  if (state.confirmations[visitId]) return { ok: false, error: "Completion is already confirmed." };
  set(s => {
    const c = tick(s);
    return { clock: c, confirmations: { ...s.confirmations, [visitId]: { by: ME, at: hhmm(c), note: note.trim() } },
      events: ev(s, c, { stream: "people", title: "Kevin confirmed a completion", note: visitId + ": " + note.trim(),
        actor: "Kevin Whitty", related: [visitId], source: "Pulse", status: "completed" }) };
  });
  toast("Completion confirmed with your name and the time.");
  return { ok: true };
}

export function applyMove(): Result {
  if (state.moved) return { ok: false, error: "The move is already applied." };
  set(s => {
    const c = tick(s);
    return { clock: c, moved: true,
      events: ev(s, c, { stream: "people", title: "Kevin approved the Friday move (local only)", note: "Juniper Lodge, Larch Court and Clover Cottage moved Fri 23 → Tue 20 Oct. Friday 46 → 40 h, Tuesday 33 → 39 h. No Google Calendar write in this demo.",
        actor: "Kevin Whitty", related: ["Juniper Lodge", "Larch Court", "Clover Cottage"], source: "Pulse · simulated", status: "completed" }) };
  });
  toast("Schedule updated locally. Friday is at 40 of 40 hours.");
  return { ok: true };
}

export function refreshLedger(): { added: string[] } {
  const missing = state.payments.filter(p => p.method === "stripe" && !state.ledger.some(l => l.paymentRef === p.ref));
  set(s => {
    const c = tick(s);
    const rows = missing.map((p, i) => ({ id: "LED-" + c + "-" + i, paymentRef: p.ref, cents: p.cents, date: p.date, addedAt: DEMO.date + " " + hhmm(c) }));
    return { clock: c, ledger: s.ledger.concat(rows), ledgerRuns: s.ledgerRuns.concat([{ at: hhmm(c), added: rows.map(r => r.paymentRef) }]),
      events: ev(s, c, { stream: "data", title: "Ledger refresh (simulated)", note: rows.length
          ? rows.length + " Sheets row" + (rows.length === 1 ? "" : "s") + " matched: " + rows.map(r => r.paymentRef).join(", ") + ". Cash collected unchanged."
          : "No missing rows. Every recorded Stripe payment already has a ledger entry.",
        actor: "Stripe → Sheets connector", related: rows.map(r => r.paymentRef), source: "Google Sheets · mock", status: "completed" }) };
  });
  toast(missing.length ? missing.length + " ledger row" + (missing.length === 1 ? "" : "s") + " matched (simulated)." : "Ledger already up to date.");
  return { added: missing.map(p => p.ref) };
}

export function rerunImport() {
  set(s => {
    const c = tick(s);
    return { clock: c, importRuns: s.importRuns.concat([{ at: hhmm(c), rows: 25, matched: 25, created: 0, duplicates: 1 }]),
      events: ev(s, c, { stream: "data", title: "Calendar import re-run (simulated)", note: "25 rows read. All 24 occurrence keys already known; 0 new visits, 0 new charges. CAL-RAW-0025 still excluded as a duplicate.",
        actor: "Calendar import", related: ["IMP-1019-" + hhmm(c).replace(":", "")], source: "Google Calendar · simulated", status: "completed" }) };
  });
  toast("Import re-run: 0 new visits, 0 new charges.");
}

export function logExport(kind: string, date: string, rows: number, file: string) {
  set(s => {
    const c = tick(s);
    return { clock: c, exports: s.exports.concat([{ at: hhmm(c), date, kind, rows, file }]),
      events: ev(s, c, { stream: "people", title: "Charge sheet exported", note: file + " · " + rows + " row" + (rows === 1 ? "" : "s") + ".",
        actor: "Kevin Whitty", related: ["Daily charge sheet"], source: "Pulse", status: "completed" }) };
  });
}
export function logCopy(what: string) {
  set(s => {
    const c = tick(s);
    return { clock: c, copies: s.copies.concat([{ at: hhmm(c), what }]),
      events: ev(s, c, { stream: "people", title: "Charge details copied", note: what + " copied for manual processing.", actor: "Kevin Whitty", related: [what], source: "Pulse", status: "completed" }) };
  });
}
export function toggleTask(id: string, done: boolean) {
  set(s => {
    const c = tick(s);
    return { clock: c, taskToggles: { ...s.taskToggles, [id]: done },
      events: ev(s, c, { stream: "people", title: done ? "Task marked done" : "Task reopened", note: id, actor: "Kevin Whitty", related: [id], source: "Pulse", status: "completed" }) };
  });
}

export function resetDemo() {
  const tabs = state.ui.tabs;
  state = initial();
  state.ui.tabs = tabs;
  state.ui.toast = { text: "Demo reset. The 19 Oct story is back to its starting values.", n: 1 };
  emit();
}

export const PRIMROSE = PRIMROSE_VISIT;
