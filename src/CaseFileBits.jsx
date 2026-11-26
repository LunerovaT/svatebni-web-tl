// Drobné stavební prvky herních obrazovek.
// Styl je v src/game/game.css – na stole leží jen papíry, proto žádné připínáčky, pásky ani razítka.

import marker1 from "./assets/marker_1.webp";
import marker2 from "./assets/marker_2.webp";
import marker3 from "./assets/marker_3.webp";
import marker4 from "./assets/marker_4.webp";
import marker5 from "./assets/marker_5.webp";
import marker6 from "./assets/marker_6.webp";
import marker7 from "./assets/marker_7.webp";
import marker8 from "./assets/marker_8.webp";
import bodyOutlineImg from "./assets/body_outline.webp";

const sentence = (t) => {
  if (typeof t !== "string") return t;
  const s = t.toLocaleLowerCase("cs");
  return s.charAt(0).toLocaleUpperCase("cs") + s.slice(1);
};

// Malý nadpis sekce na papíře (dříve žlutý štítek).
export function ClueTag({ children, style }) {
  return <p className="g-kicker" style={style}>{sentence(children)}</p>;
}

// Číslované důkazní značky (1–8) na mapě.
const MARKERS = [marker1, marker2, marker3, marker4, marker5, marker6, marker7, marker8];
export function EvidenceMarker({ number, style }) {
  const src = MARKERS[number - 1] || marker1;
  return (
    <div style={{ position: "relative", width: 34, ...style }}>
      <img src={src} alt={`stanoviště ${number}`} style={{ width: "100%", display: "block" }} />
    </div>
  );
}
export function BodyOutline({ style }) {
  return <img src={bodyOutlineImg} alt="místo činu" style={{ width: 90, ...style }} />;
}
export function ProgressStrip({ total, doneCount = 0, doneMap, style }) {
  const isDone = (i) => (doneMap ? !!doneMap[i] : i < doneCount);
  const count = Array.from({ length: total }).filter((_, i) => isDone(i)).length;
  return (
    <div className="g-progress" style={style} role="img" aria-label={`Vyřešeno ${count} z ${total} stanovišť`}>
      <span className="g-progress-count">{count} z {total}</span>
      <span className="g-progress-track" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {Array.from({ length: total }).map((_, i) => <i key={i} className={isDone(i) ? "on" : ""} />)}
      </span>
    </div>
  );
}

// Tlačítko. Výchozí je mosazné (hlavní akce); světlé barvy z dřívějších štítků = obrysové (vedlejší akce).
const GHOST = new Set(["#d8c9a3", "#f2f0e6", "#efe8d4"]);
const stripArrows = (c) => (typeof c === "string" ? c.replace(/\s*[→←]\s*/g, " ").trim() : c);
export function TagButton({ children, onClick, color, disabled, type = "button", style, variant }) {
  const v = variant || (GHOST.has(color) ? "ghost" : "primary");
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style}
            className={`g-btn${v === "ghost" ? " g-btn-ghost" : ""}`}>
      {stripArrows(children)}
    </button>
  );
}
