import { useEffect, useRef, useState } from "react";
import "./hometask.css";
import Wheel from "./Wheel.jsx";
import GameIntro from "../game/GameIntro.jsx";
import { SUSPECT_SCENES } from "../story/suspectsIntro.js";
import { play } from "./sound.js";
import { decodeLetter, verifyCipher } from "./cipher.js";
import { CIPHER, CIPHER_WORDS, CIPHERTEXT, DOCS, INK, SHIFT_FEEDBACK, SLOT_COUNT, STORY, docAlt } from "./config.js";
import imgPhoto from "../assets/ht/photo_eliska.webp";
import imgPhotoBack from "../assets/ht/photo_back.webp";
import imgEnvelope from "../assets/ht/envelope.webp";
import imgSeal from "../assets/ht/seal.webp";
import imgLamp from "../assets/ht/lamp.webp";
import imgPostcard from "../assets/ht/postcard.webp";
import imgTag from "../assets/ht/tag.webp";

const STORE_KEY = "wedding_hometask_v2";
const PHOTO_RATIO = 1086 / 1448;
const ZOOMS = [1, 2, 3.2];

const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

const DEFAULT = () => ({
  intro: true,             // úvodní text ještě nezobrazen
  open: null,              // otevřený detail: letter | photo | doc:<id> | wheel | null
  sealBroken: false,
  photoChecked: false,     // přiblížil nebo otočil fotku
  docOrder: shuffle(DOCS.map((d) => d.id)),
  designated: null,        // id dokladu označeného jako Eleanořin
  wrongChecked: [],        // špatně označené doklady, které hráč prosvítil lampou
  inkFound: false,
  offset: 0,
  slots: Array(SLOT_COUNT).fill(null),
  selected: null,
  hintsUsed: 0,
  attempts: 0,
  solved: false,
  stage: "desk",           // desk | reveal | suspects | file
  sound: false,
});

function load(alreadySolved) {
  const base = DEFAULT();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (raw && raw.v === 2) {
      const s = { ...base, ...raw.s, open: null };
      if (!Array.isArray(s.slots) || s.slots.length !== SLOT_COUNT) s.slots = base.slots;
      if (!Array.isArray(s.docOrder) || s.docOrder.length !== DOCS.length) s.docOrder = base.docOrder;
      if (alreadySolved && !s.solved) Object.assign(s, { solved: true, stage: "file", intro: false });
      return s;
    }
  } catch { /* úložiště nedostupné – hraje se bez ukládání */ }
  return alreadySolved ? { ...base, intro: false, solved: true, sealBroken: true, photoChecked: true, inkFound: true, stage: "file" } : base;
}

function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    const f = () => setRm(q.matches);
    f(); q.addEventListener?.("change", f);
    return () => q.removeEventListener?.("change", f);
  }, []);
  return rm;
}

const Icon = {
  sound: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></svg>,
  mute: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>,
  flip: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2.2-2.2A5 5 0 0 0 7 12" /><path d="M20 12a8 8 0 0 1-14 5l-2 2v-6h6l-2.2 2.2A5 5 0 0 0 17 12" /></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="10" cy="10" r="6" /><path d="M15 15l5 5M10 7v6M7 10h6" /></svg>,
  minus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="10" cy="10" r="6" /><path d="M15 15l5 5M7 10h6" /></svg>,
  bulb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21h6M10 17h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" /></svg>,
  mark: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>,
};

