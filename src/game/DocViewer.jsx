import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Náhled dokumentu s možností zvětšení (PC i mobil): klepnutí / tlačítko otevře celoobrazovkový prohlížeč.
export function DocThumb({ src, alt, wide, label = "Zvětšit a přečíst", className = "", children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`dv-thumb ${className}`} onClick={() => setOpen(true)} aria-label={`${label}: ${alt}`}>
        <img className={`dv-img${wide ? " wide" : ""}`} src={src} alt={alt} draggable="false" />
        {children}
        <span className="dv-hint"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M15 15l6 6M10 7v6M7 10h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>{label}</span>
      </button>
      {open && <DocLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

const LEVELS = [1, 1.7, 2.5];

function DocLightbox({ src, alt, onClose }) {
  const [z, setZ] = useState(0);
  const closeRef = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const k = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key === "+" || e.key === "=") setZ((v) => Math.min(LEVELS.length - 1, v + 1));
      if (e.key === "-") setZ((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", k, true);
    return () => { window.removeEventListener("keydown", k, true); document.body.style.overflow = prev; };
  }, [onClose]);
  const level = LEVELS[z];
  return createPortal(
    <div className="dv-box" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <div className="dv-bar" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => setZ((v) => Math.max(0, v - 1))} disabled={z === 0} aria-label="Zmenšit">−</button>
        <span aria-live="polite">{Math.round(level * 100)} %</span>
        <button type="button" onClick={() => setZ((v) => Math.min(LEVELS.length - 1, v + 1))} disabled={z === LEVELS.length - 1} aria-label="Zvětšit">+</button>
        <button ref={closeRef} type="button" className="dv-close" onClick={onClose} aria-label="Zavřít">Zavřít ×</button>
      </div>
      <div className="dv-scroll" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <img
          className="dv-big" src={src} alt={alt} draggable="false"
          style={{ "--z": level }}
          onClick={(e) => { e.stopPropagation(); setZ((v) => (v + 1) % LEVELS.length); }}
        />
      </div>
      <p className="dv-tip">Klepnutím na dopis ho přiblížíte, tažením se po něm pohybujete.</p>
    </div>,
    document.body
  );
}
