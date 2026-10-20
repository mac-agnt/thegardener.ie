/* Deterministic answers for the Home chat, the mini chat and the agents.
   No model is connected: each supported question is matched by intent and
   answered from the current store, so totals are never stale. */
import { getState, go } from "./store";
import {
  totals, todayRows, capacity, issues, reconRows, invoiceRows, eur, word, Word, hours, plural,
  PROPERTIES, propById, dayLabel, CATEGORY_LABEL, nextVisitFor, propertyIssues, type Row,
} from "./selectors";
import { agrById } from "./fixtures";

export type Act = { label: string; primary?: boolean; run?: () => void; ask?: string };
export type Answer = { tool: string; text: string; cols?: string[]; rows?: string[][]; actions: Act[] };

const open = (page: string, tab?: string, extra?: Parameters<typeof go>[2]) => () => go(page, tab, extra);
const openProperty = (id: string) => open("Properties", "directory", { drawer: { kind: "property", id } });
const openVisit = (id: string) => open("Charge Desk", "sheet", { filter: "all", drawer: { kind: "visit", id } });

export const SUGGESTIONS = [
  "Show today's charge sheet",
  "What still needs a decision?",
  "Which visits are already covered?",
  "Why is Friday overloaded?",
  "Show payments missing from the ledger",
];

function chargeSheet(): Answer {
  const s = getState(), t = totals(s);
  const ready = todayRows(s).filter(r => r.category === "ready");
  let text = t.ready
    ? Word(t.ready) + " item" + (t.ready === 1 ? " is" : "s are") + " ready to process manually today, " + eur(t.readyCents) + " in total: "
      + plural(t.stripe, "item") + " through your existing Stripe flow (" + eur(t.stripeCents) + ") and " + plural(t.ih, "item") + " through Invoice Home (" + eur(t.ihCents) + "). "
      + "Pulse does not charge anyone: you process each one in its own tool, then record the outcome here."
    : "Nothing is waiting to be processed on today's sheet.";
  if (t.unpriced) text += " " + Word(t.unpriced) + " completed extra is held for a price and is not in that total.";
  if (t.paid) text += " " + plural(t.paid, "visit") + " (" + eur(t.paidCents) + ") " + (t.paid === 1 ? "is" : "are") + " already paid and stay out of the queue.";
  return { tool: "charge_sheet.read", text, cols: ["Property", "Service", "Route", "Amount"],
    rows: ready.map(r => [r.p.name, r.lines.filter(l => l.basis === "chargeable").map(l => l.label).join(" + "), r.route === "stripe" ? "Stripe (manual)" : "Invoice Home", eur(r.outstandingCents)]),
    actions: [{ label: "Open today's charge sheet", primary: true, run: open("Charge Desk", "sheet", { filter: "ready" }) },
      ...(t.unpriced ? [{ label: "Open Oak Lodge review", run: openVisit("V-120") }] : [])] };
}

function decisions(): Answer {
  const s = getState();
  const need = issues(s).filter(i => i.open && ["ISS-PRICE", "ISS-FRIDAY", "ISS-EVIDENCE", "ISS-RECUR"].indexOf(i.id) > -1);
  if (!need.length) return { tool: "exceptions.list", text: "Nothing needs a decision right now. Ordinary manual charges do not need approval; they are on the charge sheet.",
    actions: [{ label: "Open Work", run: open("Work") }] };
  const text = Word(need.length) + " thing" + (need.length === 1 ? " needs" : "s need") + " a person to decide. "
    + need.map(i => i.title + " (" + i.owner.first + ", due " + i.due + ")").join("; ") + ". Ordinary charges are not on this list; they only need processing.";
  return { tool: "exceptions.list", text, cols: ["Decision", "Owner", "Due", "Kind"],
    rows: need.map(i => [i.title, i.owner.name, i.due, i.kind]),
    actions: [
      ...(need.some(i => i.id === "ISS-PRICE") ? [{ label: "Price Oak Lodge", primary: true, run: openVisit("V-120") }] : []),
      ...(need.some(i => i.id === "ISS-FRIDAY") ? [{ label: "Preview the Friday move", run: open("Schedule", "capacity") }] : []),
      { label: "Open approvals", run: open("Work") },
    ] };
}

