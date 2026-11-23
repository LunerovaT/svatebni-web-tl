// Horní lišta herních obrazovek (Spis / Mapa / Příběh + návrat na svatební web).
export default function GameHeader({ go, page, stationIndex, myPlayerId, hasTeam }) {
  return (
    <header className={`g-top${myPlayerId ? "" : " no-nav"}`}>
      <button className="g-brand" onClick={() => go("hra")}>Případ poslední vůle</button>
      {myPlayerId && (
        <nav className="g-nav" aria-label="Hra">
          {[
            { id: "hra", label: "Spis", show: true, icon: <path d="M4 5h6l2 2h8v12H4z" /> },
            { id: "mapa", label: "Mapa", show: hasTeam, icon: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></> },
            { id: "pripad", label: "Příběh", show: hasTeam, icon: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 9h6M9 13h6" /></> },
          ].filter((n) => n.show).map((n) => (
            <a key={n.id} href={`#/${n.id}`} onClick={(e) => { e.preventDefault(); go(n.id); }}
               className={page === n.id || (n.id === "mapa" && stationIndex !== null) ? "active" : ""}
               aria-current={page === n.id ? "page" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{n.icon}</svg>
              {n.label}
            </a>
          ))}
        </nav>
      )}
      <button className="g-exit" onClick={() => go("home")} aria-label="Zpět na svatební web" title="Zpět na svatební web">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h5v16h-5" /><path d="M10 8l-4 4 4 4M6 12h10" /></svg>
        <span>Svatební web</span>
      </button>
    </header>
  );
}
