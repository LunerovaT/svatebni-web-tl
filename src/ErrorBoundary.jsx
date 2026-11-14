import { Component } from "react";

// Záchranná síť: když se některá část appky rozbije, hráč uvidí srozumitelnou zprávu místo prázdné stránky.
export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error("Chyba aplikace:", error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#150e0a", color: "#e9dcc0", textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontFamily: "'Special Elite', monospace", fontWeight: 400, fontSize: 28, margin: "0 0 12px", color: "#f3e9d2" }}>Něco se pokazilo</h1>
          <p style={{ lineHeight: 1.6, margin: "0 0 22px" }}>Stránku se nepodařilo zobrazit. Postup týmu je v bezpečí, stačí ji načíst znovu.</p>
          <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 8, padding: "12px 24px", font: "600 16px 'IBM Plex Sans', sans-serif", color: "#2a1d08", background: "linear-gradient(#e6cb85,#b8913f)", cursor: "pointer" }}>Načíst znovu</button>
        </div>
      </div>
    );
  }
}
