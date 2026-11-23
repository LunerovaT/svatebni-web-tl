import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { ClueTag, ProgressStrip, TagButton } from "../CaseFileBits.jsx";
import { Accusation } from "../game/CaseParts.jsx";
import { STATIONS, FINAL_REQUIRES } from "../stations/stations.js";

// Finální vyšetřování: zamčené, dokud tým nemá všechny indicie; pak obvinění a výsledky.
export default function FinalPage({ team, evidence, finalUnlocked, stationsDoneMap, onSeal, go }) {
  // všechny týmy čteme jen po odhalení výsledků (pořadí)
  const [allTeams, setAllTeams] = useState([]);
  useEffect(() => {
    if (!team?.revealed) return undefined;
    const unsub = onSnapshot(query(collection(db, "teams"), where("revealed", "==", true)), (snap) => setAllTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (e) => console.warn("Týmy se nepodařilo načíst:", e));
    return () => unsub();
  }, [team?.revealed]);
  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">Případ poslední vůle</p>
        <h1 className="display">Finální vyšetřování</h1>
        {finalUnlocked || team?.accusation || team?.revealed ? (
          <Accusation team={team} evidence={evidence} onSeal={onSeal} teams={allTeams} />
        ) : (
          <div className="case-card">
            <ClueTag>Zamčeno</ClueTag>
            <p style={{ margin: "0 0 18px" }}>
              Finální vyšetřování se odemkne, až budete mít všech {FINAL_REQUIRES} indicií ze stanovišť.
            </p>
            <ProgressStrip total={STATIONS.length} doneMap={stationsDoneMap} />
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <TagButton variant="ghost" onClick={() => go("hra")} style={{ color: "#f3e9d2", boxShadow: "inset 0 0 0 1.5px rgba(243,233,210,.45)" }}>Spis týmu</TagButton>
        </div>
      </div>
    </section>
  );
}