// ---------------- přibližování a posouvání (myš, kolečko, prsty) ----------------
function useZoomPan(enabled = true) {
  const [z, setZ] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const ptrs = useRef(new Map());
  const pinch = useRef(null);
  const zoom = ZOOMS[z];
  const clamp = (p, zz) => { const m = (1 - 1 / ZOOMS[zz]) / 2; return { x: Math.max(-m, Math.min(m, p.x)), y: Math.max(-m, Math.min(m, p.y)) }; };
  const setZoom = (nz) => { const v = Math.max(0, Math.min(ZOOMS.length - 1, nz)); setZ(v); setPan((p) => (v === 0 ? { x: 0, y: 0 } : clamp(p, v))); };
  const handlers = enabled ? {
    onWheel: (e) => { if (Math.abs(e.deltaY) < 4) return; setZoom(z + (e.deltaY < 0 ? 1 : -1)); },
    onPointerDown: (e) => {
      ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      e.currentTarget.setPointerCapture?.(e.pointerId);
      if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z }; }
    },
    onPointerMove: (e) => {
      const prev = ptrs.current.get(e.pointerId); if (!prev) return;
      ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.current.size === 2 && pinch.current) {
        const [a, b] = [...ptrs.current.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        const ratio = d / pinch.current.d; const target = pinch.current.z + (ratio > 1.35 ? 1 : ratio < 0.75 ? -1 : 0);
        if (target !== z) setZoom(target);
        return;
      }
      if (z > 0) {
        const r = e.currentTarget.getBoundingClientRect();
        setPan((p) => clamp({ x: p.x + (e.clientX - prev.x) / r.width / zoom, y: p.y + (e.clientY - prev.y) / r.height / zoom }, z));
      }
    },
    onPointerUp: (e) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2) pinch.current = null; },
    onPointerCancel: (e) => { ptrs.current.delete(e.pointerId); pinch.current = null; },
  } : {};
  const style = { transform: `scale(${zoom}) translate(${pan.x * 100}%, ${pan.y * 100}%)` };
  return { z, zoom, setZoom, handlers, style, reset: () => { setZ(0); setPan({ x: 0, y: 0 }); } };
}

// ---------------- úvod ----------------
function IntroView({ rm, onStart }) {
  const total = STORY.intro.length;
  const [n, setN] = useState(rm ? total : 1);
  useEffect(() => { if (rm) setN(total); }, [rm, total]);
  useEffect(() => {
    if (n >= total) return;
    const t = setTimeout(() => setN((x) => x + 1), 1500);
    return () => clearTimeout(t);
  }, [n, total]);
  return (
    <div className="ht-intro" onClick={() => setN(total)}>
      <div className="ht-intro-in">
        <p className="ht-kicker">{STORY.caseName}</p>
        {STORY.intro.slice(0, n).map((l, i) => <p key={i} className="ht-intro-l">{l}</p>)}
        {n >= total && <button className="ht-tagbtn ht-fadein" onClick={(e) => { e.stopPropagation(); onStart(); }}>Začít vyšetřování</button>}
      </div>
    </div>
  );
}

// ---------------- stůl ----------------
function Desk({ st, onOpen, nudge }) {
  const docs = st.docOrder.map((id) => DOCS.find((d) => d.id === id));
  const mark = (on, label) => on && <span className="ht-check" aria-label={label}>{Icon.mark}</span>;
  return (
    <div className="ht-desk">
      <img className="ht-decor ht-decor-lamp" src={imgLamp} alt="" draggable="false" />
      <img className="ht-decor ht-decor-postcard" src={imgPostcard} alt="" draggable="false" />
      <img className="ht-decor ht-decor-tag" src={imgTag} alt="" draggable="false" />

      <button className={`ht-obj ht-o-letter${nudge === "letter" ? " ht-nudge" : ""}`} onClick={() => onOpen("letter")}
              aria-label={st.sealBroken ? "Dopis od Eleanor, otevřený" : "Zapečetěný dopis od Eleanor"}>
        <span className="ht-envwrap">
          <img src={imgEnvelope} alt="" draggable="false" />
          {!st.sealBroken && <img className="ht-envseal" src={imgSeal} alt="" draggable="false" />}
          <span className="ht-envaddr">{STORY.envelopeAddress}</span>
        </span>
        <span className="ht-plate">DOPIS</span>
        {mark(st.sealBroken, "přečteno")}
      </button>

      <button className={`ht-obj ht-o-photo${nudge === "photo" ? " ht-nudge" : ""}`} onClick={() => onOpen("photo")} aria-label="Stará fotografie">
        <span className="ht-printframe"><img src={imgPhoto} alt="" draggable="false" /></span>
        <span className="ht-plate">FOTOGRAFIE</span>
        {mark(st.photoChecked, "prozkoumáno")}
      </button>

      <div className={`ht-o-docs${nudge === "docs" ? " ht-nudge" : ""}`}>
        {docs.map((d, i) => (
          <button key={d.id} className={`ht-obj ht-doc ht-doc-${d.kind}`} style={{ "--tilt": `${[-2.2, 1.6, -1][i]}deg` }}
                  onClick={() => onOpen("doc:" + d.id)} aria-label={`${d.title}${st.designated === d.id ? ", označen jako Eleanořin" : ""}`}>
            <img src={d.front} alt="" draggable="false" />
            {st.designated === d.id && <span className="ht-designated">ELEANOR?</span>}
          </button>
        ))}
        <span className="ht-plate ht-plate-docs">CESTOVNÍ DOKLADY</span>
        {mark(st.inkFound, "nalezen inkoust")}
      </div>

      <button className={`ht-obj ht-o-wheel${nudge === "wheel" ? " ht-nudge" : ""}`} onClick={() => onOpen("wheel")} aria-label="Mosazný šifrovací kotouč">
        <Wheel offset={st.offset} />
        <span className="ht-plate">KOTOUČ</span>
      </button>
    </div>
  );
}

