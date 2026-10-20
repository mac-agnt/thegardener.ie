/* Small building blocks for the theGardener.ie pages. They reuse Pulse's own
   tokens (surfaces, borders, radii, mono labels, accent fill) and the ix*
   hover classes, so the new pages read as the same product. */
import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { cx } from "../runtime/template";

export const C = {
  page: { width: "100%", maxWidth: "1280px", margin: "0 auto", boxSizing: "border-box", padding: "22px 32px 48px", animation: "pageIn .7s var(--ease) both" } as CSSProperties,
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)", backdropFilter: "blur(20px) saturate(1.3)", boxShadow: "var(--card-shadow)" } as CSSProperties,
  mono: { fontFamily: "var(--mono)", fontSize: "9.5px", letterSpacing: "0.13em", color: "var(--faint)", textTransform: "uppercase" } as CSSProperties,
  chip: { display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", padding: "0 10px", borderRadius: "var(--r-sm,9px)", background: "var(--chip)", border: "1px solid var(--chip-border)", fontSize: "11.5px", color: "var(--body)", whiteSpace: "nowrap" } as CSSProperties,
};

export function Page({ eyebrow, title, sub, actions, children }: { eyebrow: string; title: string; sub?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div style={C.page}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", flexWrap: "wrap", padding: "18px 4px 20px" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ ...C.mono, letterSpacing: "0.16em" }}>{eyebrow}</div>
          <h1 style={{ margin: "8px 0 0", fontSize: "clamp(30px,4vw,40px)", fontWeight: 500, letterSpacing: "-1.4px", lineHeight: 1.05 }}>{title}</h1>
          {sub && <div style={{ fontSize: "14px", color: "var(--dim)", marginTop: "10px", maxWidth: "72ch", lineHeight: 1.55 }}>{sub}</div>}
        </div>
        {actions && <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, hint, right, children, pad = true, style }: { title?: ReactNode; hint?: ReactNode; right?: ReactNode; children: ReactNode; pad?: boolean; style?: CSSProperties }) {
  return (
    <section style={{ ...C.card, overflow: "hidden", minWidth: 0, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "16px 20px 12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <div style={{ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-.2px" }}>{title}</div>}
            {hint && <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "4px", lineHeight: 1.5 }}>{hint}</div>}
          </div>
          {right}
        </div>
      )}
      <div style={pad ? { padding: title || right ? "0 20px 18px" : "18px 20px" } : undefined}>{children}</div>
    </section>
  );
}

export function Grid({ cols, gap = 12, children, style }: { cols: string; gap?: number; children: ReactNode; style?: CSSProperties }) {
  return <div className="g-grid" style={{ display: "grid", gridTemplateColumns: cols, gap: gap + "px", alignItems: "stretch", ...style }}>{children}</div>;
}

type Tone = "ok" | "warn" | "bad" | "accent" | "neutral" | "info";
const TONES: Record<Tone, [string, string]> = {
  ok: ["var(--ok)", "var(--ok-soft)"], warn: ["var(--warn)", "var(--warn-soft)"], bad: ["var(--bad)", "var(--bad-soft)"],
  accent: ["var(--accent)", "var(--accent-faint)"], neutral: ["var(--dim)", "var(--track)"], info: ["var(--body)", "var(--chip)"],
};
export function Pill({ tone = "neutral", children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  const [ink, bg] = TONES[tone];
  return <span title={title} style={{ display: "inline-flex", alignItems: "center", height: "22px", padding: "0 9px", borderRadius: "var(--r-sm,9px)", background: bg, color: ink, fontSize: "11px", fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}

export function Btn({ children, onClick, primary, small, disabled, title, danger, type }: { children: ReactNode; onClick?: () => void; primary?: boolean; small?: boolean; disabled?: boolean; title?: string; danger?: boolean; type?: "button" | "submit" }) {
  const h = small ? "30px" : "36px";
  const base: CSSProperties = { height: h, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: small ? "0 12px" : "0 16px", borderRadius: "var(--r-ctl,9px)", fontSize: small ? "12px" : "13px", fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", whiteSpace: "nowrap", transition: "background .2s var(--ease),transform .18s var(--ease),border-color .2s var(--ease)", opacity: disabled ? 0.5 : 1 };
  const look: CSSProperties = primary
    ? { border: "0", background: "var(--accent-fill,var(--accent))", color: "var(--on-accent)", boxShadow: "var(--accent-glow,none)" }
    : danger ? { border: "1px solid var(--bad)", background: "var(--bad-soft)", color: "var(--bad)" }
    : { border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--ink)" };
  return <button type={type || "button"} title={title} disabled={disabled} onClick={disabled ? undefined : onClick} className={disabled ? undefined : cx(primary ? "ixp" : "ixz", "ixs")} style={{ ...base, ...look }}>{children}</button>;
}

export function LinkBtn({ children, onClick, title }: { children: ReactNode; onClick: () => void; title?: string }) {
  return <button type="button" title={title} onClick={onClick} className="ixt" style={{ border: "0", background: "none", padding: 0, color: "var(--accent-ink,var(--accent))", cursor: "pointer", fontSize: "inherit", textDecoration: "underline", textUnderlineOffset: "3px", textDecorationColor: "var(--accent-line)" }}>{children}</button>;
}

export function Stat({ label, value, sub, tone, onClick }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "ok" | "warn" | "bad"; onClick?: () => void }) {
  const color = tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--bad)" : tone === "ok" ? "var(--ok)" : "var(--ink)";
  const inner = (
    <>
      <div style={C.mono}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 500, letterSpacing: "-.8px", marginTop: "8px", lineHeight: 1, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "7px", lineHeight: 1.45 }}>{sub}</div>}
    </>
  );
  const st: CSSProperties = { ...C.card, padding: "16px 18px", minWidth: 0, textAlign: "left", color: "inherit", font: "inherit" };
  return onClick ? <button type="button" className="ixx" onClick={onClick} style={{ ...st, cursor: "pointer", transition: "transform .25s var(--ease),border-color .2s var(--ease)" }}>{inner}</button> : <div style={st}>{inner}</div>;
}

