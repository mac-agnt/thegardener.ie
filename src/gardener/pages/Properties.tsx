import { useMemo } from "react";
import { useGardener, setSub, openDrawer, openModal, toggleTask, go } from "../store";
import {
  PROPERTIES, custById, agrById, nextVisitFor, nextOccurrence, issues, allVisits, rowFor, dayLabel, plural, propById, teamById, COUNTS,
  type Issue,
} from "../selectors";
import { Page, Card, Grid, Stat, Segs, Search, Table, Pill, Btn, Ellip, Select, Empty, Pager } from "../ui";

const AREAS = Array.from(new Set(PROPERTIES.map(p => p.area))).sort();

function Directory() {
  const s = useGardener();
  const ui = s.ui.props;
  const open = issues(s).filter(i => i.open);
  const q = ui.q.trim().toLowerCase();
  const list = useMemo(() => PROPERTIES.filter(p => (ui.status === "all" || p.kind === ui.status) && (ui.area === "all" || p.area === ui.area)
    && (!q || (p.name + " " + p.area + " " + custById(p.customerId).name + " " + p.id + " " + (p.agreementId || "")).toLowerCase().indexOf(q) > -1)), [ui.status, ui.area, q]);
  const per = 25, pages = Math.ceil(list.length / per), page = Math.min(ui.page, Math.max(0, pages - 1));
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="Active properties" value={String(COUNTS.properties)} sub="One per active customer in this demo model" />
        <Stat label="On quarterly agreements" value={String(COUNTS.contract)} sub="Routine work covered by the fee" onClick={() => setSub("props", { status: "contract", page: 0 })} />
        <Stat label="Ad-hoc" value={String(COUNTS.adhoc)} sub="Priced and charged per job" onClick={() => setSub("props", { status: "adhoc", page: 0 })} />
        <Stat label="With open issues" value={String(new Set(open.flatMap(i => i.propertyIds)).size)} sub={plural(open.length, "open issue")} tone={open.length ? "warn" : undefined} onClick={() => go("Properties", "attention")} />
      </Grid>
      <Card pad={false}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px" }}>
          <Segs label="Property type" value={ui.status} onChange={v => setSub("props", { status: v, page: 0 })} items={[{ id: "all", label: "All", count: COUNTS.properties }, { id: "contract", label: "Agreement", count: COUNTS.contract }, { id: "adhoc", label: "Ad-hoc", count: COUNTS.adhoc }]} />
          <Select label="Area" value={ui.area} onChange={v => setSub("props", { area: v, page: 0 })} options={[["all", "All areas"] as [string, string]].concat(AREAS.map(a => [a, a] as [string, string]))} />
          <div style={{ flex: 1 }} />
          <Search label="Search properties" value={ui.q} onChange={v => setSub("props", { q: v, page: 0 })} placeholder="Property, customer, area or ID" />
        </div>
        <Table caption="Property directory" minWidth={900} rowKey={p => p.id} rows={list.slice(page * per, page * per + per)} onRow={p => openDrawer({ kind: "property", id: p.id })}
          cols={[
            { key: "n", label: "Property", w: "1.3fr", render: p => <Ellip strong sub={p.id}>{p.name}</Ellip> },
            { key: "a", label: "Area", w: ".8fr", render: p => p.area },
            { key: "c", label: "Customer", w: "1.1fr", render: p => <Ellip>{custById(p.customerId).name}</Ellip> },
            { key: "s", label: "Status", w: "1fr", render: p => p.kind === "contract" ? <Pill tone="accent">{p.agreementId} · {agrById(p.agreementId)!.recurrence.rule === "unclear" ? "interval unclear" : agrById(p.agreementId)!.recurrence.label.toLowerCase()}</Pill> : <Pill tone="info">Ad-hoc · {p.route === "stripe" ? "Stripe" : "Invoice Home"}</Pill> },
            { key: "v", label: "Next visit", w: ".9fr", render: p => { const v = nextVisitFor(s, p.id); const a = agrById(p.agreementId); return <span style={{ fontSize: "12.5px" }}>{v ? dayLabel(v.date) : a ? nextOccurrence(a) : "None booked"}</span>; } },
            { key: "i", label: "Issues", w: "1fr", render: p => { const mine = open.filter(i => i.propertyIds.indexOf(p.id) > -1); return mine.length ? <Pill tone="warn" title={mine.map(i => i.title).join("; ")}>{mine[0].kind}{mine.length > 1 ? " +" + (mine.length - 1) : ""}</Pill> : <span style={{ color: "var(--faint)" }}>None</span>; } },
          ]} empty={<Empty title="No properties match" body="Try another area or clear the search." action={<Btn small onClick={() => setSub("props", { q: "", status: "all", area: "all", page: 0 })}>Clear filters</Btn>} />} />
        <Pager page={page} pages={pages} onPage={p => setSub("props", { page: p })} total={list.length} shown={"Showing " + (list.length ? page * per + 1 : 0) + "–" + Math.min(list.length, page * per + per)} />
      </Card>
    </>
  );
}

