import { useMemo, useState } from "react";
import { useGardener, setSub, openDrawer, openModal, toggleTask, go } from "../store";
import {
  capacity, weekVisits, dayTimes, rowFor, todayRows, totals, issues, nextOccurrence, hours, plural, dayLabel, hhmm,
  propById, teamById, FIELD, WEEK, AGREEMENTS, DEMO, CATEGORY_LABEL, type Issue,
} from "../selectors";
import { Page, Card, Grid, Stat, Segs, Search, Table, Pill, Btn, Ellip, Avatar, Note, Bar, Select, Empty, Pager, KV, C } from "../ui";
import { toneOf } from "../Overlays";

function Today() {
  const s = useGardener();
  const rows = todayRows(s);
  const t = totals(s);
  const cap = capacity(s).days[0];
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="Visits today" value={String(t.visits)} sub={t.completed + " completed · " + t.rescheduled + " rescheduled · " + t.cancelled + " cancelled"} />
        <Stat label="Booked field hours" value={hours(cap.booked) + " / " + hours(cap.cap)} sub={cap.pct + "% of today's crew time, as booked at 07:30"} />
        <Stat label="Contract visits" value={String(rows.filter(r => r.v.kind === "contract").length)} sub="Routine work covered by agreements" />
        <Stat label="Ad-hoc visits" value={String(rows.filter(r => r.v.kind === "adhoc").length)} sub="Priced per job" />
      </Grid>
      <Grid cols="repeat(auto-fit,minmax(300px,1fr))">
        {FIELD.map(f => {
          const mine = rows.filter(r => r.v.staffId === f.id).sort((a, b) => a.start - b.start);
          const mins = mine.reduce((n, r) => n + r.v.serviceMins + r.v.travelMins, 0);
          return (
            <Card key={f.id} title={<span style={{ display: "flex", alignItems: "center", gap: "9px" }}><Avatar initials={f.initials} tint={f.tint} />{f.name}</span>}
              hint={f.role + " · " + hours(mins) + " h booked · " + plural(mine.length, "visit")} pad={false}>
              {mine.map(r => (
                <button key={r.v.id} type="button" className="ix11" onClick={() => openDrawer({ kind: "visit", id: r.v.id })}
                  style={{ width: "100%", display: "grid", gridTemplateColumns: "54px 1fr auto", gap: "10px", alignItems: "center", padding: "10px 20px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "inherit", textAlign: "left", cursor: "pointer" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--dim)" }}>{r.time}</span>
                  <span style={{ minWidth: 0 }}><Ellip strong sub={r.v.service + " · " + (r.v.kind === "contract" ? (r.a ? r.a.id : "Agreement") : "Ad-hoc")}>{r.p.name}</Ellip></span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <Pill tone={r.status === "Completed" ? "ok" : "neutral"}>{r.status}</Pill>
                    <span style={{ fontSize: "10.5px", color: "var(--faint)" }}>{CATEGORY_LABEL[r.category]}</span>
                  </span>
                </button>
              ))}
            </Card>
          );
        })}
      </Grid>
    </>
  );
}

