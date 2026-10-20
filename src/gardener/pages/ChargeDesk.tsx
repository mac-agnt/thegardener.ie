import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useGardener, setSub, openDrawer, openModal, toast, logCopy, logExport, refreshLedger, rerunImport, toggleTask, go } from "../store";
import {
  todayRows, totals, reconRows, invoiceRows, historySheets, issues, eur, dayLabel, plural, CATEGORY_LABEL, DEMO, RAW_IMPORTS, teamById, propById,
  allVisits, rowFor, type Row, type Category,
} from "../selectors";
import { PRIMROSE_VISIT } from "../fixtures";
import { Page, Card, Grid, Stat, Segs, Search, Table, Pill, Btn, Ellip, Avatar, Note, Section, Empty, KV, Select, C, downloadText, copyText, csvCell, type Col } from "../ui";
import { chargeText, toneOf } from "../Overlays";

const FILTERS: { id: string; label: string; cats: Category[] | null }[] = [
  { id: "ready", label: "Ready", cats: ["ready"] }, { id: "all", label: "All", cats: null }, { id: "included", label: "Included", cats: ["included"] },
  { id: "review", label: "Review", cats: ["review"] }, { id: "invoiced", label: "Invoiced", cats: ["invoiced"] }, { id: "paid", label: "Already paid", cats: ["paid"] },
  { id: "excluded", label: "Excluded", cats: ["excluded"] },
];

const amountCell = (r: Row) => r.category === "ready" ? <span style={{ fontFamily: "var(--mono)", color: "var(--ink)" }}>{eur(r.outstandingCents)}</span>
  : r.category === "included" ? <span style={{ fontFamily: "var(--mono)", color: "var(--dim)" }}>€0 extra</span>
  : r.category === "review" ? <span style={{ fontFamily: "var(--mono)", color: "var(--warn)" }}>{r.reviewKind === "price" ? "Unpriced" : "Held"}</span>
  : r.category === "paid" ? <span style={{ fontFamily: "var(--mono)", color: "var(--ok)" }}>{eur(r.paidCents)} paid</span>
  : r.category === "invoiced" ? <span style={{ fontFamily: "var(--mono)" }}>{eur(r.chargeCents)} invoiced</span>
  : <span style={{ color: "var(--faint)" }}>Excluded</span>;

function csvFor(rows: Row[]) {
  const head = ["date", "timezone", "property", "customer", "source_visit_id", "occurrence_key", "amount_eur", "route", "status", "evidence_or_reference"];
  const body = rows.map(r => [DEMO.date, DEMO.tz, r.p.name, r.c.name, r.v.id, r.v.occurrenceKey, (r.category === "ready" ? r.outstandingCents : r.category === "paid" ? r.paidCents : r.chargeCents) / 100,
    r.route === "stripe" ? "Stripe (manual)" : "Invoice Home", CATEGORY_LABEL[r.category],
    r.lines.map(l => l.payment ? l.payment.ref : l.invoice ? l.invoice.ref : (l.ref || l.source)).join(" | ")]);
  return "# theGardener.ie daily charge sheet, demo data, generated " + DEMO.stamp + " " + DEMO.tz + "\n" + [head].concat(body.map(b => b.map(x => String(x)))).map(r => r.map(csvCell).join(",")).join("\n") + "\n";
}

function PrintSheet({ rows }: { rows: Row[] }) {
  const t = rows.reduce((n, r) => n + r.outstandingCents, 0);
  return createPortal(
    <div className="g-print-sheet" style={{ display: "none" }}>
      <h1>theGardener.ie · Daily charge sheet</h1>
      <p>{DEMO.stamp} ({DEMO.tz}) · Demo data · Process manually in Stripe or Invoice Home. Pulse does not take payments.</p>
      <table>
        <thead><tr><th>Property</th><th>Customer</th><th>Visit</th><th>Work</th><th>Route</th><th>Amount</th><th>Done</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.v.id}><td>{r.p.name}</td><td>{r.c.name}</td><td>{r.v.id}</td><td>{r.lines.filter(l => l.basis === "chargeable" && !l.payment).map(l => l.label).join(", ")}</td>
          <td>{r.route === "stripe" ? "Stripe (manual)" : "Invoice Home"}</td><td>{eur(r.outstandingCents)}</td><td>☐</td></tr>)}</tbody>
        <tfoot><tr><td colSpan={5}>{plural(rows.length, "item")} ready</td><td>{eur(t)}</td><td /></tr></tfoot>
      </table>
    </div>, document.body);
}

