import { useGardener, go, openDrawer } from "../store";
import {
  totals, capacity, completionTrend, issues, todayRows, invoiceRows, reconRows, weekVisits, eur, hours, plural, dayLabel, propById, DEMO, CATEGORY_LABEL, teamById,
} from "../selectors";
import { Card, Grid, Pill, Btn, Ellip, Bar, Note, C } from "../ui";
import { IssueList } from "./Properties";

function Ops() {
  const s = useGardener();
  const t = totals(s), c = capacity(s), trend = completionTrend(s);
  const peak = Math.max(...trend.map(d => d.booked));
  const breakdown = [
    { k: "Included", n: t.included, bg: "var(--neutral)" }, { k: "Ready", n: t.ready, bg: "var(--accent)" }, { k: "Invoiced", n: t.invoiced, bg: "var(--body)" },
    { k: "Review", n: t.review, bg: "var(--warn)" }, { k: "Already paid", n: t.paid, bg: "var(--ok)" }, { k: "Excluded", n: t.excluded, bg: "var(--track)" },
  ].filter(x => x.n > 0);
  const opsIssues = issues(s).filter(i => i.open && ["Capacity clash", "Missing completion evidence", "Weather deferral", "Access issue", "Missing price"].indexOf(i.kind) > -1);
  return (
    <>
      <Grid cols="1.15fr 1fr">
        <Card title="Today's visits" hint={t.visits + " unique visits from " + t.rawRows + " calendar rows. At 17:15 the field day is finished."}>
          <div style={{ display: "flex", height: "16px", borderRadius: "999px", overflow: "hidden", gap: "2px" }} aria-hidden="true">
            {breakdown.map(b => <div key={b.k} title={b.k + ": " + b.n} style={{ flex: b.n, background: b.bg }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "12px", marginTop: "14px" }}>
            {breakdown.map(b => (
              <button key={b.k} type="button" className="ix11" onClick={() => go("Charge Desk", "sheet", { filter: { Included: "included", Ready: "ready", Invoiced: "invoiced", Review: "review", "Already paid": "paid", Excluded: "excluded" }[b.k] })}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", border: 0, background: "none", color: "inherit", cursor: "pointer", borderRadius: "var(--r-sm,9px)", textAlign: "left" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: b.bg, flex: "none" }} />
                <span style={{ flex: 1, fontSize: "12.5px", color: "var(--dim)" }}>{b.k}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "14px" }}>{b.n}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: "12px", color: "var(--faint)", marginTop: "10px" }}>{t.completed} completed · {t.rescheduled} rescheduled · {t.cancelled} cancelled · {t.duplicates} duplicate row excluded</div>
        </Card>
        <Card title="Field hours this week" hint={hours(c.booked) + " of " + hours(c.cap) + " h (" + c.pct + "%). Friday " + c.fri.pct + "%."}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "150px", padding: "8px 4px 0", position: "relative" }}>
            <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: (24 + 120 * 2400 / 2760) + "px", borderTop: "1px dashed var(--neutral)" }} />
            {c.days.map(d => (
              <button key={d.date} type="button" onClick={() => go("Schedule", "capacity")} title={d.label + ": " + hours(d.booked) + " h"}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", border: 0, background: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: d.over ? "var(--bad)" : "var(--dim)" }}>{hours(d.booked)}</span>
                <span style={{ width: "100%", maxWidth: "46px", height: Math.round(120 * d.booked / 2760) + "px", borderRadius: "8px 8px 3px 3px", background: d.over ? "var(--bad)" : d.booked === d.cap ? "var(--warn)" : "var(--accent)", transformOrigin: "bottom", animation: "growBar .6s var(--ease) both" }} />
                <span style={{ fontSize: "11.5px", color: "var(--dim)" }}>{d.short}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "8px" }}>Dashed line: 40 h a day (five field staff × 8 h, demo assumption).</div>
        </Card>
      </Grid>
      <div style={{ height: "12px" }} />
      <Grid cols="1fr 1.15fr">
        <Card title="Completions by day" hint="From dated visit records: last week and today. Illustrative history.">
          {trend.map(d => (
            <div key={d.date} style={{ display: "grid", gridTemplateColumns: "64px 1fr 70px", gap: "10px", alignItems: "center", padding: "7px 0" }}>
              <span style={{ fontSize: "12.5px" }}>{d.label}</span>
              <div style={{ display: "flex", height: "10px", borderRadius: "999px", overflow: "hidden", background: "var(--track)", width: Math.round(100 * d.booked / peak) + "%" }}>
                <div style={{ flex: d.completed, background: "var(--accent)" }} /><div style={{ flex: d.deferred + d.cancelled, background: "var(--neutral)" }} /><div style={{ flex: d.noEvidence, background: "var(--warn)" }} />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: "12px", textAlign: "right" }}>{d.completed}/{d.booked}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontSize: "11.5px", color: "var(--dim)" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--accent)", marginRight: 6 }} />Completed</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--neutral)", marginRight: 6 }} />Deferred or cancelled</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--warn)", marginRight: 6 }} />No evidence</span>
          </div>
        </Card>
        <Card title={"Service exceptions · " + opsIssues.length} hint="Open operational issues, owned and dated." pad={false}>
          {opsIssues.map(i => (
            <div key={i.id} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <Pill tone={i.severity === "high" ? "bad" : "warn"}>{i.kind}</Pill>
              <span style={{ flex: 1, minWidth: 0 }}><Ellip sub={i.owner.name + " · due " + i.due}>{i.title}</Ellip></span>
            </div>
          ))}
          {!opsIssues.length && <div style={{ padding: "20px", fontSize: "13px", color: "var(--dim)" }}>No operational exceptions open.</div>}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}><Btn small onClick={() => go("Schedule", "exceptions")}>Open service exceptions</Btn></div>
        </Card>
      </Grid>
    </>
  );
}