function Week() {
  const s = useGardener();
  const cap = capacity(s);
  const staff = s.ui.schedule.staff;
  const day = s.ui.schedule.day;
  const wv = weekVisits(s);
  const d = WEEK.find(w => w.date === day) || WEEK[0];
  const list = wv.filter(v => v.date === d.date && (staff === "all" || v.staffId === staff));
  const times = dayTimes(s, d.date);
  return (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
        <Segs label="Day" value={d.date} onChange={id => setSub("schedule", { day: id })} items={WEEK.map(w => ({ id: w.date, label: w.label, count: hours(cap.days.find(x => x.date === w.date)!.booked) + "h" }))} />
        <div style={{ flex: 1 }} />
        <Select label="Crew" value={staff} onChange={v => setSub("schedule", { staff: v })} options={[["all", "Everyone"] as [string, string]].concat(FIELD.map(f => [f.id, f.name] as [string, string]))} />
      </div>
      <Grid cols="repeat(5,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        {cap.days.map(x => (
          <button key={x.date} type="button" onClick={() => setSub("schedule", { day: x.date })} className="ixx"
            style={{ ...C.card, padding: "14px 16px", textAlign: "left", cursor: "pointer", color: "inherit", font: "inherit", borderColor: x.date === d.date ? "var(--accent-line)" : undefined }}>
            <div style={C.mono}>{x.label}</div>
            <div style={{ fontSize: "20px", fontWeight: 500, marginTop: "6px", color: x.over ? "var(--bad)" : "var(--ink)" }}>{hours(x.booked)} / 40 h</div>
            <div style={{ margin: "9px 0 6px" }}><Bar value={x.booked} max={Math.max(x.booked, x.cap)} marker={x.cap} tone={x.over ? "bad" : x.booked === x.cap ? "warn" : "accent"} /></div>
            <div style={{ fontSize: "11.5px", color: "var(--dim)" }}>{plural(x.visits, "visit")} · {x.contract} contract{x.flexible ? " · " + x.flexible + " flexible" : ""}</div>
          </button>
        ))}
      </Grid>
      <Card title={d.label + (staff !== "all" ? " · " + teamById(staff).name : "")} hint={plural(list.length, "visit") + ". Calendar occurrences as imported from Google Calendar (simulated)."} pad={false}>
        <Table caption={"Visits on " + d.label} minWidth={760} rowKey={v => v.id} rows={list.slice().sort((a, b) => (times[a.id]?.serviceStart || 0) - (times[b.id]?.serviceStart || 0))}
          onRow={v => openDrawer({ kind: "visit", id: v.id })} cols={[
            { key: "t", label: "Time", w: ".55fr", render: v => <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{times[v.id] ? hhmm(times[v.id].serviceStart) + "–" + hhmm(times[v.id].end) : ""}</span> },
            { key: "p", label: "Property", w: "1.3fr", render: v => <Ellip strong sub={propById(v.propertyId).area}>{propById(v.propertyId).name}</Ellip> },
            { key: "s", label: "Service", w: "1.3fr", render: v => <Ellip>{v.service}</Ellip> },
            { key: "k", label: "Type", w: ".8fr", render: v => v.flexible ? <Pill tone="warn">Flexible · {propById(v.propertyId).window}</Pill> : <Pill tone={v.kind === "contract" ? "accent" : "info"}>{v.kind === "contract" ? "Contract" : "Ad-hoc"}</Pill> },
            { key: "c", label: "Crew", w: ".9fr", render: v => <span style={{ display: "flex", alignItems: "center", gap: "7px" }}><Avatar initials={teamById(v.staffId).initials} tint={teamById(v.staffId).tint} size={22} />{teamById(v.staffId).first}</span> },
            { key: "o", label: "Status", w: ".8fr", render: v => { const r = rowFor(s, v); return <Pill tone={r.status === "Completed" ? "ok" : r.status === "Scheduled" ? "info" : "neutral"}>{r.status}</Pill>; } },
          ]} empty={<Empty title="No visits match" body="Nobody in that crew filter is booked on this day." action={<Btn small onClick={() => setSub("schedule", { staff: "all" })}>Clear filters</Btn>} />} />
      </Card>
    </>
  );
}

function Recurring() {
  const s = useGardener();
  const [page, setPage] = useState(0);
  const [rule, setRule] = useState("all");
  const q = s.ui.schedule.recurQ.trim().toLowerCase();
  const list = useMemo(() => AGREEMENTS.filter(a => (rule === "all" || a.recurrence.rule === rule)
    && (!q || (propById(a.propertyId).name + " " + a.id + " " + a.recurrence.label + " " + a.recurrence.sourceText).toLowerCase().indexOf(q) > -1)), [rule, q]);
  const per = 20, pages = Math.ceil(list.length / per), p = Math.min(page, Math.max(0, pages - 1));
  const counts = (r: string) => AGREEMENTS.filter(a => a.recurrence.rule === r).length;
  return (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
        <Segs label="Recurrence" value={rule} onChange={v => { setRule(v); setPage(0); }} items={[
          { id: "all", label: "All", count: AGREEMENTS.length }, { id: "weekly", label: "Every week", count: counts("weekly") }, { id: "2w", label: "Every 2 weeks", count: counts("2w") },
          { id: "4w", label: "Every 4 weeks", count: counts("4w") }, { id: "2m", label: "Every 2 months", count: counts("2m") }, { id: "unclear", label: "Needs clarification", count: counts("unclear") }]} />
        <div style={{ flex: 1 }} />
        <Search label="Search recurring visits" value={s.ui.schedule.recurQ} onChange={v => { setSub("schedule", { recurQ: v }); setPage(0); }} placeholder="Property or agreement" />
      </div>
      <Note>Kevin's calendar uses words like weekly, bi-weekly, bi-monthly and quarterly. Here every series shows an explicit interval. Where the source word is ambiguous (“bi-monthly”), the series is flagged instead of guessed.</Note>
      <div style={{ height: "12px" }} />
      <Card pad={false}>
        <Table caption="Recurring visits" minWidth={900} rowKey={a => a.id} rows={list.slice(p * per, p * per + per)} onRow={a => openDrawer({ kind: "agreement", id: a.id })} cols={[
          { key: "p", label: "Property", w: "1.3fr", render: a => <Ellip strong sub={propById(a.propertyId).area}>{propById(a.propertyId).name}</Ellip> },
          { key: "r", label: "Rule", w: "1fr", render: a => a.recurrence.rule === "unclear" ? <Pill tone="warn">Needs recurrence clarification</Pill> : <span>{a.recurrence.label} · {WEEK.find(w => w.dow === a.weekday)?.short}</span> },
          { key: "src", label: "Source wording", w: "1.1fr", render: a => <Ellip>“{a.recurrence.sourceText}”</Ellip> },
          { key: "sea", label: "Seasonal plan", w: "1.4fr", render: a => <Ellip>{a.seasonal}</Ellip> },
          { key: "n", label: "Next occurrence", w: ".9fr", render: a => <span style={{ fontSize: "12.5px" }}>{nextOccurrence(a)}</span> },
          { key: "a", label: "Agreement", w: ".7fr", render: a => <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{a.id}</span> },
        ]} empty={<Empty title="No series match" body="Try another rule or clear the search." action={<Btn small onClick={() => { setRule("all"); setSub("schedule", { recurQ: "" }); }}>Clear filters</Btn>} />} />
        <Pager page={p} pages={pages} onPage={setPage} total={list.length} shown={"Showing " + (list.length ? p * per + 1 : 0) + "–" + Math.min(list.length, p * per + per)} />
      </Card>
    </>
  );
}

