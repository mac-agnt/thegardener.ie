/* Record-level traces for the Ontology keyword search. Typing a property, a
   visit ID, an agreement ID or a payment reference returns the real chain of
   linked records and the clusters it passes through. */
import type { GState } from "./store";
import { PROPERTIES, VISITS, HISTORY_VISITS, AGREEMENTS, custById, agrById, propById } from "./fixtures";
import { todayRows, issues, tasks, eur, CATEGORY_LABEL } from "./selectors";

export function recordTrail(s: GState, q: string): { label: string; links: string[]; clusters: string[] } | null {
  const ql = q.trim().toLowerCase();
  if (!ql) return null;
  let prop = PROPERTIES.slice().sort((a, b) => b.name.length - a.name.length).find(p => ql.indexOf(p.name.toLowerCase()) > -1) || null;
  if (!prop) {
    const v = VISITS.concat(HISTORY_VISITS).find(x => x.id.toLowerCase() === ql);
    if (v) prop = propById(v.propertyId);
  }
  if (!prop) {
    const a = AGREEMENTS.find(x => x.id.toLowerCase() === ql);
    if (a) prop = propById(a.propertyId);
  }
  if (!prop) {
    const pay = s.payments.find(p => p.ref.toLowerCase() === ql);
    const lid = pay?.allocations[0]?.lineId;
    const v = lid ? VISITS.concat(HISTORY_VISITS).find(x => lid.startsWith(x.id + "-")) : null;
    if (v) prop = propById(v.propertyId);
  }
  if (!prop) return null;
  const c = custById(prop.customerId), a = agrById(prop.agreementId);
  const row = todayRows(s).find(r => r.p.id === prop!.id);
  const links: string[] = ["Customer " + c.name + " (" + c.id + ")", "Property " + prop.name + " (" + prop.id + ", " + prop.area + ")"];
  const clusters = ["Customers", "Properties"];
  if (a) { links.push("Agreement " + a.id + " · " + a.recurrence.label.toLowerCase() + " · evidence " + (a.evidence.status === "paid" ? a.evidence.ref : "missing")); clusters.push("Agreements"); }
  if (row) {
    links.push("Visit " + row.v.id + " · " + row.status.toLowerCase() + (row.v.completion ? " by " + row.staff.name + " at " + row.v.completion.at : ""));
    clusters.push("Visits");
    row.lines.forEach(l => links.push("Line " + l.id + " · " + (l.basis === "unpriced" ? "unpriced, held" : l.basis === "included" ? "included, €0" : eur(l.cents || 0)) + (l.ref ? " · " + l.ref : "")));
    clusters.push("Billing lines");
    const pay = row.lines.find(l => l.payment)?.payment;
    if (pay) {
      links.push("Payment " + pay.ref + " · " + eur(pay.cents) + " · ledger " + (s.ledger.some(x => x.paymentRef === pay.ref) ? "matched" : "missing"));
      clusters.push("Payments");
    }
    const inv = row.lines.find(l => l.invoice)?.invoice;
    if (inv) links.push("Invoice " + inv.ref + " · " + (inv.status === "paid" ? "paid" : "awaiting payment"));
    links.push("Status today: " + CATEGORY_LABEL[row.category]);
  }
  const iss = issues(s).filter(i => i.propertyIds.indexOf(prop!.id) > -1);
  iss.forEach(i => {
    links.push((i.open ? "Open exception: " : "Resolved: ") + i.title);
    const t = tasks(s).find(x => x.issueId === i.id);
    if (t) links.push("Task " + t.id + " · " + t.owner.name + " · due " + t.due + (t.done ? " · done" : ""));
  });
  if (iss.length) clusters.push("Exceptions", "Team");
  return { label: prop.name, links, clusters };
}
