import { useState, useEffect } from "react";
import {
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, deleteField,
} from "firebase/firestore";
import { db } from "./firebase.js";
import OrganizerGate from "./admin/OrganizerGate.jsx";
import { STATIONS } from "./stations/stations.js";
import StationQr from "./admin/StationQr.jsx";
import RsvpOverview from "./admin/RsvpOverview.jsx";


const ROLES = [
  "Vrah",
  "Jádro 1", "Jádro 2", "Jádro 3",
  "Svědek 1", "Svědek 2", "Svědek 3", "Svědek 4", "Svědek 5",
  "Rezerva",
];

function AdminInner() {
  const unlocked = true; // přihlášení řeší OrganizerGate

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("");
  const [joinTeamId, setJoinTeamId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, "players"), (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubPlayers(); unsubTeams(); };
  }, []);

  const unassigned = players.filter((p) => !p.teamId && p.wantsGame !== "ne");
  const assignedRoles = teams.map((t) => t.role).filter(Boolean);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || selectedIds.length === 0) return;
    setBusy(true);
    try {
      const stationsDone = {};
      for (let i = 0; i < 8; i++) stationsDone[i] = false;
      const teamRef = await addDoc(collection(db, "teams"), {
        name: newTeamName.trim(),
        role: newTeamRole,
        stationsDone,
        createdAt: serverTimestamp(),
      });
      await Promise.all(
        selectedIds.map((id) => updateDoc(doc(db, "players", id), { teamId: teamRef.id }))
      );
      setSelectedIds([]);
      setNewTeamName("");
      setNewTeamRole("");
    } finally {
      setBusy(false);
    }
  };

  const joinExistingTeam = async () => {
    if (!joinTeamId || selectedIds.length === 0) return;
    setBusy(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateDoc(doc(db, "players", id), { teamId: joinTeamId }))
      );
      setSelectedIds([]);
      setJoinTeamId("");
    } finally {
      setBusy(false);
    }
  };

  const setTeamRole = async (teamId, role) => {
    await updateDoc(doc(db, "teams", teamId), { role });
  };

  const setTeamBackstory = async (teamId, backstory) => {
    await updateDoc(doc(db, "teams", teamId), { backstory });
  };

  // vrácení vyřešené úlohy (pro testování nebo opravu omylu)
  const resetStation = async (team, i) => {
    const st = STATIONS[i];
    if (!window.confirm(`Vrátit stanoviště ${i + 1} (${st?.title || st?.name}) týmu ${team.name} jako nevyřešené?`)) return;
    await updateDoc(doc(db, "teams", team.id), { [`stationsDone.${i}`]: deleteField(), [`stationsSolvedAt.${i}`]: deleteField() });
  };
  const resetHomeTask = async (player) => {
    if (!window.confirm(`Vrátit domácí úkol hráči ${player.name} jako nevyřešený? Na jeho zařízení se minihra spustí od začátku.`)) return;
    await updateDoc(doc(db, "players", player.id), { homeClueSolved: false, homeTask: deleteField(), homeTaskResetAt: serverTimestamp() });
  };

  const setRevealAll = async (revealed) => {
    if (!window.confirm(revealed ? "Odhalit výsledky finálního obvinění všem týmům?" : "Skrýt výsledky všem týmům?")) return;
    await Promise.all(teams.map((t) => updateDoc(doc(db, "teams", t.id), { revealed })));
  };
  const [testMode, setTestMode] = useState(() => { try { return localStorage.getItem("testMode") === "1"; } catch { return false; } });
  const toggleTestMode = () => {
    const next = !testMode;
    try { next ? localStorage.setItem("testMode", "1") : localStorage.removeItem("testMode"); } catch { /* ignore */ }
    setTestMode(next);
  };

  const dissolveTeam = async (teamId) => {
    const members = players.filter((p) => p.teamId === teamId);
    await Promise.all(members.map((p) => updateDoc(doc(db, "players", p.id), { teamId: null })));
    await deleteDoc(doc(db, "teams", teamId));
  };

  return (
    <section className="block" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <p className="eyebrow">jen pro vás</p>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,48px)", margin: "0 0 10px" }}>Hráči a týmy</h1>

        {/* nepřiřazení hráči */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>nepřiřazení hráči ({unassigned.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {unassigned.length === 0 && <p style={{ fontSize: 14, color: "#6b6153" }}>Nikdo nečeká na přiřazení.</p>}
          {unassigned.map((p) => (
            <label key={p.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
              border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6, fontSize: 14, cursor: "pointer",
              background: selectedIds.includes(p.id) ? "rgba(201,169,98,0.08)" : "transparent",
            }}>
              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelected(p.id)} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ color: "#6b6153" }}>{p.contact}</span>
            </label>
          ))}
        </div>

        {/* přidat do existujícího týmu */}
        {teams.length > 0 && (
          <div style={{ border: "1px dashed rgba(58,90,58,0.4)", borderRadius: 8, padding: "18px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, color: "#3a5a3a", marginBottom: 4 }}>Přidat vybrané do stávajícího týmu</label>
              <select value={joinTeamId} onChange={(e) => setJoinTeamId(e.target.value)}
                style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "8px 10px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff", minWidth: 200 }}>
                <option value="">— vyberte tým —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <button className="btn" disabled={busy || !joinTeamId || selectedIds.length === 0} onClick={joinExistingTeam}>
              {busy ? "Chvilku…" : `Přidat do týmu (${selectedIds.length})`}
            </button>
          </div>
        )}

        {/* vytvořit tým z vybraných */}
        <div style={{ border: "1px dashed rgba(147,113,60,0.4)", borderRadius: 8, padding: "18px 20px", marginBottom: 40, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="field" style={{ minWidth: 180 }}>
            <label>Název nového týmu</label>
            <input type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="např. Rodinné stříbro" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11.5, color: "#93713c", marginBottom: 4 }}>Postava</label>
            <select value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value)}
              style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "8px 10px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff" }}>
              <option value="">— zatím žádná —</option>
              {ROLES.map((r) => (
                <option key={r} value={r} disabled={assignedRoles.includes(r)}>
                  {r}{assignedRoles.includes(r) ? " (obsazeno)" : ""}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" disabled={busy || !newTeamName.trim() || selectedIds.length === 0} onClick={createTeam}>
            {busy ? "Chvilku…" : `Vytvořit tým z vybraných (${selectedIds.length})`}
          </button>
        </div>

        {/* finále a testování */}
        <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "16px 18px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>
              Finální obvinění: zapečetěno {teams.filter((t) => t.accusation).length} z {teams.length} týmů
              {teams.some((t) => t.revealed) ? ", výsledky jsou odhalené" : ""}
            </span>
            <span style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => setRevealAll(true)}>Odhalit výsledky všem</button>
              <button className="btn" onClick={() => setRevealAll(false)}>Skrýt</button>
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14 }}>Testovací režim na tomto zařízení (tlačítko Test ve hře): <b>{testMode ? "zapnutý" : "vypnutý"}</b></span>
            <button className="btn" onClick={toggleTestMode}>{testMode ? "Vypnout" : "Zapnout"}</button>
          </div>
        </div>

        <StationQr stations={STATIONS} />

        {/* existující týmy */}
        <p className="eyebrow" style={{ marginBottom: 10 }}>týmy ({teams.length})</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {teams.map((t) => {
            const members = players.filter((p) => p.teamId === t.id);
            const doneCount = Object.values(t.stationsDone || {}).filter(Boolean).length;
            const assists = Object.keys(t.expertAssist || {}).map((k) => STATIONS[k]?.name).filter(Boolean);
            return (
              <div key={t.id} style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <h4 className="display" style={{ fontSize: 20, margin: 0 }}>{t.name}{assists.length > 0 && <span style={{ fontSize: 13, fontFamily: "'IBM Plex Sans'", marginLeft: 10, opacity: 0.7 }}>odborná asistence: {assists.length}× ({assists.join(", ")})</span>}</h4>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <select value={t.role || ""} onChange={(e) => setTeamRole(t.id, e.target.value)}
                      style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "6px 8px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff" }}>
                      <option value="">— nepřiřazeno —</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r} disabled={assignedRoles.includes(r) && t.role !== r}>
                          {r}{assignedRoles.includes(r) && t.role !== r ? " (obsazeno)" : ""}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => dissolveTeam(t.id)} style={{ border: "none", background: "none", color: "#a8604f", fontSize: 13, cursor: "pointer" }}>
                      zrušit tým
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "#6b6153", margin: "8px 0 0" }}>
                  Postup: {doneCount} z {STATIONS.length} stanovišť
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {STATIONS.map((st, i) => {
                    const done = !!(t.stationsDone || {})[i];
                    return done ? (
                      <button key={st.id} onClick={() => resetStation(t, i)} title="Vrátit jako nevyřešené"
                              style={{ fontSize: 12.5, padding: "5px 9px", borderRadius: 14, border: "1px solid #b8913f", background: "rgba(184,145,63,.12)", cursor: "pointer" }}>
                        {i + 1} ✓ vrátit
                      </button>
                    ) : (
                      <span key={st.id} style={{ fontSize: 12.5, padding: "5px 9px", borderRadius: 14, border: "1px solid rgba(0,0,0,.12)", color: "#8a8070" }}>{i + 1}</span>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {members.length === 0 && <span style={{ fontSize: 13.5, color: "#6b6153" }}>(bez členů)</span>}
                  {members.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                      <span>{m.name} <span style={{ color: "#8a8070" }}>· domácí úkol {m.homeClueSolved ? "vyřešen" : "nevyřešen"}</span></span>
                      {m.homeClueSolved && (
                        <button onClick={() => resetHomeTask(m)} style={{ border: "none", background: "none", color: "#8f2a22", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                          vrátit domácí úkol
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <textarea
                  value={t.backstory || ""}
                  onChange={(e) => setTeamBackstory(t.id, e.target.value)}
                  placeholder="Krátký backstory k této postavě (uvidí ho hráči na svém profilu)"
                  rows={2}
                  style={{
                    width: "100%", marginTop: 10, fontFamily: "'IBM Plex Sans'", fontSize: 13.5,
                    padding: "8px 10px", border: "1px solid rgba(0,0,0,0.12)", resize: "vertical",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("odpovedi");
  const tabBtn = (id, label) => (
    <button key={id} type="button" onClick={() => setTab(id)}
      style={{ fontFamily: "'IBM Plex Sans'", fontSize: 14, padding: "9px 18px", cursor: "pointer", border: "1px solid #221D16",
        background: tab === id ? "#221D16" : "transparent", color: tab === id ? "#FBF9F5" : "#221D16" }}>{label}</button>
  );
  return (
    <OrganizerGate label="jen pro vás" title="Administrace">
      <div className="wrap" style={{ paddingTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabBtn("odpovedi", "Odpovědi hostů")}
        {tabBtn("hraci", "Hráči a týmy")}
      </div>
      {tab === "odpovedi" ? <RsvpOverview /> : <AdminInner />}
    </OrganizerGate>
  );
}