function DailySheet() {
  const s = useGardener();
  const ui = s.ui.charge;
  const t = totals(s);
  const rows = todayRows(s);
  const [sortKey, setSortKey] = useState(ui.sort);
  const isToday = ui.date === DEMO.date;
  const counts = Object.fromEntries(FILTERS.map(f => [f.id, f.cats ? rows.filter(r => f.cats!.indexOf(r.category) > -1).length : rows.length]));
  const q = ui.q.trim().toLowerCase();
  const filter = FILTERS.find(f => f.id === ui.filter) || FILTERS[0];
  const shown = useMemo(() => {
    const list = rows.filter(r => (!filter.cats || filter.cats.indexOf(r.category) > -1)
      && (!q || (r.p.name + " " + r.c.name + " " + r.v.id + " " + r.v.service + " " + r.staff.name).toLowerCase().indexOf(q) > -1));
    const key = (r: Row): string | number => sortKey === "amount" ? r.outstandingCents || r.chargeCents : sortKey === "time" ? r.start : sortKey === "owner" ? r.owner.name : sortKey === "status" ? r.category : r.p.name;
    return list.slice().sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * ui.dir; });
  }, [rows, filter, q, sortKey, ui.dir]);
  const sel = ui.selected.filter(id => shown.some(r => r.v.id === id));
  const selRows = shown.filter(r => sel.indexOf(r.v.id) > -1);
  const exportRows = (selRows.length ? selRows : rows.filter(r => r.category === "ready"));
  const doExport = () => {
    const file = "thegardener-charge-sheet-" + DEMO.date + (selRows.length ? "-selected" : "-ready") + ".csv";
    downloadText(file, csvFor(exportRows));
    logExport(selRows.length ? "selected" : "ready", DEMO.date, exportRows.length, file);
    toast("Exported " + plural(exportRows.length, "row") + " to " + file + ".");
  };
  const doCopy = async () => {
    const list = selRows.length ? selRows : rows.filter(r => r.category === "ready");
    const ok = await copyText(list.map(chargeText).join("\n\n"));
    logCopy(plural(list.length, "item"));
    toast(ok ? "Copied " + plural(list.length, "item") + " for manual processing." : "Copy blocked by the browser.");
  };
  const toggleSel = (id: string) => setSub("charge", { selected: sel.indexOf(id) > -1 ? sel.filter(x => x !== id) : sel.concat([id]) });
  const sortBy = (k: string) => { if (k === sortKey) setSub("charge", { dir: (ui.dir * -1) as 1 | -1 }); else { setSortKey(k); setSub("charge", { sort: k, dir: 1 }); } };
  const cols: Col<Row>[] = [
    { key: "sel", label: "", w: "40px", render: r => <input type="checkbox" aria-label={"Select " + r.p.name} checked={sel.indexOf(r.v.id) > -1} onClick={e => e.stopPropagation()} onChange={() => toggleSel(r.v.id)} style={{ accentColor: "var(--accent)", width: "15px", height: "15px" }} /> },
    { key: "property", label: "Property / customer", w: "1.35fr", sort: r => r.p.name, render: r => <Ellip strong sub={r.c.name + " · " + r.v.id}>{r.p.name}</Ellip> },
    { key: "service", label: "Service", w: "1.2fr", render: r => <Ellip sub={r.time ? r.time + " · " + r.staff.first : ""}>{r.v.service}</Ellip> },
    { key: "evidence", label: "Completion", w: ".9fr", render: r => <Pill tone={r.status === "Completed" ? "ok" : r.status === "Cancelled" || r.status === "Rescheduled" ? "neutral" : "warn"} title={r.evidence}>{r.status}</Pill> },
    { key: "basis", label: "Billing basis", w: "1.1fr", render: r => <Ellip>{r.basis}</Ellip> },
    { key: "route", label: "Route", w: ".85fr", render: r => <span style={{ fontSize: "12.5px", color: "var(--dim)" }}>{r.category === "included" || r.category === "excluded" ? "—" : r.route === "stripe" ? "Stripe (manual)" : "Invoice Home"}</span> },
    { key: "amount", label: "Amount", w: ".85fr", align: "right", sort: r => r.outstandingCents, render: amountCell },
    { key: "status", label: "Processing", w: ".95fr", sort: r => r.category, render: r => <Pill tone={toneOf(r) as any}>{CATEGORY_LABEL[r.category]}</Pill> },
    { key: "owner", label: "Owner", w: ".7fr", sort: r => r.owner.name, render: r => <span style={{ display: "flex", alignItems: "center", gap: "7px" }}><Avatar initials={r.owner.initials} tint={r.owner.tint} size={22} /><span style={{ fontSize: "12px" }}>{r.owner.first}</span></span> },
    { key: "next", label: "Next action", w: "1.3fr", render: r => <Ellip>{r.next}</Ellip> },
  ];
  const hist = historySheets(s);
  if (!isToday) {
    const sh = hist.find(h => h.date === ui.date);
    return (
      <>
        <Toolbar />
        <Card title={"Charge sheet for " + dayLabel(ui.date) + " (processed)"} hint={"Read-only. Exported " + (sh ? sh.exportedAt : "") + " and processed by " + (sh ? teamById(sh.processedBy).name : "") + "."}>
          {sh && <Table caption="Processed sheet" minWidth={640} rowKey={i => i.lineId} rows={sh.items} cols={[
            { key: "p", label: "Property", w: "1.3fr", render: i => <Ellip strong>{i.prop.name}</Ellip> },
            { key: "l", label: "Work", w: "1.2fr", render: i => <Ellip>{i.label}</Ellip> },
            { key: "r", label: "Route", w: ".9fr", render: i => i.route === "stripe" ? "Stripe (manual)" : "Invoice Home" },
            { key: "a", label: "Amount", w: ".7fr", align: "right", render: i => <span style={{ fontFamily: "var(--mono)" }}>{eur(i.cents)}</span> },
            { key: "s", label: "Outcome", w: "1.4fr", render: i => <Ellip sub={i.ref}>{i.status}</Ellip> }]} />}
        </Card>
      </>
    );
  }
  return (
    <>
      <Toolbar />
      <Grid cols="1.5fr 1fr 1fr 1fr 1fr" style={{ marginBottom: "12px" }}>
        <Stat label={"Ready to process · " + plural(t.ready, "item")} value={eur(t.readyCents)} sub={<>{plural(t.stripe, "item")} Stripe {eur(t.stripeCents)} · {plural(t.ih, "item")} Invoice Home {eur(t.ihCents)}</>} onClick={() => setSub("charge", { filter: "ready" })} />
        <Stat label="Review" value={plural(t.review, "item")} sub={t.unpriced ? t.unpriced + " unpriced extra, not €0" : "Nothing held"} tone={t.review ? "warn" : undefined} onClick={() => setSub("charge", { filter: "review" })} />
        <Stat label="Already paid" value={eur(t.paidCents)} sub={plural(t.paid, "visit") + (t.unreconciled ? " · " + eur(t.unreconciledCents) + " awaiting ledger" : " · ledger matched")} tone="ok" onClick={() => setSub("charge", { filter: "paid" })} />
        <Stat label="Included" value={String(t.included)} sub="Covered by agreements · €0 extra" onClick={() => setSub("charge", { filter: "included" })} />
        <Stat label="Excluded" value={String(t.excluded)} sub={t.rescheduled + " rescheduled, " + t.cancelled + " cancelled · +" + t.duplicates + " duplicate row"} onClick={() => setSub("charge", { filter: "excluded" })} />
      </Grid>
      <div style={{ fontSize: "12px", color: "var(--faint)", margin: "0 4px 12px" }}>
        {t.rawRows} calendar rows → {t.visits} unique visits = {t.completed} completed + {t.rescheduled} rescheduled + {t.cancelled} cancelled. Only completed, confirmed, priced work with nothing already linked becomes Ready.
      </div>
      <Card pad={false}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px" }}>
          <Segs label="Charge sheet filter" value={filter.id} onChange={id => setSub("charge", { filter: id, selected: [] })} items={FILTERS.map(f => ({ id: f.id, label: f.label, count: counts[f.id] }))} />
          <div style={{ flex: 1 }} />
          <Search label="Search the charge sheet" value={ui.q} onChange={v => setSub("charge", { q: v })} placeholder="Property, customer, visit or crew" />
        </div>
        {sel.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", background: "var(--accent-faint)", borderTop: "1px solid var(--accent-line)", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12.5px", flex: 1 }}>{plural(sel.length, "row")} selected. Batch actions only copy or export; each charge is still processed one at a time in its own tool.</span>
            <Btn small onClick={doCopy}>Copy selected</Btn><Btn small onClick={doExport}>Export selected</Btn><Btn small onClick={() => setSub("charge", { selected: [] })}>Clear</Btn>
          </div>
        )}
        <Table caption="Daily charge sheet" minWidth={1080} rows={shown} rowKey={r => r.v.id} cols={cols} onRow={r => openDrawer({ kind: "visit", id: r.v.id })}
          selected={r => sel.indexOf(r.v.id) > -1} onSort={sortBy} sortKey={sortKey} sortDir={ui.dir}
          empty={<Empty title="No matching visits" body={q ? "Nothing on today's sheet matches “" + ui.q + "”." : "No visits in this filter today."} action={<Btn small onClick={() => setSub("charge", { q: "", filter: "all" })}>Clear filters</Btn>} />} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", flexWrap: "wrap" }}>
          <span style={{ flex: 1, fontSize: "12px", color: "var(--faint)" }}>Showing {shown.length} of {rows.length} visits · {DEMO.label} · {DEMO.tz}</span>
          <Btn small onClick={doCopy}>Copy ready details</Btn>
          <Btn small onClick={doExport}>{selRows.length ? "Export selected (CSV)" : "Export ready (CSV)"}</Btn>
          <Btn small onClick={() => window.print()}>Print sheet</Btn>
        </div>
      </Card>
      <PrintSheet rows={rows.filter(r => r.category === "ready")} />
    </>
  );
}