export function Segs({ items, value, onChange, label }: { items: { id: string; label: string; count?: number | string }[]; value: string; onChange: (id: string) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px", padding: "3px", background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,12px)" }}>
      {items.map(it => {
        const on = it.id === value;
        return (
          <button key={it.id} role="tab" aria-selected={on} type="button" onClick={() => onChange(it.id)} className={on ? undefined : "ix3"}
            style={{ height: "30px", display: "inline-flex", alignItems: "center", gap: "7px", padding: "0 12px", border: 0, borderRadius: "var(--r-ctl,10px)", cursor: "pointer", fontSize: "12.5px", fontWeight: on ? 600 : 500, background: on ? "var(--pill-bg)" : "none", color: on ? "var(--pill-ink)" : "var(--dim)", whiteSpace: "nowrap" }}>
            {it.label}
            {it.count !== undefined && <span style={{ fontFamily: "var(--mono)", fontSize: "10.5px", padding: "0 6px", borderRadius: "999px", background: on ? "var(--accent-soft)" : "var(--track)", color: on ? "var(--accent)" : "var(--faint)" }}>{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Search({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="ix13" style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 12px", minWidth: "200px", flex: "1 1 220px", maxWidth: "360px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,12px)" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m21 21-4.3-4.3 M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0" /></svg>
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "none", fontSize: "13px", color: "var(--ink)" }} />
      {value && <button type="button" aria-label="Clear search" onClick={() => onChange("")} style={{ border: 0, background: "var(--chip)", color: "var(--dim)", width: "18px", height: "18px", borderRadius: "6px", cursor: "pointer", fontSize: "10px" }}>✕</button>}
    </label>
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; label: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--dim)" }}>
      <span>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="ix1g" style={{ height: "34px", padding: "0 10px", background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,10px)", fontSize: "12.5px", outline: 0 }}>
        {options.map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
    </label>
  );
}

export type Col<T> = { key: string; label: string; w: string; render: (r: T) => ReactNode; sort?: (r: T) => string | number; align?: "right" };
export function Table<T>({ cols, rows, rowKey, onRow, empty, minWidth = 760, selected, onSort, sortKey, sortDir, caption }: {
  cols: Col<T>[]; rows: T[]; rowKey: (r: T) => string; onRow?: (r: T) => void; empty?: ReactNode; minWidth?: number;
  selected?: (r: T) => boolean; onSort?: (key: string) => void; sortKey?: string; sortDir?: 1 | -1; caption: string;
}) {
  const tpl = cols.map(c => c.w).join(" ");
  return (
    <div style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
      <div role="table" aria-label={caption} style={{ minWidth: minWidth + "px" }}>
        <div role="row" style={{ display: "grid", gridTemplateColumns: tpl, background: "var(--surface-faint)", borderTop: "1px solid var(--border)" }}>
          {cols.map(c => (
            <div role="columnheader" key={c.key} style={{ padding: "10px 14px", ...C.mono, fontSize: "9.5px", textAlign: c.align || "left" }}>
              {c.sort && onSort ? (
                <button type="button" onClick={() => onSort(c.key)} className="ix3" style={{ border: 0, background: "none", padding: 0, cursor: "pointer", font: "inherit", letterSpacing: "inherit", color: sortKey === c.key ? "var(--ink)" : "inherit", textTransform: "uppercase" }}>
                  {c.label}{sortKey === c.key ? (sortDir === 1 ? " ↑" : " ↓") : ""}
                </button>
              ) : c.label}
            </div>
          ))}
        </div>
        {rows.map(r => {
          const sel = selected ? selected(r) : false;
          return (
            <div role="row" key={rowKey(r)} className={onRow ? "ix11" : undefined} onClick={onRow ? () => onRow(r) : undefined}
              style={{ display: "grid", gridTemplateColumns: tpl, borderTop: "1px solid var(--border)", cursor: onRow ? "pointer" : "default", background: sel ? "var(--accent-faint)" : undefined, transition: "background .18s var(--ease)" }}>
              {cols.map(c => (
                <div role="cell" key={c.key} style={{ padding: "12px 14px", fontSize: "13px", minWidth: 0, display: "flex", alignItems: "center", justifyContent: c.align === "right" ? "flex-end" : "flex-start", textAlign: c.align || "left", color: "var(--body)", overflow: "hidden" }}>
                  {c.render(r)}
                </div>
              ))}
            </div>
          );
        })}
        {rows.length === 0 && <div style={{ padding: "40px 20px", textAlign: "center", borderTop: "1px solid var(--border)", color: "var(--dim)", fontSize: "13px" }}>{empty || "No matching records."}</div>}
      </div>
    </div>
  );
}

export function Ellip({ children, strong, sub }: { children: ReactNode; strong?: boolean; sub?: ReactNode }) {
  return (
    <span style={{ minWidth: 0, display: "block", overflow: "hidden" }}>
      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: strong ? "var(--ink)" : undefined, fontWeight: strong ? 500 : undefined }}>{children}</span>
      {sub && <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "11.5px", color: "var(--faint)", marginTop: "2px" }}>{sub}</span>}
    </span>
  );
}