function Billing() {
  const s = useGardener();
  const t = totals(s), inv = invoiceRows(s), rec = reconRows(s).filter(r => r.state !== "matched");
  const ready = todayRows(s).filter(r => r.category === "ready");
  const review = todayRows(s).filter(r => r.category === "review");
  return (
    <>
      <Note>These are operational amounts from today's records. Ready charges are not revenue until a payment is recorded, and a recorded payment is not reconciled until the ledger agrees.</Note>
      <div style={{ height: "12px" }} />
      <Grid cols="1.3fr 1fr">
        <Card title={"Ready to process · " + eur(t.readyCents)} hint={plural(t.ready, "item") + " · manual processing only"} pad={false}
          right={<Btn small primary onClick={() => go("Charge Desk", "sheet", { filter: "ready" })}>Open the sheet</Btn>}>
          <div style={{ padding: "0 20px 14px" }}>
            {[["Stripe flow (manual)", t.stripe, t.stripeCents], ["Invoice Home", t.ih, t.ihCents]].map(([k, n, c]) => (
              <div key={k as string} style={{ display: "grid", gridTemplateColumns: "150px 1fr 90px", gap: "12px", alignItems: "center", padding: "7px 0" }}>
                <span style={{ fontSize: "12.5px" }}>{k} · {n}</span><Bar value={c as number} max={Math.max(1, t.readyCents)} /><span style={{ fontFamily: "var(--mono)", textAlign: "right" }}>{eur(c as number)}</span>
              </div>
            ))}
          </div>
          {ready.map(r => (
            <button key={r.v.id} type="button" className="ix11" onClick={() => openDrawer({ kind: "visit", id: r.v.id })}
              style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center", padding: "10px 20px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "inherit", cursor: "pointer", textAlign: "left" }}>
              <span style={{ flex: 1, minWidth: 0 }}><Ellip strong sub={r.lines.filter(l => l.basis === "chargeable").map(l => l.label).join(", ")}>{r.p.name}</Ellip></span>
              <Pill tone="info">{r.route === "stripe" ? "Stripe" : "Invoice Home"}</Pill>
              <span style={{ fontFamily: "var(--mono)", width: "70px", textAlign: "right" }}>{eur(r.outstandingCents)}</span>
            </button>
          ))}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Card title="Review" hint="Held, not counted in ready totals.">
            <div style={{ display: "flex", gap: "20px" }}>
              <div><div style={C.mono}>Unpriced</div><div style={{ fontSize: "24px", marginTop: "6px", color: t.unpriced ? "var(--warn)" : "var(--ink)" }}>{t.unpriced}</div></div>
              <div><div style={C.mono}>Priced, held</div><div style={{ fontSize: "24px", marginTop: "6px" }}>{eur(t.reviewPricedCents)}</div></div>
            </div>
            {review.map(r => <div key={r.v.id} style={{ marginTop: "10px", fontSize: "12.5px", color: "var(--body)" }}>{r.p.name} · {r.lines.find(l => l.basis === "unpriced")?.label} · <span style={{ color: "var(--warn)" }}>Unpriced, not €0</span></div>)}
          </Card>
          <Card title="Invoice Home queue" hint="Preparation and payment are separate states." right={<Btn small onClick={() => go("Charge Desk", "invoices")}>Open</Btn>}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div><div style={C.mono}>To prepare</div><div style={{ fontSize: "20px", marginTop: "6px" }}>{inv.prep.length} · {eur(inv.prep.reduce((n, r) => n + r.outstandingCents, 0))}</div></div>
              <div><div style={C.mono}>Awaiting payment</div><div style={{ fontSize: "20px", marginTop: "6px" }}>{inv.awaiting.length} · {eur(inv.awaiting.reduce((n, r) => n + r.i.cents, 0))}</div></div>
            </div>
          </Card>
          <Card title="Paid, not yet reconciled" hint="Payments with no matching Sheets row, or a mismatched amount." right={<Btn small onClick={() => go("Charge Desk", "reconciliation")}>Open</Btn>}>
            <div style={{ fontSize: "24px" }}>{eur(t.unreconciledCents)}</div>
            {rec.map(r => <div key={r.p.id} style={{ fontSize: "12.5px", color: "var(--body)", marginTop: "8px" }}>{r.p.ref} · {r.prop ? r.prop.name : ""} · {eur(r.p.cents)} · <span style={{ color: r.state === "mismatch" ? "var(--bad)" : "var(--warn)" }}>{r.state === "mismatch" ? "amount mismatch" : "awaiting ledger"}</span></div>)}
          </Card>
        </div>
      </Grid>
    </>
  );
}

