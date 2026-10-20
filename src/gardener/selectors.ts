/* Derived views over the store. Counts, totals, issues and briefings are all
   computed here from records, never copied as constants. */
import {
  DEMO, VISITS, HISTORY_VISITS, PROPERTIES, CUSTOMERS, AGREEMENTS, TEAM, FIELD, WEEK, LAST_WEEK, RAW_IMPORTS, HISTORY,
  FLEX_IDS, PRIMROSE_VISIT, DAY_CAPACITY_MIN, STAFF_DAY_MIN,
  propById, custById, agrById, teamById, layoutDay, hhmm, dayLabel,
  type Visit, type Property, type Customer, type Agreement, type TeamMember, type Route, type Payment, type Invoice,
} from "./fixtures";
import type { GState } from "./store";

/* ── formatting ─────────────────────────────────────────────────────────── */
export const eur = (cents: number) => {
  const neg = cents < 0, c = Math.abs(cents);
  const whole = Math.floor(c / 100), frac = c % 100;
  return (neg ? "−" : "") + "€" + whole.toLocaleString("en-IE") + (frac ? "." + String(frac).padStart(2, "0") : "");
};
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export const word = (n: number) => (n >= 0 && n < WORDS.length ? WORDS[n] : String(n));
export const Word = (n: number) => { const w = word(n); return w.charAt(0).toUpperCase() + w.slice(1); };
export const plural = (n: number, one: string, many?: string) => n + " " + (n === 1 ? one : many || one + "s");
export const hours = (min: number) => { const h = min / 60; return (Number.isInteger(h) ? String(h) : h.toFixed(1)) ; };

/* ── per-state memo ─────────────────────────────────────────────────────── */
const memo = new WeakMap<GState, Map<string, unknown>>();
function cached<T>(s: GState, key: string, fn: () => T): T {
  let m = memo.get(s);
  if (!m) { m = new Map(); memo.set(s, m); }
  if (!m.has(key)) m.set(key, fn());
  return m.get(key) as T;
}

/* ── visits on the calendar, with the local move applied ─────────────────── */
export function weekVisits(s: GState): Visit[] {
  return cached(s, "week", () => VISITS.map(v => (s.moved && FLEX_IDS.indexOf(v.id) > -1)
    ? { ...v, date: "2026-10-20", order: 99, outcomeNote: "Moved from Fri 23 Oct inside its Tue–Fri window (local demo change)." }
    : v));
}
export function dayTimes(s: GState, date: string) {
  return cached(s, "times:" + date, () => layoutDay(allVisits(s).filter(v => v.date === date)));
}
export function allVisits(s: GState): Visit[] { return cached(s, "all", () => weekVisits(s).concat(HISTORY_VISITS)); }

/* ── charge lines and visit rows ─────────────────────────────────────────── */
export type LineView = {
  id: string; label: string; basis: "included" | "chargeable" | "unpriced";
  cents: number | null; source: string; ref: string | null; resolvedBy: string | null;
  payment: Payment | null; invoice: Invoice | null;
};
export type Category = "ready" | "invoiced" | "included" | "review" | "paid" | "excluded";
export type Row = {
  v: Visit; p: Property; c: Customer; a: Agreement | null; staff: TeamMember;
  time: string; start: number; end: number;
  lines: LineView[]; category: Category; route: Route;
  chargeCents: number; outstandingCents: number; paidCents: number;
  status: string; evidence: string; basis: string; processing: string; reconciliation: "matched" | "pending" | "n/a";
  next: string; why: string; owner: TeamMember; reviewKind: string | null; duplicateRaw: string[];
};

export const CATEGORY_LABEL: Record<Category, string> = {
  ready: "Ready", invoiced: "Invoice recorded", included: "Included", review: "Review", paid: "Already paid", excluded: "Excluded",
};

function lineViews(s: GState, v: Visit): LineView[] {
  return v.lines.map(l => {
    const r = s.prices[l.id];
    const basis = l.basis === "unpriced" && r ? "chargeable" : l.basis;
    const pay = s.payments.find(p => p.allocations.some(a => a.lineId === l.id)) || null;
    const inv = s.invoices.find(i => i.lineId === l.id) || null;
    return { id: l.id, label: l.label, basis, cents: r ? r.cents : l.cents,
      source: r ? "Price confirmed by Kevin Whitty at " + r.at : l.evidence, ref: r ? r.ref : l.evidenceRef,
      resolvedBy: r ? r.by : null, payment: pay, invoice: inv };
  });
}

function evidenceOf(s: GState, v: Visit) {
  if (v.completion) return { ok: true, text: "Completion note by " + teamById(v.completion.by).name + " at " + v.completion.at + ": " + v.completion.note };
  const c = s.confirmations[v.id];
  if (c) return { ok: true, text: "Confirmed by " + teamById(c.by).name + " at " + c.at + ": " + c.note };
  return { ok: false, text: "No completion note. A calendar booking alone does not prove the work was done." };
}

