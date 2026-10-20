/* Drawers, modals and the toast shared by every theGardener.ie page. Mounted
   once in AppShell so any page, chat answer or agent can open a record. */
import { useEffect, useState, type ReactNode } from "react";
import {
  useGardener, closeDrawer, closeModal, openModal, openDrawer, go, toast, logCopy,
  recordPayment, recordInvoice, recordInvoicePayment, resolvePrice, confirmCompletion, applyMove, resetDemo, setUi,
} from "./store";
import {
  rowFor, allVisits, eur, dayLabel, hhmm, propById, custById, agrById, teamById, CATEGORY_LABEL, propertyIssues, visitsFor,
  nextVisitFor, nextOccurrence, capacity, hours, DEMO, RAW_IMPORTS, type Row,
} from "./selectors";
import { AGREEMENTS, HISTORY, PRIMROSE_VISIT, type Agreement } from "./fixtures";
import { Btn, DrawerShell, ModalShell, Field, inputStyle, KV, Note, Pill, Section, Segs, C, copyText, LinkBtn } from "./ui";

export const toneOf = (r: Row) => r.category === "ready" ? "accent" : r.category === "review" ? "warn" : r.category === "paid" ? "ok"
  : r.category === "invoiced" ? "info" : r.category === "excluded" ? "neutral" : "neutral";

export function chargeText(r: Row) {
  const lines = r.lines.filter(l => l.basis === "chargeable" && !l.payment);
  return [
    "theGardener.ie · charge details (demo data)",
    "Date: " + dayLabel(r.v.date) + " 2026 (Europe/Dublin)",
    "Customer: " + r.c.name + " (" + r.c.id + ")",
    "Property: " + r.p.name + ", " + r.p.area + " (" + r.p.id + ")",
    "Visit: " + r.v.id + " · occurrence " + r.v.occurrenceKey,
    ...lines.map(l => "Line: " + l.label + " · " + eur(l.cents || 0) + " · basis " + (l.ref || l.source)),
    "Amount: " + eur(r.outstandingCents),
    "Route: " + (r.route === "stripe" ? "Manual charge in the existing Stripe flow" : "Invoice Home invoice"),
    "Completion: " + r.evidence,
  ].join("\n");
}