function Toolbar() {
  const s = useGardener();
  const dates = [DEMO.date].concat(historySheets(s).map(h => h.date));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", margin: "0 0 14px" }}>
      <Select label="Sheet date" value={s.ui.charge.date} onChange={d => setSub("charge", { date: d, selected: [] })}
        options={dates.map(d => [d, dayLabel(d) + (d === DEMO.date ? " (today, live)" : " (processed)")] as [string, string])} />
      <div style={{ flex: 1 }} />
      <Btn small onClick={() => { rerunImport(); }}>Re-run calendar import (simulated)</Btn>
      <Btn small onClick={() => openModal({ kind: "reset", id: "" })}>Reset demo</Btn>
    </div>
  );
}

const REVIEW_CATS = [
  { id: "price", label: "Missing price" }, { id: "match", label: "Ambiguous customer match" },
  { id: "evidence", label: "Incomplete service evidence" }, { id: "scope", label: "Scope dispute" },
];
function Review() {
  const s = useGardener();
  const today = todayRows(s).filter(r => r.category === "review");
  const prim = allVisits(s).find(v => v.id === PRIMROSE_VISIT);
  const primRow = prim ? rowFor(s, prim) : null;
  const earlier = primRow && primRow.category === "review" ? [primRow] : [];
  const all = today.concat(earlier);
  const cat = s.ui.charge.reviewCat;
  const resolvedPrice = s.prices["V-120-L2"];
  const items = all.filter(r => cat === "all" || r.reviewKind === cat);
  return (
    <>
      <Note title="What lands here">Only items a person has to decide: a missing price, an uncertain customer match, missing completion evidence or a scope dispute. Ordinary ready charges never need approval.</Note>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", margin: "14px 0" }}>
        <Segs label="Review category" value={cat} onChange={id => setSub("charge", { reviewCat: id })}
          items={[{ id: "all", label: "All", count: all.length }].concat(REVIEW_CATS.map(c => ({ id: c.id, label: c.label, count: all.filter(r => r.reviewKind === c.id).length })))} />
      </div>
      <Card pad={false}>
        {items.map(r => (
          <div key={r.v.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px 20px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <Pill tone="warn">{REVIEW_CATS.find(c => c.id === r.reviewKind)?.label}</Pill>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{r.p.name}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--faint)" }}>{r.v.id} · {dayLabel(r.v.date)}</span>
                {r.v.date !== DEMO.date && <Pill>Earlier, not on today's sheet</Pill>}
              </div>
              <div style={{ fontSize: "13px", color: "var(--body)", marginTop: "8px", lineHeight: 1.55 }}>{r.why}</div>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "6px" }}>Owner {r.owner.name} · {r.reviewKind === "price" ? "task T-01 due Tue 20 Oct, 09:30" : "task T-05"}</div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Btn small primary onClick={() => openModal({ kind: r.reviewKind === "price" ? "price" : "confirm", id: r.v.id })}>{r.reviewKind === "price" ? "Enter price and source" : "Confirm completion"}</Btn>
              <Btn small onClick={() => openDrawer({ kind: "visit", id: r.v.id })}>Open details</Btn>
            </div>
          </div>
        ))}
        {items.length === 0 && <Empty title={cat === "all" ? "Nothing held for review" : "No " + (REVIEW_CATS.find(c => c.id === cat)?.label || "").toLowerCase() + " issues in today's seed"}
          body={cat === "match" ? "Every calendar occurrence matched one property record. The category stays available for real data."
            : cat === "scope" ? "No customer has disputed scope today. Oak Lodge's extra is a missing price, not a dispute."
            : resolvedPrice && (cat === "price" || cat === "all") ? "Oak Lodge was priced at " + eur(resolvedPrice.cents) + " (" + resolvedPrice.ref + ") and moved to Ready." : "Clear."} />}
      </Card>
    </>
  );
}

