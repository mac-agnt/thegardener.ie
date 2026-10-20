import { useMemo } from "react";
import { useGardener, setSub, openDrawer, openModal, toggleTask } from "../store";
import { AGREEMENTS, propById, custById, eur, dayLabel, plural, issues, todayRows, DEMO, type Row } from "../selectors";
import { Page, Card, Grid, Stat, Segs, Search, Table, Pill, Btn, Ellip, Note, Empty, Pager, KV } from "../ui";

const RULE_LABEL: Record<string, string> = { weekly: "Every week", "2w": "Every 2 weeks", "4w": "Every 4 weeks", "2m": "Every 2 months", unclear: "Needs clarification" };

function Overview() {
  const s = useGardener();
  const fees = AGREEMENTS.reduce((n, a) => n + a.feeCents, 0);
  const missing = AGREEMENTS.filter(a => a.evidence.status === "missing");
  const byNext = ["2026-11-01", "2026-12-01", "2027-01-01"].map(d => ({ d, list: AGREEMENTS.filter(a => a.nextPaymentDate === d) }));
  const reviews = AGREEMENTS.filter(a => a.reviewDate <= "2026-12-31").sort((a, b) => a.reviewDate.localeCompare(b.reviewDate));
  const qtrDone = !!s.taskToggles["T-07"];
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="Active agreements" value={String(AGREEMENTS.length)} sub="Quarterly, paid upfront (demo records)" />
        <Stat label="Quarterly fees on file" value={eur(fees)} sub="Sum of demo fees per quarter. Illustrative, not turnover." />
        <Stat label="Reviews before year end" value={String(reviews.length)} sub="Annual review dates" onClick={() => setSub("contracts", { page: 0 })} />
        <Stat label="Missing payment evidence" value={String(qtrDone ? 0 : missing.length)} sub={qtrDone ? "Followed up" : missing.map(a => a.id).join(", ")} tone={qtrDone ? "ok" : "warn"} />
      </Grid>
      <Grid cols="1fr 1fr">
        <Card title="Recurring commitments" hint="How often contracted properties are visited. Each series has an explicit interval.">
          {Object.keys(RULE_LABEL).map(r => {
            const n = AGREEMENTS.filter(a => a.recurrence.rule === r).length;
            return <div key={r} style={{ display: "grid", gridTemplateColumns: "160px 1fr 40px", gap: "12px", alignItems: "center", padding: "8px 0" }}>
              <span style={{ fontSize: "13px", color: r === "unclear" ? "var(--warn)" : undefined }}>{RULE_LABEL[r]}</span>
              <div style={{ height: "8px", borderRadius: "999px", background: "var(--track)" }}><div style={{ width: Math.max(2, Math.round(100 * n / AGREEMENTS.length)) + "%", height: "100%", borderRadius: "999px", background: r === "unclear" ? "var(--warn)" : "var(--accent)" }} /></div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "12.5px", textAlign: "right" }}>{n}</span></div>;
          })}
        </Card>
        <Card title="Next quarterly payment dates" hint="Collected through the existing Stripe flow. Pulse does not collect them.">
          {byNext.map(x => <div key={x.d} style={{ display: "flex", gap: "12px", padding: "10px 0", borderTop: "1px solid var(--border)", fontSize: "13px" }}>
            <span style={{ width: "110px" }}>{dayLabel(x.d)} {x.d.slice(0, 4)}</span><span style={{ flex: 1, color: "var(--dim)" }}>{plural(x.list.length, "agreement")}</span>
            <span style={{ fontFamily: "var(--mono)" }}>{eur(x.list.reduce((n, a) => n + a.feeCents, 0))}</span></div>)}
          <div style={{ marginTop: "10px" }}><Note>Birch House (AGR-001) is in the 1 Aug – 31 Oct quarter, paid. Its next quarterly payment date is 1 Nov.</Note></div>
        </Card>
      </Grid>
      <div style={{ height: "12px" }} />
      <Card title="Upcoming reviews" hint="Dated review conversations, sorted by date." pad={false}>
        <Table caption="Upcoming reviews" minWidth={700} rowKey={a => a.id} rows={reviews.slice(0, 8)} onRow={a => openDrawer({ kind: "agreement", id: a.id })} cols={[
          { key: "d", label: "Review", w: ".8fr", render: a => dayLabel(a.reviewDate) },
          { key: "p", label: "Property", w: "1.3fr", render: a => <Ellip strong sub={a.id}>{propById(a.propertyId).name}</Ellip> },
          { key: "f", label: "Quarterly fee", w: ".8fr", render: a => <span style={{ fontFamily: "var(--mono)" }}>{eur(a.feeCents)}</span> },
          { key: "r", label: "Recurrence", w: "1fr", render: a => a.recurrence.label }]} />
      </Card>
    </>
  );
}

