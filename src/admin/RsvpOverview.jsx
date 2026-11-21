import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { COLUMNS, CONFIRM_ITEMS, persons, peopleOf, personLine, extraAnswers, toMs, toCsv, SLEEP_OPTIONS, SLEEP_SHORT } from "../rsvpFields.js";

const th = { textAlign: "left", fontSize: 11.5, letterSpacing: ".06em", textTransform: "uppercase", color: "#6b6153", padding: "8px 10px", borderBottom: "1px solid rgba(0,0,0,.15)", whiteSpace: "nowrap", fontWeight: 500 };
const td = { padding: "9px 10px", fontSize: 13.5, borderBottom: "1px solid rgba(0,0,0,.07)", verticalAlign: "top" };
const tile = { border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, padding: "12px 14px", minWidth: 150, flex: "1 1 150px" };

function Tile({ big, label, sub }) {
  return (
    <div style={tile}>
      <div className="display" style={{ fontSize: 30, lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#6b6153", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Detail({ r }) {
  const extra = extraAnswers(r);
  const save = (patch) => updateDoc(doc(db, "rsvps", r.id), patch);
  return (
    <div style={{ background: "rgba(147,113,60,.06)", padding: "14px 16px" }}>
      {r.attending === "ano" && (
        <div style={{ margin: "0 0 12px", fontSize: 13.5 }}>
          <b>Osoby ({persons(r)}):</b>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {peopleOf(r).map((p, i) => <li key={i}>{personLine(p)}</li>)}
          </ul>
        </div>
      )}
      {r.comment && <p style={{ margin: "0 0 12px", fontSize: 13.5 }}><b>Vzkaz:</b> {r.comment}</p>}
      {extra.length > 0 && (
        <p style={{ margin: "0 0 12px", fontSize: 13.5 }}>
          <b>Další odpovědi:</b> {extra.map(([k, v]) => `${k}: ${v}`).join(" · ")}
        </p>
      )}
      <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#93713c" }}>Potvrzení hostovi (uvidí ho ve svém profilu)</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CONFIRM_ITEMS.map((it) => {
          const c = r.confirm?.[it.key] || {};
          return (
            <div key={it.key} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 130, fontSize: 13.5 }}>
                <input type="checkbox" checked={!!c.ok} onChange={(e) => save({ [`confirm.${it.key}`]: { ok: e.target.checked, text: c.text || "" } })} />
                {it.label} potvrzeno
              </label>
              <input type="text" key={(c.text || "") + r.id} defaultValue={c.text || ""} placeholder={it.placeholder} maxLength={200}
                onBlur={(e) => { if (e.target.value !== (c.text || "")) save({ [`confirm.${it.key}`]: { ok: !!c.ok, text: e.target.value.trim() } }); }}
                style={{ flex: "1 1 220px", fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "7px 9px", border: "1px solid rgba(0,0,0,.15)", background: "#fff" }} />
            </div>
          );
        })}
        <textarea rows={2} key={(r.guestNote || "") + r.id} defaultValue={r.guestNote || ""} maxLength={600}
          placeholder="Zpráva pro hosta (třeba „Ve čtvrtek ti pošleme číslo účtu.“)"
          onBlur={(e) => { if (e.target.value !== (r.guestNote || "")) save({ guestNote: e.target.value.trim() }); }}
          style={{ width: "100%", fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "7px 9px", border: "1px solid rgba(0,0,0,.15)", background: "#fff", resize: "vertical" }} />
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#6b6153" }}>
        Odesláno {toMs(r) ? new Date(toMs(r)).toLocaleString("cs-CZ") : "—"}{" "}
        <button type="button" onClick={() => { if (window.confirm(`Smazat odpověď „${r.name}“?`)) deleteDoc(doc(db, "rsvps", r.id)); }}
          style={{ border: "none", background: "none", color: "#8f2a22", textDecoration: "underline", cursor: "pointer", font: "inherit", marginLeft: 10 }}>smazat odpověď</button>
      </p>
    </div>
  );
}