function covered(): Answer {
  const s = getState();
  const inc = todayRows(s).filter(r => r.category === "included" || (r.a && r.lines.some(l => l.basis === "included") && r.v.outcome === "completed"));
  const text = plural(inc.length, "completed visit") + " today " + (inc.length === 1 ? "is" : "are") + " covered by quarterly agreements, so the routine work carries €0 extra. "
    + "The quarterly fee is never divided by visits and charged again. Birch House, for example, is covered by AGR-001: " + eur((agrById("AGR-001") as any).feeCents) + " for 1 Aug to 31 Oct, already paid. "
    + (inc.some(r => r.p.name === "Oak Lodge") ? "Oak Lodge's routine work is covered too, but its extra hedge work is not." : "");
  return { tool: "agreements.check_scope", text, cols: ["Property", "Agreement", "Period", "Extra today"],
    rows: inc.map(r => [r.p.name, r.a ? r.a.id : "—", r.a ? dayLabel(r.a.periodStart) + " – " + dayLabel(r.a.periodEnd) : "—", r.category === "review" ? "Extra unpriced" : "€0"]),
    actions: [{ label: "Show included visits", primary: true, run: open("Charge Desk", "sheet", { filter: "included" }) },
      { label: "Open Birch House", run: openProperty(PROPERTIES.find(p => p.name === "Birch House")!.id) }] };
}

function friday(): Answer {
  const s = getState(), c = capacity(s);
  const days = c.days.map(d => [d.label, hours(d.booked) + " / " + hours(d.cap) + " h", d.pct + "%", d.over ? "Over" : d.booked === d.cap ? "Full" : "OK"]);
  const text = s.moved
    ? "Friday is no longer overloaded. The three flexible visits now sit on Tuesday, so Friday is at " + hours(c.fri.booked) + " of 40 field hours (no spare buffer) and Tuesday at " + hours(c.tue.booked) + ". The week still totals " + hours(c.booked) + " of " + hours(c.cap) + " hours."
    : "This week is " + hours(c.booked) + " of " + hours(c.cap) + " field hours (" + c.pct + "%), but that average hides Friday: " + hours(c.fri.booked) + " hours booked against 40 (" + c.fri.pct + "%). "
      + "Three flexible ad-hoc visits (" + c.flex.map(f => f.p.name).join(", ") + ") total " + word(c.flexMins / 60) + " field hours and their windows allow Tuesday to Friday. Moving them to Tuesday takes Friday to 40 and Tuesday to " + hours(c.preview.tueAfter) + ", with contracted slots untouched.";
  return { tool: "capacity.week", text, cols: ["Day", "Booked", "Load", "State"], rows: days,
    actions: [{ label: s.moved ? "Open capacity" : "Preview the move", primary: true, run: open("Schedule", "capacity") }, { label: "Open the week", run: open("Schedule", "week") }] };
}

function ledger(): Answer {
  const s = getState();
  const pending = reconRows(s).filter(r => r.state === "pending");
  const text = pending.length
    ? plural(pending.length, "payment") + " recorded in Stripe " + (pending.length === 1 ? "has" : "have") + " no matching Google Sheets row yet, " + eur(pending.reduce((n, r) => n + r.p.cents, 0)) + " in total. "
      + "That is a ledger lag, not non-payment: " + pending.map(r => r.p.ref + " (" + (r.prop ? r.prop.name : "") + ", " + eur(r.p.cents) + ")").join(", ") + ". None of these can be charged again."
    : "Every recorded Stripe payment has a matching ledger row. Nothing is waiting on the Stripe → Sheets connector.";
  return { tool: "ledger.compare", text, cols: pending.length ? ["Payment", "Property", "Amount", "Paid"] : undefined,
    rows: pending.map(r => [r.p.ref, r.prop ? r.prop.name : "—", eur(r.p.cents), dayLabel(r.p.date)]),
    actions: [{ label: "Open reconciliation", primary: true, run: open("Charge Desk", "reconciliation") },
      { label: "Open Harbour House", run: openProperty(PROPERTIES.find(p => p.name === "Harbour House")!.id) }] };
}