function RelLink({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="ixa" style={{ ...C.chip, cursor: "pointer", height: "28px" }}>{label}</button>;
}

function VisitDrawer({ id }: { id: string }) {
  const s = useGardener();
  const v = allVisits(s).find(x => x.id === id);
  if (!v) return null;
  const r = rowFor(s, v);
  const raws = RAW_IMPORTS.filter(x => x.occurrenceKey === v.occurrenceKey);
  const a = r.a;
  const priced = r.lines.filter(l => l.basis === "chargeable");
  const pay = priced.find(l => l.payment)?.payment || null;
  const inv = priced.find(l => l.invoice)?.invoice || null;
  const unpriced = r.lines.find(l => l.basis === "unpriced");
  const copy = async () => { const ok = await copyText(chargeText(r)); logCopy(r.v.id + " charge details"); toast(ok ? "Charge details copied." : "Copy blocked by the browser; details are shown in the drawer."); };
  const footer: ReactNode[] = [];
  if (r.category === "ready" && r.route === "stripe") footer.push(<Btn key="p" primary onClick={() => openModal({ kind: "payment", id: v.id })}>Record manual payment (demo)</Btn>);
  if (r.category === "ready" && r.route === "invoicehome") footer.push(<Btn key="i" primary onClick={() => openModal({ kind: "invoice", id: v.id })}>Record invoice (demo)</Btn>);
  if (r.category === "invoiced" && inv && inv.status === "awaiting") footer.push(<Btn key="ip" primary onClick={() => openModal({ kind: "invoicePaid", id: inv.id })}>Record invoice payment (demo)</Btn>);
  if (r.reviewKind === "price") footer.push(<Btn key="pr" primary onClick={() => openModal({ kind: "price", id: v.id })}>Enter price and source</Btn>);
  if (r.reviewKind === "evidence") footer.push(<Btn key="ce" primary onClick={() => openModal({ kind: "confirm", id: v.id })}>Confirm completion</Btn>);
  if (r.category === "ready") footer.push(<Btn key="c" onClick={copy}>Copy charge details</Btn>);
  footer.push(<Btn key="o" onClick={() => openDrawer({ kind: "property", id: r.p.id })}>Open property</Btn>);
  return (
    <DrawerShell eyebrow={"VISIT · " + v.id + " · DEMO DATA"} title={r.p.name + " · " + v.service} onClose={closeDrawer}
      status={<Pill tone={toneOf(r) as any}>{CATEGORY_LABEL[r.category]}</Pill>} footer={footer}>
      <Note tone={r.category === "review" ? "warn" : r.category === "ready" ? "ok" : "info"} title={r.category === "excluded" ? "Why it is excluded" : r.category === "review" ? "Why it is held" : r.category === "ready" ? "Why it is ready" : "Why no new charge"}>
        {r.why}
      </Note>
      <Section label="What happens next"><div style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.6 }}>{r.next}</div></Section>
      <Section label="1 · Which calendar occurrence">
        <KV items={[["Occurrence key", <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px" }}>{v.occurrenceKey}</span>],
          ["Scheduled", dayLabel(v.originalDate) + (r.time ? ", " + r.time + "–" + hhmm(r.end) : "") + " · " + teamById(v.staffId).name],
          ["Source rows", raws.length ? raws.map(x => x.rawId + " (" + x.batch + ")").join(", ") : "From the Google Calendar series (simulated)"],
          ["Duplicates", r.duplicateRaw.length ? r.duplicateRaw.join(", ") + " excluded: same occurrence key, not a second visit" : "None"]]} />
        {v.rescheduledTo && <div style={{ marginTop: "10px" }}><Note title="Rescheduled">Original occurrence {v.occurrenceKey} is kept. New time {dayLabel(v.rescheduledTo.slice(0, 10))} {v.rescheduledTo.slice(11)}. It will not appear as a second completed job.</Note></div>}
      </Section>
      <Section label="2 · Matched customer and property">
        <KV items={[["Customer", r.c.name + " · " + r.c.id], ["Property", r.p.name + ", " + r.p.area + " · " + r.p.id],
          ["Match", "Calendar series " + v.seriesId + " → property record (demo match; Laravel field names unverified)"], ["Contact", <span>{r.c.email} <span style={{ color: "var(--faint)" }}>(fictional)</span></span>]]} />
      </Section>
      <Section label="3 · How we know it was done">
        <Note tone={v.completion || s.confirmations[v.id] ? "ok" : v.outcome === "completed" ? "warn" : "info"}>{v.outcome === "rescheduled" || v.outcome === "cancelled" ? v.outcomeNote : r.evidence}</Note>
        <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "8px", lineHeight: 1.5 }}>Demo assumption: completion comes from an explicit crew note or a person's confirmation. Google Calendar has no job-completion field, and a passed time slot is never treated as done.</div>
      </Section>
      <Section label="4 · What makes it chargeable or included">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {r.lines.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", background: "var(--chip)", border: "1px solid var(--chip-border)", borderRadius: "var(--r-sm,10px)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: "var(--ink)" }}>{l.label}</div>
                <div style={{ fontSize: "11.5px", color: "var(--dim)", marginTop: "4px", lineHeight: 1.45 }}>{l.source}{l.ref ? " · " + l.ref : ""}</div>
              </div>
              <div style={{ flex: "none", textAlign: "right" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: l.basis === "unpriced" ? "var(--warn)" : "var(--ink)" }}>{l.basis === "unpriced" ? "Unpriced" : l.basis === "included" ? "€0 extra" : eur(l.cents || 0)}</div>
                <div style={{ fontSize: "10.5px", color: "var(--faint)", marginTop: "3px" }}>{l.basis === "included" ? "Included" : l.basis === "unpriced" ? "Held" : "Chargeable"}</div>
              </div>
            </div>
          ))}
        </div>
        {a && <div style={{ marginTop: "10px", fontSize: "12.5px", color: "var(--dim)", lineHeight: 1.55 }}>
          Agreement <LinkBtn onClick={() => openDrawer({ kind: "agreement", id: a.id })}>{a.id}</LinkBtn>: {eur(a.feeCents)} a quarter (demo), current period {dayLabel(a.periodStart)} – {dayLabel(a.periodEnd)}, payment evidence {a.evidence.status === "paid" ? a.evidence.ref : "missing"}. The fee is never divided per visit.
        </div>}
      </Section>
      <Section label="5 · Invoice or payment already linked">
        <KV items={[["Payment", pay ? pay.ref + " · " + eur(pay.cents) + " · " + dayLabel(pay.date) + (pay.method === "stripe" ? "" : " (bank transfer)") : "None"],
          ["Ledger", pay && pay.method === "stripe" ? (r.reconciliation === "matched" ? "Matched in Google Sheets (mock)" : "No Sheets row yet: lag, not non-payment") : "n/a"],
          ["Invoice", inv ? inv.ref + " · due " + dayLabel(inv.dueOn) + " · " + (inv.status === "paid" ? "paid" : "awaiting payment") : r.route === "invoicehome" ? "Not yet prepared" : "Not used (Stripe flow)"],
          ["Route", r.route === "stripe" ? "Existing Stripe flow, processed manually" : "Invoice Home, prepared manually"]]} />
      </Section>
      {unpriced && s.prices[unpriced.id] && <Section label="Price decision"><Note tone="ok">{eur(s.prices[unpriced.id].cents)} confirmed by Kevin Whitty at {s.prices[unpriced.id].at} from {s.prices[unpriced.id].ref}. Nothing has been charged.</Note></Section>}
    </DrawerShell>
  );
}

