import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { authMsg } from "../authMessages.js";
import { DATES, VENUE } from "../public/venue.js";
import cluster from "../assets/cluster.webp";
import SleepChecks from "./SleepChecks.jsx";

const newGuest = () => ({ name: "", sleep: "ano", sleepRank: [], travel: "same", travelFrom: "", dietYes: false, diet: "" });

// Potvrzení účasti (sjednocené se založením herního účtu). Stav formuláře je uvnitř; rodič řeší jen přesměrování a "už potvrzeno".
export default function RsvpPage({ go, authUid, needRsvp, setNeedRsvp, rsvpConfirmed, rsvpAgain, setRsvpAgain, myRsvp, onSent }) {
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpPw, setRsvpPw] = useState("");
  const [rsvpAttending, setRsvpAttending] = useState("ano");
  const [rsvpGame, setRsvpGame] = useState("ano");
  const [sleepWants, setSleepWants] = useState("ano");
  const [sleepRank, setSleepRank] = useState([]); // zaškrtnuté možnosti přespání (v poli sleepRank kvůli pravidlům databáze)
  const [travel, setTravel] = useState("auto");
  const [travelFrom, setTravelFrom] = useState("");
  const [dietYes, setDietYes] = useState(false);
  const [diet, setDiet] = useState("");
  const [comment, setComment] = useState("");
  const [guests, setGuests] = useState([]);
  const addGuest = () => setGuests((g) => (g.length >= 8 ? g : [...g, newGuest()]));
  const setGuest = (i, patch) => setGuests((g) => g.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeGuest = (i) => setGuests((g) => g.filter((_, j) => j !== i));
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpDone, setRsvpDone] = useState(false);

  const submitRsvp = async (e) => {
    e.preventDefault();
    if (!rsvpName.trim()) { setRsvpError("Vyplňte prosím jméno."); return; }
    if (!rsvpEmail.trim()) { setRsvpError("Vyplňte prosím e-mail — přihlašujete se jím do svého profilu."); return; }
    if (rsvpAttending === "ano" && rsvpPw.length < 6) { setRsvpError("Zvolte si prosím heslo k profilu (aspoň 6 znaků)."); return; }
    if (rsvpAttending === "ano" && sleepWants === "ano" && sleepRank.length === 0) { setRsvpError("Zaškrtněte prosím aspoň jednu možnost přespání, nebo zvolte „Nechci přespat“."); return; }
    if (rsvpAttending === "ano" && dietYes && !diet.trim()) { setRsvpError("Napište prosím, jaké máte dietní omezení, nebo zvolte „Žádná“."); return; }
    const badDiet = rsvpAttending === "ano" ? guests.find((g) => g.dietYes && !g.diet.trim()) : null;
    if (badDiet) { setRsvpError(`U osoby ${badDiet.name.trim() || "navíc"} napište prosím dietní omezení, nebo zvolte „Žádná“.`); return; }
    if (rsvpAttending === "ano" && guests.some((g) => !g.name.trim())) { setRsvpError("Doplňte prosím jména všech přidaných osob, nebo je odeberte."); return; }
    const badGuest = rsvpAttending === "ano" ? guests.find((g) => g.sleep === "ano" && g.sleepRank.length === 0) : null;
    if (badGuest) { setRsvpError(`U osoby ${badGuest.name.trim()} zaškrtněte aspoň jednu možnost přespání, nebo zvolte „Nepřespí“.`); return; }
    setRsvpError("");
    setRsvpBusy(true);
    try {
      const email = rsvpEmail.trim().toLowerCase();
      let uid = null;
      if (rsvpAttending === "ano") {
        // účet (e-mail + heslo) = osobní profil se souhrnem; kdo už účet má, přihlásí se stejným heslem
        try {
          uid = (await createUserWithEmailAndPassword(auth, email, rsvpPw)).user.uid;
        } catch (ex) {
          if (ex.code === "auth/email-already-in-use") {
            try { uid = (await signInWithEmailAndPassword(auth, email, rsvpPw)).user.uid; }
            catch { setRsvpError("Pro tenhle e-mail už účet existuje. Zadejte své stávající heslo, nebo si ho obnovte v sekci Můj profil."); return; }
          } else { setRsvpError(authMsg(ex)); return; }
        }
      }
      await addDoc(collection(db, "rsvps"), {
        name: rsvpName.trim(),
        contact: email,
        attending: rsvpAttending,
        wantsGame: rsvpGame,
        ...(rsvpAttending === "ano" ? {
          sleep: sleepWants,
          sleepRank: sleepWants === "ano" ? sleepRank : [],
          diet: dietYes ? diet.trim().slice(0, 300) : "",
          travel,
          travelFrom: travel === "odvoz" ? travelFrom.trim().slice(0, 120) : "",
          guests: guests.slice(0, 8).map((g) => ({
            name: g.name.trim().slice(0, 120),
            sleep: g.sleep,
            sleepRank: g.sleep === "ano" ? g.sleepRank : [],
            travel: g.travel,
            travelFrom: g.travel === "odvoz" ? g.travelFrom.trim().slice(0, 120) : "",
            diet: g.dietYes ? g.diet.trim().slice(0, 300) : "",
          })),
        } : {}),
        ...(comment.trim() ? { comment: comment.trim().slice(0, 1000) } : {}),
        createdAt: serverTimestamp(),
      });
      if (uid) {
        // profil hosta; když už existuje (opakované odeslání), jen aktualizujeme volbu hry
        const ref = doc(db, "players", uid);
        try { await updateDoc(ref, { wantsGame: rsvpGame, name: rsvpName.trim() }); }
        catch { await setDoc(ref, { name: rsvpName.trim(), contact: email, wantsGame: rsvpGame, teamId: null, homeClueSolved: false, createdAt: serverTimestamp() }); }
      }
      setRsvpPw("");
      try { localStorage.setItem("rsvp_sent", "1"); } catch { /* bez ukládání */ }
      setRsvpDone(true);
      setRsvpAgain(false);
      setNeedRsvp(false);
      onSent();
    } catch (err) {
      setRsvpError("Něco se nepovedlo, zkuste to prosím znovu. (" + err.message + ")");
    } finally {
      setRsvpBusy(false);
    }
  };

  return (

          <section className="pb-sec" style={{ position: "relative", overflow: "hidden", paddingTop: 56 }}>
            <img src={cluster} alt="" style={{ position: "absolute", opacity: 0.12, left: "-16%", bottom: "-25%", width: 560, transform: "scaleX(-1)", pointerEvents: "none", mixBlendMode: "multiply" }} />
            <div className="wrap" style={{ position: "relative", maxWidth: 560 }}>
              <div style={{ marginBottom: 18 }}>
                <h1 className="display pb-h1s">Potvrdit účast</h1>
                <p className="lede">Dejte nám vědět, zda dorazíte, kde budete spát a jak se k nám dopravíte, a jestli se přidáte i do hry. Termín: {DATES.long}, {VENUE.name}.</p>
                {!authUid && needRsvp && <p className="pb-guests-note" style={{ marginTop: 10 }}>Do hry se dostanete po potvrzení účasti. Stačí vyplnit dotazník a u otázky „Chci hrát detektivku“ nechat Ano, profil hráče se vytvoří sám.</p>}
                {!authUid && <p className="pb-guests-note" style={{ marginTop: 8 }}>Už máte účet? <button type="button" className="pb-linkbtn" onClick={() => go("profil")}>Přihlásit se</button></p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
                {!rsvpDone && (!rsvpConfirmed || rsvpAgain) ? (
                  <form onSubmit={submitRsvp} className="pb-form">
                    <div className="field">
                      <label>Jméno a příjmení</label>
                      <input type="text" maxLength={120} value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" maxLength={160} value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} placeholder="jana@example.cz" />
                    </div>
                    <div className="field">
                      <label>Zúčastním se</label>
                      <select value={rsvpAttending} onChange={(e) => setRsvpAttending(e.target.value)}>
                        <option value="ano">Ano, s radostí</option>
                        <option value="ne">Bohužel ne</option>
                      </select>
                    </div>
                    {rsvpAttending === "ano" && (<>
                    <div className="field">
                      <label>Chci přespat</label>
                      <select value={sleepWants} onChange={(e) => setSleepWants(e.target.value)}>
                        <option value="ano">Ano</option>
                        <option value="ne">Nechci přespat</option>
                      </select>
                    </div>
                    {sleepWants === "ano" && (
                      <div className="field">
                        <label>Co vám vyhovuje? Zaškrtněte všechno, co platí.</label>
                        <SleepChecks value={sleepRank} onChange={setSleepRank} />
                        <p className="pb-rank-note">Podle toho budeme přidělovat pokoje.</p>
                      </div>
                    )}
                    <div className="field">
                      <label>Doprava</label>
                      <select value={travel} onChange={(e) => setTravel(e.target.value)}>
                        <option value="auto">Dojedu autem</option>
                        <option value="odvoz">Potřebuji odvést</option>
                        <option value="jinak">Jedu jinak</option>
                      </select>
                      {travel === "odvoz" && <input type="text" maxLength={120} value={travelFrom} onChange={(e) => setTravelFrom(e.target.value)} placeholder="Odkud (město, zastávka)?" style={{ marginTop: 6 }} />}
                    </div>
                    <div className="field">
                      <label>Dietní omezení nebo alergie</label>
                      <select value={dietYes ? "ano" : "ne"} onChange={(e) => setDietYes(e.target.value === "ano")}>
                        <option value="ne">Žádná</option>
                        <option value="ano">Ano, mám</option>
                      </select>
                      {dietYes && <input type="text" maxLength={300} value={diet} onChange={(e) => setDiet(e.target.value)} placeholder="Jaká? (vegetarián, bezlepkové, alergie na ořechy…)" style={{ marginTop: 6 }} />}
                    </div>
                    <div className="field pb-guests">
                      <label>Registruji i další osoby</label>
                      <p className="pb-guests-note">Hodí se, když vyplňujete za celou skupinu (partner, děti, babička, teta…). Za každou osobu vyplníte stejné údaje jako za sebe, ať víme, jak se kdo k nám dostane a kde bude spát.</p>
                      {guests.map((g, i) => (
                        <div className="pb-guest" key={i}>
                          <div className="pb-guest-head">
                            <input type="text" maxLength={120} value={g.name} onChange={(e) => setGuest(i, { name: e.target.value })} placeholder={"Jméno a příjmení osoby " + (i + 2)} />
                            <button type="button" className="pb-guest-x" aria-label="Odebrat osobu" onClick={() => removeGuest(i)}>×</button>
                          </div>
                          <div className="pb-gf">
                            <label>Přespání</label>
                            <select value={g.sleep} onChange={(e) => setGuest(i, { sleep: e.target.value })}>
                              <option value="ano">Chce přespat</option>
                              <option value="ne">Nepřespí</option>
                            </select>
                          </div>
                          {g.sleep === "ano" && (
                            <div className="pb-gf">
                              <label>Co mu/jí vyhovuje? Zaškrtněte všechno, co platí.</label>
                              <SleepChecks value={g.sleepRank} onChange={(v) => setGuest(i, { sleepRank: v })} />
                            </div>
                          )}
                          <div className="pb-gf">
                            <label>Doprava</label>
                            <select value={g.travel} onChange={(e) => setGuest(i, { travel: e.target.value })}>
                              <option value="same">Jede se mnou</option>
                              <option value="auto">Dojede vlastním autem</option>
                              <option value="odvoz">Potřebuje odvést</option>
                              <option value="jinak">Jede jinak</option>
                            </select>
                            {g.travel === "odvoz" && <input type="text" maxLength={120} value={g.travelFrom} onChange={(e) => setGuest(i, { travelFrom: e.target.value })} placeholder="Odkud (město, zastávka)?" />}
                          </div>
                          <div className="pb-gf">
                            <label>Dietní omezení nebo alergie</label>
                            <select value={g.dietYes ? "ano" : "ne"} onChange={(e) => setGuest(i, { dietYes: e.target.value === "ano" })}>
                              <option value="ne">Žádná</option>
                              <option value="ano">Ano, má</option>
                            </select>
                            {g.dietYes && <input type="text" maxLength={300} value={g.diet} onChange={(e) => setGuest(i, { diet: e.target.value })} placeholder="Jaká?" />}
                          </div>
                        </div>
                      ))}
                      {guests.length < 8 && <button type="button" className="pb-btn pb-btn-add" onClick={addGuest}>+ Přidat další osobu</button>}
                    </div>
                    <div className="field">
                      <label>Heslo k vašemu profilu</label>
                      <input type="password" autoComplete="new-password" minLength={6} value={rsvpPw} onChange={(e) => setRsvpPw(e.target.value)} placeholder="aspoň 6 znaků" />
                      <p className="pb-guests-note" style={{ marginTop: 6 }}>S e-mailem a heslem se pak přihlásíte do profilu: uvidíte tam svou odpověď a od nás potvrzené ubytování a jídlo. Heslo si zapamatujte.</p>
                    </div>
                    </>)}
                    <div className="field">
                      <label>Chci hrát detektivku</label>
                      <select value={rsvpGame} onChange={(e) => setRsvpGame(e.target.value)}>
                        <option value="ano">Ano</option>
                        <option value="ne">Ne, díky</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Vzkaz nebo cokoli dalšího (nepovinné)</label>
                      <textarea rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Cokoli, co bychom měli vědět…" />
                    </div>
                    {rsvpError && <p style={{ color: "#a8342a", fontSize: 13.5, margin: 0 }}>{rsvpError}</p>}
                    <button type="submit" className="pb-btn solid" disabled={rsvpBusy}>
                      {rsvpBusy ? "Chvilku…" : "Potvrdit účast"}
                    </button>
                  </form>
                ) : !rsvpDone ? (
                  <div className="pb-thanks">
                    <p style={{ margin: "0 0 8px", fontWeight: 500 }}>Vaše účast už je potvrzená{myRsvp?.name ? `, ${myRsvp.name}` : ""}.</p>
                    <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "#6b6153" }}>Odpověď znovu odesílat nemusíte. Souhrn a případné změny najdete v sekci Můj profil. Pokud se chcete změnit, napište nám.</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                      <button type="button" className="pb-btn solid" onClick={() => go("profil")}>Otevřít můj profil</button>
                      <button type="button" className="pb-linkbtn" onClick={() => setRsvpAgain(true)} style={{ background: "none", border: 0, padding: 0, color: "#6b6153", textDecoration: "underline", cursor: "pointer", font: "inherit", fontSize: 14 }}>Potvrdit účast za někoho dalšího</button>
                    </div>
                  </div>
                ) : (
                  <div className="pb-thanks">
                    <p style={{ margin: "0 0 8px", fontWeight: 500 }}>Díky, {rsvpName}{guests.length > 0 ? ` a další (${guests.length})` : ""}!</p>
                    <p style={{ margin: 0, fontSize: 14.5, color: "#6b6153" }}>
                      {rsvpAttending === "ano"
                        ? "Vaše potvrzení účasti i profil jsou založené. V sekci Můj profil se přihlásíte e-mailem a heslem a uvidíte tam souhrn" + (rsvpGame === "ano" ? " i hru, jakmile budou týmy hotové." : ".")
                        : "Vaše potvrzení účasti je zaznamenané."}
                    </p>
                    {rsvpAttending === "ano" && rsvpGame === "ano" && <button type="button" className="pb-btn solid" style={{ marginTop: 14 }} onClick={() => go("hra")}>Přejít do hry</button>}
                  </div>
                )}
              </div>
            </div>
          </section>
  );
}