export default function RsvpOverview() {
  const [rows, setRows] = useState([]);
  const [players, setPlayers] = useState([]);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("vse");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "rsvps"), (s) => setRows(s.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => setErr(e.message));
    const u2 = onSnapshot(collection(db, "players"), (s) => setPlayers(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
    return () => { u1(); u2(); };
  }, []);

  const accounts = useMemo(() => new Set(players.map((p) => (p.contact || "").toLowerCase())), [players]);
  const dupes = useMemo(() => {
    const c = {}; rows.forEach((r) => { const k = (r.contact || "").toLowerCase(); c[k] = (c[k] || 0) + 1; });
    return c;
  }, [rows]);
  const missing = (r) => r.attending === "ano" && CONFIRM_ITEMS.some((it) => !r.confirm?.[it.key]?.ok);

  const sorted = useMemo(() => [...rows].sort((a, b) => toMs(b) - toMs(a)), [rows]);
  const shown = sorted.filter((r) => {
    if (filter === "ano" && r.attending !== "ano") return false;
    if (filter === "ne" && r.attending === "ano") return false;
    if (filter === "nepotvrzeno" && !missing(r)) return false;
    if (q.trim()) { const s = q.trim().toLowerCase(); if (!((r.name || "").toLowerCase().includes(s) || (r.contact || "").toLowerCase().includes(s))) return false; }
    return true;
  });

  const yes = rows.filter((r) => r.attending === "ano");
  const all = yes.flatMap(peopleOf); // všichni lidé včetně přidaných osob
  const people = all.length;
  const sleepers = all.filter((p) => p.sleep !== "ne");
  const optCount = (k) => sleepers.filter((p) => (p.sleepRank || []).includes(k)).length;
  const travelCount = (k) => all.filter((p) => p.travel === k).length;
  const players_ = yes.filter((r) => r.wantsGame === "ano").length;

  const download = () => {
    const blob = new Blob([toCsv(sorted)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "odpovedi-svatba.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <section className="block" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <p className="eyebrow">jen pro vás</p>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,48px)", margin: "0 0 18px" }}>Odpovědi hostů</h1>
        {err && <p role="alert" style={{ color: "#a8342a" }}>Odpovědi se nepodařilo načíst: {err}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          <Tile big={people} label="osob přijde" sub={`${yes.length} odpovědí ano · ${rows.length - yes.length} ne`} />
          <Tile big={sleepers.length} label="osob chce přespat" sub={SLEEP_OPTIONS.map(([k]) => `${SLEEP_SHORT[k]} ${optCount(k)}`).join(" · ")} />
          <Tile big={travelCount("odvoz")} label="potřebuje odvoz" sub={`auto ${travelCount("auto")} · jinak ${travelCount("jinak")} (počítáno za osoby)`} />
          <Tile big={players_} label="chce hrát hru" />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hledat jméno nebo e-mail"
            style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, padding: "8px 10px", border: "1px solid rgba(0,0,0,.15)", background: "#fff", minWidth: 220 }} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, padding: "8px 10px", border: "1px solid rgba(0,0,0,.15)", background: "#fff" }}>
            <option value="vse">Všichni</option>
            <option value="ano">Přijdou</option>
            <option value="ne">Nepřijdou</option>
            <option value="nepotvrzeno">Čeká na moje potvrzení</option>
          </select>
          <span style={{ fontSize: 13, color: "#6b6153" }}>{shown.length} z {rows.length}</span>
          <button className="btn" onClick={download} disabled={!rows.length} style={{ marginLeft: "auto" }}>Stáhnout CSV (Excel)</button>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,.1)", borderRadius: 8, background: "rgba(255,255,255,.5)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={th}>Jméno</th>
                {COLUMNS.filter((c) => c.key !== "guests" && c.key !== "persons" && c.key !== "comment").map((c) => <th key={c.key} style={th}>{c.label.replace(" (pořadí preferencí)", "")}</th>)}
                <th style={th}>Osob</th>
                <th style={th}>Profil</th>
                <th style={th}>Potvrzeno</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && <tr><td style={td} colSpan={9}>Zatím nic.</td></tr>}
              {shown.map((r) => {
                const isOpen = open === r.id;
                const col = (k) => COLUMNS.find((c) => c.key === k).get(r);
                const conf = CONFIRM_ITEMS.map((it) => `${it.label.slice(0, 3)}. ${r.confirm?.[it.key]?.ok ? "✓" : "–"}`).join("  ");
                return [
                  <tr key={r.id} onClick={() => setOpen(isOpen ? null : r.id)} style={{ cursor: "pointer", background: isOpen ? "rgba(147,113,60,.06)" : "transparent" }}>
                    <td style={td}>
                      <b>{r.name}</b>
                      {dupes[(r.contact || "").toLowerCase()] > 1 && <span title="Stejný e-mail odeslal formulář víckrát" style={{ marginLeft: 6, fontSize: 11, color: "#8f2a22", border: "1px solid #8f2a22", borderRadius: 10, padding: "1px 6px" }}>víckrát</span>}
                      <div style={{ color: "#6b6153", fontSize: 12.5 }}>{r.contact}</div>
                    </td>
                    <td style={{ ...td, color: r.attending === "ano" ? "#2f5a2f" : "#8f2a22" }}>{col("attending")}</td>
                    <td style={td}>{col("sleep")}</td>
                    <td style={td}>{col("travel")}</td>
                    <td style={td}>{col("diet")}</td>
                    <td style={td}>{col("wantsGame")}</td>
                    <td style={td}>{col("persons")}</td>
                    <td style={td}>{r.attending === "ano" ? (accounts.has((r.contact || "").toLowerCase()) ? "účet ✓" : "bez účtu") : ""}</td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{r.attending === "ano" ? conf : ""}</td>
                  </tr>,
                  isOpen && <tr key={r.id + "d"}><td colSpan={9} style={{ padding: 0 }}><Detail r={r} /></td></tr>,
                ];
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12.5, color: "#6b6153", marginTop: 10 }}>Klikni na řádek: uvidíš další osoby a můžeš hostovi potvrdit ubytování a jídlo (uvidí to ve svém profilu).</p>
      </div>
    </section>
  );
}
