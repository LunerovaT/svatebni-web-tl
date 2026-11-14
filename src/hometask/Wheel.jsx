import { useEffect, useRef, useState } from "react";
import { ALPHA, mod } from "./cipher.js";
import wheelBase from "../assets/ht/wheel_base.webp";
import wheelRing from "../assets/ht/wheel_ring.webp";

const STEP = 360 / 26;
// Geometrie v souřadnicích fotografie kotouče (1160×1160, střed 0,0).
const R_OUTER = 430;   // pevný prstenec = šifra
const R_INNER = 332;   // otočný prstenec = pravý text
const R_RIM = 528;     // okraj s popisky

function Letters({ r, size, color, shade }) {
  return [...ALPHA].map((ch, i) => (
    <g key={ch} transform={`rotate(${i * STEP})`}>
      <text y={-r + size * 0.36 + 2} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontWeight="600" fontSize={size} fill={shade}>{ch}</text>
      <text y={-r + size * 0.36} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontWeight="600" fontSize={size} fill={color}>{ch}</text>
    </g>
  ));
}

// Mosazný šifrovací kotouč. offset 0–25: vnitřní A leží pod vnějším písmenem s indexem `offset`.
export default function Wheel({ offset, onChange, interactive = false, cipherLetter = null, onTick, label = "Šifrovací kotouč" }) {
  const boxRef = useRef(null);
  const drag = useRef(null);
  const [rot, setRot] = useState(offset * STEP);

  // otáčení nejkratší cestou (bez přetočení z 25 zpět na 0)
  useEffect(() => {
    setRot((prev) => {
      const diff = ((((offset * STEP - prev) % 360) + 540) % 360) - 180;
      return prev + diff;
    });
  }, [offset]);

  const angleAt = (e) => {
    const r = boxRef.current.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const down = (e) => {
    if (!interactive) return;
    drag.current = { a0: angleAt(e), start: offset, last: offset };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const diff = ((((angleAt(e) - d.a0) % 360) + 540) % 360) - 180;
    const next = mod(d.start + Math.round(diff / STEP));
    if (next !== d.last) { d.last = next; onChange?.(next); onTick?.(); }
  };
  const up = () => { drag.current = null; };
  const key = (e) => {
    if (!interactive) return;
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
    if (e.key in map) { e.preventDefault(); onChange?.(mod(offset + map[e.key])); onTick?.(); }
    else if (e.key === "Home") { e.preventDefault(); onChange?.(0); }
  };

  const ci = cipherLetter ? ALPHA.indexOf(cipherLetter) : -1;

  return (
    <div
      ref={boxRef}
      className={`ht-wheel${interactive ? " is-i" : ""}`}
      role={interactive ? "slider" : "img"}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 25 : undefined}
      aria-valuenow={interactive ? offset : undefined}
      aria-valuetext={interactive ? `Posun ${offset}. Vnitřní A leží pod vnějším ${ALPHA[offset]}.` : undefined}
      onKeyDown={key}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
    >
      <img src={wheelBase} alt="" draggable="false" className="ht-wheel-layer" />
      <svg className="ht-wheel-layer" viewBox="-580 -580 1160 1160" aria-hidden="true">
        <defs>
          <path id="ht-rimL" d={`M ${-R_RIM * Math.sin(Math.PI * 0.43)} ${-R_RIM * Math.cos(Math.PI * 0.43)} A ${R_RIM} ${R_RIM} 0 0 1 ${-R_RIM * Math.sin(Math.PI * 0.05)} ${-R_RIM * Math.cos(Math.PI * 0.05)}`} />
          <path id="ht-rimR" d={`M ${R_RIM * Math.sin(Math.PI * 0.05)} ${-R_RIM * Math.cos(Math.PI * 0.05)} A ${R_RIM} ${R_RIM} 0 0 1 ${R_RIM * Math.sin(Math.PI * 0.43)} ${-R_RIM * Math.cos(Math.PI * 0.43)}`} />
        </defs>
        <text fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fontSize="26" letterSpacing="4" fill="rgba(35,22,6,.62)"><textPath href="#ht-rimL" startOffset="50%" textAnchor="middle">ŠIFRA · VNĚJŠÍ KRUH</textPath></text>
        <text fontFamily="IBM Plex Sans, sans-serif" fontWeight="600" fontSize="26" letterSpacing="4" fill="rgba(35,22,6,.62)"><textPath href="#ht-rimR" startOffset="50%" textAnchor="middle">TEXT · VNITŘNÍ KRUH</textPath></text>
        <Letters r={R_OUTER} size={66} color="rgba(38,24,6,.86)" shade="rgba(255,236,190,.35)" />
        {ci >= 0 && <circle cx="0" cy={-R_OUTER} r="46" fill="rgba(255,240,170,.28)" stroke="#fff3b0" strokeWidth="6" transform={`rotate(${ci * STEP})`} />}
      </svg>
      <div className="ht-wheel-layer ht-wring" style={{ transform: `rotate(${rot}deg)` }}>
        <img src={wheelRing} alt="" draggable="false" />
        <svg viewBox="-580 -580 1160 1160" aria-hidden="true">
          <Letters r={R_INNER} size={56} color="rgba(38,24,6,.86)" shade="rgba(255,236,190,.35)" />
        </svg>
      </div>
      {ci >= 0 && (
        <svg className="ht-wheel-layer" viewBox="-580 -580 1160 1160" aria-hidden="true">
          <circle cx="0" cy={-R_INNER} r="40" fill="rgba(255,240,170,.22)" stroke="#fff3b0" strokeWidth="6" transform={`rotate(${ci * STEP})`} />
          <line x1="0" y1={-R_OUTER + 40} x2="0" y2={-R_INNER - 36} stroke="#fff3b0" strokeWidth="5" transform={`rotate(${ci * STEP})`} />
        </svg>
      )}
    </div>
  );
}
