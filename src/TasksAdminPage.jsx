import { useState, useEffect } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase.js";
import { reportError } from "./reportError.js";
import OrganizerGate from "./admin/OrganizerGate.jsx";


// Provizorní výchozí kategorie — uprav/doplň si klidně přímo tady, nebo přidávej nové rovnou ve formuláři níž.
const DEFAULT_CATEGORIES = [
  "Jídlo", "Pití", "Dekorace", "Hudba a zábava", "Doprava a parkování",
  "Ubytování hostů", "Foto a video", "Papírenství", "Technika a ozvučení", "Úklid a organizace na místě",
];

function TasksAdminInner() {
  const unlocked = true; // přihlášení řeší OrganizerGate

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    const unsub = onSnapshot(collection(db, "tasks"), (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [unlocked]);

  const existingCategories = [...new Set([...DEFAULT_CATEGORIES, ...tasks.map((t) => t.category)])];

  const addTask = async (e) => {
    e.preventDefault();
    const finalCategory = category === "__new__" ? customCategory.trim() : category;
    if (!title.trim() || !finalCategory) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        note: note.trim(),
        category: finalCategory,
        assignee: assignee.trim(),
        done: false,
        createdAt: serverTimestamp(),
      });
      setTitle(""); setNote(""); setAssignee(""); setCustomCategory("");
    } catch (e) { reportError(e, "Přidání úkolu"); } finally {
      setBusy(false);
    }
  };

  const updateTask = async (id, patch) => {
    try { await updateDoc(doc(db, "tasks", id), patch); } catch (e) { reportError(e, "Uložení úkolu"); }
  };

  const removeTask = async (id) => {
    try { await deleteDoc(doc(db, "tasks", id)); } catch (e) { reportError(e, "Smazání úkolu"); }
  };

  const byCategory = existingCategories
    .map((cat) => ({ cat, items: tasks.filter((t) => t.category === cat) }))
    .filter((g) => g.items.length > 0 || DEFAULT_CATEGORIES.includes(g.cat));

  return (
    <section className="block" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <p className="eyebrow">jen pro vás dva</p>
        <h1 className="display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "0 0 8px" }}>Správce úkolů</h1>
        <p className="lede" style={{ marginBottom: 30 }}>
          Sem přidávejte a upravujte úkoly — organizační tým je uvidí na stránce Úkoly (přehledně podle kategorií).
        </p>

        {/* nový úkol */}
        <form onSubmit={addTask} style={{
          border: "1px dashed rgba(147,113,60,0.4)", borderRadius: 8, padding: "18px 20px", marginBottom: 40,
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end",
        }}>
          <div className="field" style={{ minWidth: 200 }}>
            <label>Úkol</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="např. Koupit víno" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11.5, color: "#93713c", marginBottom: 4 }}>Kategorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "8px 10px", border: "1px solid rgba(0,0,0,0.15)", background: "#fff" }}>
              {existingCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__new__">+ nová kategorie…</option>
            </select>
          </div>
          {category === "__new__" && (
            <div className="field" style={{ minWidth: 160 }}>
              <label>Název nové kategorie</label>
              <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="např. Květiny" />
            </div>
          )}
          <div className="field" style={{ minWidth: 160 }}>
            <label>Poznámka (nepovinné)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="upřesnění, množství..." />
          </div>
          <div className="field" style={{ minWidth: 140 }}>
            <label>Rovnou přiřadit (nepovinné)</label>
            <input type="text" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="jméno" />
          </div>
          <button className="btn" disabled={busy || !title.trim()}>{busy ? "Chvilku…" : "Přidat úkol"}</button>
        </form>

        {/* přehled podle kategorií */}
        {byCategory.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 30 }}>
            <h3 className="display" style={{ fontSize: 20, margin: "0 0 10px" }}>{cat}</h3>
            {items.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "#6b6153" }}>Zatím žádné úkoly v téhle kategorii.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((t) => (
                  <div key={t.id} style={{
                    display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
                    border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6, padding: "8px 12px", fontSize: 14,
                  }}>
                    <input type="checkbox" checked={!!t.done} onChange={() => updateTask(t.id, { done: !t.done })} />
                    <span style={{ flex: "1 1 160px", textDecoration: t.done ? "line-through" : "none", color: t.done ? "#6b6153" : "#221D16" }}>
                      {t.title}
                    </span>
                    <input
                      type="text" defaultValue={t.assignee || ""} placeholder="přiřadit komu"
                      onBlur={(e) => { if (e.target.value !== (t.assignee || "")) updateTask(t.id, { assignee: e.target.value.trim() }); }}
                      style={{ fontSize: 13, padding: "4px 8px", border: "1px solid rgba(0,0,0,0.15)", width: 140 }}
                    />
                    <button onClick={() => removeTask(t.id)} style={{ fontSize: 12, color: "#a8342a", background: "none", border: "none", cursor: "pointer" }}>
                      smazat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TasksAdminPage() {
  return (
    <OrganizerGate label="jen pro vás dva" title="Správce úkolů">
      <TasksAdminInner />
    </OrganizerGate>
  );
}