function PropertyDrawer({ id, tab }: { id: string; tab?: string }) {
  const s = useGardener();
  const [t, setT] = useState(tab || "overview");
  useEffect(() => { setT(tab || "overview"); }, [id, tab]);
  const p = propById(id); if (!p) return null;
  const c = custById(p.customerId), a = agrById(p.agreementId);
  const iss = propertyIssues(s, p.id);
  const visits = visitsFor(s, p.id);
  const nv = nextVisitFor(s, p.id);
  const events = s.events.filter(e => e.related.some(x => x === p.name || visits.some(v => v.id === x) || (a && x === a.id)));
  const payments = s.payments.filter(pay => pay.allocations.some(al => visits.some(v => al.lineId.startsWith(v.id + "-"))));
  const invoices = s.invoices.filter(i => i.propertyId === p.id);
  return (
    <DrawerShell eyebrow={"PROPERTY · " + p.id + " · DEMO DATA"} title={p.name} onClose={closeDrawer} width={640}
      status={<Pill tone={p.kind === "contract" ? "accent" : "info"}>{p.kind === "contract" ? "Quarterly agreement" : "Ad-hoc"}</Pill>}>
      <Segs label="Property sections" value={t} onChange={setT} items={[{ id: "overview", label: "Overview" }, { id: "visits", label: "Visits", count: visits.length },
        { id: "billing", label: "Agreement & Billing" }, { id: "notes", label: "Notes & Activity", count: events.length }]} />
      {t === "overview" && <>
        <Section label="Property">
          <KV items={[["Area", p.area + " (demo; exact address not stored)"], ["Customer", c.name + " · " + c.id], ["Contact", c.email + " (fictional)"],
            ["Garden", p.size], ["Access", p.access], ["Service window", p.window], ["Payment route", p.route === "stripe" ? "Stripe flow (manual)" : "Invoice Home"],
            ["Next visit", nv ? dayLabel(nv.date) + (nv.outcome === "rescheduled" && nv.rescheduledTo ? " → rebooked " + dayLabel(nv.rescheduledTo.slice(0, 10)) : "") : a ? nextOccurrence(a) : "None booked"]]} />
        </Section>
        <Section label={"Open issues · " + iss.length}>
          {iss.length ? iss.map(i => (
            <div key={i.id} style={{ marginBottom: "8px" }}><Note tone={i.severity === "high" ? "warn" : "info"} title={i.kind + " · " + i.owner.name + " · due " + i.due}>{i.title}. {i.detail}</Note></div>
          )) : <div style={{ fontSize: "13px", color: "var(--dim)" }}>Nothing open for this property.</div>}
        </Section>
      </>}
      {t === "visits" && <Section label="Visits, newest first">
        {visits.map(v => { const r = rowFor(s, v); return (
          <button key={v.id} type="button" className="ix11" onClick={() => openDrawer({ kind: "visit", id: v.id })} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "11px 12px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "inherit", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--faint)", width: "86px", flex: "none" }}>{dayLabel(v.date)}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: "13px" }}>{v.service}<span style={{ display: "block", fontSize: "11.5px", color: "var(--faint)" }}>{v.id} · {teamById(v.staffId).name}</span></span>
            <Pill tone={r.status === "Completed" ? "ok" : r.status === "Scheduled" ? "info" : "warn"}>{r.status}</Pill>
          </button>); })}
      </Section>}
      {t === "billing" && <>
        {a ? <Section label={"Agreement " + a.id}>
          <KV items={[["Quarterly fee (demo)", eur(a.feeCents)], ["Current period", dayLabel(a.periodStart) + " – " + dayLabel(a.periodEnd)],
            ["Payment evidence", a.evidence.status === "paid" ? a.evidence.ref + " · " + dayLabel(a.evidence.date as string) : "Missing for this quarter"],
            ["Next quarterly payment", dayLabel(a.nextPaymentDate) + " · existing Stripe flow, not Pulse"], ["Recurrence", a.recurrence.label], ["Effective from", dayLabel(a.effectiveFrom) + " " + a.effectiveFrom.slice(0, 4)]]} />
          <div style={{ marginTop: "10px" }}><Btn small onClick={() => openDrawer({ kind: "agreement", id: a.id })}>Open agreement</Btn></div>
        </Section> : <Section label="Billing"><Note>Ad-hoc customer: each completed job is priced from the demo rate card or an accepted quote and processed through {p.route === "stripe" ? "the Stripe flow" : "Invoice Home"}.</Note></Section>}
        <Section label={"Payments recorded · " + payments.length}>
          {payments.length ? <KV cols={1} items={payments.map(pay => [pay.ref, eur(pay.cents) + " · " + dayLabel(pay.date) + " · " + (s.ledger.some(l => l.paymentRef === pay.ref) || pay.method !== "stripe" ? "ledger ok" : "awaiting ledger row")] as [string, ReactNode])} />
            : <div style={{ fontSize: "13px", color: "var(--dim)" }}>{a ? "Quarterly fees are paid through the existing Stripe flow; no per-visit payments." : "No payments recorded yet."}</div>}
        </Section>
        {invoices.length > 0 && <Section label="Invoices"><KV cols={1} items={invoices.map(i => [i.ref, eur(i.cents) + " · due " + dayLabel(i.dueOn) + " · " + (i.status === "paid" ? "paid" : "awaiting payment")] as [string, ReactNode])} /></Section>}
      </>}
      {t === "notes" && <Section label="Notes and activity">
        {visits.filter(v => v.completion || v.outcomeNote).slice(0, 4).map(v => (
          <div key={v.id} style={{ marginBottom: "8px" }}><Note title={dayLabel(v.date) + " · " + v.id}>{v.completion ? v.completion.note : v.outcomeNote}</Note></div>
        ))}
        {events.map(e => (
          <div key={e.id} style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--faint)", width: "44px", flex: "none" }}>{e.at}</span>
            <span style={{ flex: 1, fontSize: "13px", lineHeight: 1.5 }}>{e.title}<span style={{ display: "block", color: "var(--dim)", fontSize: "12px" }}>{e.note}</span></span>
          </div>
        ))}
        {!events.length && <div style={{ fontSize: "13px", color: "var(--dim)" }}>No activity logged against this property today.</div>}
      </Section>}
    </DrawerShell>
  );
}