function Invoices() {
  const s = useGardener();
  const q = invoiceRows(s);
  return (
    <>
      <Grid cols="repeat(3,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="Preparation needed" value={eur(q.prep.reduce((n, r) => n + r.outstandingCents, 0))} sub={plural(q.prep.length, "invoice") + " for Invoice Home"} tone={q.prep.length ? "warn" : undefined} />
        <Stat label="Recorded · awaiting payment" value={eur(q.awaiting.reduce((n, r) => n + r.i.cents, 0))} sub={plural(q.awaiting.length, "invoice") + " · invoiced is not paid"} />
        <Stat label="Paid" value={eur(q.paid.reduce((n, r) => n + r.i.cents, 0))} sub={plural(q.paid.length, "invoice") + " in the last fortnight"} tone="ok" />
      </Grid>
      <Card title="Preparation needed" hint="Create these in Invoice Home, then record the invoice number. There is no Invoice Home connection; nothing is created automatically.">
        {q.prep.length ? q.prep.map(r => (
          <div key={r.v.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 280px", minWidth: 0 }}><Ellip strong sub={r.c.name + " · " + r.v.id + " · " + r.lines[0].label}>{r.p.name}</Ellip></div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "14px" }}>{eur(r.outstandingCents)}</span>
            <Btn small onClick={async () => { const ok = await copyText(chargeText(r)); logCopy(r.v.id + " invoice details"); toast(ok ? "Invoice details copied." : "Copy blocked by the browser."); }}>Copy details</Btn>
            <Btn small primary onClick={() => openModal({ kind: "invoice", id: r.v.id })}>Record invoice (demo)</Btn>
          </div>
        )) : <Empty title="Nothing to prepare" body="Both of today's Invoice Home items have invoice numbers recorded." />}
      </Card>
      <div style={{ height: "12px" }} />
      <Grid cols="1fr 1fr">
        <Card title="Recorded, awaiting payment">
          {q.awaiting.length ? q.awaiting.map(r => (
            <div key={r.i.id} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "11px 0", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}><Ellip strong sub={r.i.ref + " · issued " + dayLabel(r.i.issuedOn) + " · due " + dayLabel(r.i.dueOn)}>{r.prop.name}</Ellip></div>
              <span style={{ fontFamily: "var(--mono)" }}>{eur(r.i.cents)}</span>
              <Btn small onClick={() => openModal({ kind: "invoicePaid", id: r.i.id })}>Record payment</Btn>
            </div>
          )) : <Empty title="No open invoices" body="Every recorded invoice is paid." />}
        </Card>
        <Card title="Paid">
          {q.paid.length ? q.paid.map(r => (
            <div key={r.i.id} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "11px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}><Ellip strong sub={r.i.ref + " · " + (r.pay ? r.pay.ref + " · " + dayLabel(r.pay.date) : "")}>{r.prop.name}</Ellip></div>
              <span style={{ fontFamily: "var(--mono)" }}>{eur(r.i.cents)}</span><Pill tone="ok">Paid</Pill>
            </div>
          )) : <Empty title="None yet" body="Paid invoices show here once recorded." />}
        </Card>
      </Grid>
    </>
  );
}