function Agreements() {
  const s = useGardener();
  const ui = s.ui.contracts;
  const q = ui.q.trim().toLowerCase();
  const list = useMemo(() => AGREEMENTS.filter(a => (ui.rule === "all" || a.recurrence.rule === ui.rule || (ui.rule === "missing" && a.evidence.status === "missing"))
    && (!q || (a.id + " " + propById(a.propertyId).name + " " + custById(a.customerId).name).toLowerCase().indexOf(q) > -1)), [ui.rule, q]);
  const per = 20, pages = Math.ceil(list.length / per), page = Math.min(ui.page, Math.max(0, pages - 1));
  return (
    <Card pad={false}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px" }}>
        <Segs label="Agreement filter" value={ui.rule} onChange={v => setSub("contracts", { rule: v, page: 0 })} items={[{ id: "all", label: "All", count: AGREEMENTS.length },
          { id: "weekly", label: "Weekly" }, { id: "2w", label: "Every 2 weeks" }, { id: "unclear", label: "Unclear interval" }, { id: "missing", label: "Missing evidence", count: AGREEMENTS.filter(a => a.evidence.status === "missing").length }]} />
        <div style={{ flex: 1 }} />
        <Search label="Search agreements" value={ui.q} onChange={v => setSub("contracts", { q: v, page: 0 })} placeholder="Agreement, property or customer" />
      </div>
      <Table caption="Agreements" minWidth={1000} rowKey={a => a.id} rows={list.slice(page * per, page * per + per)} onRow={a => openDrawer({ kind: "agreement", id: a.id })} cols={[
        { key: "id", label: "Agreement", w: ".7fr", render: a => <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{a.id}</span> },
        { key: "p", label: "Property", w: "1.2fr", render: a => <Ellip strong sub={custById(a.customerId).name}>{propById(a.propertyId).name}</Ellip> },
        { key: "f", label: "Quarterly fee", w: ".75fr", align: "right", render: a => <span style={{ fontFamily: "var(--mono)" }}>{eur(a.feeCents)}</span> },
        { key: "sc", label: "Scope", w: "1.1fr", render: a => <Ellip sub={plural(a.excluded.length, "exclusion")}>{a.included.length} included services</Ellip> },
        { key: "per", label: "Current period", w: "1fr", render: a => <span style={{ fontSize: "12.5px" }}>{dayLabel(a.periodStart)} – {dayLabel(a.periodEnd)}</span> },
        { key: "ev", label: "Payment evidence", w: ".95fr", render: a => a.evidence.status === "paid" ? <Ellip sub={dayLabel(a.evidence.date as string)}>{a.evidence.ref}</Ellip> : <Pill tone="warn">Missing</Pill> },
        { key: "r", label: "Recurrence", w: ".95fr", render: a => a.recurrence.rule === "unclear" ? <Pill tone="warn">Needs clarification</Pill> : <span style={{ fontSize: "12.5px" }}>{a.recurrence.label}</span> },
        { key: "eff", label: "Effective", w: ".7fr", render: a => <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--dim)" }}>{a.effectiveFrom}</span> },
      ]} empty={<Empty title="No agreements match" body="Clear the search or pick another filter." action={<Btn small onClick={() => setSub("contracts", { q: "", rule: "all" })}>Clear filters</Btn>} />} />
      <Pager page={page} pages={pages} onPage={p => setSub("contracts", { page: p })} total={list.length} shown={"Showing " + (list.length ? page * per + 1 : 0) + "–" + Math.min(list.length, page * per + per)} />
    </Card>
  );
}

function Renewals() {
  const s = useGardener();
  const list = AGREEMENTS.filter(a => a.reviewDate <= "2027-01-31").sort((a, b) => a.reviewDate.localeCompare(b.reviewDate));
  const nov = list.filter(a => a.reviewDate.slice(0, 7) === "2026-11");
  return (
    <>
      <Note title="What this tab does">Lists dated review conversations so nothing lapses quietly. Renewal fees and next quarterly payments are still taken through the existing Stripe flow; Pulse never collects them.</Note>
      <div style={{ height: "12px" }} />
      <Card title={"Reviews due by 31 Jan 2027 · " + list.length} hint={"November has " + plural(nov.length, "review") + ". Task T-09 tracks that batch for Kevin."}
        right={<Btn small primary={!s.taskToggles["T-09"]} onClick={() => toggleTask("T-09", !s.taskToggles["T-09"])}>{s.taskToggles["T-09"] ? "November reviewed ✓" : "Mark November reviewed"}</Btn>} pad={false}>
        <Table caption="Renewal reviews" minWidth={760} rowKey={a => a.id} rows={list} onRow={a => openDrawer({ kind: "agreement", id: a.id })} cols={[
          { key: "d", label: "Review date", w: ".8fr", render: a => <span style={{ fontWeight: 500 }}>{dayLabel(a.reviewDate)} {a.reviewDate.slice(0, 4)}</span> },
          { key: "p", label: "Property", w: "1.3fr", render: a => <Ellip strong sub={a.id + " · since " + a.effectiveFrom.slice(0, 4)}>{propById(a.propertyId).name}</Ellip> },
          { key: "t", label: "Task", w: "1.4fr", render: a => <Ellip>Review scope and fee with {custById(a.customerId).name.split(" ")[0]}</Ellip> },
          { key: "o", label: "Owner", w: ".7fr", render: () => "Kevin" },
          { key: "s", label: "Status", w: ".7fr", render: a => a.reviewDate.slice(0, 7) === "2026-11" && s.taskToggles["T-09"] ? <Pill tone="ok">Reviewed</Pill> : <Pill>Upcoming</Pill> }]} />
      </Card>
    </>
  );
}

