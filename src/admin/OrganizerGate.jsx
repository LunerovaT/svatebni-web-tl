import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase.js";

// Přihlášení organizátorů přes Firebase Authentication (e-mail + heslo). Hesla nejsou v kódu.
// Účty se zakládají v konzoli Firebase (Authentication → Users), viz README.
const ERR = {
  "auth/invalid-credential": "Špatný e-mail nebo heslo.",
  "auth/invalid-email": "Zkontrolujte tvar e-mailu.",
  "auth/user-not-found": "Špatný e-mail nebo heslo.",
  "auth/wrong-password": "Špatný e-mail nebo heslo.",
  "auth/too-many-requests": "Příliš mnoho pokusů. Zkuste to za chvíli.",
  "auth/network-request-failed": "Chybí připojení k internetu.",
  "auth/operation-not-allowed": "Přihlášení e-mailem není ve Firebase zapnuté (Authentication → Sign-in method).",
};

export default function OrganizerGate({ label, title, children }) {
  const [user, setUser] = useState(undefined); // undefined = zjišťuje se
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { await signInWithEmailAndPassword(auth, email.trim(), pw); setPw(""); }
    catch (x) { setErr(ERR[x.code] || "Přihlášení se nepovedlo. (" + (x.code || x.message) + ")"); }
    finally { setBusy(false); }
  };

  if (user === undefined) return <section className="block"><div className="wrap"><p style={{ color: "#6b6153" }}>Chvilku…</p></div></section>;

  if (!user) {
    return (
      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="case-card" style={{ maxWidth: 400 }}>
            <p className="case-label">{label}</p>
            <h1 className="display" style={{ fontSize: 30, margin: "0 0 16px" }}>{title}</h1>
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="field"><label htmlFor="og-mail">E-mail</label><input id="og-mail" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
              <div className="field"><label htmlFor="og-pw">Heslo</label><input id="og-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
              {err && <p role="alert" style={{ color: "#a8342a", fontSize: 13.5, margin: 0 }}>{err}</p>}
              <button type="submit" className="btn" disabled={busy || !email || !pw} style={{ alignSelf: "flex-start" }}>{busy ? "Chvilku…" : "Vstoupit"}</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <div style={{ background: "#221D16", color: "#d9cbae", fontSize: 12.5, padding: "6px 16px", display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
        <span>Přihlášen: {user.email}</span>
        <button type="button" onClick={() => signOut(auth)} style={{ background: "none", border: "1px solid rgba(217,203,174,.5)", color: "#d9cbae", borderRadius: 3, padding: "3px 10px", cursor: "pointer", font: "inherit" }}>Odhlásit</button>
      </div>
      {children}
    </>
  );
}