function Capacity() {
  const s = useGardener();
  const c = capacity(s);
  const maxDay = Math.max(...c.days.map(d => d.booked), 2400);
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" style={{ marginBottom: "12px" }}>
        <Stat label="This week" value={hours(c.booked) + " / " + hours(c.cap) + " h"} sub={c.pct + "% utilisation, five field staff × 40 h (demo assumption)"} />
        <Stat label="Friday 23 Oct" value={hours(c.fri.booked) + " / 40 h"} sub={c.fri.pct + "%" + (c.fri.over ? " · over capacity" : " · full, no buffer")} tone={c.fri.over ? "bad" : "warn"} />
        <Stat label="Tuesday 20 Oct" value={hours(c.tue.booked) + " / 40 h"} sub={c.tue.pct + "%"} />
        <Stat label="Flexible work on Friday" value={hours(c.moved ? 0 : c.flexMins) + " h"} sub={c.moved ? "Moved to Tuesday" : plural(c.flex.length, "ad-hoc visit") + ", Tue–Fri windows"} />
      </Grid>
      <div style={{ fontSize: "12px", color: "var(--faint)", margin: "0 4px 12px" }}>The weekly average and the Friday figure are shown together on purpose: {c.pct}% for the week can hide a day at {c.fri.pct}%.</div>
      <Grid cols="1.25fr 1fr">
        <Card title="Field hours by day" hint="Booked service and travel time against 40 h a day. The tick marks capacity.">
          {c.days.map(d => (
            <div key={d.date} style={{ display: "grid", gridTemplateColumns: "84px 1fr 86px", gap: "12px", alignItems: "center", padding: "10px 0" }}>
              <span style={{ fontSize: "13px" }}>{d.label}</span>
              <Bar value={d.booked} max={maxDay} marker={d.cap} height={12} tone={d.over ? "bad" : d.booked === d.cap ? "warn" : "accent"} />
              <span style={{ fontFamily: "var(--mono)", fontSize: "12.5px", textAlign: "right", color: d.over ? "var(--bad)" : "var(--ink)" }}>{hours(d.booked)} / 40</span>
            </div>
          ))}
          <div style={{ marginTop: "16px", overflowX: "auto" }}>
            <div style={{ ...C.mono, marginBottom: "8px" }}>Crew workload (hours)</div>
            <div role="table" aria-label="Crew workload" style={{ display: "grid", gridTemplateColumns: "120px repeat(5,1fr)", minWidth: "460px", fontSize: "12.5px" }}>
              <div />{c.days.map(d => <div key={d.date} style={{ ...C.mono, padding: "6px", textAlign: "center" }}>{d.short}</div>)}
              {FIELD.map(f => [
                <div key={f.id} style={{ padding: "7px 6px", display: "flex", alignItems: "center", gap: "7px", borderTop: "1px solid var(--border)" }}><Avatar initials={f.initials} tint={f.tint} size={20} />{f.first}</div>,
                ...c.days.map(d => { const x = d.staff.find(y => y.staff.id === f.id)!; return (
                  <div key={f.id + d.date} style={{ padding: "7px 6px", textAlign: "center", borderTop: "1px solid var(--border)", fontFamily: "var(--mono)", color: x.over ? "var(--bad)" : x.mins === 480 ? "var(--warn)" : "var(--body)", background: x.over ? "var(--bad-soft)" : undefined }}>{hours(x.mins)}</div>); }),
              ])}
            </div>
          </div>
        </Card>
        <Card title={c.moved ? "Move applied" : "Proposed move"} hint={c.moved ? "Local change only; no Google Calendar write." : "From the Capacity Planner. Contracted slots stay where they are."}>
          <KV items={[["Friday", hours(c.preview.friBefore) + " → " + hours(c.preview.friAfter) + " h"], ["Tuesday", hours(c.preview.tueBefore) + " → " + hours(c.preview.tueAfter) + " h"],
            ["Week total", hours(c.booked) + " h before and after"], ["Contract visits moved", "None"]]} />
          <div style={{ marginTop: "12px" }}>
            {c.flex.map(f => (
              <button key={f.v.id} type="button" className="ix11" onClick={() => openDrawer({ kind: "property", id: f.p.id })}
                style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center", padding: "10px 4px", border: 0, borderTop: "1px solid var(--border)", background: "none", color: "inherit", cursor: "pointer", textAlign: "left" }}>
                <span style={{ flex: 1, minWidth: 0 }}><Ellip strong sub={f.v.service + " · " + f.staff.name + " · window " + f.p.window}>{f.p.name}</Ellip></span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{hours(f.v.serviceMins + f.v.travelMins)} h</span>
                <Pill tone={c.moved ? "ok" : "warn"}>{c.moved ? "Tue 20 Oct" : "Fri 23 Oct"}</Pill>
              </button>
            ))}
          </div>
          <div style={{ marginTop: "12px" }}>
            <Note tone="warn">{c.moved ? "Friday now sits at exactly 40 of 40 hours, with no spare buffer." : "After the move Friday is at exactly 40 of 40 hours. Resolved, but with no spare buffer."}</Note>
          </div>
          {!c.moved && <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}><Btn primary onClick={() => openModal({ kind: "move", id: "" })}>Preview and approve</Btn><Btn onClick={() => setSub("schedule", { day: "2026-10-23" })}>Open Friday</Btn></div>}
        </Card>
      </Grid>
    </>
  );
}