export function issueAction(i: Issue) {
  if (i.id === "ISS-PRICE") return () => openModal({ kind: "price", id: "V-120" });
  if (i.id === "ISS-FRIDAY") return () => go("Schedule", "capacity");
  if (i.id === "ISS-EVIDENCE") return () => openModal({ kind: "confirm", id: i.related[1].id });
  if (i.id.startsWith("ISS-LEDGER") || i.id === "ISS-MISMATCH") return () => go("Charge Desk", "reconciliation");
  if (i.id === "ISS-INVOICE") return () => go("Charge Desk", "invoices");
  if (i.id === "ISS-ACCESS") return () => toggleTask("T-11", true);
  if (i.id === "ISS-RECUR") return () => toggleTask("T-06", true);
  if (i.id === "ISS-QTR") return () => toggleTask("T-07", true);
  const r = i.related.find(x => x.kind === "visit") || i.related.find(x => x.kind === "property");
  return () => r && openDrawer(r.kind === "visit" ? { kind: "visit", id: r.id } : { kind: "property", id: r.id });
}

export function IssueList({ list }: { list: Issue[] }) {
  return (
    <Card pad={false}>
      {list.map(i => (
        <div key={i.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px 20px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <Pill tone={i.severity === "high" ? "bad" : i.severity === "medium" ? "warn" : "neutral"}>{i.kind}</Pill>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{i.title}</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--body)", marginTop: "7px", lineHeight: 1.55 }}>{i.detail}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "9px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--dim)", marginRight: "4px" }}>{i.owner.name} · due {i.due}</span>
              {i.related.map(r => (
                <button key={r.kind + r.id} type="button" className="ixa" onClick={() => r.kind === "page" ? go(r.id.split(":")[0], r.id.split(":")[1]) : openDrawer({ kind: r.kind as "visit" | "property" | "agreement", id: r.id })}
                  style={{ height: "24px", padding: "0 9px", borderRadius: "var(--r-sm,8px)", background: "var(--chip)", border: "1px solid var(--chip-border)", fontSize: "11.5px", color: "var(--body)", cursor: "pointer" }}>{r.label}</button>
              ))}
            </div>
          </div>
          <Btn small primary onClick={issueAction(i)}>{i.action}</Btn>
        </div>
      ))}
      {list.length === 0 && <Empty title="Nothing needs attention" body="Every exception in the demo is resolved. Reset the demo to bring the story back." />}
    </Card>
  );
}