const PAST_SCOPE = [
  { date: "2026-10-12", agr: "AGR-031", what: "Customer asked for spring bulb planting in two borders.", decision: "Excluded (new planting). Quoted separately as Q-DEMO-0391; accepted at €140.", by: "Kevin Whitty" },
  { date: "2026-10-08", agr: "AGR-058", what: "Request to reduce a laurel hedge above 2 m.", decision: "Excluded (hedge reduction). Customer declined the quote; routine trimming continues.", by: "Kevin Whitty" },
  { date: "2026-10-02", agr: "AGR-104", what: "Extra leaf clearance on the driveway.", decision: "Included: seasonal leaf clearance on paths is in scope. No charge.", by: "Emma Byrne" },
];
function Scope() {
  const s = useGardener();
  const oak = todayRows(s).find(r => r.p.name === "Oak Lodge") as Row;
  const priced = s.prices["V-120-L2"];
  return (
    <>
      <Card title="Open now" hint="Extras and exclusions that need a human decision before anything is charged.">
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <Pill tone={priced ? "ok" : "warn"}>{priced ? "Priced" : "Missing rate"}</Pill>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Oak Lodge · V-120 · AGR-013</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--body)", marginTop: "8px", lineHeight: 1.6 }}>
              Routine maintenance is included. The boundary hedge reduction the customer asked for on site falls under the exclusion “Hedge reduction or reshaping above the agreed height”. No quote or rate exists, so the line is unpriced, not €0.
            </div>
            <div style={{ marginTop: "10px" }}><KV cols={3} items={[["Proposed extra", oak.lines[1].label], ["Price", priced ? eur(priced.cents) + " · " + priced.ref : "None confirmed"], ["Decision owner", "Emma (task T-01), price agreed by Kevin"]]} /></div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!priced && <Btn small primary onClick={() => openModal({ kind: "price", id: "V-120" })}>Enter price and source</Btn>}
            <Btn small onClick={() => openDrawer({ kind: "agreement", id: "AGR-013" })}>Open AGR-013</Btn>
          </div>
        </div>
      </Card>
      <div style={{ height: "12px" }} />
      <Card title="Recent decisions" hint="Earlier scope calls, kept so the same question gets the same answer next time." pad={false}>
        {PAST_SCOPE.map(x => (
          <div key={x.agr} style={{ display: "flex", gap: "14px", padding: "14px 20px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--faint)", width: "80px" }}>{dayLabel(x.date)}</span>
            <div style={{ flex: "1 1 360px", minWidth: 0, fontSize: "13px", lineHeight: 1.55 }}>
              <button type="button" className="ixt" onClick={() => openDrawer({ kind: "agreement", id: x.agr })} style={{ border: 0, background: "none", padding: 0, color: "var(--accent)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: "12px" }}>{x.agr}</button>
              {" · " + propById(AGREEMENTS.find(a => a.id === x.agr)!.propertyId).name}
              <div style={{ color: "var(--body)", marginTop: "4px" }}>{x.what}</div>
              <div style={{ color: "var(--dim)", marginTop: "3px" }}>{x.decision} · {x.by}</div>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

export const CONTRACT_TABS = [["overview", "Overview"], ["agreements", "Agreements"], ["renewals", "Renewals"], ["scope", "Scope Exceptions"]];
export default function Contracts() {
  const s = useGardener();
  const tab = s.ui.tabs.Contracts || "overview";
  const open = issues(s).filter(i => i.open && ["ISS-PRICE", "ISS-RECUR", "ISS-QTR"].indexOf(i.id) > -1).length;
  return (
    <Page eyebrow={"CONTRACTS · " + DEMO.label.toUpperCase()} title={CONTRACT_TABS.find(t => t[0] === tab)?.[1] || "Contracts"}
      sub={tab === "overview" ? "150 quarterly agreements, paid upfront. Fees, scopes and dates here are demo assumptions, not Kevin's real terms."
        : tab === "agreements" ? "Every agreement with its fee, scope, effective dates, payment evidence and recurrence."
        : tab === "renewals" ? "Review dates coming up. Payment collection stays in Stripe."
        : "What is in scope, what is not, and who decided."}
      actions={open ? <Pill tone="warn">{plural(open, "contract question")} open</Pill> : undefined}>
      {tab === "overview" && <Overview />}
      {tab === "agreements" && <Agreements />}
      {tab === "renewals" && <Renewals />}
      {tab === "scope" && <Scope />}
    </Page>
  );
}