function Quality() {
  const s = useGardener();
  const c = capacity(s);
  const wv = weekVisits(s);
  const protectedVisits = wv.filter(v => v.kind === "contract" && v.date > DEMO.date && v.outcome === "scheduled");
  const resched = todayRows(s).filter(r => r.v.outcome === "rescheduled");
  const all = issues(s);
  const resolved = all.filter(i => !i.open), open = all.filter(i => i.open);
  return (
    <>
      <Note>No satisfaction scores or NPS here: Pulse has no survey data. Service quality is shown through what the records do hold: protected contract visits, reschedules, capacity and how issues are resolved.</Note>
      <div style={{ height: "12px" }} />
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        {[["Protected visits ahead", String(protectedVisits.length), "Contract visits Tue–Fri this week"],
          ["Rescheduled today", String(resched.length), "Weather deferrals, rebooked 26 Oct"],
          ["Capacity conflicts", String(c.days.filter(d => d.over).length), c.fri.over ? "Friday " + hours(c.fri.booked) + " / 40 h" : "None after the move"],
          ["Issues resolved", resolved.length + " / " + all.length, plural(open.length, "still open")]].map(([k, v, sub]) => (
          <div key={k} style={{ ...C.card, padding: "16px 18px" }}><div style={C.mono}>{k}</div><div style={{ fontSize: "24px", marginTop: "8px" }}>{v}</div><div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "6px" }}>{sub}</div></div>
        ))}
      </Grid>
      <Grid cols="1fr 1fr">
        <Card title="Upcoming protected visits" hint="Contracted customers come first when a day gets tight. Nothing here moves in the proposed change." pad={false}>
          {protectedVisits.slice(0, 9).map(v => (
            <button key={v.id} type="button" className="ix11" onClick={() => openDrawer({ kind: "visit", id: v.id })}
              style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center", padding: "10px 20px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "inherit", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "11.5px", color: "var(--faint)", width: "78px" }}>{dayLabel(v.date)}</span>
              <span style={{ flex: 1, minWidth: 0 }}><Ellip strong sub={teamById(v.staffId).name}>{propById(v.propertyId).name}</Ellip></span>
              <Pill tone="accent">{propById(v.propertyId).agreementId}</Pill>
            </button>
          ))}
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--faint)" }}>{protectedVisits.length - Math.min(9, protectedVisits.length)} more this week · <button type="button" className="ixt" onClick={() => go("Schedule", "week")} style={{ border: 0, background: "none", color: "var(--accent)", padding: 0, cursor: "pointer" }}>Open the week</button></div>
        </Card>
        <Card title="Reschedules and capacity" pad={false}>
          {resched.map(r => <div key={r.v.id} style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: "13px" }}><Ellip strong sub={r.v.outcomeNote}>{r.p.name} → {r.v.rescheduledTo ? dayLabel(r.v.rescheduledTo.slice(0, 10)) + " " + r.v.rescheduledTo.slice(11) : ""}</Ellip></div>)}
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: "13px", marginBottom: "8px" }}>Friday 23 Oct · {hours(c.fri.booked)} / 40 h</div>
            <Bar value={c.fri.booked} max={Math.max(c.fri.booked, 2400)} marker={2400} tone={c.fri.over ? "bad" : "warn"} height={10} />
            <div style={{ marginTop: "10px" }}><Btn small primary={c.fri.over} onClick={() => go("Schedule", "capacity")}>{c.fri.over ? "Preview the move" : "View capacity"}</Btn></div>
          </div>
        </Card>
      </Grid>
      <div style={{ height: "12px" }} />
      <div style={{ ...C.mono, margin: "6px 4px 10px" }}>Open issues</div>
      <IssueList list={open} />
    </>
  );
}

export const DASH_TABS = [["ops", "Operations"], ["billing", "Billing"], ["quality", "Service Quality"]];
export default function GardenerDashboard() {
  const s = useGardener();
  const tab = s.ui.tabs.Dashboard || "ops";
  return (
    <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box", padding: "18px 32px 48px", animation: "pageIn .7s var(--ease) both" }}>
      {tab === "ops" && <Ops />}
      {tab === "billing" && <Billing />}
      {tab === "quality" && <Quality />}
      <div style={{ ...C.mono, marginTop: "18px", textAlign: "center" }}>{DEMO.label} · demo data · {CATEGORY_LABEL.ready.toLowerCase()} means ready to process manually</div>
    </div>
  );
}