export function rowFor(s: GState, v: Visit): Row {
  const p = propById(v.propertyId), c = custById(p.customerId), a = agrById(p.agreementId), staff = teamById(v.staffId);
  const t = dayTimes(s, v.date)[v.id];
  const lines = lineViews(s, v);
  const ev = evidenceOf(s, v);
  const charge = lines.filter(l => l.basis === "chargeable");
  const chargeCents = charge.reduce((n, l) => n + (l.cents || 0), 0);
  const paidCents = charge.reduce((n, l) => n + (l.payment ? (l.payment.allocations.find(x => x.lineId === l.id)?.cents || 0) : 0), 0);
  const outstanding = charge.filter(l => !l.payment).reduce((n, l) => n + (l.cents || 0), 0);
  const unpriced = lines.some(l => l.basis === "unpriced");
  const dup = RAW_IMPORTS.filter(r => r.occurrenceKey === v.occurrenceKey).map(r => r.rawId);
  const route = p.route;
  const inScope = !a || (a.effectiveFrom <= v.date);
  let category: Category, why: string, next: string, reviewKind: string | null = null, owner = teamById("tm-emma");
  if (v.outcome === "scheduled" && v.date >= DEMO.date) {
    category = "excluded"; why = "Scheduled for " + dayLabel(v.date) + ". Not done yet, so nothing can be charged."; next = "Nothing to do until the visit is completed.";
  } else if (v.outcome === "rescheduled" || v.outcome === "cancelled") {
    category = "excluded";
    why = v.outcome === "rescheduled" ? "Rescheduled, not completed. " + v.outcomeNote + (v.rescheduledTo ? " New time " + dayLabel(v.rescheduledTo.slice(0, 10)) + " " + v.rescheduledTo.slice(11) + "." : "")
      : "Cancelled, not completed. " + v.outcomeNote;
    next = "Nothing to charge today.";
  } else if (!ev.ok) {
    category = "review"; reviewKind = "evidence";
    why = "Scheduled time has passed but there is no completion evidence. Time elapsed is not proof of work.";
    next = "Confirm completion from the crew's report, or mark it not done."; owner = teamById("tm-sean");
  } else if (!inScope) {
    category = "review"; reviewKind = "scope"; why = "Visit date falls outside the agreement's effective dates."; next = "Check the agreement dates.";
  } else if (unpriced) {
    category = "review"; reviewKind = "price";
    why = "Completed and confirmed, but the extra work is outside " + (a ? a.id : "the agreement") + " scope and no confirmed price or quote exists. Unknown is not €0.";
    next = "Get a price and a source reference, then confirm it here."; owner = teamById("tm-emma");
  } else if (charge.length === 0) {
    category = "included";
    why = "Routine work inside " + (a ? a.id : "the agreement") + " scope, within its effective dates. The quarterly fee already covers it; the fee is not divided per visit.";
    next = "No action. €0 extra.";
  } else if (outstanding === 0) {
    category = "paid";
    const pay = charge[0].payment as Payment;
    const matched = s.ledger.some(l => l.paymentRef === pay.ref);
    why = "Payment " + pay.ref + " (" + eur(pay.cents) + ", " + dayLabel(pay.date) + ") already covers this work." + (pay.method === "stripe" && !matched ? " The Google Sheets ledger has no matching row yet: a lag, not non-payment." : "");
    next = pay.method === "stripe" && !matched ? "Do not charge again. Wait for the ledger, or run the simulated ledger refresh." : "No action.";
  } else if (charge.every(l => l.invoice)) {
    category = "invoiced";
    const inv = charge[0].invoice as Invoice;
    why = "Invoice " + inv.ref + " recorded in Invoice Home, due " + dayLabel(inv.dueOn) + ". Invoiced is not paid.";
    next = "Record the payment when it arrives.";
  } else {
    category = "ready";
    why = "Completed and confirmed, customer and property matched, price from " + charge.map(l => l.ref || l.source).join(", ")
      + ", no payment or invoice linked yet.";
    next = route === "stripe" ? "Process manually in the existing Stripe flow, then record the payment here." : "Prepare the invoice in Invoice Home, then record its number here.";
  }
  const charged = charge.find(l => l.payment)?.payment || null;
  const reconciliation = charged && charged.method === "stripe" ? (s.ledger.some(l => l.paymentRef === charged.ref) ? "matched" : "pending") : "n/a";
  const processing = category === "paid" ? "Payment recorded" : category === "invoiced" ? "Invoice recorded" : category === "ready" ? "Ready to process" : category === "review" ? "Held" : "None";
  const basis = category === "excluded" ? "Not billable today"
    : unpriced ? "Included + extra (unpriced)"
    : charge.length === 0 ? "Included in quarterly agreement"
    : lines.some(l => l.basis === "included") ? "Included + extra" : "Ad-hoc work";
  return {
    v, p, c, a, staff, time: t ? hhmm(t.serviceStart) : "", start: t ? t.serviceStart : 0, end: t ? t.end : 0,
    lines, category, route, chargeCents, outstandingCents: outstanding, paidCents,
    status: v.outcome === "completed" ? (ev.ok ? "Completed" : "No evidence") : v.outcome === "rescheduled" ? "Rescheduled" : v.outcome === "cancelled" ? "Cancelled" : ev.ok ? "Completed" : v.date < DEMO.date ? "No evidence" : "Scheduled",
    evidence: ev.text, basis, processing, reconciliation, next, why, owner, reviewKind, duplicateRaw: dup.length > 1 ? dup.slice(1) : [],
  };
}