function Reconciliation() {
  const s = useGardener();
  const rows = reconRows(s);
  const pending = rows.filter(r => r.state === "pending"), mismatch = rows.filter(r => r.state === "mismatch");
  const last = s.ledgerRuns[s.ledgerRuns.length - 1];
  const dupRaw = RAW_IMPORTS.filter((r, i, a) => a.findIndex(x => x.occurrenceKey === r.occurrenceKey) !== i);
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="Stripe payments (2 weeks)" value={String(rows.length)} sub="Read-only mock records" />
        <Stat label="Matched in Sheets" value={String(rows.filter(r => r.state === "matched").length)} tone="ok" />
        <Stat label="Paid, no ledger row" value={eur(pending.reduce((n, r) => n + r.p.cents, 0))} sub={plural(pending.length, "payment") + " · lag, not non-payment"} tone={pending.length ? "warn" : undefined} />
        <Stat label="Amount mismatch" value={String(mismatch.length)} sub="Sheets row differs from Stripe" tone={mismatch.length ? "bad" : undefined} />
      </Grid>
      <Card title="Stripe payments against the Google Sheets ledger" hint="Existing connector, provider unconfirmed. The refresh below only runs the known local simulation."
        right={<Btn small primary onClick={() => refreshLedger()}>Refresh ledger (simulated)</Btn>} pad={false}>
        {last && <div style={{ padding: "0 20px 12px" }}><Note tone="ok" title={"Last refresh " + last.at}>{last.added.length ? "Added " + last.added.join(", ") + ". Cash collected is unchanged; only the reconciliation state moved." : "No missing rows found."}</Note></div>}
        <Table caption="Reconciliation" minWidth={820} rowKey={r => r.p.id} rows={rows} cols={[
          { key: "ref", label: "Payment", w: "1.1fr", render: r => <Ellip strong sub={dayLabel(r.p.date)}>{r.p.ref}</Ellip> },
          { key: "prop", label: "Property", w: "1.1fr", render: r => <Ellip>{r.prop ? r.prop.name : "—"}</Ellip> },
          { key: "amt", label: "Stripe", w: ".7fr", align: "right", render: r => <span style={{ fontFamily: "var(--mono)" }}>{eur(r.p.cents)}</span> },
          { key: "led", label: "Sheets row", w: ".9fr", render: r => <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--dim)" }}>{r.led ? eur(r.led.cents) + " · " + r.led.addedAt.slice(5) : "—"}</span> },
          { key: "st", label: "State", w: ".8fr", render: r => <Pill tone={r.state === "matched" ? "ok" : r.state === "mismatch" ? "bad" : "warn"}>{r.state === "matched" ? "Matched" : r.state === "mismatch" ? "Mismatch" : "Pending"}</Pill> },
          { key: "note", label: "Note", w: "1.6fr", render: r => <span style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}><Ellip>{r.note}</Ellip>{r.state === "mismatch" && <Btn small onClick={() => toggleTask("T-12", true)}>Mark corrected</Btn>}</span> }]} />
      </Card>
      <div style={{ height: "12px" }} />
      <Card title="Calendar import, 19 Oct" hint="Stable occurrence keys, not matching titles, decide what is a visit. Re-running an import cannot create a second visit or charge.">
        <KV cols={4} items={[["Rows read", String(RAW_IMPORTS.length)], ["Unique occurrences", String(new Set(RAW_IMPORTS.map(r => r.occurrenceKey)).size)], ["Duplicates excluded", String(dupRaw.length)], ["Import runs today", String(s.importRuns.length)]]} />
        {dupRaw.map(d => <div key={d.rawId} style={{ marginTop: "10px" }}><Note title={d.rawId + " · " + d.batch}>{d.note}</Note></div>)}
        <Section label="Runs">
          {s.importRuns.map((r, i) => <div key={i} style={{ fontSize: "12.5px", padding: "7px 0", borderTop: "1px solid var(--border)", color: "var(--body)" }}><span style={{ fontFamily: "var(--mono)", color: "var(--faint)", marginRight: "12px" }}>{r.at}</span>{r.rows} rows · {r.matched} matched · {r.created} new visits · {r.duplicates} duplicate</div>)}
        </Section>
      </Card>
    </>
  );
}