export function Avatar({ initials, tint, size = 26 }: { initials: string; tint: string; size?: number }) {
  return <span aria-hidden="true" style={{ width: size + "px", height: size + "px", flex: "none", borderRadius: "999px", background: tint, color: "#0b0c0b", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size < 28 ? "9.5px" : "11px", fontWeight: 600 }}>{initials}</span>;
}

export function Bar({ value, max, tone, height = 8, marker }: { value: number; max: number; tone?: "ok" | "warn" | "bad" | "accent"; height?: number; marker?: number }) {
  const pct = Math.min(100, Math.round(100 * value / Math.max(1, max)));
  const color = tone === "bad" ? "var(--bad)" : tone === "warn" ? "var(--warn)" : tone === "ok" ? "var(--ok)" : "var(--accent)";
  return (
    <div style={{ position: "relative", height: height + "px", borderRadius: "999px", background: "var(--track)", overflow: "visible" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: "999px", background: color, transformOrigin: "left", animation: "sweep .6s var(--ease) both" }} />
      {marker !== undefined && <span aria-hidden="true" style={{ position: "absolute", top: "-3px", bottom: "-3px", left: Math.min(100, Math.round(100 * marker / Math.max(1, max))) + "%", width: "2px", background: "var(--ink)", opacity: 0.55, borderRadius: "1px" }} />}
    </div>
  );
}

export function KV({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + cols + ",minmax(0,1fr))", gap: "10px" }} className="g-kv">
      {items.map(([k, v], i) => (
        <div key={i} style={{ padding: "11px 13px", background: "var(--chip)", border: "1px solid var(--chip-border)", borderRadius: "var(--r-sm,10px)", minWidth: 0 }}>
          <div style={{ ...C.mono, fontSize: "8.5px" }}>{k}</div>
          <div style={{ fontSize: "13px", color: "var(--ink)", marginTop: "5px", lineHeight: 1.45, overflowWrap: "anywhere" }}>{v}</div>
        </div>
      ))}
    </div>
  );
}