export function todayRows(s: GState): Row[] {
  return cached(s, "today", () => weekVisits(s).filter(v => v.date === DEMO.date).map(v => rowFor(s, v)));
}

export function totals(s: GState) {
  return cached(s, "totals", () => {
    const rows = todayRows(s);
    const of = (c: Category) => rows.filter(r => r.category === c);
    const ready = of("ready"), stripe = ready.filter(r => r.route === "stripe"), ih = ready.filter(r => r.route === "invoicehome");
    const sum = (list: Row[], f: (r: Row) => number) => list.reduce((n, r) => n + f(r), 0);
    const paid = of("paid");
    const unrec = s.payments.filter(p => p.method === "stripe" && !s.ledger.some(l => l.paymentRef === p.ref));
    const review = of("review");
    return {
      visits: rows.length,
      completed: rows.filter(r => r.v.outcome === "completed").length,
      rescheduled: rows.filter(r => r.v.outcome === "rescheduled").length,
      cancelled: rows.filter(r => r.v.outcome === "cancelled").length,
      included: of("included").length,
      ready: ready.length, readyCents: sum(ready, r => r.outstandingCents),
      stripe: stripe.length, stripeCents: sum(stripe, r => r.outstandingCents),
      ih: ih.length, ihCents: sum(ih, r => r.outstandingCents),
      invoiced: of("invoiced").length, invoicedCents: sum(of("invoiced"), r => r.chargeCents),
      review: review.length,
      unpriced: review.filter(r => r.reviewKind === "price").length,
      reviewPricedCents: sum(review.filter(r => r.reviewKind !== "price"), r => r.chargeCents),
      paid: paid.length, paidCents: sum(paid, r => r.paidCents),
      excluded: of("excluded").length, duplicates: RAW_IMPORTS.length - new Set(RAW_IMPORTS.map(r => r.occurrenceKey)).size,
      rawRows: RAW_IMPORTS.length,
      unreconciled: unrec.length, unreconciledCents: unrec.reduce((n, p) => n + p.cents, 0), unreconciledRefs: unrec.map(p => p.ref),
    };
  });
}

/* ── capacity ───────────────────────────────────────────────────────────── */
export function capacity(s: GState) {
  return cached(s, "cap", () => {
    const wv = weekVisits(s);
    const days = WEEK.map(d => {
      const list = wv.filter(v => v.date === d.date);
      const booked = list.reduce((n, v) => n + v.serviceMins + v.travelMins, 0);
      const staff = FIELD.map(f => {
        const mine = list.filter(v => v.staffId === f.id);
        const m = mine.reduce((n, v) => n + v.serviceMins + v.travelMins, 0);
        return { staff: f, mins: m, visits: mine.length, over: m > STAFF_DAY_MIN };
      });
      return { ...d, booked, cap: DAY_CAPACITY_MIN, over: booked > DAY_CAPACITY_MIN, pct: Math.round(100 * booked / DAY_CAPACITY_MIN),
        visits: list.length, contract: list.filter(v => v.kind === "contract").length, flexible: list.filter(v => v.flexible).length, staff };
    });
    const booked = days.reduce((n, d) => n + d.booked, 0), cap = days.reduce((n, d) => n + d.cap, 0);
    const fri = days[4], tue = days[1];
    const flex = VISITS.filter(v => FLEX_IDS.indexOf(v.id) > -1);
    const flexMins = flex.reduce((n, v) => n + v.serviceMins + v.travelMins, 0);
    return { days, booked, cap, pct: Math.round(100 * booked / cap), fri, tue, moved: s.moved,
      flex: flex.map(v => ({ v, p: propById(v.propertyId), staff: teamById(v.staffId) })), flexMins,
      preview: { friBefore: s.moved ? fri.booked + flexMins : fri.booked, friAfter: s.moved ? fri.booked : fri.booked - flexMins,
        tueBefore: s.moved ? tue.booked - flexMins : tue.booked, tueAfter: s.moved ? tue.booked : tue.booked + flexMins } };
  });
}

