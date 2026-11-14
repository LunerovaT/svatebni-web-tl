import { useState } from "react";

// Testovací režim: plovoucí tlačítko „Test“ pro volné proklikávání hry.
// Viditelné při `npm run dev` (localhost) a na zařízeních, kde je zapnuté v administraci (localStorage testMode=1).
export const isTestMode = () => {
  try { return !!import.meta.env?.DEV || localStorage.getItem("testMode") === "1"; } catch { return !!import.meta.env?.DEV; }
};

export default function TestPanel({ stationIndex, stationTitle, hasTeam, isLoggedIn, onResetStation, onResetAllStations, onSolveAllStations, onResetHomeTask, onResetAccusation, onToggleReveal, revealed }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const run = async (label, fn) => {
    setMsg("Pracuji…");
    try { await fn(); setMsg(`Hotovo: ${label}`); } catch (e) { setMsg(`Nepovedlo se: ${e?.message || e}`); }
  };
  return (
    <div className={`g-test${open ? " open" : ""}`}>
      {open && (
        <div className="g-test-panel" role="dialog" aria-label="Testovací režim">
          <p className="g-test-title">Testovací režim</p>
          {stationIndex !== null && (
            <button className="g-test-btn" disabled={!hasTeam} onClick={() => run("stanoviště vráceno", () => onResetStation(stationIndex))}>
              Vrátit toto stanoviště{stationTitle ? ` (${stationTitle})` : ""}
            </button>
          )}
          <button className="g-test-btn" disabled={!hasTeam} onClick={() => run("všechna stanoviště vrácena", onResetAllStations)}>Vrátit všechna stanoviště</button>
          <button className="g-test-btn" disabled={!hasTeam} onClick={() => run("všechna stanoviště vyřešena", onSolveAllStations)}>Vyřešit všechna stanoviště</button>
          <button className="g-test-btn" onClick={() => run("domácí úkol vrácen", onResetHomeTask)}>Vrátit domácí úkol</button>
          <button className="g-test-btn" disabled={!hasTeam} onClick={() => run("obvinění smazáno", onResetAccusation)}>Smazat obvinění týmu</button>
          <button className="g-test-btn" disabled={!hasTeam} onClick={() => run(revealed ? "odhalení skryto" : "výsledek odhalen", onToggleReveal)}>
            {revealed ? "Skrýt odhalení (můj tým)" : "Odhalit výsledek (můj tým)"}
          </button>
          {!isLoggedIn && <p className="g-test-note">Nejste přihlášená – vrátí se jen domácí úkol v tomto prohlížeči.</p>}
          {isLoggedIn && !hasTeam && <p className="g-test-note">Stanoviště jdou vracet, až budete v týmu.</p>}
          {msg && <p className="g-test-note" role="status">{msg}</p>}
        </div>
      )}
      <button className="g-test-toggle" onClick={() => { setOpen((o) => !o); setMsg(""); }} aria-expanded={open}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />
        </svg>
        Test
      </button>
    </div>
  );
}