function Attention() {
  const s = useGardener();
  const list = issues(s).filter(i => i.open).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
  const done = issues(s).filter(i => !i.open);
  return (
    <>
      <IssueList list={list} />
      <div style={{ height: "14px" }} />
      <Card title={"Resolved · " + done.length} hint="The same issue records behind Schedule, Charge Desk, Work and the agents.">
        {done.map(i => <div key={i.id} style={{ display: "flex", gap: "10px", fontSize: "12.5px", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
          <Pill tone="ok">Resolved</Pill><span style={{ flex: 1 }}>{i.title}</span><span style={{ color: "var(--dim)" }}>{i.resolution}</span></div>)}
      </Card>
    </>
  );
}

function History() {
  const s = useGardener();
  const ui = s.ui.props;
  const q = ui.historyQ.trim().toLowerCase();
  const rows = useMemo(() => allVisits(s).filter(v => v.date <= "2026-10-19").map(v => rowFor(s, v))
    .filter(r => (ui.historyOutcome === "all" || r.status.toLowerCase().replace(" ", "") === ui.historyOutcome)
      && (!q || (r.p.name + " " + r.v.id + " " + r.v.service + " " + r.staff.name).toLowerCase().indexOf(q) > -1))
    .sort((a, b) => b.v.date.localeCompare(a.v.date) || a.start - b.start), [s, ui.historyOutcome, q]);
  const per = 25, pages = Math.ceil(rows.length / per), page = Math.min(ui.page, Math.max(0, pages - 1));
  return (
    <Card pad={false}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px" }}>
        <Segs label="Outcome" value={ui.historyOutcome} onChange={v => setSub("props", { historyOutcome: v, page: 0 })} items={[
          { id: "all", label: "All" }, { id: "completed", label: "Completed" }, { id: "rescheduled", label: "Deferred" }, { id: "cancelled", label: "Cancelled" }, { id: "noevidence", label: "No evidence" }]} />
        <div style={{ flex: 1 }} />
        <Search label="Search visit history" value={ui.historyQ} onChange={v => setSub("props", { historyQ: v, page: 0 })} placeholder="Property, visit ID, service or crew" />
      </div>
      <Table caption="Visit history" minWidth={860} rowKey={r => r.v.id} rows={rows.slice(page * per, page * per + per)} onRow={r => openDrawer({ kind: "visit", id: r.v.id })} cols={[
        { key: "d", label: "Date", w: ".75fr", render: r => <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{dayLabel(r.v.date)}</span> },
        { key: "p", label: "Property", w: "1.2fr", render: r => <Ellip strong sub={r.v.id}>{r.p.name}</Ellip> },
        { key: "s", label: "Service", w: "1.3fr", render: r => <Ellip>{r.v.service}</Ellip> },
        { key: "c", label: "Crew", w: ".8fr", render: r => teamById(r.v.staffId).first },
        { key: "o", label: "Outcome", w: ".8fr", render: r => <Pill tone={r.status === "Completed" ? "ok" : r.status === "No evidence" ? "warn" : "neutral"}>{r.status}</Pill> },
        { key: "e", label: "Evidence", w: "1.6fr", render: r => <Ellip>{r.v.completion ? r.v.completion.note : r.v.outcomeNote || r.evidence}</Ellip> },
      ]} empty={<Empty title="No visits match" body="Try a different outcome or clear the search." action={<Btn small onClick={() => setSub("props", { historyQ: "", historyOutcome: "all" })}>Clear filters</Btn>} />} />
      <Pager page={page} pages={pages} onPage={p => setSub("props", { page: p })} total={rows.length} shown={"Showing " + (rows.length ? page * per + 1 : 0) + "–" + Math.min(rows.length, page * per + per)} />
    </Card>
  );
}

export const PROPERTY_TABS = [["directory", "Directory"], ["attention", "Needs Attention"], ["history", "Visit History"]];
export default function Properties() {
  const s = useGardener();
  const tab = s.ui.tabs.Properties || "directory";
  const open = issues(s).filter(i => i.open).length;
  return (
    <Page eyebrow="PROPERTIES · DEMO DATA" title={PROPERTY_TABS.find(t => t[0] === tab)?.[1] || "Properties"}
      sub={tab === "directory" ? "250 fictional active properties: 150 on quarterly agreements and 100 ad-hoc. Areas are demo values; no exact addresses or gate codes are stored."
        : tab === "attention" ? "Every open exception, owned and dated, linked to the records it touches."
        : "Completed, deferred and cancelled visits for this week and last."}
      actions={open ? <Pill tone="warn">{plural(open, "open issue")}</Pill> : <Pill tone="ok">All clear</Pill>}>
      {tab === "directory" && <Directory />}
      {tab === "attention" && <Attention />}
      {tab === "history" && <History />}
    </Page>
  );
}
export { propById };