/* ── issues: one list behind Needs Attention, exceptions, Work and agents ── */
export type Issue = {
  id: string; title: string; detail: string; kind: string; severity: "high" | "medium" | "low";
  open: boolean; owner: TeamMember; due: string; related: { label: string; kind: "property" | "visit" | "agreement" | "page"; id: string }[];
  propertyIds: string[]; action: string; resolution: string;
};
export function issues(s: GState): Issue[] {
  return cached(s, "issues", () => {
    const t = totals(s), cap = capacity(s);
    const P = (n: string) => PROPERTIES.find(p => p.name === n) as Property;
    const oak = P("Oak Lodge"), harbour = P("Harbour House"), elms = P("The Elms"), manor = P("Manor View");
    const prim = VISITS.concat(HISTORY_VISITS).find(v => v.id === PRIMROSE_VISIT) as Visit;
    const primP = propById(prim.propertyId);
    const ledgerOpen = !s.ledger.some(l => l.paymentRef === "DEMO-PAY-021");
    const otherUnrec = t.unreconciledRefs.filter(r => r !== "DEMO-PAY-021");
    const elmsRow = todayRows(s).find(r => r.p.id === elms.id) as Row, manorRow = todayRows(s).find(r => r.p.id === manor.id) as Row;
    const accessP = PROPERTIES[63];
    const list: Issue[] = [
      { id: "ISS-PRICE", title: "Oak Lodge extra hedge work has no price", detail: "V-120 is completed. Boundary hedge reduction is excluded from AGR-013 scope and no quote or rate exists.",
        kind: "Missing price", severity: "high", open: !s.prices["V-120-L2"], owner: teamById("tm-emma"), due: "Tue 20 Oct, 09:30",
        related: [{ label: "Oak Lodge", kind: "property", id: oak.id }, { label: "V-120", kind: "visit", id: "V-120" }, { label: "AGR-013", kind: "agreement", id: "AGR-013" }],
        propertyIds: [oak.id], action: "Enter price and source", resolution: s.prices["V-120-L2"] ? "Priced at " + eur(s.prices["V-120-L2"].cents) + " from " + s.prices["V-120-L2"].ref : "" },
      { id: "ISS-LEDGER", title: "Harbour House €210 paid, not in the ledger", detail: "DEMO-PAY-021 (18 Oct) is in Stripe with no Google Sheets row. Already paid: never re-enter the ready queue.",
        kind: "Ledger lag", severity: "medium", open: ledgerOpen, owner: teamById("tm-emma"), due: "Tue 20 Oct, 10:00",
        related: [{ label: "Harbour House", kind: "property", id: harbour.id }, { label: "V-121", kind: "visit", id: "V-121" }, { label: "Reconciliation", kind: "page", id: "Charge Desk:reconciliation" }],
        propertyIds: [harbour.id], action: "Check reconciliation", resolution: ledgerOpen ? "" : "Sheets row matched by simulated refresh" },
      ...otherUnrec.map(ref => {
        const pay = s.payments.find(p => p.ref === ref) as Payment;
        const vid = pay.allocations[0].lineId.replace(/-L\d+$/, "");
        const vv = VISITS.find(v => v.id === vid);
        const pp = vv ? propById(vv.propertyId) : null;
        return { id: "ISS-LEDGER-" + ref, title: (pp ? pp.name + " " : "") + eur(pay.cents) + " recorded, awaiting ledger row", detail: ref + " was recorded today. The Stripe → Sheets connector has not added its row yet.",
          kind: "Ledger lag", severity: "low" as const, open: true, owner: teamById("tm-emma"), due: "Tue 20 Oct",
          related: pp ? [{ label: pp.name, kind: "property" as const, id: pp.id }, { label: vid, kind: "visit" as const, id: vid }] : [],
          propertyIds: pp ? [pp.id] : [], action: "Check reconciliation", resolution: "" };
      }),
      { id: "ISS-FRIDAY", title: "Friday is 6 field hours over capacity", detail: "Fri 23 Oct: " + hours(cap.preview.friBefore) + " of 40 h booked. Three flexible ad-hoc visits can move to Tuesday inside their windows.",
        kind: "Capacity clash", severity: "high", open: !s.moved, owner: teamById("tm-kevin"), due: "Tue 20 Oct, 12:00",
        related: [{ label: "Capacity", kind: "page", id: "Schedule:capacity" }, ...cap.flex.map(f => ({ label: f.p.name, kind: "property" as const, id: f.p.id }))],
        propertyIds: cap.flex.map(f => f.p.id), action: "Preview the move", resolution: s.moved ? "Moved to Tuesday: Friday 40/40 h, Tuesday 39/40 h" : "" },
      { id: "ISS-EVIDENCE", title: primP.name + " has no completion evidence", detail: prim.id + " on " + dayLabel(prim.date) + " shows a booking but no completion note. Contract visit, so nothing to charge, but the record is incomplete.",
        kind: "Missing completion evidence", severity: "medium", open: !s.confirmations[prim.id], owner: teamById("tm-sean"), due: "Mon 19 Oct",
        related: [{ label: primP.name, kind: "property", id: primP.id }, { label: prim.id, kind: "visit", id: prim.id }],
        propertyIds: [primP.id], action: "Confirm completion", resolution: s.confirmations[prim.id] ? "Confirmed by " + teamById(s.confirmations[prim.id].by).name + " at " + s.confirmations[prim.id].at : "" },
      { id: "ISS-INVOICE", title: "Two Invoice Home invoices to prepare", detail: "The Elms €240 and Manor View €360 are outside the Stripe flow. Invoice creation and payment stay separate.",
        kind: "Invoice preparation", severity: "medium", open: !(elmsRow.lines[0].invoice && manorRow.lines[0].invoice), owner: teamById("tm-emma"), due: "Mon 19 Oct, 18:00",
        related: [{ label: "The Elms", kind: "property", id: elms.id }, { label: "Manor View", kind: "property", id: manor.id }, { label: "Invoices", kind: "page", id: "Charge Desk:invoices" }],
        propertyIds: [elms.id, manor.id], action: "Open invoices", resolution: "Both invoices recorded; payment outstanding" },
      { id: "ISS-WEATHER", title: "Two visits deferred for weather", detail: "Sycamore House and Foxglove Cottage rebooked for Mon 26 Oct. Occurrence keys kept, so neither can be charged twice.",
        kind: "Weather deferral", severity: "low", open: false, owner: teamById("tm-sean"), due: "Mon 26 Oct",
        related: [{ label: "Sycamore House", kind: "property", id: P("Sycamore House").id }, { label: "Foxglove Cottage", kind: "property", id: P("Foxglove Cottage").id }],
        propertyIds: [P("Sycamore House").id, P("Foxglove Cottage").id], action: "View visits", resolution: "Rebooked by Sean Murphy at 08:05" },
      { id: "ISS-CANCEL", title: "Parkside cancelled by the customer", detail: "Logged at 08:40. Excluded from the charge sheet.", kind: "Cancellation", severity: "low", open: false,
        owner: teamById("tm-emma"), due: "Mon 19 Oct", related: [{ label: "Parkside", kind: "property", id: P("Parkside").id }],
        propertyIds: [P("Parkside").id], action: "View visit", resolution: "Logged by Emma Byrne" },
      { id: "ISS-ACCESS", title: accessP.name + ": access to confirm before Thursday", detail: "The crew reported the side gate was locked last visit. Customer to confirm access arrangements. No codes are stored in Pulse.",
        kind: "Access issue", severity: "low", open: !s.taskToggles["T-11"], owner: teamById("tm-emma"), due: "Wed 21 Oct",
        related: [{ label: accessP.name, kind: "property", id: accessP.id }], propertyIds: [accessP.id], action: "Mark confirmed", resolution: "Access confirmed with the customer" },
      { id: "ISS-RECUR", title: "Two agreements say “bi-monthly”", detail: "AGR-022 and AGR-076: could mean twice a month or every two months. Pulse does not guess the interval.",
        kind: "Recurrence clarification", severity: "low", open: !s.taskToggles["T-06"], owner: teamById("tm-kevin"), due: "Fri 23 Oct",
        related: [{ label: "AGR-022", kind: "agreement", id: "AGR-022" }, { label: "AGR-076", kind: "agreement", id: "AGR-076" }],
        propertyIds: [(agrById("AGR-022") as Agreement).propertyId, (agrById("AGR-076") as Agreement).propertyId], action: "Mark clarified", resolution: "Interval confirmed" },
      { id: "ISS-QTR", title: "Two agreements lack quarterly payment evidence", detail: "AGR-047 and AGR-112 have no payment record for the current quarter. Their visits stay included; this does not make each visit chargeable.",
        kind: "Agreement payment evidence", severity: "medium", open: !s.taskToggles["T-07"], owner: teamById("tm-emma"), due: "Wed 21 Oct",
        related: [{ label: "AGR-047", kind: "agreement", id: "AGR-047" }, { label: "AGR-112", kind: "agreement", id: "AGR-112" }],
        propertyIds: [(agrById("AGR-047") as Agreement).propertyId, (agrById("AGR-112") as Agreement).propertyId], action: "Mark followed up", resolution: "Followed up with both customers" },
      ...reconRows(s).filter(r => r.state === "mismatch").map(r => ({ id: "ISS-MISMATCH", title: "Ledger amount differs for " + r.p.ref,
        detail: r.note, kind: "Ledger mismatch", severity: "low" as const, open: true, owner: teamById("tm-emma"), due: "Wed 21 Oct",
        related: [{ label: "Reconciliation", kind: "page" as const, id: "Charge Desk:reconciliation" }, ...(r.prop ? [{ label: r.prop.name, kind: "property" as const, id: r.prop.id }] : [])],
        propertyIds: r.prop ? [r.prop.id] : [], action: "Mark sheet corrected", resolution: "" })),
      { id: "ISS-DUP", title: "Duplicate calendar row excluded", detail: "CAL-RAW-0025 repeats Laurel Lodge's occurrence key. One visit, one €75 charge.", kind: "Duplicate import", severity: "low",
        open: false, owner: teamById("tm-emma"), due: "Mon 19 Oct", related: [{ label: "Laurel Lodge", kind: "property", id: P("Laurel Lodge").id }, { label: "V-113", kind: "visit", id: "V-113" }],
        propertyIds: [P("Laurel Lodge").id], action: "View source", resolution: "Excluded automatically by occurrence key" },
    ];
    return list;
  });
}

