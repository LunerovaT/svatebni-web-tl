import venueMap from "./assets/venue_map_vintage.webp"; // dobová mapa panství (původní satelitní: venue_map.webp)
import { EvidenceMarker, BodyOutline, ProgressStrip } from "./CaseFileBits.jsx";

// Pozice značek jsou u každého stanoviště v stations.js (pos: { x, y } v procentech mapy).

// místo činu — provizorně na nádvoří, dokud nebude něco jiného
const CRIME_SCENE = { x: 73, y: 37 };

export default function MapPage({ stations, stationsDoneMap, onGoOverview, onGoStation }) {
  // stanoviště jsou nezávislá – na mapě jsou vidět všechna hned
  const revealCount = stations.length;

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">Místo konání</p>
        <h1 className="display">Mapa stanovišť</h1>
        <div className="case-card g-mapcard">
          <div className="g-map">
            <img src={venueMap} alt="Mapa místa konání" />
            <BodyOutline style={{
              position: "absolute", left: `${CRIME_SCENE.x}%`, top: `${CRIME_SCENE.y}%`, width: "7%",
              transform: "translate(-50%,-50%) rotate(-10deg)", pointerEvents: "none",
            }} />
            {stations.slice(0, revealCount).map((s, i) => {
              const pos = s.pos || { x: 50, y: 50 };
              return (
                <button key={s.id || i} className={`g-marker${stationsDoneMap[i] ? " done" : ""}`} onClick={() => onGoStation(i)}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label={`Stanoviště ${i + 1}: ${s.title || s.name}`} title={s.title || s.name}>
                  <EvidenceMarker number={i + 1} style={{ width: "100%" }} />
                </button>
              );
            })}
          </div>
          <ProgressStrip total={stations.length} doneMap={stationsDoneMap} style={{ margin: "22px 0 8px" }} />
          <div className="g-list">
            {stations.map((s, i) => (
              <a key={s.id || i} href={`#/stanoviste/${i + 1}`} onClick={(e) => { e.preventDefault(); onGoStation(i); }} className="case-station-row g-row">
                <span className="g-row-n">{i + 1}</span>
                <span className="g-row-main">
                  <span className="g-row-title">{s.name}</span>
                  {s.title && <span className="g-row-sub">{s.title}</span>}
                </span>
                <span className={`g-status${stationsDoneMap[i] ? " done" : ""}`}>{stationsDoneMap[i] ? "Vyřešeno" : "Otevřít"}</span>
              </a>
            ))}
          </div>
          <p style={{ fontSize: 13, marginTop: 16, marginBottom: 0 }}>Stanoviště 4 je provizorní náhrada za altán, který leží mimo areál.</p>
          <div className="g-actions"><button className="g-btn g-btn-ghost" onClick={onGoOverview}>Spis týmu</button></div>
        </div>
      </div>
    </section>
  );
}