function AgreementDrawer({ id }: { id: string }) {
  const s = useGardener();
  const a = agrById(id) as Agreement; if (!a) return null;
  const p = propById(a.propertyId);
  const vs = visitsFor(s, p.id);
  return (
    <DrawerShell eyebrow={"AGREEMENT · " + a.id + " · DEMO DATA"} title={p.name + " · quarterly agreement"} onClose={closeDrawer}
      status={<Pill tone={a.evidence.status === "paid" ? "ok" : "warn"}>{a.evidence.status === "paid" ? "Payment evidence present" : "Payment evidence missing"}</Pill>}
      footer={<><Btn onClick={() => openDrawer({ kind: "property", id: p.id })}>Open property</Btn></>}>
      <KV items={[["Quarterly fee (demo)", eur(a.feeCents)], ["Current period", dayLabel(a.periodStart) + " – " + dayLabel(a.periodEnd)],
        ["Payment evidence", a.evidence.status === "paid" ? a.evidence.ref + " · paid " + dayLabel(a.evidence.date as string) : "Not found for this quarter"],
        ["Next quarterly payment", dayLabel(a.nextPaymentDate) + " (existing Stripe flow; Pulse does not collect it)"],
        ["Recurrence", a.recurrence.label], ["Source wording", "“" + a.recurrence.sourceText + "”"], ["Visits a year", a.visitsPerYear ? "About " + a.visitsPerYear : "Unknown until clarified"],
        ["Effective from", a.effectiveFrom], ["Next review", dayLabel(a.reviewDate) + " " + a.reviewDate.slice(0, 4)], ["Seasonal plan", a.seasonal]]} />
      {a.recurrence.rule === "unclear" && <div style={{ marginTop: "12px" }}><Note tone="warn" title="Needs recurrence clarification">The calendar says “bi-monthly”. That can mean twice a month or every two months, so Pulse shows the series without guessing an interval.</Note></div>}
      {a.evidence.status === "missing" && <div style={{ marginTop: "12px" }}><Note tone="warn" title="Payment evidence missing">No payment record for the current quarter. Visits stay included under the agreement; an unclear contract payment never turns each visit into a separate charge.</Note></div>}
      <Section label="Included work"><ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.8, color: "var(--body)" }}>{a.included.map(x => <li key={x}>{x}</li>)}</ul></Section>
      <Section label="Excluded, priced separately"><ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.8, color: "var(--body)" }}>{a.excluded.map(x => <li key={x}>{x}</li>)}</ul></Section>
      <Section label={"Visits under this agreement · " + vs.length}>
        {vs.slice(0, 8).map(v => <div key={v.id} style={{ display: "flex", gap: "10px", padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: "12.5px" }}>
          <span style={{ fontFamily: "var(--mono)", color: "var(--faint)", width: "86px" }}>{dayLabel(v.date)}</span><span style={{ flex: 1 }}>{v.id} · {v.service}</span><span style={{ color: "var(--dim)" }}>{v.outcome}</span></div>)}
      </Section>
    </DrawerShell>
  );
}