/* ── tasks: owners, dates, priority, linked records ─────────────────────── */
export type Task = { id: string; title: string; owner: TeamMember; due: string; dueSort: string; priority: "High" | "Medium" | "Low";
  area: string; done: boolean; auto: string | null; related: Issue["related"]; issueId: string | null; late: boolean };
export function tasks(s: GState): Task[] {
  return cached(s, "tasks", () => {
    const iss = issues(s);
    const I = (id: string) => iss.find(i => i.id === id) as Issue;
    const done = (id: string, auto: boolean) => auto || !!s.taskToggles[id];
    const exported = s.exports.some(e => e.date === DEMO.date);
    const list: Task[] = [
      { id: "T-01", title: "Get a price and source reference for Oak Lodge extra hedge work", owner: teamById("tm-emma"), due: "Tue 20 Oct, 09:30", dueSort: "2026-10-20 09:30", priority: "High", area: "Billing", done: !I("ISS-PRICE").open, auto: "Completes when a price is confirmed on V-120", related: I("ISS-PRICE").related, issueId: "ISS-PRICE", late: false },
      { id: "T-02", title: "Prepare Invoice Home invoices for The Elms and Manor View", owner: teamById("tm-emma"), due: "Mon 19 Oct, 18:00", dueSort: "2026-10-19 18:00", priority: "Medium", area: "Billing", done: !I("ISS-INVOICE").open, auto: "Completes when both invoice numbers are recorded", related: I("ISS-INVOICE").related, issueId: "ISS-INVOICE", late: false },
      { id: "T-03", title: "Decide on Friday's overload: move three flexible visits to Tuesday?", owner: teamById("tm-kevin"), due: "Tue 20 Oct, 12:00", dueSort: "2026-10-20 12:00", priority: "High", area: "Scheduling", done: !I("ISS-FRIDAY").open, auto: "Completes when the move is approved", related: I("ISS-FRIDAY").related, issueId: "ISS-FRIDAY", late: false },
      { id: "T-04", title: "Check Harbour House €210 reaches the Sheets ledger", owner: teamById("tm-emma"), due: "Tue 20 Oct, 10:00", dueSort: "2026-10-20 10:00", priority: "Medium", area: "Reconciliation", done: !I("ISS-LEDGER").open, auto: "Completes when DEMO-PAY-021 has a ledger row", related: I("ISS-LEDGER").related, issueId: "ISS-LEDGER", late: false },
      { id: "T-05", title: "Confirm completion for " + I("ISS-EVIDENCE").related[0].label + " (" + I("ISS-EVIDENCE").related[1].label + ")", owner: teamById("tm-sean"), due: "Mon 19 Oct, 17:00", dueSort: "2026-10-19 17:00", priority: "Medium", area: "Field", done: !I("ISS-EVIDENCE").open, auto: "Completes when completion is confirmed", related: I("ISS-EVIDENCE").related, issueId: "ISS-EVIDENCE", late: I("ISS-EVIDENCE").open },
      { id: "T-06", title: "Clarify “bi-monthly” on AGR-022 and AGR-076", owner: teamById("tm-kevin"), due: "Fri 23 Oct", dueSort: "2026-10-23 12:00", priority: "Low", area: "Contracts", done: done("T-06", false), auto: null, related: I("ISS-RECUR").related, issueId: "ISS-RECUR", late: false },
      { id: "T-07", title: "Follow up missing quarterly payment evidence (AGR-047, AGR-112)", owner: teamById("tm-emma"), due: "Wed 21 Oct", dueSort: "2026-10-21 12:00", priority: "Medium", area: "Contracts", done: done("T-07", false), auto: null, related: I("ISS-QTR").related, issueId: "ISS-QTR", late: false },
      { id: "T-08", title: "Rebook Sycamore House and Foxglove Cottage after the weather call", owner: teamById("tm-sean"), due: "Mon 19 Oct, 09:00", dueSort: "2026-10-19 09:00", priority: "Medium", area: "Scheduling", done: true, auto: "Done at 08:05", related: I("ISS-WEATHER").related, issueId: "ISS-WEATHER", late: false },
      { id: "T-09", title: "Review agreements due for renewal in November", owner: teamById("tm-kevin"), due: "Fri 30 Oct", dueSort: "2026-10-30 12:00", priority: "Low", area: "Contracts", done: done("T-09", false), auto: null, related: [{ label: "Renewals", kind: "page", id: "Contracts:renewals" }], issueId: null, late: false },
      { id: "T-10", title: "Export today's charge sheet for the records", owner: teamById("tm-emma"), due: "Mon 19 Oct, 18:00", dueSort: "2026-10-19 18:00", priority: "Low", area: "Billing", done: exported, auto: "Completes on the first CSV export", related: [{ label: "Daily sheet", kind: "page", id: "Charge Desk:sheet" }], issueId: null, late: false },
      { id: "T-11", title: "Confirm access arrangements for " + I("ISS-ACCESS").related[0].label, owner: teamById("tm-emma"), due: "Wed 21 Oct", dueSort: "2026-10-21 12:00", priority: "Low", area: "Field", done: done("T-11", false), auto: null, related: I("ISS-ACCESS").related, issueId: "ISS-ACCESS", late: false },
    ];
    const mm = HISTORY.ledger.find((l, i) => i === 5);
    if (mm) list.push({ id: "T-12", title: "Correct the Sheets amount for " + mm.paymentRef, owner: teamById("tm-emma"), due: "Wed 21 Oct", dueSort: "2026-10-21 15:00",
      priority: "Low", area: "Reconciliation", done: done("T-12", false), auto: null,
      related: [{ label: "Reconciliation", kind: "page", id: "Charge Desk:reconciliation" }], issueId: "ISS-MISMATCH", late: false });
    return list;
  });
}