// ---------------- dopis ----------------
function LetterDetail({ st, patch, snd, rm, say }) {
  const [breaking, setBreaking] = useState(false);
  const dragX = useRef(null);
  const breakSeal = () => {
    if (breaking || st.sealBroken) return;
    setBreaking(true); snd("crack");
    setTimeout(() => { patch({ sealBroken: true }); snd("paper"); say("Pečeť je rozlomená. Dopis je otevřený."); }, rm ? 30 : 1150);
  };
  if (!st.sealBroken) {
    return (
      <div className="ht-stagebox">
        <div className={`ht-bigenv${breaking ? " breaking" : ""}`}>
          <img src={imgEnvelope} alt="" draggable="false" />
          <span className="ht-envaddr">{STORY.envelopeAddress}</span>
          <button className="ht-bigseal" aria-label="Rozlomit pečeť" onClick={breakSeal}
                  onPointerDown={(e) => { dragX.current = e.clientX; }}
                  onPointerMove={(e) => { if (dragX.current != null && Math.abs(e.clientX - dragX.current) > 26) { dragX.current = null; breakSeal(); } }}
                  onPointerUp={() => { dragX.current = null; }}>
            <img className="h l" src={imgSeal} alt="" draggable="false" />
            <img className="h r" src={imgSeal} alt="" draggable="false" />
          </button>
        </div>
        <p className="ht-handnote">{breaking ? "…" : "Rozlomte pečeť: klepněte, nebo ji táhněte do strany."}</p>
      </div>
    );
  }
  return (
    <div className="ht-stagebox">
      <article className="ht-letter" aria-label="Dopis Eleanor">
        <p className="ht-l-date">{STORY.letter.dateline}</p>
        {STORY.letter.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p className="ht-l-sig">{STORY.letter.signature}</p>
      </article>
    </div>
  );
}

// ---------------- fotografie ----------------
function PhotoDetail({ st, patch, snd, setTools }) {
  const [back, setBack] = useState(false);
  const zp = useZoomPan(!back);
  useEffect(() => { if ((zp.z > 0 || back) && !st.photoChecked) patch({ photoChecked: true }); }, [zp.z, back]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setTools(
      <>
        <button className="ht-round" onClick={() => { snd("paper"); setBack((b) => !b); zp.reset(); }} aria-label="Otočit fotografii">{Icon.flip}<span>Otočit</span></button>
        {!back && <button className="ht-round" onClick={() => zp.setZoom(zp.z + 1)} disabled={zp.z >= ZOOMS.length - 1} aria-label="Přiblížit">{Icon.plus}<span>Přiblížit</span></button>}
        {!back && <button className="ht-round" onClick={() => zp.setZoom(zp.z - 1)} disabled={zp.z === 0} aria-label="Oddálit">{Icon.minus}<span>Oddálit</span></button>}
      </>
    );
  }, [back, zp.z]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="ht-stagebox">
      <div className="ht-fit" style={{ "--r": PHOTO_RATIO }}>
        <div className={`ht-flip${back ? " is-back" : ""}`}>
          <div className="ht-face ht-photoface" aria-hidden={back}>
            <div className="ht-zoomwin" {...zp.handlers}>
              <img src={imgPhoto} alt="Sépiová fotografie: mladá žena s kufrem v přístavu, za ní velký parník se třemi komíny." draggable="false" style={zp.style} />
            </div>
          </div>
          <div className="ht-face ht-face-back ht-photoback" aria-hidden={!back}>
            <img src={imgPhotoBack} alt={`Zadní strana fotografie, rukou: ${STORY.photoBackText}`} draggable="false" />
          </div>
        </div>
      </div>
      {!back && zp.z === 0 && <p className="ht-handnote ht-under">Přibližte si detaily – kolečkem, prsty nebo lupou.</p>}
    </div>
  );
}

