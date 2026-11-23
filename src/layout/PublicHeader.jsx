import { useState } from "react";
import { NAV_ITEMS } from "../navItems.js";
import { DATES } from "../public/venue.js";

// Horní lišta veřejného webu včetně mobilního menu.
export default function PublicHeader({ go, page, rsvpConfirmed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header className="pb-top">
        <a className="pb-gamebar" href="#/hra" onClick={(e) => { e.preventDefault(); go("hra"); }}>
          <span className="pb-gamebar-dot" aria-hidden="true" />
          <span><b>Případ poslední vůle</b><span className="pb-gamebar-long"> · svatební detektivka pro hosty</span></span>
          <span className="pb-gamebar-go">Zahrát si →</span>
        </a>
        <div className="wrap" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span className="display" style={{ fontSize: 22, letterSpacing: "0.05em" }}>L · T</span>
            <span style={{ fontSize: 12, color: "#6b6153" }}>{DATES.label}</span>
          </div>
          <nav className="links" style={{ display: "flex", gap: 30, alignItems: "center" }}>
            {NAV_ITEMS.map((n) => (
              <a key={n.id} href={"#/" + (n.id === "home" ? "" : n.id)}
                 className={(page === n.id ? "active " : "") + (n.id === "hra" ? "pb-nav-game" : "")}
                 onClick={(e) => { e.preventDefault(); go(n.id); }}>
                {n.doneLabel && rsvpConfirmed ? n.doneLabel : n.label}
              </a>
            ))}
          </nav>
          <button onClick={() => setMobileOpen(true)} style={{ display: "none", border: "none", background: "none" }} className="burger-btn">☰</button>
        </div>
      </header>
      
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, top: 104, background: "#F6F0E3", zIndex: 39, padding: "30px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          {NAV_ITEMS.map((n) => (
            <a key={n.id} href={"#/" + (n.id === "home" ? "" : n.id)} className="display"
               style={{ fontSize: 26, textDecoration: "none", color: n.id === "hra" ? "#93713c" : "#221D16", fontWeight: n.id === "hra" ? 600 : 500 }}
               onClick={(e) => { e.preventDefault(); go(n.id); setMobileOpen(false); }}>
              {n.doneLabel && rsvpConfirmed ? n.doneLabel : n.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