function invoices(): Answer {
  const s = getState(), q = invoiceRows(s);
  const text = (q.prep.length ? plural(q.prep.length, "invoice") + " to prepare in Invoice Home, " + eur(q.prep.reduce((n, r) => n + r.outstandingCents, 0)) + ": " + q.prep.map(r => r.p.name + " " + eur(r.outstandingCents)).join(", ") + ". " : "No Invoice Home invoices are waiting to be prepared. ")
    + (q.awaiting.length ? plural(q.awaiting.length, "recorded invoice") + " " + (q.awaiting.length === 1 ? "is" : "are") + " awaiting payment. Recording an invoice never marks it paid." : "");
  return { tool: "invoices.queue", text, actions: [{ label: "Open invoices", primary: true, run: open("Charge Desk", "invoices") }] };
}

function property(name: string): Answer {
  const s = getState();
  const p = PROPERTIES.find(x => x.name.toLowerCase() === name) as typeof PROPERTIES[number];
  const row = todayRows(s).find(r => r.p.id === p.id) as Row | undefined;
  const a = agrById(p.agreementId);
  const iss = propertyIssues(s, p.id);
  const nv = nextVisitFor(s, p.id);
  let text = p.name + " (" + p.area + ") is " + (a ? "on quarterly agreement " + a.id + ", " + a.recurrence.label.toLowerCase() : "an ad-hoc customer") + ", paid via " + (p.route === "stripe" ? "the Stripe flow" : "Invoice Home") + ". ";
  if (row) text += "Today " + row.v.id + " is " + row.status.toLowerCase() + " and " + CATEGORY_LABEL[row.category].toLowerCase() + ": " + row.why + " Next: " + row.next;
  else if (nv) text += "Next visit " + dayLabel(nv.date) + ".";
  if (iss.length) text += " Open: " + iss.map(i => i.title).join("; ") + ".";
  return { tool: "records.property", text, actions: [{ label: "Open " + p.name, primary: true, run: openProperty(p.id) },
    ...(row ? [{ label: "Open " + row.v.id + " on the sheet", run: openVisit(row.v.id) }] : [])] };
}

export function answer(q: string): Answer {
  const s = q.toLowerCase();
  const named = PROPERTIES.map(p => p.name.toLowerCase()).filter(n => s.indexOf(n) > -1).sort((a, b) => b.length - a.length)[0];
  if (named) return property(named);
  if (/ledger|sheets|reconcil|missing from|lag/.test(s)) return ledger();
  if (/friday|overload|capacity|hours|busy|too much|schedule/.test(s)) return friday();
  if (/decision|decide|approv|attention|held|need(s)? (me|a)|exception/.test(s)) return decisions();
  if (/covered|included|contract|agreement|quarterly|retainer/.test(s)) return covered();
  if (/invoice/.test(s)) return invoices();
  if (/charge|ready|process|sheet|bill|stripe|today/.test(s)) return chargeSheet();
  return { tool: "demo.limits",
    text: "This is a front-end demo with seeded records, not a connected model, so I can only answer what the data supports: today's charge sheet, what still needs a decision, which visits are covered, Friday's capacity, ledger gaps, Invoice Home items, or any property by name (try “Oak Lodge”).",
    actions: [{ label: "Show today's charge sheet", primary: true, ask: "Show today's charge sheet" }, { label: "What still needs a decision?", ask: "What still needs a decision?" }] };
}