// ---------------- doklad + lampa ----------------
const GRID = { x: 6, y: 4 };
function DocDetail({ doc, st, patch, snd, say, setTools }) {
  const [side, setSide] = useState("front");            // front | back (u knížky: front = obálka, back = vnitřek)
  const [lampOn, setLampOn] = useState(false);
  const [lamp, setLamp] = useState({ x: 0.5, y: 0.5 });
  const [note, setNote] = useState("");
  const visited = useRef({});
  const faceRef = useRef(null);
  const designated = st.designated === doc.id;
  const isBook = doc.kind === "booklet";
  const inkHere = doc.correct && side === "back";
  const ratio = isBook && side === "back" ? doc.insideRatio : doc.ratio;
  const zp = useZoomPan(!lampOn);

  useEffect(() => { visited.current = {}; setNote(""); }, [side, lampOn]);
  useEffect(() => { if (!designated && lampOn) setLampOn(false); }, [designated, lampOn]);

  // sledování, kolik plochy hráč prosvítil (aby „nic tu není“ nezaznělo předčasně)
  const visit = (x, y) => {
    const k = `${Math.floor(x * GRID.x)}:${Math.floor(y * GRID.y)}`;
    visited.current[k] = true;
    const covered = Object.keys(visited.current).length / (GRID.x * GRID.y);
    if (inkHere) {
      const b = INK.box;
      if (!st.inkFound && x * 100 > b.left && x * 100 < b.left + b.width && y * 100 > b.top && y * 100 < b.top + b.height) {
        patch({ inkFound: true }); snd("found"); setNote(STORY.msg.inkFound); say(`Pod světlem lampy se objevil text: ${INK.line} Zašifrovaná zpráva: ${CIPHERTEXT}`);
      }
      return;
    }
    if (covered >= 0.55 && !note) {
      const wrongInside = !doc.correct && side === "back";
      setNote(wrongInside ? STORY.msg.docWrong : STORY.msg.docNothingSide);
      if (wrongInside && !st.wrongChecked.includes(doc.id)) patch({ wrongChecked: [...st.wrongChecked, doc.id] });
    }
  };
  const moveLamp = (cx, cy) => {
    const r = faceRef.current?.getBoundingClientRect(); if (!r) return;
    let x = (cx - r.left) / r.width, y = (cy - r.top) / r.height;
    x = Math.max(0, Math.min(1, x)); y = Math.max(0, Math.min(1, y));
    setLamp({ x, y }); visit(x, y);
  };

  useEffect(() => {
    setTools(
      <>
        <button className="ht-round" onClick={() => { snd("paper"); setSide((s) => (s === "front" ? "back" : "front")); zp.reset(); }}
                aria-label={isBook ? (side === "front" ? "Otevřít knížku" : "Zavřít knížku") : "Otočit doklad"}>
          {Icon.flip}<span>{isBook ? (side === "front" ? "Otevřít" : "Zavřít") : "Otočit"}</span>
        </button>
        <button className={`ht-round${designated ? " is-on" : ""}`} onClick={() => {
                  snd("tick");
                  if (designated) { patch({ designated: null }); setLampOn(false); setNote(""); return; }
                  const prev = st.designated && DOCS.find((d) => d.id === st.designated);
                  patch({ designated: doc.id });
                  setNote(prev ? `Označení přesunuto: Eleanořin je teď tenhle doklad, ne „${prev.title}“.` : "");
                }}
                aria-pressed={designated} aria-label={designated ? "Zrušit označení" : "Označit jako Eleanořin doklad"}>
          {Icon.mark}<span>{designated ? "Označeno" : "Je Eleanořin"}</span>
        </button>
        <button className={`ht-round${lampOn ? " is-on" : ""}${designated ? "" : " is-locked"}`} aria-disabled={!designated}
                onClick={() => {
                  if (!designated) { snd("wrong"); setLampOn(false); setNote(STORY.msg.lampNeedsDesignation); return; }
                  snd("lamp"); setLampOn((l) => !l);
                }} aria-pressed={lampOn} aria-label="Posvítit lampou">
          {Icon.bulb}<span>Lampa</span>
        </button>
        {!lampOn && <button className="ht-round" onClick={() => zp.setZoom(zp.z === ZOOMS.length - 1 ? 0 : zp.z + 1)} aria-label="Přiblížit">{Icon.plus}<span>{zp.z ? "×" + ZOOMS[zp.z] : "Přiblížit"}</span></button>}
      </>
    );
  }, [side, designated, st.designated, lampOn, zp.z]); // eslint-disable-line react-hooks/exhaustive-deps

  const img = side === "front" ? doc.front : (isBook ? doc.inside : doc.back);
  const inkVisible = inkHere && (st.inkFound || lampOn);
  const lampStyle = { "--lx": `${lamp.x * 100}%`, "--ly": `${lamp.y * 100}%` };

  return (
    <div className="ht-stagebox">
      <div className="ht-fit" style={{ "--r": ratio }}>
        <div className={`ht-docface${lampOn ? " lamp-on" : ""}`} ref={faceRef} style={lampStyle}
             onPointerDown={(e) => { if (lampOn) { e.currentTarget.setPointerCapture?.(e.pointerId); moveLamp(e.clientX, e.clientY); } }}
             onPointerMove={(e) => { if (lampOn && (e.buttons || e.pointerType === "mouse")) moveLamp(e.clientX, e.clientY); }}>
          <div className="ht-zoomwin" {...zp.handlers}>
            <img src={img} alt={side === "front" || isBook ? docAlt(doc) : "Zadní strana dokladu s natištěnými přepravními podmínkami."} draggable="false" style={zp.style} />
          </div>
          {inkVisible && (
            <div className={`ht-ink${st.inkFound ? " is-found" : ""}`} style={{ left: `${INK.box.left}%`, top: `${INK.box.top}%`, width: `${INK.box.width}%`, height: `${INK.box.height}%` }}>
              <p>{INK.line}</p>
              <p className="ht-ink-c">{CIPHERTEXT}</p>
            </div>
          )}
          {lampOn && <div className="ht-lampshade" />}
          {lampOn && (
            <div className="ht-lamphandle" style={{ left: `${lamp.x * 100}%`, top: `${lamp.y * 100}%` }} tabIndex={0} role="application"
                 aria-label="Světlo lampy. Šipkami ho posouvejte po dokladu."
                 onKeyDown={(e) => {
                   const d = { ArrowLeft: [-0.06, 0], ArrowRight: [0.06, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] }[e.key];
                   if (d) { e.preventDefault(); const x = Math.max(0, Math.min(1, lamp.x + d[0])), y = Math.max(0, Math.min(1, lamp.y + d[1])); setLamp({ x, y }); visit(x, y); }
                 }} />
          )}
        </div>
      </div>
      <p className="ht-handnote ht-under" role="status">
        {note || (lampOn ? "Posouvejte světlo po dokladu." : !designated ? STORY.msg.lampNeedsDesignation : "")}
      </p>
    </div>
  );
}