function History() {
  const s = useGardener();
  const hist = historySheets(s);
  const [open, setOpen] = useState<string | null>(hist[0]?.date || null);
  const decisions = s.events.filter(e => /price|confirmed|approved|cancellation|deferred/i.test(e.title));
  const external = s.payments.filter(p => p.recordedAt.startsWith(DEMO.date) || p.date >= "2026-10-18").slice().reverse();
  return (
    <Grid cols="1.5fr 1fr">
      <Card title="Previous daily sheets" pad={false}>
        {hist.map(h => (
          <div key={h.date} style={{ borderTop: "1px solid var(--border)" }}>
            <button type="button" className="ix11" onClick={() => setOpen(open === h.date ? null : h.date)} aria-expanded={open === h.date}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "13px 20px", border: 0, background: "none", color: "inherit", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontWeight: 500, fontSize: "13.5px", width: "92px" }}>{h.label}</span>
              <span style={{ flex: 1, fontSize: "12.5px", color: "var(--dim)" }}>{plural(h.items.length, "item")} · exported {h.exportedAt} · {teamById(h.processedBy).name}</span>
              <span style={{ fontFamily: "var(--mono)" }}>{eur(h.cents)}</span>
              <span aria-hidden="true" style={{ color: "var(--faint)" }}>{open === h.date ? "−" : "+"}</span>
            </button>
            {open === h.date && <div style={{ padding: "0 20px 14px" }}>
              {h.items.map(i => <div key={i.lineId} style={{ display: "flex", gap: "10px", fontSize: "12.5px", padding: "7px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ flex: 1, minWidth: 0 }}>{i.prop.name} · {i.label}</span><span style={{ color: "var(--dim)" }}>{i.status}</span><span style={{ fontFamily: "var(--mono)", width: "64px", textAlign: "right" }}>{eur(i.cents)}</span></div>)}
              {h.decisions.map(d => <div key={d} style={{ marginTop: "8px" }}><Note title="Review decision">{d}</Note></div>)}
            </div>}
          </div>
        ))}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Card title="Exports today">
          {s.exports.length ? s.exports.slice().reverse().map((e, i) => <div key={i} style={{ fontSize: "12.5px", padding: "7px 0", borderTop: "1px solid var(--border)" }}><span style={{ fontFamily: "var(--mono)", color: "var(--faint)", marginRight: "10px" }}>{e.at}</span>{e.file} · {plural(e.rows, "row")}</div>)
            : <div style={{ fontSize: "13px", color: "var(--dim)" }}>No export yet today. <button type="button" className="ixt" onClick={() => go("Charge Desk", "sheet")} style={{ border: 0, background: "none", color: "var(--accent)", cursor: "pointer", padding: 0 }}>Open the sheet</button></div>}
        </Card>
        <Card title="Payments recorded outside Pulse">
          {external.map(p => <div key={p.id} style={{ display: "flex", gap: "10px", fontSize: "12.5px", padding: "7px 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ flex: 1 }}>{p.ref} · {dayLabel(p.date)}</span><span style={{ fontFamily: "var(--mono)" }}>{eur(p.cents)}</span></div>)}
        </Card>
        <Card title="Decisions today">
          {decisions.map(e => <div key={e.id} style={{ fontSize: "12.5px", padding: "7px 0", borderTop: "1px solid var(--border)", lineHeight: 1.5 }}><span style={{ fontFamily: "var(--mono)", color: "var(--faint)", marginRight: "10px" }}>{e.at}</span>{e.title}<span style={{ display: "block", color: "var(--dim)" }}>{e.note}</span></div>)}
        </Card>
      </div>
    </Grid>
  );
}

export const CHARGE_TABS = [["sheet", "Daily Sheet"], ["review", "Review"], ["invoices", "Invoices"], ["reconciliation", "Reconciliation"], ["history", "History"]];

export default function ChargeDesk() {
  const s = useGardener();
  const tab = s.ui.tabs["Charge Desk"] || "sheet";
  const t = totals(s);
  const iss = issues(s).filter(i => i.open);
  const sub = tab === "sheet" ? "See what was completed today, what is already covered, and exactly what needs to be charged. You still process every charge yourself in Stripe or Invoice Home."
    : tab === "review" ? "Held items need a person: a price, a match, evidence or a scope call."
    : tab === "invoices" ? "Customers outside the Stripe flow. Invoice creation and payment stay separate states."
    : tab === "reconciliation" ? "Payment evidence in Stripe against rows in the Google Sheets ledger, plus the calendar import that feeds the sheet."
    : "Earlier sheets, exports, recorded payments and the decisions behind them.";
  return (
    <Page eyebrow={"CHARGE DESK · " + DEMO.label.toUpperCase()} title={tab === "sheet" ? "Today's charge sheet" : CHARGE_TABS.find(x => x[0] === tab)?.[1] || ""} sub={sub}
      actions={tab === "sheet" ? <Pill tone="accent">{plural(t.ready, "item")} · {eur(t.readyCents)} ready</Pill> : iss.length ? <Pill tone="warn">{plural(iss.length, "open issue")}</Pill> : undefined}>
      {tab === "sheet" && <DailySheet />}
      {tab === "review" && <Review />}
      {tab === "invoices" && <Invoices />}
      {tab === "reconciliation" && <Reconciliation />}
      {tab === "history" && <History />}
      <div style={{ ...C.mono, marginTop: "18px", textAlign: "center" }}>Demo data · no live charges, invoices or ledger writes</div>
    </Page>
  );
}
export { propById };