/* ── reconciliation, invoices, history ──────────────────────────────────── */
export function reconRows(s: GState) {
  return cached(s, "recon", () => s.payments.filter(p => p.method === "stripe").map(p => {
    const led = s.ledger.find(l => l.paymentRef === p.ref) || null;
    const lineId = p.allocations[0]?.lineId || "";
    const vid = lineId.replace(/-L\d+$/, "");
    const v = VISITS.concat(HISTORY_VISITS).find(x => x.id === vid) || null;
    const prop = v ? propById(v.propertyId) : null;
    const lagDays = led ? Math.round((Date.parse(led.addedAt.slice(0, 10)) - Date.parse(p.date)) / 864e5) : Math.round((Date.parse(DEMO.date) - Date.parse(p.date)) / 864e5);
    const mismatch = !!led && led.cents !== p.cents && !s.taskToggles["T-12"];
    return { p, led, v, prop, state: (led ? (mismatch ? "mismatch" : "matched") : "pending") as "matched" | "pending" | "mismatch", lagDays,
      note: mismatch ? "Sheets shows " + eur((led as { cents: number }).cents) + " against " + eur(p.cents) + " in Stripe. Fix the sheet; never re-charge."
        : led ? (led.cents !== p.cents ? "Sheet corrected by hand" : lagDays > 0 ? "Matched after " + plural(lagDays, "day") : "Matched same day") : "No Sheets row yet (" + (lagDays ? plural(lagDays, "day") : "today") + ")" };
  }).sort((a, b) => { const o = { pending: 0, mismatch: 1, matched: 2 }; return o[a.state] - o[b.state] || b.p.date.localeCompare(a.p.date); }));
}

