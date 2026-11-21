import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { INTRO_SCENES } from "../story/intro.js";
import fallbackBg from "../assets/intro/margaret.webp";

// Celoobrazovkový úvod: scény se zatmívají, řádky naskakují postupně. Klepnutím se zobrazí všechny řádky scény.
export default function GameIntro({ onDone, scenes = INTRO_SCENES, finishLabel = "Do hry" }) {
  const rm = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [i, setI] = useState(0);
  const [n, setN] = useState(rm ? 99 : 1);
  const [out, setOut] = useState(false);
  const timer = useRef(null);
  const sc = { ...scenes[i], bg: scenes[i].bg || fallbackBg };
  const last = i === scenes.length - 1;
  const allShown = n >= sc.lines.length;

  useEffect(() => {
    if (allShown) return;
    timer.current = setTimeout(() => setN((x) => x + 1), 1700);
    return () => clearTimeout(timer.current);
  }, [n, i, allShown]);

  const next = () => {
    if (last) { onDone(); return; }
    setOut(true);
    setTimeout(() => { setI((x) => x + 1); setN(rm ? 99 : 1); setOut(false); }, rm ? 0 : 650);
  };

  return createPortal(
    <div className="gi" role="dialog" aria-label="Úvod do hry" onClick={() => !allShown && setN(99)}>
      <button className="gi-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>Přeskočit</button>
      <div key={sc.bg} className={"gi-bg" + (out && (scenes[i + 1]?.bg || fallbackBg) !== sc.bg ? " out" : "")} style={{ backgroundImage: `url(${sc.bg})`, backgroundPosition: sc.pos || "50% 50%", "--z": sc.zoom || 1.1 }} />
      <div className="gi-shade" />
      <div className={"gi-scene" + (out ? " out" : "")} key={i}>
        <p className="gi-kicker">{sc.kicker}</p>
        {sc.image && <img className="gi-img" src={sc.image} alt={sc.title || ""} />}
        {sc.title && <h2 className="gi-title">{sc.title}</h2>}
        {sc.sub && <p className="gi-sub">{sc.sub}</p>}
        {sc.lines.slice(0, n).map((l, k) => <p key={k} className="gi-line">{l}</p>)}
        <div className="gi-foot">
          {allShown && <button className="gi-next" onClick={(e) => { e.stopPropagation(); next(); }}>{last ? finishLabel : "Dál"}</button>}
        </div>
      </div>
      <div className="gi-dots" aria-hidden="true">{scenes.map((_, k) => <span key={k} className={k === i ? "on" : k < i ? "past" : ""} />)}</div>
    </div>,
    document.body
  );
}
