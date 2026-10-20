import { useMemo } from "react";
import { useGardener, setSub, openDrawer } from "../store";
import { CUSTOMERS, TEAM, COUNTS, propById, tasks, issues, todayRows, capacity, dayLabel, hours, plural } from "../selectors";
import { Card, Grid, Stat, Segs, Search, Table, Pill, Btn, Ellip, Empty, Pager, Avatar, Note, C } from "../ui";

export function RecordsCustomers() {
  const s = useGardener();
  const ui = s.ui.records;
  const q = ui.q.trim().toLowerCase();
  const list = useMemo(() => CUSTOMERS.filter(c => (ui.status === "all" || c.status === ui.status)
    && (!q || (c.name + " " + c.email + " " + c.id + " " + c.area + " " + c.propertyIds.map(id => propById(id).name).join(" ")).toLowerCase().indexOf(q) > -1)), [ui.status, q]);
  const per = 25, pages = Math.ceil(list.length / per), page = Math.min(ui.page, Math.max(0, pages - 1));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Grid cols="repeat(3,minmax(0,1fr))">
        <Stat label="Registered profiles" value={COUNTS.customers.toLocaleString("en-IE")} sub="Website registrations in this synthetic model (call: about 1,000)" />
        <Stat label="Active service customers" value={String(COUNTS.active)} sub="150 on agreements + 100 ad-hoc, one property each" onClick={() => setSub("records", { status: "active", page: 0 })} />
        <Stat label="Registration only" value={String(COUNTS.registered)} sub="Registered, no active service yet. Not lost or churned." onClick={() => setSub("records", { status: "registered", page: 0 })} />
      </Grid>
      <Card pad={false}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", padding: "14px 16px" }}>
          <Segs label="Customer status" value={ui.status} onChange={v => setSub("records", { status: v, page: 0 })} items={[{ id: "all", label: "All", count: COUNTS.customers }, { id: "active", label: "Active", count: COUNTS.active }, { id: "registered", label: "Registration only", count: COUNTS.registered }]} />
          <div style={{ flex: 1 }} />
          <Search label="Search customers" value={ui.q} onChange={v => setSub("records", { q: v, page: 0 })} placeholder="Name, email, area or property" />
        </div>
        <Table caption="Customers" minWidth={860} rowKey={c => c.id} rows={list.slice(page * per, page * per + per)}
          onRow={c => c.propertyIds[0] && openDrawer({ kind: "property", id: c.propertyIds[0] })} cols={[
            { key: "n", label: "Customer", w: "1.2fr", render: c => <Ellip strong sub={c.id}>{c.name}</Ellip> },
            { key: "e", label: "Email (fictional)", w: "1.4fr", render: c => <Ellip>{c.email}</Ellip> },
            { key: "s", label: "Status", w: ".9fr", render: c => c.status === "active" ? <Pill tone="accent">Active</Pill> : <Pill>Registration only</Pill> },
            { key: "p", label: "Property", w: "1.1fr", render: c => c.propertyIds.length ? <Ellip>{c.propertyIds.map(id => propById(id).name).join(", ")}</Ellip> : <span style={{ color: "var(--faint)" }}>None yet</span> },
            { key: "j", label: "Journey", w: "1.3fr", render: c => <Ellip sub={"Registered " + dayLabel(c.registeredOn) + " " + c.registeredOn.slice(0, 4)}>{c.journey}</Ellip> },
          ]} empty={<Empty title="No customers match" body="Clear the search or change the status filter." action={<Btn small onClick={() => setSub("records", { q: "", status: "all", page: 0 })}>Clear filters</Btn>} />} />
        <Pager page={page} pages={pages} onPage={p => setSub("records", { page: p })} total={list.length} shown={"Showing " + (list.length ? page * per + 1 : 0) + "–" + Math.min(list.length, page * per + per)} />
      </Card>
      <Note>The structure allows several properties per customer; this demo seeds one each. Prices sit on agreements, rate cards and quotes, never on the customer.</Note>
    </div>
  );
}

export function RecordsTeam() {
  const s = useGardener();
  const tk = tasks(s), iss = issues(s), rows = todayRows(s), cap = capacity(s);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Note title="Demo assumption">Seven people work in the business (from the call). Only Kevin Whitty is a real name; the other six names, roles and @thegardener.ie addresses are fictional and never used to send anything.</Note>
      <Grid cols="repeat(auto-fit,minmax(280px,1fr))">
        {TEAM.map(m => {
          const mine = tk.filter(t => t.owner.id === m.id && !t.done);
          const today = rows.filter(r => r.v.staffId === m.id);
          const weekMins = cap.days.reduce((n, d) => n + (d.staff.find(x => x.staff.id === m.id)?.mins || 0), 0);
          const owns = iss.filter(i => i.open && i.owner.id === m.id).length;
          return (
            <Card key={m.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar initials={m.initials} tint={m.tint} size={40} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "2px" }}>{m.role}</div>
                </div>
                <Pill tone={m.sourced ? "accent" : "neutral"}>{m.sourced ? "From the call" : "Fictional"}</Pill>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--body)", marginTop: "12px", lineHeight: 1.55 }}>{m.duties}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "12px" }}>
                <div><div style={C.mono}>{m.field ? "Visits today" : "Access"}</div><div style={{ fontSize: "15px", marginTop: "4px" }}>{m.field ? today.length : m.perm}</div></div>
                <div><div style={C.mono}>{m.field ? "Week hours" : "Open tasks"}</div><div style={{ fontSize: "15px", marginTop: "4px" }}>{m.field ? hours(weekMins) + " / 40" : mine.length}</div></div>
                <div><div style={C.mono}>Owns issues</div><div style={{ fontSize: "15px", marginTop: "4px", color: owns ? "var(--warn)" : undefined }}>{owns}</div></div>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--faint)", marginTop: "12px" }}>{m.email} · demo address · {m.perm} permissions</div>
              {mine.length > 0 && <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--dim)" }}>{plural(mine.length, "open task")}: {mine.map(t => t.id).join(", ")}</div>}
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