export function invoiceRows(s: GState) {
  return cached(s, "inv", () => {
    const prep = todayRows(s).filter(r => r.route === "invoicehome" && r.category === "ready");
    const recorded = s.invoices.map(i => {
      const vid = i.lineId.replace(/-L\d+$/, "");
      const v = VISITS.concat(HISTORY_VISITS).find(x => x.id === vid) || null;
      const pay = s.payments.find(p => p.allocations.some(a => a.lineId === i.lineId)) || null;
      return { i, v, prop: propById(i.propertyId), pay };
    }).sort((a, b) => b.i.issuedOn.localeCompare(a.i.issuedOn));
    return { prep, awaiting: recorded.filter(r => r.i.status === "awaiting"), paid: recorded.filter(r => r.i.status === "paid") };
  });
}

export function historySheets(s: GState) {
  return cached(s, "hist", () => HISTORY.sheets.slice().reverse().map(sh => {
    const items = sh.items.map(it => {
      const inv = s.invoices.find(i => i.lineId === it.lineId);
      const status = it.route === "invoicehome" && inv ? (inv.status === "paid" ? "Invoice recorded · paid" : "Invoice recorded · awaiting payment") : it.status;
      return { ...it, status, prop: propById(it.propertyId) };
    });
    return { ...sh, items, cents: items.reduce((n, i) => n + i.cents, 0), label: dayLabel(sh.date) };
  }));
}