/* ── modals ─────────────────────────────────────────────────────────────── */
function PaymentModal({ id }: { id: string }) {
  const s = useGardener();
  const v = allVisits(s).find(x => x.id === id); const r = v ? rowFor(s, v) : null;
  const [ref, setRef] = useState(""); const [amt, setAmt] = useState(r ? (r.outstandingCents / 100).toFixed(2) : ""); const [date, setDate] = useState(DEMO.date);
  const [err, setErr] = useState("");
  if (!r) return null;
  const lineIds = r.lines.filter(l => l.basis === "chargeable" && !l.payment).map(l => l.id);
  const submit = () => {
    const cents = Math.round(parseFloat(amt.replace(/[^0-9.]/g, "")) * 100);
    const res = recordPayment(r.v.id, lineIds, r.outstandingCents, { ref, cents, date });
    if (!res.ok) setErr(res.error); else closeModal();
  };
  return (
    <ModalShell title="Record manual payment (demo)" hint={"Process " + eur(r.outstandingCents) + " for " + r.p.name + " in the existing Stripe flow first. This only records what happened there; Pulse never takes or moves money."}
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={submit}>Record payment</Btn></>}>
      <Field label="Stripe payment reference" help="Copy it from the Stripe payment. Any text works in this demo, but a reference can only be recorded once." error={err && /reference|recorded/i.test(err) ? err : ""}>
        <input autoFocus value={ref} onChange={e => { setRef(e.target.value); setErr(""); }} placeholder="e.g. DEMO-PAY-113" style={inputStyle} className="ix1g" />
      </Field>
      <Field label="Amount paid (€)" help={"Outstanding on this visit: " + eur(r.outstandingCents)} error={err && /amount|match/i.test(err) ? err : ""}>
        <input inputMode="decimal" value={amt} onChange={e => { setAmt(e.target.value); setErr(""); }} style={inputStyle} className="ix1g" />
      </Field>
      <Field label="Payment date" error={err && /date/i.test(err) ? err : ""}><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} className="ix1g" /></Field>
      {err && !/reference|recorded|amount|match|date/i.test(err) && <div role="alert" style={{ color: "var(--bad)", fontSize: "12px" }}>{err}</div>}
    </ModalShell>
  );
}