export function Note({ tone = "info", title, children }: { tone?: "info" | "warn" | "ok" | "bad"; title?: string; children: ReactNode }) {
  const bg = tone === "warn" ? "var(--warn-soft)" : tone === "ok" ? "var(--ok-soft)" : tone === "bad" ? "var(--bad-soft)" : "var(--chip)";
  const ink = tone === "warn" ? "var(--warn)" : tone === "ok" ? "var(--ok)" : tone === "bad" ? "var(--bad)" : "var(--faint)";
  return (
    <div style={{ padding: "12px 14px", background: bg, border: "1px solid var(--chip-border)", borderRadius: "var(--r-md,13px)" }}>
      {title && <div style={{ ...C.mono, fontSize: "9px", color: ink }}>{title}</div>}
      <div style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--body)", marginTop: title ? "5px" : 0 }}>{children}</div>
    </div>
  );
}

export function Section({ label, children, right }: { label: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ marginTop: "22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{ ...C.mono, flex: 1 }}>{label}</div>{right}
      </div>
      {children}
    </div>
  );
}

/* Side drawer, same shell as Pulse's record drawers. Escape closes it. */
export function DrawerShell({ eyebrow, title, status, onClose, children, footer, width = 600 }: { eyebrow: string; title: ReactNode; status?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    ref.current?.focus();
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 66, background: "var(--scrim)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end" }}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : eyebrow} onClick={e => e.stopPropagation()}
        style={{ width: "min(" + width + "px,100%)", height: "100%", display: "flex", flexDirection: "column", background: "var(--overlay)", borderLeft: "1px solid var(--border)", backdropFilter: "blur(20px)", boxShadow: "-30px 0 80px rgba(0,0,0,.5)", animation: "popIn .3s var(--ease) both", outline: 0 }}>
        <div style={{ flex: "none", display: "flex", alignItems: "flex-start", gap: "12px", padding: "22px 24px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
              <span style={{ ...C.mono }}>{eyebrow}</span>{status}
            </div>
            <div style={{ fontSize: "21px", fontWeight: 500, letterSpacing: "-.5px", marginTop: "8px", lineHeight: 1.25 }}>{title}</div>
          </div>
          <button type="button" aria-label="Close" className="ixm" onClick={onClose} style={{ flex: "none", width: "30px", height: "30px", border: "1px solid var(--border)", borderRadius: "var(--r-ctl,11px)", background: "none", color: "var(--dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12 M18 6 6 18" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "18px 24px 28px" }}>{children}</div>
        {footer && <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", padding: "14px 24px", borderTop: "1px solid var(--border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

export function ModalShell({ title, hint, onClose, children, footer }: { title: string; hint?: string; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 74, background: "var(--scrim)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "9vh 16px 4vh", overflowY: "auto" }}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} style={{ width: "min(520px,100%)", background: "var(--overlay)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)", boxShadow: "0 30px 80px rgba(0,0,0,.55)", backdropFilter: "blur(20px)", overflow: "hidden", animation: "riseIn .32s var(--ease) both" }}>
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "-.4px" }}>{title}</div>
          {hint && <div style={{ fontSize: "12.5px", color: "var(--dim)", marginTop: "6px", lineHeight: 1.5 }}>{hint}</div>}
        </div>
        <div style={{ padding: "18px 24px" }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "14px 24px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>{footer}</div>
      </div>
    </div>
  );
}

export function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
      <span style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--ink)" }}>{label}</span>
      {children}
      {help && <span style={{ fontSize: "11.5px", color: "var(--dim)", lineHeight: 1.45 }}>{help}</span>}
      {error && <span role="alert" style={{ fontSize: "12px", color: "var(--bad)", lineHeight: 1.45 }}>{error}</span>}
    </label>
  );
}
export const inputStyle: CSSProperties = { height: "38px", padding: "0 12px", background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: "var(--r-md,12px)", fontSize: "13.5px", outline: 0 };

export function Pager({ page, pages, onPage, total, shown }: { page: number; pages: number; onPage: (p: number) => void; total: number; shown: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", flexWrap: "wrap" }}>
      <span style={{ flex: 1, fontSize: "12px", color: "var(--faint)" }}>{shown} of {total.toLocaleString("en-IE")}</span>
      <Btn small disabled={page <= 0} onClick={() => onPage(page - 1)}>Previous</Btn>
      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--dim)" }}>{pages ? page + 1 : 0} / {pages}</span>
      <Btn small disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>Next</Btn>
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div style={{ padding: "36px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: "13px", color: "var(--dim)", marginTop: "6px" }}>{body}</div>
      {action && <div style={{ marginTop: "14px" }}>{action}</div>}
    </div>
  );
}

/* Browser-native helpers for exports. */
export function downloadText(name: string, text: string, type = "text/csv") {
  const blob = new Blob([text], { type: type + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch { ok = false; }
    ta.remove(); return ok;
  }
}
export const csvCell = (v: string | number) => { const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