/* ── wider records ──────────────────────────────────────────────────────── */
export function nextVisitFor(s: GState, propertyId: string): Visit | null {
  const list = weekVisits(s).filter(v => v.propertyId === propertyId && v.outcome === "scheduled").sort((a, b) => a.date.localeCompare(b.date));
  if (list.length) return list[0];
  const today = weekVisits(s).find(v => v.propertyId === propertyId && v.outcome === "rescheduled");
  return today || null;
}
export function nextOccurrence(a: Agreement) {
  // Computed from the series weekday and interval. Monday's visits have happened at 17:15.
  const dow = a.weekday;
  if (a.recurrence.rule === "unclear") return "Held: interval unclear";
  const thisWeek = WEEK.find(w => w.dow === dow) as typeof WEEK[number];
  const weeks = a.recurrence.rule === "weekly" ? 1 : a.recurrence.rule === "2w" ? 2 : a.recurrence.rule === "4w" ? 4 : 8;
  const occursNow = VISITS.some(v => v.propertyId === a.propertyId && v.date === thisWeek.date && v.date > DEMO.date);
  if (occursNow) return dayLabel(thisWeek.date);
  const lastHere = VISITS.concat(HISTORY_VISITS).filter(v => v.propertyId === a.propertyId).map(v => v.date).sort().pop();
  const base = lastHere || thisWeek.date;
  const nextMs = Date.parse(base + "T12:00:00Z") + weeks * 7 * 864e5;
  let next = new Date(nextMs).toISOString().slice(0, 10);
  if (next <= DEMO.date) next = new Date(Date.parse(thisWeek.date + "T12:00:00Z") + weeks * 7 * 864e5).toISOString().slice(0, 10);
  return dayLabel(next);
}
export function propertyIssues(s: GState, propertyId: string) { return issues(s).filter(i => i.open && i.propertyIds.indexOf(propertyId) > -1); }
export function visitsFor(s: GState, propertyId: string) {
  return allVisits(s).filter(v => v.propertyId === propertyId).sort((a, b) => b.date.localeCompare(a.date));
}

export const COUNTS = {
  customers: CUSTOMERS.length,
  active: CUSTOMERS.filter(c => c.status === "active").length,
  registered: CUSTOMERS.filter(c => c.status === "registered").length,
  properties: PROPERTIES.length,
  contract: PROPERTIES.filter(p => p.kind === "contract").length,
  adhoc: PROPERTIES.filter(p => p.kind === "adhoc").length,
  agreements: AGREEMENTS.length,
  team: TEAM.length,
  field: FIELD.length,
};

/* ── completion trend (dated fixture rows) ─────────────────────────────── */
export function completionTrend(s: GState) {
  return cached(s, "trend", () => LAST_WEEK.concat([WEEK[0]]).map(d => {
    const list = allVisits(s).filter(v => v.date === d.date);
    const rows = list.map(v => rowFor(s, v));
    return { date: d.date, label: d.short + " " + d.date.slice(8), booked: list.length,
      completed: rows.filter(r => r.status === "Completed").length,
      deferred: list.filter(v => v.outcome === "rescheduled").length, cancelled: list.filter(v => v.outcome === "cancelled").length,
      noEvidence: rows.filter(r => r.status === "No evidence").length };
  }));
}

/* ── briefings ──────────────────────────────────────────────────────────── */
export function afternoonBriefing(s: GState) {
  const t = totals(s), cap = capacity(s);
  const parts: string[] = [];
  parts.push(Word(t.completed) + " visit" + (t.completed === 1 ? " is" : "s are") + " complete.");
  if (t.ready) {
    const routes: string[] = [];
    if (t.stripe) routes.push(eur(t.stripeCents) + " through your existing Stripe flow");
    if (t.ih) routes.push(eur(t.ihCents) + " through Invoice Home");
    parts.push(eur(t.readyCents) + " across " + word(t.ready) + " item" + (t.ready === 1 ? "" : "s") + " is ready to process manually" + (routes.length ? ": " + routes.join(" and ") : "") + ".");
  } else parts.push("Nothing is waiting to be processed.");
  if (t.unpriced) parts.push(Word(t.unpriced) + " completed extra still needs a price.");
  if (t.invoiced) parts.push(Word(t.invoiced) + " invoice" + (t.invoiced === 1 ? " is" : "s are") + " recorded and awaiting payment.");
  const over = cap.fri.booked - cap.fri.cap;
  parts.push(over > 0 ? "Friday is " + word(over / 60) + " field hours over capacity." : "Friday is at " + hours(cap.fri.booked) + " of " + hours(cap.fri.cap) + " field hours, with no spare buffer.");
  return parts.join(" ");
}
export const MORNING_BRIEFING = "24 visits are scheduled today. Friday has 46 field hours booked against 40 available. Harbour House's earlier €210 payment is still missing from the ledger.";
export const MORNING_NOTE = "The €210 is prior payment evidence from 18 Oct, not a payment collected this morning.";

export { DEMO, PROPERTIES, CUSTOMERS, AGREEMENTS, TEAM, FIELD, WEEK, VISITS, RAW_IMPORTS, propById, custById, agrById, teamById, dayLabel, hhmm };
