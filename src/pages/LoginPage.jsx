import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { authMsg } from "../authMessages.js";

// Přihlášení hosta do profilu (e-mail + heslo, stejné jako při potvrzení účasti).
export default function LoginPage({ go }) {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formInfo, setFormInfo] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  const submitLogin = async (e) => {
    e.preventDefault();
    if (!contact.trim() || !password) { setFormError("Zadejte e-mail a heslo."); return; }
    setFormError(""); setFormInfo("");
    setFormBusy(true);
    try {
      await signInWithEmailAndPassword(auth, contact.trim().toLowerCase(), password);
      setPassword("");
    } catch (err) {
      setFormError(authMsg(err));
    } finally {
      setFormBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!contact.trim()) { setFormError("Napište nahoře e-mail a klikněte znovu."); return; }
    setFormError(""); setFormInfo("");
    try {
      await sendPasswordResetEmail(auth, contact.trim().toLowerCase());
      setFormInfo("Poslali jsme vám e-mail s odkazem na nové heslo (zkontrolujte i spam).");
    } catch (err) { setFormError(authMsg(err)); }
  };

  return (
    <section className="pb-sec" style={{ paddingTop: 56 }}>
      <div className="wrap pb-login">
        <h1 className="display pb-h1s">Můj profil</h1>
        <p className="lede" style={{ marginBottom: 18 }}>Přihlaste se e-mailem a heslem, které jste zadali při potvrzení účasti. Uvidíte tam svou odpověď a od nás potvrzené ubytování a jídlo.</p>
        <form onSubmit={submitLogin} className="pb-form">
          <div className="field">
            <label>E-mail</label>
            <input type="email" autoComplete="username" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="jana@example.cz" />
          </div>
          <div className="field">
            <label>Heslo</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {formInfo && <p style={{ color: "#3a5a3a", fontSize: 13.5, margin: 0 }}>{formInfo}</p>}
          {formError && <p style={{ color: "#a8342a", fontSize: 13.5, margin: 0 }}>{formError}</p>}
          <button type="submit" className="pb-btn solid" disabled={formBusy}>{formBusy ? "Chvilku…" : "Přihlásit se"}</button>
          <button type="button" className="pb-linkbtn" onClick={resetPassword}>Zapomněla/a jsem heslo</button>
          <button type="button" className="pb-linkbtn" onClick={() => go("rsvp")}>Ještě jste nepotvrdili účast? Potvrdit účast</button>
        </form>
      </div>
    </section>
  );
}
