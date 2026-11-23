import { useEffect, useRef, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";

// Přihlášený účet + živá data hráče: profil (players/uid), odpověď z „Potvrdit účast“, tým a členové týmu.
export default function usePlayerData() {
  const [authUid, setAuthUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [playerChecked, setPlayerChecked] = useState(false);
  const profileTried = useRef({});
  const [myPlayer, setMyPlayer] = useState(null); // živý dokument hráče (jméno, teamId, homeClueSolved...)
  const [myTeam, setMyTeam] = useState(null); // živá data týmu (postup, jméno)
  const [myRsvp, setMyRsvp] = useState(undefined); // souhrn hosta (undefined = načítá se, null = žádná odpověď)
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => onAuthStateChanged(auth, (u) => { setAuthUid(u ? u.uid : null); setPlayerChecked(false); setAuthReady(true); }), []);

  // živý poslech na vlastní profil — jakmile admin přiřadí tým, appka to uvidí sama, bez nutnosti znovu se přihlásit
  useEffect(() => {
    if (!authUid) { setMyPlayer(null); return; }
    let profileTimer = null;
    const unsub = onSnapshot(doc(db, "players", authUid), (snap) => {
      if (!snap.exists() && !profileTried.current[authUid] && auth.currentUser?.uid === authUid) {
        // Účet existuje, ale chybí profil (např. účet založený mimo potvrzení účasti) → založíme ho, ať se přihlášení nevrací na formulář.
        // Chvíli počkáme: při „Potvrdit účast“ se profil zakládá hned po vytvoření účtu a nesmíme ho přepsat jménem z e-mailu.
        profileTried.current[authUid] = true;
        profileTimer = setTimeout(async () => {
          try {
            if ((await getDoc(doc(db, "players", authUid))).exists()) return; // mezitím vznikl, snapshot ho přinese
            const em = (auth.currentUser?.email || "").toLowerCase();
            await setDoc(doc(db, "players", authUid), {
              name: auth.currentUser?.displayName || em.split("@")[0] || "Host", contact: em, wantsGame: "ne", teamId: null, homeClueSolved: false, createdAt: serverTimestamp(),
            });
          } catch (err) { console.warn("Profil se nepodařilo založit:", err); setPlayerChecked(true); }
        }, 2500);
        return;
      }
      setMyPlayer(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setPlayerChecked(true);
    }, (err) => { console.warn("Profil se nepodařilo načíst:", err); setPlayerChecked(true); });
    return () => { unsub(); clearTimeout(profileTimer); };
  }, [authUid]);

  // moje odpověď z „Potvrdit účast“ + to, co jsme jí potvrdili (ubytování, jídlo…)
  useEffect(() => {
    const em = auth.currentUser?.email;
    if (!authUid || !em) { setMyRsvp(undefined); return; }
    const unsub = onSnapshot(query(collection(db, "rsvps"), where("contact", "==", em)), (snap) => {
      const l = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setMyRsvp(l.length ? { ...l[0], confirm: l.find((r) => r.confirm)?.confirm, guestNote: l.find((r) => r.guestNote)?.guestNote } : null);
    }, (err) => { console.warn("Odpověď se nepodařilo načíst:", err); setMyRsvp(null); });
    return () => unsub();
  }, [authUid]);

  // živý poslech na tým, jakmile ho hráč má přiřazený — sdílené napříč telefony celého týmu
  useEffect(() => {
    const teamId = myPlayer?.teamId;
    if (!teamId) { setMyTeam(null); return; }
    const unsub = onSnapshot(doc(db, "teams", teamId), (snap) => {
      setMyTeam(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    }, (err) => console.warn("Tým se nepodařilo načíst:", err));
    return () => unsub();
  }, [myPlayer?.teamId]);

  // členové týmu (kvůli Důkazu 01 z domácího úkolu a dění v týmu)
  useEffect(() => {
    const teamId = myPlayer?.teamId;
    if (!teamId) { setTeamMembers([]); return; }
    const unsub = onSnapshot(query(collection(db, "players"), where("teamId", "==", teamId)), (snap) => {
      setTeamMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Členy týmu se nepodařilo načíst:", err));
    return () => unsub();
  }, [myPlayer?.teamId]);

  // po odhlášení smaže lokální kopie dat (aby další přihlášený neviděl cizí)
  const clear = () => { setMyPlayer(null); setMyTeam(null); setMyRsvp(undefined); setTeamMembers([]); };

  return {
    authUid, myPlayer, myPlayerId: myPlayer ? myPlayer.id : null, myTeam, myRsvp, teamMembers, clear,
    authLoading: !authReady || (!!authUid && !playerChecked),
  };
}