// ---------------- kotouč a přepis ----------------
function WheelDetail({ st, patch, snd, onSolve, setTools }) {
  const [fb, setFb] = useState("");
  const [shake, setShake] = useState(0);
  const [tried, setTried] = useState(null); // { offset, text, ok } – výsledek posledního „Zadat“
  const solving = useRef(false);
  const setOffset = (o) => { patch({ offset: o }); setFb(""); setTried(null); };
  useEffect(() => { setTools(null); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const decodeAll = (offset) => CIPHER_WORDS.map((w) => [...w].map((c) => decodeLetter(c, offset)).join("")).join(" ");
  const submit = () => {
    if (solving.current) return;
    const offset = st.offset;
    const text = decodeAll(offset);
    if (offset === CIPHER.key) {
      solving.current = true;
      setTried({ offset, text, ok: true }); setFb("");
      snd("chime");
      setTimeout(onSolve, 1400);
    } else {
      setTried({ offset, text, ok: false });
      setFb("Špatná odpověď.");
      setShake((n) => n + 1); patch({ attempts: st.attempts + 1 }); snd("wrong");
    }
  };

  return (
    <div className="ht-wheelgrid">
      <div className="ht-stagebox ht-wheelstage">
        <div className="ht-fit" style={{ "--r": 1 }}>
          <Wheel offset={st.offset} interactive cipherLetter={null} onChange={setOffset} onTick={() => snd("tick")} />
        </div>
      </div>
      <div className="ht-wheelside">
        <div className="ht-stepper">
          <button className="ht-round" onClick={() => { setOffset((st.offset + 25) % 26); snd("tick"); }} aria-label="Otočit o jedno místo zpět">−</button>
          <div className="ht-stepval">Posun<b>{st.offset}</b></div>
          <button className="ht-round" onClick={() => { setOffset((st.offset + 1) % 26); snd("tick"); }} aria-label="Otočit o jedno místo dál">+</button>
        </div>
        {!st.inkFound ? (
          <div className="ht-notebook"><p className="ht-nb-empty">{STORY.msg.noCipherYet}</p></div>
        ) : (
          <div className="ht-notebook">
            <p className="ht-nb-ink">„{INK.line}“</p>
            <div className="ht-strip">
              {(() => { let idx = 0; return CIPHER_WORDS.map((w, wi) => (
                <div className="ht-word" key={wi}>
                  {[...w].map((c) => {
                    const i = idx++;
                    const ch = tried ? decodeLetter(c, tried.offset) : " ";
                    return (
                      <div key={i} className={`ht-cell${tried?.ok ? " ok" : ""}`} aria-label={`Písmeno šifry ${c}, pozice ${i + 1}. ${tried ? `Přepsáno jako ${ch}.` : "Zatím nepřepsáno."}`}>
                        <span className="c">{c}</span><span className="p">{ch}</span>
                      </div>
                    );
                  })}
                </div>
              )); })()}
            </div>
            <div key={shake} className={`ht-fb${shake ? " shake" : ""}`} role="status">{fb}</div>
            <div className="ht-checkrow">
              <button className="ht-tagbtn" disabled={tried?.ok} onClick={submit}>Zadat posun {st.offset}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- odhalení ----------------
function RevealView({ rm, offset, onContinue }) {
  const [ready, setReady] = useState(rm);
  const words = CIPHER.display.split(" ");
  const lines = [words[0], words.slice(1, 3).join(" "), words[3], words[4]];
  useEffect(() => {
    if (rm) { setReady(true); return; }
    const t = setTimeout(() => setReady(true), CIPHER.display.length * 90 + 1800);
    return () => clearTimeout(t);
  }, [rm]);
  let n = 0;
  return (
    <div className="ht-reveal">
      <div className="ht-reveal-glow" />
      <div className="ht-reveal-wheel"><Wheel offset={offset} /></div>
      <p className="ht-kicker">Zpráva rozluštěna</p>
      <h2 className="ht-msg" aria-label={CIPHER.display}>
        {lines.map((l, i) => (
          <span key={i} className={`ht-msgline${i >= 2 ? " red" : ""}`} aria-hidden="true">
            {[...l].map((c, k) => <span key={k} className="ht-letterin" style={{ animationDelay: `${800 + (n++) * 90}ms` }}>{c}</span>)}
          </span>
        ))}
      </h2>
      {ready && STORY.revealAfter && <p className="ht-reveal-after ht-fadein">{STORY.revealAfter}</p>}
      {ready && <button className="ht-tagbtn ht-fadein" onClick={onContinue}>Pokračovat</button>}
    </div>
  );
}

// ---------------- spis ----------------
function FileView({ st, onContinue, onDesk, onReset, onSuspects, showReset }) {
  return (
    <div className="ht-file">
      <div className="ht-casefile">
        <p className="ht-fkicker">Důkaz 01</p>
        <dl>
          <dt>Důkaz</dt><dd>{STORY.file.evidence}</dd>
          <dt>Zjištění</dt><dd className="red">{STORY.file.finding}</dd>
          <dt>Stav</dt><dd>{STORY.file.status}</dd>
          <dt>Další úkol</dt><dd>{STORY.file.nextTask}</dd>
          <dt>Záznam vyšetřování</dt><dd className="small">Nápovědy {st.hintsUsed} ze 3, chybně určené doklady {st.wrongChecked.length}, pokusy o přepis {st.attempts + 1}</dd>
        </dl>
        <div className="ht-stamp">{STORY.file.closing.map((l, i) => <span key={i}>{l}</span>)}</div>
      </div>
      <div className="ht-filebtns">
        <button className="ht-tagbtn" onClick={onContinue}>Pokračovat do hry</button>
        <button className="ht-tagbtn alt" onClick={onSuspects}>Přehrát představení podezřelých</button>
        <button className="ht-tagbtn alt" onClick={onDesk}>Vrátit se ke stolu</button>
      </div>
      {showReset && <button className="ht-linkbtn ht-reset" onClick={onReset}>začít úkol znovu (test)</button>}
    </div>
  );
}

// =====================================================================
export default function HomeTask({ showReset = false, alreadySolved = false, resetToken = null, onSolved, onExit, onContinue }) {
  const [st, setSt] = useState(() => load(alreadySolved));
  const patch = (p) => setSt((s) => ({ ...s, ...(typeof p === "function" ? p(s) : p) }));
  const rm = useReducedMotion();
  const snd = (k) => play(k, st.sound);
  const [hintOpen, setHintOpen] = useState(false);
  const [live, setLive] = useState("");
  const [nudge, setNudge] = useState(null);
  const [tools, setTools] = useState(null);
  const solvedSent = useRef(alreadySolved);

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify({ v: 2, s: st })); } catch { /* ignore */ } }, [st]);
  // administrace vrátila úkol jako nevyřešený → začít znovu (každý reset jen jednou)
  useEffect(() => {
    if (resetToken && st.resetSeen !== resetToken) {
      solvedSent.current = alreadySolved;
      setSt({
        ...DEFAULT(), sound: st.sound, resetSeen: resetToken,
        // po resetu už hráč úkol znovu vyřešil (např. na jiném zařízení) → rovnou spis
        ...(alreadySolved ? { solved: true, sealBroken: true, photoChecked: true, inkFound: true, stage: "file", intro: false } : {}),
      });
    }
  }, [resetToken]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (alreadySolved && !st.solved) { solvedSent.current = true; patch({ solved: true, sealBroken: true, photoChecked: true, inkFound: true, stage: "file", intro: false }); }
  }, [alreadySolved]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (import.meta.env?.DEV) {
      const p = verifyCipher(CIPHER, SHIFT_FEEDBACK, DOCS);
      if (p.length) console.error("[hometask] rozpor v konfiguraci šifry:", p);
    }
  }, []);
  useEffect(() => {
    const f = (e) => { if (e.key === "Escape") { if (hintOpen) setHintOpen(false); else if (st.open) patch({ open: null }); } };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [hintOpen, st.open]);

  // po 90 s nečinnosti na stole jemně zvýrazni další krok
  useEffect(() => {
    setNudge(null);
    if (st.open || st.stage !== "desk" || st.intro) return;
    const t = setTimeout(() => setNudge(!st.sealBroken ? "letter" : !st.photoChecked ? "photo" : !st.inkFound ? "docs" : "wheel"), 90000);
    return () => clearTimeout(t);
  }, [st.open, st.stage, st.intro, st.sealBroken, st.photoChecked, st.inkFound]);

  const openObj = (o) => { snd("paper"); setTools(null); patch({ open: o }); };
  const closeObj = () => { setTools(null); patch({ open: null }); };
  const solve = () => {
    patch({ solved: true, stage: "reveal", open: null });
    if (!solvedSent.current) {
      solvedSent.current = true;
      onSolved?.({ hintsUsed: st.hintsUsed, wrongDocs: st.wrongChecked.length, attempts: st.attempts + 1 });
    }
  };
  const reset = () => {
    if (!window.confirm("Začít minihru znovu od začátku? (hodí se pro testování)")) return;
    try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ }
    solvedSent.current = true;
    setSt({ ...DEFAULT(), sound: st.sound });
  };

  const progress = [st.sealBroken, st.photoChecked, st.inkFound, st.solved];
  const openDoc = st.open?.startsWith("doc:") ? DOCS.find((d) => d.id === st.open.slice(4)) : null;
  const detailTitle = { letter: "Dopis", photo: "Fotografie", wheel: "Mosazný kotouč" }[st.open] || (openDoc ? openDoc.title : "");

  return (
    <div className="ht">
      <div className="ht-table" />
      <div className="ht-lamplight" />
      <div className="ht-vignette" />

      {st.stage === "desk" && (
        <>
          <header className="ht-top">
            <button className="ht-exit" onClick={onExit} aria-label="Opustit domácí úkol a vrátit se do hry">Do hry</button>
            <div className="ht-title">
              <span className="ht-kicker">{STORY.caseName}</span>
              <h1>{STORY.title}</h1>
              <span className="ht-pips" aria-label={`Postup ${progress.filter(Boolean).length} ze 4`}>
                {progress.map((p, i) => <i key={i} className={p ? "on" : ""} />)}
              </span>
            </div>
            <div className="ht-topr">
              <button className="ht-hintbtn" onClick={() => setHintOpen((o) => !o)} aria-expanded={hintOpen}>
                <span className="ht-ico">{Icon.bulb}</span>Nápověda{st.hintsUsed ? ` ${st.hintsUsed} ze 3` : ""}
              </button>
              <button className="ht-iconbtn" onClick={() => { patch({ sound: !st.sound }); play("tick", !st.sound); }}
                      aria-pressed={st.sound} aria-label={st.sound ? "Vypnout zvuky" : "Zapnout zvuky"}>{st.sound ? Icon.sound : Icon.mute}</button>
            </div>
          </header>
          <Desk st={st} onOpen={openObj} nudge={nudge} />
        </>
      )}

      {st.stage === "desk" && st.open && (
        <div className="ht-detail" role="dialog" aria-label={detailTitle}>
          <div className="ht-dhead">
            <button className="ht-exit" onClick={closeObj}>Zpět na stůl</button>
            <span className="ht-kicker">{detailTitle}</span>
            <button className="ht-hintbtn" onClick={() => setHintOpen((o) => !o)} aria-expanded={hintOpen}><span className="ht-ico">{Icon.bulb}</span>Nápověda</button>
          </div>
          <div className="ht-dbody">
            {st.open === "letter" && <LetterDetail st={st} patch={patch} snd={snd} rm={rm} say={setLive} />}
            {st.open === "photo" && <PhotoDetail st={st} patch={patch} snd={snd} setTools={setTools} />}
            {openDoc && <DocDetail key={openDoc.id} doc={openDoc} st={st} patch={patch} snd={snd} say={setLive} setTools={setTools} />}
            {st.open === "wheel" && <WheelDetail st={st} patch={patch} snd={snd} onSolve={solve} setTools={setTools} />}
          </div>
          {tools && <div className="ht-tools">{tools}</div>}
        </div>
      )}

      {hintOpen && st.stage === "desk" && (
        <div className="ht-hintpanel" role="dialog" aria-label="Nápověda">
          <h3>Nápověda</h3>
          {st.hintsUsed === 0 && <p className="none">Zatím jste žádnou nápovědu nepoužili. Zkuste to nejdřív sami.</p>}
          {STORY.hints.slice(0, st.hintsUsed).map((h, i) => <p key={i}><b>{i + 1}.</b> {h}</p>)}
          <div className="row">
            <button className="ht-linkbtn" onClick={() => setHintOpen(false)}>Zavřít</button>
            {st.hintsUsed < STORY.hints.length && <button className="ht-tagbtn small" onClick={() => patch({ hintsUsed: st.hintsUsed + 1 })}>Odhalit nápovědu {st.hintsUsed + 1} ze 3</button>}
          </div>
        </div>
      )}

      {st.stage === "reveal" && <RevealView rm={rm} offset={st.offset} onContinue={() => { snd("paper"); patch({ stage: "suspects" }); }} />}
      {st.stage === "suspects" && <GameIntro scenes={SUSPECT_SCENES} finishLabel="Otevřít spis" onDone={() => patch({ stage: "file" })} />}
      {st.stage === "file" && <FileView st={st} onContinue={onContinue} onDesk={() => patch({ stage: "desk", open: null })} onReset={reset} showReset={showReset} onSuspects={() => patch({ stage: "suspects" })} />}
      {st.intro && st.stage === "desk" && <IntroView rm={rm} onStart={() => { snd("paper"); patch({ intro: false }); }} />}

      <div className="ht-sr" aria-live="polite">{live}</div>
    </div>
  );
}
