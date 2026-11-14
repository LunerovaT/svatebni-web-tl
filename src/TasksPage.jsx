import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import OrganizerGate from "./admin/OrganizerGate.jsx";


function TasksInner() {
  const unlocked = true; // přihlášení řeší OrganizerGate

  const [tasks, setTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [editingAssignee, setEditingAssignee] = useState(null);
  const [assigneeInput, setAssigneeInput] = useState("");

  useEffect(() => {
    if (!unlocked) return;
    const unsub = onSnapshot(collection(db, "tasks"), (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [unlocked]);

  const categories = [...new Set(tasks.map((t) => t.category))].sort();
  const current = activeCategory || categories[0];

  const toggleDone = async (task) => {
    await updateDoc(doc(db, "tasks", task.id), { done: !task.done });
  };

  const saveAssignee = async (taskId) => {
    await updateDoc(doc(db, "tasks", taskId), { assignee: assigneeInput.trim() });
    setEditingAssignee(null);
    setAssigneeInput("");
  };

  const shown = tasks.filter((t) => t.category === current);

  return (
    <section className="block" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <p className="eyebrow">organizační tým</p>
        <h1 className="display" style={{ fontSize: "clamp(30px,5vw,44px)", margin: "0 0 20px" }}>Úkoly na svatbu</h1>

        {categories.length === 0 ? (
          <p className="lede">Zatím tu nejsou žádné úkoly — přidá je Tereza/Lukáš ve správci.</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
              {categories.map((cat) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                const doneCount = catTasks.filter((t) => t.done).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      fontFamily: "'IBM Plex Sans'", fontSize: 13.5, padding: "8px 14px", cursor: "pointer",
                      border: "1px solid rgba(0,0,0,0.15)", borderRadius: 20,
                      background: cat === current ? "#221D16" : "#fff",
                      color: cat === current ? "#FBF9F5" : "#221D16",
                    }}
                  >
                    {cat} ({doneCount}/{catTasks.length})
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
              {shown.length === 0 && <p style={{ fontSize: 14, color: "#6b6153" }}>V téhle kategorii zatím nic není.</p>}
              {shown.map((t) => (
                <div key={t.id} style={{
                  border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "14px 16px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  background: t.done ? "rgba(58,90,58,0.06)" : "#fff",
                }}>
                  <input type="checkbox" checked={!!t.done} onChange={() => toggleDone(t)} style={{ marginTop: 3 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 15, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#6b6153" : "#221D16" }}>
                      {t.title}
                    </p>
                    {t.note && <p style={{ margin: "0 0 6px", fontSize: 13, color: "#6b6153" }}>{t.note}</p>}
                    {editingAssignee === t.id ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="text" value={assigneeInput} onChange={(e) => setAssigneeInput(e.target.value)}
                          placeholder="Kdo to má na starost"
                          style={{ fontSize: 13, padding: "4px 8px", border: "1px solid rgba(0,0,0,0.15)" }}
                          autoFocus
                        />
                        <button onClick={() => saveAssignee(t.id)} style={{ fontSize: 12, background: "#221D16", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}>Uložit</button>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13 }}>
                        {t.assignee ? <>Má na starost: <b>{t.assignee}</b></> : <span style={{ color: "#a8342a" }}>Nikdo se zatím nepřihlásil</span>}
                        {" · "}
                        <button
                          onClick={() => { setEditingAssignee(t.id); setAssigneeInput(t.assignee || ""); }}
                          style={{ fontSize: 12, color: "#93713c", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          {t.assignee ? "změnit" : "přihlásit se"}
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function TasksPage() {
  return (
    <OrganizerGate label="organizační tým" title="Úkoly">
      <TasksInner />
    </OrganizerGate>
  );
}