function InvoiceModal({ id }: { id: string }) {
  const s = useGardener();
  const v = allVisits(s).find(x => x.id === id); const r = v ? rowFor(s, v) : null;
  const [ref, setRef] = useState(""); const [due, setDue] = useState("2026-11-02"); const [err, setErr] = useState("");
  if (!r) return null;
  const line = r.lines.find(l => l.basis === "chargeable" && !l.payment);
  if (!line) return null;
  const details = chargeText(r);
  const submit = () => { const res = recordInvoice(r.v.id, line.id, line.cents || 0, r.p.id, { ref, dueOn: due }); if (!res.ok) setErr(res.error); else closeModal(); };
  return (
    <ModalShell title="Record Invoice Home invoice (demo)" hint="Create the invoice in Invoice Home using these details, then record its number here. Recording an invoice leaves the payment outstanding."
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={submit}>Record invoice</Btn></>}>
      <div style={{ position: "relative", marginBottom: "14px" }}>
        <pre style={{ margin: 0, padding: "12px 14px", background: "var(--chip)", border: "1px solid var(--chip-border)", borderRadius: "var(--r-md,12px)", fontFamily: "var(--mono)", fontSize: "11px", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--body)" }}>{details}</pre>
        <div style={{ marginTop: "8px" }}><Btn small onClick={async () => { const ok = await copyText(details); logCopy(r.v.id + " invoice details"); toast(ok ? "Invoice details copied." : "Copy blocked; select the text instead."); }}>Copy invoice details</Btn></div>
      </div>
      <Field label="Invoice Home invoice number" help="Must be unique. An invoice that already exists cannot be prepared again." error={err}>
        <input autoFocus value={ref} onChange={e => { setRef(e.target.value); setErr(""); }} placeholder="e.g. IH-DEMO-0201" style={inputStyle} className="ix1g" />
      </Field>
      <Field label="Due date"><input type="date" value={due} onChange={e => setDue(e.target.value)} style={inputStyle} className="ix1g" /></Field>
    </ModalShell>
  );
}

