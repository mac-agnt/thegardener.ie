/* What "act on this issue" means, shared by Properties, Activity, Work and
   the Home inbox so the same exception always leads to the same place. */
import { go, openDrawer, openModal, toggleTask } from "./store";
import type { Issue } from "./selectors";

export const TAB_SETS: Record<string, [string, string][]> = {
  Dashboard: [["ops", "Operations"], ["billing", "Billing"], ["quality", "Service Quality"]],
  Schedule: [["today", "Today"], ["week", "Week"], ["recurring", "Recurring Visits"], ["capacity", "Capacity"], ["exceptions", "Service Exceptions"]],
  "Charge Desk": [["sheet", "Daily Sheet"], ["review", "Review"], ["invoices", "Invoices"], ["reconciliation", "Reconciliation"], ["history", "History"]],
  Properties: [["directory", "Directory"], ["attention", "Needs Attention"], ["history", "Visit History"]],
  Contracts: [["overview", "Overview"], ["agreements", "Agreements"], ["renewals", "Renewals"], ["scope", "Scope Exceptions"]],
};

export function issueAction(i: Issue): () => void {
  if (i.id === "ISS-PRICE") return () => openModal({ kind: "price", id: "V-120" });
  if (i.id === "ISS-FRIDAY") return () => go("Schedule", "capacity");
  if (i.id === "ISS-EVIDENCE") return () => openModal({ kind: "confirm", id: i.related[1].id });
  if (i.id.startsWith("ISS-LEDGER") || i.id === "ISS-MISMATCH") return () => go("Charge Desk", "reconciliation");
  if (i.id === "ISS-INVOICE") return () => go("Charge Desk", "invoices");
  if (i.id === "ISS-ACCESS") return () => toggleTask("T-11", true);
  if (i.id === "ISS-RECUR") return () => toggleTask("T-06", true);
  if (i.id === "ISS-QTR") return () => toggleTask("T-07", true);
  const r = i.related.find(x => x.kind === "visit") || i.related.find(x => x.kind === "property") || i.related.find(x => x.kind === "agreement");
  return () => { if (r) openDrawer({ kind: r.kind as "visit" | "property" | "agreement", id: r.id }); };
}

export function openRelated(r: Issue["related"][number]) {
  if (r.kind === "page") { const [page, tab] = r.id.split(":"); go(page, tab); }
  else openDrawer({ kind: r.kind, id: r.id });
}