const EXC_KINDS = ["Weather deferral", "Missing completion evidence", "Access issue", "Capacity clash", "Cancellation"];
function Exceptions() {
  const s = useGardener();
  const list = issues(s).filter(i => EXC_KINDS.indexOf(i.kind) > -1);
  const act = (i: Issue) => {
    if (i.id === "ISS-FRIDAY") return go("Schedule", "capacity");
    if (i.id === "ISS-EVIDENCE") return openModal({ kind: "confirm", id: i.related[1].id });
    if (i.id === "ISS-ACCESS") return toggleTask("T-11", true);
    const v = i.related.find(r => r.kind === "visit") || i.related.find(r => r.kind === "property");
    if (v) openDrawer(v.kind === "visit" ? { kind: "visit", id: v.id } : { kind: "property", id: v.id });
  };
  return (
    <Card pad={false}>
      {list.map(i => (
        <div key={i.id} style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px 20px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <Pill tone={!i.open ? "ok" : i.severity === "high" ? "bad" : "warn"}>{i.open ? i.kind : "Resolved"}</Pill>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{i.title}</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--body)", marginTop: "7px", lineHeight: 1.55 }}>{i.open ? i.detail : i.resolution + ". " + i.detail}</div>
            <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "6px" }}>{i.owner.name} · due {i.due} · {i.related.map(r => r.label).join(", ")}</div>
          </div>
          <Btn small primary={i.open} onClick={() => act(i)}>{i.open ? i.action : "View"}</Btn>
        </div>
      ))}
    </Card>
  );
}

export const SCHEDULE_TABS = [["today", "Today"], ["week", "Week"], ["recurring", "Recurring Visits"], ["capacity", "Capacity"], ["exceptions", "Service Exceptions"]];
export default function Schedule() {
  const s = useGardener();
  const tab = s.ui.tabs.Schedule || "today";
  const c = capacity(s);
  const sub = tab === "today" ? "Monday's visits by crew member. At 17:15 the day is done: what happened, and how each visit is billed."
    : tab === "week" ? "The week as booked in Google Calendar (simulated), with the local move applied if approved."
    : tab === "recurring" ? "150 recurring series behind the quarterly agreements, each with an explicit interval."
    : tab === "capacity" ? "Where demand meets five people's hours. Protect contracted visits first."
    : "Weather calls, missing evidence, access problems and capacity clashes.";
  return (
    <Page eyebrow={"SCHEDULE · " + DEMO.label.toUpperCase()} title={SCHEDULE_TABS.find(x => x[0] === tab)?.[1] || "Schedule"} sub={sub}
      actions={c.fri.over ? <Pill tone="bad">Friday {hours(c.fri.booked)} / 40 h</Pill> : <Pill tone="warn">Friday full, 40 / 40 h</Pill>}>
      {tab === "today" && <Today />}
      {tab === "week" && <Week />}
      {tab === "recurring" && <Recurring />}
      {tab === "capacity" && <Capacity />}
      {tab === "exceptions" && <Exceptions />}
    </Page>
  );
}
export { toneOf, dayLabel, DEMO };