function InvoicePaidModal({ id }: { id: string }) {
  const s = useGardener();
  const inv = s.invoices.find(i => i.id === id);
  const [ref, setRef] = useState(""); const [date, setDate] = useState(DEMO.date); const [err, setErr] = useState("");
  if (!inv) return null;
  const submit = () => { const res = recordInvoicePayment(inv.id, { ref, date }); if (!res.ok) setErr(res.error); else closeModal(); };
  return (
    <ModalShell title={"Record payment for " + inv.ref + " (demo)"} hint={eur(inv.cents) + " for " + propById(inv.propertyId).name + ". Record it only once the money has arrived outside Pulse."}
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={submit}>Record payment</Btn></>}>
      <Field label="Bank or payment reference" error={err}><input autoFocus value={ref} onChange={e => { setRef(e.target.value); setErr(""); }} placeholder="e.g. DEMO-BANK-201" style={inputStyle} className="ix1g" /></Field>
      <Field label="Date received"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} className="ix1g" /></Field>
    </ModalShell>
  );
}

function PriceModal({ id }: { id: string }) {
  const s = useGardener();
  const v = allVisits(s).find(x => x.id === id); const r = v ? rowFor(s, v) : null;
  const [amt, setAmt] = useState(""); const [ref, setRef] = useState(""); const [err, setErr] = useState("");
  if (!r) return null;
  const line = r.lines.find(l => l.basis === "unpriced");
  if (!line) return null;
  const submit = () => {
    const cents = Math.round(parseFloat(amt.replace(/[^0-9.]/g, "")) * 100);
    const res = resolvePrice(line.id, r.v.id, { cents: Number.isFinite(cents) ? cents : 0, ref });
    if (!res.ok) setErr(res.error); else closeModal();
  };
  return (
    <ModalShell title={"Price the extra work at " + r.p.name} hint={line.label + ". Nothing is suggested or prefilled: enter the price that was actually agreed and where it comes from. Confirming makes it ready to process; it does not take a payment."}
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={submit}>Confirm price</Btn></>}>
      <Field label="Agreed price (€)" help="Walkthrough example: €165 against a mock quote reference." error={err && /price/i.test(err) && !/already/.test(err) ? err : ""}>
        <input autoFocus inputMode="decimal" value={amt} onChange={e => { setAmt(e.target.value); setErr(""); }} placeholder="Amount" style={inputStyle} className="ix1g" />
      </Field>
      <Field label="Quote or source reference" help="e.g. Q-DEMO-0507, or the note where the customer agreed the price." error={err && /reference|already/i.test(err) ? err : ""}>
        <input value={ref} onChange={e => { setRef(e.target.value); setErr(""); }} placeholder="Reference" style={inputStyle} className="ix1g" />
      </Field>
    </ModalShell>
  );
}

function ConfirmModal({ id }: { id: string }) {
  const s = useGardener();
  const v = allVisits(s).find(x => x.id === id);
  const [note, setNote] = useState(""); const [err, setErr] = useState("");
  if (!v) return null;
  const p = propById(v.propertyId);
  const submit = () => { const res = confirmCompletion(v.id, note); if (!res.ok) setErr(res.error); else closeModal(); };
  return (
    <ModalShell title={"Confirm completion · " + p.name} hint={v.id + " on " + dayLabel(v.date) + ". Confirm only what the crew reported. Your name and the time are recorded with it."}
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={submit}>Confirm as Kevin Whitty</Btn></>}>
      <Field label="What was done" help={"Walkthrough example: “Sean confirmed by phone: routine visit done 16 Oct, note was not submitted.”"} error={err}>
        <textarea autoFocus value={note} onChange={e => { setNote(e.target.value); setErr(""); }} rows={3} style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical", fontFamily: "inherit" }} className="ix1g" />
      </Field>
    </ModalShell>
  );
}

function MoveModal() {
  const s = useGardener(); const c = capacity(s);
  return (
    <ModalShell title="Move three flexible visits to Tuesday?" hint="Local demo change only. Nothing is written to Google Calendar; customers are not contacted."
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn primary onClick={() => { applyMove(); closeModal(); }}>Approve the move</Btn></>}>
      <KV items={[["Friday", hours(c.preview.friBefore) + " → " + hours(c.preview.friAfter) + " of 40 h"], ["Tuesday", hours(c.preview.tueBefore) + " → " + hours(c.preview.tueAfter) + " of 40 h"],
        ["Week", hours(c.booked) + " of " + hours(c.cap) + " h, unchanged"], ["Contracted slots", "Untouched"]]} />
      <Section label="Visits that move">
        {c.flex.map(f => <div key={f.v.id} style={{ fontSize: "13px", padding: "7px 0", borderTop: "1px solid var(--border)" }}>{f.p.name} · {f.v.service} · {hours(f.v.serviceMins + f.v.travelMins)} h · {f.staff.name} · window {f.p.window}</div>)}
      </Section>
      <div style={{ marginTop: "12px" }}><Note tone="warn">Friday will sit at exactly 40 of 40 hours, with no spare buffer.</Note></div>
    </ModalShell>
  );
}

function ResetModal() {
  return (
    <ModalShell title="Reset the demo?" hint="Restores the 19 Oct 17:15 starting story: 7 ready items, €1,215, Oak Lodge unpriced, Friday 46 of 40 hours. Clears every payment, invoice, price and move recorded in this session."
      onClose={closeModal} footer={<><Btn onClick={closeModal}>Cancel</Btn><Btn danger onClick={() => { resetDemo(); }}>Reset demo data</Btn></>}>
      <Note>Nothing outside this browser tab is affected. There is no live data to lose.</Note>
    </ModalShell>
  );
}

function Toast() {
  const s = useGardener();
  const t = s.ui.toast;
  useEffect(() => {
    if (!t) return;
    const h = setTimeout(() => setUi({ toast: null }), 3600);
    return () => clearTimeout(h);
  }, [t?.n]);
  if (!t) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: 90, maxWidth: "min(560px,92vw)", padding: "11px 16px", background: "var(--tooltip)", color: "var(--tooltip-ink)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md,14px)", fontSize: "13px", boxShadow: "0 18px 40px rgba(0,0,0,.4)", animation: "riseIn .3s var(--ease) both" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: ".12em", color: "var(--accent)", marginRight: "10px" }}>DEMO</span>{t.text}
    </div>
  );
}

export default function GardenerOverlays() {
  const s = useGardener();
  const d = s.ui.drawer, m = s.ui.modal;
  return (
    <>
      {d?.kind === "visit" && <VisitDrawer id={d.id} />}
      {d?.kind === "property" && <PropertyDrawer id={d.id} tab={d.tab} />}
      {d?.kind === "agreement" && <AgreementDrawer id={d.id} />}
      {m?.kind === "payment" && <PaymentModal id={m.id} />}
      {m?.kind === "invoice" && <InvoiceModal id={m.id} />}
      {m?.kind === "invoicePaid" && <InvoicePaidModal id={m.id} />}
      {m?.kind === "price" && <PriceModal id={m.id} />}
      {m?.kind === "confirm" && <ConfirmModal id={m.id} />}
      {m?.kind === "move" && <MoveModal />}
      {m?.kind === "reset" && <ResetModal />}
      <Toast />
    </>
  );
}

export { go, PRIMROSE_VISIT, AGREEMENTS, HISTORY };
