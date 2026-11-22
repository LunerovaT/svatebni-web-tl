import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import {
  collection, addDoc, setDoc, query, where, doc, updateDoc, onSnapshot, serverTimestamp, deleteField, runTransaction,
} from "firebase/firestore";
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,
} from "firebase/auth";
import { db, auth } from "./firebase.js";
import { SLEEP_OPTIONS } from "./rsvpFields.js";
import monogram from "./assets/monogram.webp";
import cluster from "./assets/cluster.webp";
import corner from "./assets/corner.webp";
import paperBg from "./assets/paper_bg.webp";
import gameBg from "./assets/game_bg.webp";
import folderClipBg from "./assets/game_bg2.webp"; // nové kompozitní pozadí (papír na sponce na textuře)
import exitIcon from "./assets/exit_icon.webp";
import blood from "./assets/blood.webp";
import blood2 from "./assets/blood2.webp";
import clipping from "./assets/clipping.webp";
import clipping2 from "./assets/clipping2.webp";
import clipping3 from "./assets/clipping3.webp";
import photo1 from "./assets/photo1.webp";
import photo2 from "./assets/photo2.webp";
import tape from "./assets/tape.webp";
import StationPage from "./StationPage.jsx";
import { HomePage, WherePage, ProgramPage, InfoPage } from "./public/PublicPages.jsx";
import { VENUE, DATES } from "./public/venue.js";
import "./public/public.css";
const AdminPage = lazy(() => import("./AdminPage.jsx"));   // jen organizátoři – nezatěžuje hráče
const TasksPage = lazy(() => import("./TasksPage.jsx"));   // jen organizátoři – nezatěžuje hráče
const TasksAdminPage = lazy(() => import("./TasksAdminPage.jsx"));   // jen organizátoři – nezatěžuje hráče
import ProfilePage from "./ProfilePage.jsx";
import { Pushpin, ClueTag, Polaroid, ConfidentialStamp, MapIcon, Footprints, ProgressStrip, TagButton } from "./CaseFileBits.jsx";
import MapPage from "./MapPage.jsx";
import HomeTask from "./hometask/HomeTask.jsx";
import GameIntro from "./game/GameIntro.jsx";
import { INTRO_SCENES } from "./story/intro.js";
import { SUSPECT_SCENES } from "./story/suspectsIntro.js";
import { STATION_STORY } from "./story/stationStory.js";

// Testovací přehrání celého příběhu v kuse (jen v testovacím režimu): úvod → podezřelí → intra a outra stanovišť 1–4.
const FULL_STORY_SCENES = [...INTRO_SCENES, ...SUSPECT_SCENES, ...["s01", "s02", "s03", "s04"].flatMap((id) => [STATION_STORY[id].intro, STATION_STORY[id].outro])];
import { STATIONS, FINAL_REQUIRES, doneCountOf } from "./stations/stations.js";
import "./game/game.css";
import TestPanel, { isTestMode } from "./game/TestPanel.jsx";
import { EvidenceShelf, TeamFeed, InvestigatorLog, SuspectsBoard, Accusation, weddingCountdown } from "./game/CaseParts.jsx";
import { collectEvidence } from "./story/evidence.js";
import deskTable from "./assets/ht/table.webp";
import deskInk from "./assets/ev/ink.webp";
import deskBooks from "./assets/ev/books.webp";
import deskLamp from "./assets/ht/lamp.webp";
import deskTag from "./assets/ht/tag.webp";
import deskPostcard from "./assets/ht/postcard.webp";

const AUTH_ERR = {
  "auth/invalid-credential": "Špatný e-mail nebo heslo.",
  "auth/wrong-password": "Špatný e-mail nebo heslo.",
  "auth/user-not-found": "Špatný e-mail nebo heslo.",
  "auth/invalid-email": "Zkontrolujte prosím tvar e-mailu.",
  "auth/weak-password": "Heslo musí mít aspoň 6 znaků.",
  "auth/email-already-in-use": "Pro tenhle e-mail už účet existuje. Přihlaste se.",
  "auth/too-many-requests": "Příliš mnoho pokusů, zkuste to prosím za chvíli.",
  "auth/network-request-failed": "Chybí připojení k internetu.",
  "auth/unauthorized-domain": "Tahle adresa webu není ve Firebase povolená (Authentication → Settings → Authorized domains).",
  "auth/operation-not-allowed": "Přihlášení e-mailem není ve Firebase zapnuté (Authentication → Sign-in method).",
};
const authMsg = (e) => AUTH_ERR[e?.code] || `Něco se nepovedlo, zkuste to prosím znovu. (${e?.code || e?.message})`;

const NAV_ITEMS = [
  { id: "home", label: "Domů" },
  { id: "kde", label: "Kdy a kde" },
  { id: "program", label: "Program" },
  { id: "info", label: "Informace" },
  { id: "rsvp", label: "Potvrdit účast", doneLabel: "Účast potvrzena" },
  { id: "profil", label: "Můj profil" },
  { id: "hra", label: "Hra" },
];


// Výrazná karta s domácím úkolem (pulzuje, dokud není vyřešený, ať si jí hráč hned všimne).
function HomeTaskCard({ solved, onOpen }) {
  return (
    <div className={"gh-task" + (solved ? " done" : "")}>
      <span className="gh-badge">{solved ? "Hotovo" : "Nový úkol · začněte tady"}</span>
      <h2>Domácí úkol</h2>
      <p>{solved ? "Úkol je vyřešený. Spis si můžete kdykoli znovu otevřít." : "Na stole po Eleanor zůstalo pár věcí. Rozlušťte její zprávu: je to první stopa a jde ji řešit hned, ještě před přidělením týmů."}</p>
      <TagButton onClick={onOpen}>{solved ? "Otevřít spis" : "Otevřít domácí úkol"}</TagButton>
    </div>
  );
}

// Zaškrtávací možnosti přespání (hlavní osoba i další osoby).
function SleepChecks({ value, onChange }) {
  const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="pb-checks">
      {SLEEP_OPTIONS.map(([k, label]) => (
        <label key={k}><input type="checkbox" checked={value.includes(k)} onChange={() => toggle(k)} /><span>{label}</span></label>
      ))}
    </div>
  );
}

const newGuest = () => ({ name: "", sleep: "ano", sleepRank: [], travel: "same", travelFrom: "", dietYes: false, diet: "" });

function useHashRoute() {
  const [page, setPage] = useState(() => location.hash.replace("#/", "") || "home");
  useEffect(() => {
    const onHash = () => setPage(location.hash.replace("#/", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (id) => {
    location.hash = "#/" + (id === "home" ? "" : id);
    setPage(id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return [page, go];
}

export default function WeddingSite() {
  const [page, go] = useHashRoute();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chosenPath, setChosenPath] = useState(null);

  // --- RSVP (sjednocené se založením herního účtu) ---
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
  const [needRsvp, setNeedRsvp] = useState(false); // sem nás přesměrovala hra, protože host ještě není přihlášený
  const [rsvpAgain, setRsvpAgain] = useState(false); // už potvrzeno, ale host chce odeslat odpověď za někoho dalšího

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
        try { await updateDoc(ref, { wantsGame: rsvpGame }); }
        catch { await setDoc(ref, { name: rsvpName.trim(), contact: email, wantsGame: rsvpGame, teamId: null, homeClueSolved: false, createdAt: serverTimestamp() }); }
      }
      setRsvpPw("");
      try { localStorage.setItem("rsvp_sent", "1"); } catch { /* bez ukládání */ }
      setRsvpSent(true);
      setRsvpDone(true);
      setRsvpAgain(false);
      setNeedRsvp(false);
    } catch (err) {
      setRsvpError("Něco se nepovedlo, zkuste to prosím znovu. (" + err.message + ")");
    } finally {
      setRsvpBusy(false);
    }
  };

  // --- registrace / přihlášení hráče (Firebase Authentication e-mail + heslo; profil v kolekci "players", id = uid) ---
  const [authMode, setAuthMode] = useState("login"); // "register" | "login"
  const [playerName, setPlayerName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formInfo, setFormInfo] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  const [authUid, setAuthUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [playerChecked, setPlayerChecked] = useState(false);
  const profileTried = useRef({});
  const [myPlayer, setMyPlayer] = useState(null); // živý dokument hráče (jméno, teamId, homeClueSolved...)
  const [myTeam, setMyTeam] = useState(null); // živá data týmu (postup, jméno)
  const [myRsvp, setMyRsvp] = useState(undefined); // souhrn hosta (undefined = načítá se, null = žádná odpověď)
  const myPlayerId = myPlayer ? myPlayer.id : null;
  const [introTick, setIntroTick] = useState(0);
  const introKey = myPlayerId ? `intro_seen_${myPlayerId}` : null;
  const introSeen = (() => { if (!introKey) return true; try { return localStorage.getItem(introKey) === "1"; } catch { return true; } })();
  const finishIntro = () => { try { if (introKey) localStorage.setItem(introKey, "1"); } catch { /* bez ukládání */ } setIntroTick((t) => t + 1); go("hra"); };
  const [rsvpSent, setRsvpSent] = useState(() => { try { return localStorage.getItem("rsvp_sent") === "1"; } catch { return false; } });
  const rsvpConfirmed = rsvpSent || !!myRsvp;
  const authLoading = !authReady || (!!authUid && !playerChecked);

  useEffect(() => onAuthStateChanged(auth, (u) => { setAuthUid(u ? u.uid : null); setPlayerChecked(false); setAuthReady(true); }), []);

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) { setFormError("Vyplňte prosím své jméno."); return; }
    if (!contact.trim()) { setFormError("Vyplňte e-mail."); return; }
    if (password.length < 6) { setFormError("Heslo musí mít aspoň 6 znaků."); return; }
    setFormError(""); setFormInfo("");
    setFormBusy(true);
    try {
      const email = contact.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "players", cred.user.uid), {
        name: playerName.trim(), contact: email, wantsGame: "ano", teamId: null, homeClueSolved: false, createdAt: serverTimestamp(),
      });
      setPassword("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setAuthMode("login");
      setFormError(authMsg(err));
    } finally {
      setFormBusy(false);
    }
  };

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

  const joinGame = async () => {
    if (!authUid) return;
    try { await updateDoc(doc(db, "players", authUid), { wantsGame: "ano" }); } catch (err) { console.warn(err); }
  };

  const resetPassword = async () => {
    if (!contact.trim()) { setFormError("Napište nahoře e-mail a klikněte znovu."); return; }
    setFormError(""); setFormInfo("");
    try {
      await sendPasswordResetEmail(auth, contact.trim().toLowerCase());
      setFormInfo("Poslali jsme vám e-mail s odkazem na nové heslo (zkontrolujte i spam).");
    } catch (err) { setFormError(authMsg(err)); }
  };

  const logout = async () => {
    await signOut(auth);
    setMyPlayer(null);
    setMyTeam(null);
    setMyRsvp(undefined);
    setPlayerName(""); setContact(""); setPassword("");
    setFormError(""); setFormInfo("");
    setAuthMode("login");
    try { localStorage.removeItem("rsvp_sent"); } catch { /* bez ukládání */ }
    setRsvpSent(false);
    setNeedRsvp(false); setRsvpDone(false); setRsvpAgain(false); setRsvpName(""); setRsvpEmail(""); setRsvpPw(""); setRsvpAttending("ano"); setRsvpGame("ano");
    setSleepWants("ano"); setSleepRank([]); setTravel("auto"); setTravelFrom(""); setGuests([]); setDietYes(false); setDiet(""); setComment(""); setRsvpError("");
    go("home");
  };

  // živý poslech na vlastní profil — jakmile admin přiřadí tým, appka to uvidí sama, bez nutnosti znovu se přihlásit
  useEffect(() => {
    if (!authUid) { setMyPlayer(null); return; }
    const unsub = onSnapshot(doc(db, "players", authUid), (snap) => {
      if (!snap.exists() && !profileTried.current[authUid] && auth.currentUser?.uid === authUid) {
        // účet existuje, ale chybí profil (např. účet založený mimo potvrzení účasti) → založíme ho, ať se přihlášení nevrací na formulář
        profileTried.current[authUid] = true;
        const em = (auth.currentUser.email || "").toLowerCase();
        setDoc(doc(db, "players", authUid), {
          name: auth.currentUser.displayName || em.split("@")[0] || "Host", contact: em, wantsGame: "ne", teamId: null, homeClueSolved: false, createdAt: serverTimestamp(),
        }).catch((err) => { console.warn("Profil se nepodařilo založit:", err); setPlayerChecked(true); });
        return;
      }
      setMyPlayer(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setPlayerChecked(true);
    }, (err) => { console.warn("Profil se nepodařilo načíst:", err); setPlayerChecked(true); });
    return () => unsub();
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
  const [teamMembers, setTeamMembers] = useState([]);
  useEffect(() => {
    const teamId = myPlayer?.teamId;
    if (!teamId) { setTeamMembers([]); return; }
    const unsub = onSnapshot(query(collection(db, "players"), where("teamId", "==", teamId)), (snap) => {
      setTeamMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Členy týmu se nepodařilo načíst:", err));
    return () => unsub();
  }, [myPlayer?.teamId]);

  // všechny týmy – jen po odhalení výsledků (pořadí)
  const [allTeams, setAllTeams] = useState([]);
  useEffect(() => {
    if (page !== "vysetrovani" || !myTeam?.revealed) return;
    const unsub = onSnapshot(query(collection(db, "teams"), where("revealed", "==", true)), (snap) => setAllTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [page, myTeam?.revealed]);

  const solveHomeClue = async (stats) => {
    if (!myPlayerId) return;
    // stats z domácí minihry (nápovědy, chybně určené doklady, pokusy) – hodí se pro ladění obtížnosti
    await updateDoc(doc(db, "players", myPlayerId), {
      homeClueSolved: true,
      ...(stats ? { homeTask: { ...stats, solvedAt: serverTimestamp() } } : {}),
    });
  };

  const choosePath = (which) => {
    setChosenPath(which);
    setTimeout(() => go(which === "info" ? "info" : "hra"), 650);
  };

  // --- stanoviště — postup se čte/zapisuje na dokument týmu (pole stationsDone jako mapa "0"..."7") ---
  const stationsDoneMap = myTeam?.stationsDone || {};
  const completeStation = async (i) => {
    if (!myTeam?.id) throw new Error("Tým není načtený.");
    if (myTeam?.stationsDone?.[i]) return;          // už vyřešeno – nic nezapisovat podruhé
    await updateDoc(doc(db, "teams", myTeam.id), {
      [`stationsDone.${i}`]: true,
      [`stationsSolvedAt.${i}`]: serverTimestamp(),
      [`stationsSolvedBy.${i}`]: myPlayer?.name || null,
    });
  };
  // nápovědy: stav je na dokumentu týmu (hintsOpened.N = nejvyšší odkrytá úroveň), 3. úroveň zapíše záznam jen jednou (transakce)
  const openHint = async (i, level) => {
    if (!myTeam?.id) throw new Error("Tým není načtený.");
    const ref = doc(db, "teams", myTeam.id);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const d = snap.data() || {};
      const cur = d.hintsOpened?.[i] || 0;
      if (level <= cur || level > cur + 1) return;      // už odkryto / přeskočení úrovně
      const upd = { [`hintsOpened.${i}`]: level };
      if (level === 3 && !d.expertAssist?.[i]) upd[`expertAssist.${i}`] = { at: serverTimestamp(), by: myPlayer?.name || null };
      tx.update(ref, upd);
    });
  };
  const evidence = useMemo(() => collectEvidence({ team: myTeam, members: teamMembers, player: myPlayer }), [myTeam, teamMembers, myPlayer]);

  // finální obvinění – zapečetí se jen jednou
  const sealAccusation = async ({ suspect, motive, evidence: ev }) => {
    if (!myTeam?.id || myTeam.accusation) return;
    await updateDoc(doc(db, "teams", myTeam.id), { accusation: { suspect, motive, evidence: ev, by: myPlayer?.name || null, at: serverTimestamp() } });
  };

  // --- testovací režim (tlačítko Test) ---
  const testActions = {
    onResetStation: async (i) => {
      await updateDoc(doc(db, "teams", myTeam.id), { [`stationsDone.${i}`]: deleteField(), [`stationsSolvedAt.${i}`]: deleteField(), [`stationsSolvedBy.${i}`]: deleteField() });
    },
    onResetAllStations: async () => {
      await updateDoc(doc(db, "teams", myTeam.id), { stationsDone: {}, stationsSolvedAt: {}, stationsSolvedBy: {}, hintsOpened: {}, expertAssist: {} });
    },
    onSolveAllStations: async () => {
      const upd = {};
      STATIONS.forEach((_, i) => {
        if (!myTeam?.stationsDone?.[i]) { upd[`stationsDone.${i}`] = true; upd[`stationsSolvedAt.${i}`] = serverTimestamp(); upd[`stationsSolvedBy.${i}`] = myPlayer?.name || null; }
      });
      if (Object.keys(upd).length) await updateDoc(doc(db, "teams", myTeam.id), upd);
    },
    onResetHomeTask: async () => {
      try { localStorage.removeItem("wedding_hometask_v2"); } catch { /* ignore */ }
      if (myPlayerId) await updateDoc(doc(db, "players", myPlayerId), { homeClueSolved: false, homeTask: deleteField(), homeTaskResetAt: serverTimestamp() });
      else window.location.reload();
    },
    onResetAccusation: async () => {
      await updateDoc(doc(db, "teams", myTeam.id), { accusation: deleteField(), revealed: false });
    },
    onToggleReveal: async () => {
      await updateDoc(doc(db, "teams", myTeam.id), { revealed: !myTeam?.revealed });
    },
  };
  const stationsDoneCount = doneCountOf(stationsDoneMap);
  const finalUnlocked = stationsDoneCount >= FINAL_REQUIRES;

  const stationMatch = page.match(/^stanoviste\/(\d+)(?:\?(.*))?$/);
  const stationIndex = stationMatch ? parseInt(stationMatch[1], 10) - 1 : null;
  // QR kód ze schránky (#/stanoviste/N?k=KOD) – kód si pamatujeme i přes přihlášení
  let stationQrKey = null;
  if (stationMatch) {
    const k = new URLSearchParams(stationMatch[2] || "").get("k");
    try {
      if (k) sessionStorage.setItem(`qr_${stationIndex}`, k);
      stationQrKey = k || sessionStorage.getItem(`qr_${stationIndex}`);
    } catch { stationQrKey = k; }
  }
  const isGameScreen = page === "hra" || page === "uvod" || page === "pribeh" || page === "pripad" || page === "mapa" || page === "vysetrovani" || stationIndex !== null;
  // kdokoli bez účtu, kdo klikne na cokoli ve hře, jde nejdřív na „Potvrdit účast“ (tam se zakládá účet i profil hráče)
  useEffect(() => {
    if (isGameScreen && page !== "pribeh" && !authLoading && !myPlayerId) { setNeedRsvp(true); go("rsvp"); }
  }, [page, authLoading, myPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const gameBackLabel = "⌂";

  // Domácí minihra je samostatná celoobrazovková scéna (bez hlavičky a patičky webu).
  if (page === "domaci-ukol") {
    return (
      <>
      <HomeTask
        showReset={isTestMode()}
        alreadySolved={!!myPlayer?.homeClueSolved}
        resetToken={myPlayer?.homeTaskResetAt?.toMillis?.() ?? null}
        onSolved={solveHomeClue}
        onExit={() => go("hra")}
        onContinue={() => go("hra")}
      />
      {isTestMode() && (
        <TestPanel onPlayStory={() => go("pribeh")} stationIndex={stationIndex} stationTitle={stationIndex !== null ? (STATIONS[stationIndex]?.title || STATIONS[stationIndex]?.name) : null}
                   hasTeam={!!myTeam?.id} isLoggedIn={!!myPlayerId} revealed={!!myTeam?.revealed} {...testActions} />
      )}
      </>
    );
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: isGameScreen ? "#1a0c07" : "#F6F0E3", color: "#221D16", minHeight: "100%", position: "relative" }} className={isGameScreen ? "" : "pb-root"}>
      {/* full-page watermark — the corner graphic, faint but actually visible now, fixed behind everything */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <img src={corner} alt="" style={{ position: "absolute", width: "70vw", minWidth: 900, maxWidth: 1400, right: "-8vw", top: "50%", transform: "translateY(-50%) rotate(4deg)", opacity: 0.14, mixBlendMode: "multiply" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
      <style>{`
        .display{ font-family:'Cormorant Garamond', serif; font-weight:500; letter-spacing:.01em; }
        .wrap{ max-width:1100px; margin:0 auto; padding:0 24px; }
        section.block{ padding:64px 0; border-bottom:1px solid rgba(0,0,0,0.07); }
        section.block:last-child{ border-bottom:none; }
        .eyebrow{ font-size:13px; color:#93713c; margin:0 0 10px; }
        .lede{ color:#6b6153; max-width:52ch; font-size:15.5px; margin:0; }
        .hero-grid{ display:grid; grid-template-columns:1.05fr 0.95fr; gap:24px; align-items:center; }
        @media (max-width:820px){
          .hero-grid{ grid-template-columns:1fr; }
          .hero-grid > div:last-child{ max-width:200px; margin:6px auto 0; }
          .hero-monogram{ width:100% !important; margin-left:0 !important; opacity:0.85 !important; }
        }
        .hero-monogram{ width:125%; max-width:none; margin-left:-10%; opacity:0.92; display:block; }

        /* --- interactive path chooser --- */
        .paths{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        @media (max-width:700px){ .paths{ grid-template-columns:1fr; } }
        .path{
          position:relative; overflow:hidden; border-radius:10px; cursor:pointer;
          padding:32px 32px 30px; border:1px solid rgba(255,255,255,0.12);
          background:rgba(255,255,255,0.03);
          transition:transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
        }
        .path:hover{ transform:translateY(-4px); box-shadow:0 14px 30px rgba(0,0,0,0.25); background:rgba(255,255,255,0.06); }
        .path.active{ background:rgba(201,169,98,0.10); border-color:#c9a962; box-shadow:0 14px 30px rgba(0,0,0,0.25); }
        .path .p-content{ position:relative; z-index:1; }
        @media (max-width:600px){
          .panel-corner-graphic{ display:none; }
        }
        .path button{
          font-family:'IBM Plex Sans'; font-size:14px; background:none;
          border:1px solid #EDE6D6; color:#EDE6D6; padding:10px 18px; cursor:pointer;
          border-radius:5px; transition:all .2s ease;
        }
        .path.active button{ background:#c9a962; border-color:#c9a962; color:#1C1712; }
        .path-check{
          position:absolute; top:18px; right:18px; width:22px; height:22px; border-radius:50%;
          border:1px solid rgba(255,255,255,0.35); display:flex; align-items:center; justify-content:center;
          font-size:12px; color:transparent; transition:all .25s ease; transform:scale(0.7);
        }
        .path.active .path-check{ background:#c9a962; border-color:#c9a962; color:#1C1712; transform:scale(1); }

        .result{
          margin-top:22px; border:1px solid rgba(201,169,98,0.35); border-radius:8px;
          padding:0 24px; font-size:14px; color:#c9bfa9;
          max-height:0; opacity:0; overflow:hidden;
          transition:max-height .35s ease, opacity .3s ease, padding .35s ease;
        }
        .result.show{ max-height:140px; opacity:1; padding:20px 24px; }
        .result b{ color:#EDE6D6; }

        .cols-2{ display:grid; grid-template-columns:1fr 1fr; gap:40px; }
        @media (max-width:760px){ .cols-2{ grid-template-columns:1fr; } }
        .card-plain{ border-top:1px solid rgba(0,0,0,0.08); padding-top:18px; }
        .card-plain h4{ font-size:17px; margin:0 0 6px; }
        .card-plain p{ font-size:14.5px; color:#6b6153; margin:0; }
        .placeholder{ display:inline-block; font-size:11.5px; color:#5f6f52; border:1px solid #5f6f52; padding:1px 6px; margin-left:8px; border-radius:2px; }
        .timeline{ max-width:520px; }
        .t-row{ display:flex; gap:18px; padding:14px 0; border-top:1px solid rgba(0,0,0,0.08); }
        .t-row:last-child{ border-bottom:1px solid rgba(0,0,0,0.08); }
        .t-time{ font-family:'Cormorant Garamond'; font-size:20px; width:74px; flex:none; color:#93713c; }
        .t-body h4{ margin:0 0 3px; font-size:15px; }
        .t-body p{ margin:0; font-size:13.5px; color:#6b6153; }
        .rsvp-grid{ display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; }
        @media (max-width:820px){ .rsvp-grid{ grid-template-columns:1fr; } }
        .field{ border-bottom:1px solid #221D16; padding:8px 2px; }
        .field label{ display:block; font-size:11.5px; color:#93713c; margin-bottom:2px; }
        .field input, .field select{ width:100%; border:none; background:none; font-family:'IBM Plex Sans'; font-size:14px; color:#221D16; }
        .field input:-webkit-autofill,
        .field input:-webkit-autofill:hover,
        .field input:-webkit-autofill:focus{
          -webkit-text-fill-color: #2c2416;
          -webkit-box-shadow: 0 0 0px 1000px #f4ecd8 inset;
          box-shadow: 0 0 0px 1000px #f4ecd8 inset;
          transition: background-color 9999s ease-in-out 0s;
        }
        .field input:focus, .field select:focus{ outline:none; }
        .btn{ font-family:'IBM Plex Sans'; font-size:14px; background:none; border:1px solid #221D16; color:#221D16; padding:10px 18px; cursor:pointer; }
        .gate-btn{ display:inline-block; margin-top:14px; padding:13px 26px; background:#221D16; color:#FBF9F5; border:none; font-family:'IBM Plex Sans'; font-size:14.5px; cursor:not-allowed; opacity:.45; }
        .seal{ display:inline-block; font-size:12px; letter-spacing:.04em; color:#a8604f; border:1px solid #a8604f; padding:4px 10px; margin-bottom:18px; }
        nav.links a{ text-decoration:none; color:#6b6153; padding:6px 0; border-bottom:1px solid transparent; font-size:14px; }
        nav.links a.active, nav.links a:hover{ color:#221D16; border-color:#93713c; }

        @media (max-width:760px){
          nav.links{ display:none !important; }
          .burger-btn{ display:block !important; font-size:22px; }
        }
        /* pozadí herních obrazovek: mahagonový stůl se světlem lampy (zbytek stylu hry je v src/game/game.css) */
        .game-bg-fixed{ position:fixed; inset:0; z-index:0; overflow:hidden; background:#2a130b url(${deskTable}) center/cover no-repeat; }
        .game-bg-fixed::before{ content:""; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 70% 55% at 18% 10%, rgba(255,196,120,.26), rgba(255,160,80,.06) 45%, transparent 70%); mix-blend-mode:screen; }
        .game-bg-fixed::after{ content:""; position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse 95% 85% at 50% 40%, transparent 45%, rgba(0,0,0,.6) 100%); }
        .game-bg-fixed .grain{ position:absolute; inset:0; opacity:.07; pointer-events:none; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>"); }
      `}</style>

      {isGameScreen && (
        <div className="game-bg-fixed"><div className="grain" />
          <img className="game-decor hide-sm" src={deskLamp} alt="" style={{ top: "-7vh", left: "-3vw", height: "44vh", transform: "rotate(8deg)" }} />
          <img className="game-decor hide-sm" src={deskPostcard} alt="" style={{ bottom: "-6vh", left: "6vw", height: "24vh", transform: "rotate(9deg)", opacity: 0.9 }} />
          <img className="game-decor hide-sm" src={deskInk} alt="" style={{ top: "14vh", left: "2vw", width: "7vw", opacity: 0.95 }} />
          <img className="game-decor hide-sm" src={deskBooks} alt="" style={{ bottom: "-4vh", right: "12vw", width: "20vw", opacity: 0.95 }} />
          <img className="game-decor hide-sm" src={deskTag} alt="" style={{ bottom: "-5vh", right: "-2vw", height: "20vh", transform: "rotate(-18deg)", opacity: 0.85 }} />
        </div>
      )}

      {isGameScreen ? (
        <header className={`g-top${myPlayerId ? "" : " no-nav"}`}>
          <button className="g-brand" onClick={() => go("hra")}>Případ poslední vůle</button>
          {myPlayerId && (
            <nav className="g-nav" aria-label="Hra">
              {[
                { id: "hra", label: "Spis", show: true, icon: <path d="M4 5h6l2 2h8v12H4z" /> },
                { id: "mapa", label: "Mapa", show: !!myTeam, icon: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></> },
                { id: "pripad", label: "Příběh", show: !!myTeam, icon: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 9h6M9 13h6" /></> },
              ].filter((n) => n.show).map((n) => (
                <a key={n.id} href={`#/${n.id}`} onClick={(e) => { e.preventDefault(); go(n.id); }}
                   className={page === n.id || (n.id === "mapa" && stationIndex !== null) ? "active" : ""}
                   aria-current={page === n.id ? "page" : undefined}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{n.icon}</svg>
                  {n.label}
                </a>
              ))}
            </nav>
          )}
          <button className="g-exit" onClick={() => go("home")} aria-label="Zpět na svatební web" title="Zpět na svatební web">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h5v16h-5" /><path d="M10 8l-4 4 4 4M6 12h10" /></svg>
            <span>Svatební web</span>
          </button>
        </header>
      ) : (
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
      )}

      {isGameScreen && isTestMode() && (
        <TestPanel onPlayStory={() => go("pribeh")} stationIndex={stationIndex} stationTitle={stationIndex !== null ? (STATIONS[stationIndex]?.title || STATIONS[stationIndex]?.name) : null}
                   hasTeam={!!myTeam?.id} isLoggedIn={!!myPlayerId} revealed={!!myTeam?.revealed} {...testActions} />
      )}
      <main className={isGameScreen ? "game-shell" : ""}>
        {page === "home" && <HomePage go={go} choosePath={choosePath} chosenPath={chosenPath} rsvpDone={rsvpConfirmed} />}
        {page === "kde" && <WherePage />}
        {page === "info" && <InfoPage />}
        {page === "program" && <ProgramPage />}

        {page === "rsvp" && (
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
                      <input type="text" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>E-mail</label>
                      <input type="email" value={rsvpEmail} onChange={(e) => setRsvpEmail(e.target.value)} placeholder="jana@example.cz" />
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
        )}

        {(page === "hra" || page === "profil") && !myPlayerId && authLoading && (
          <section className="block" style={{ paddingTop: 60 }}><div className="wrap"><p className="lede" style={{ textAlign: "center" }}>Chvilku…</p></div></section>
        )}

        {page === "profil" && !myPlayerId && !authLoading && (
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
        )}

        {page === "hra" && myPlayerId && myPlayer?.wantsGame !== "ne" && !introSeen && <GameIntro onDone={finishIntro} finishLabel="Do hry" />}

        {page === "hra" && myPlayerId && myPlayer?.wantsGame === "ne" && (
          <section className="block" style={{ paddingTop: 40 }}>
            <div className="wrap">
              <div className="case-bg">
                <div className="case-card tilt-r">
                  <Pushpin tint={120} style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)" }} />
                  <p className="case-label">detektivní hra</p>
                  <h3 className="display" style={{ fontSize: 26, margin: "0 0 14px" }}>{myPlayer?.name}</h3>
                  <p style={{ fontSize: 14.5, margin: "0 0 18px" }}>
                    Při potvrzení účasti jste zvolili, že hrát nechcete. Pokud jste si to rozmysleli, přidejte se. Do týmu vás zařadíme.
                  </p>
                  <TagButton onClick={joinGame}>Chci hrát</TagButton>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "hra" && myPlayerId && myPlayer?.wantsGame !== "ne" && !myPlayer?.teamId && (
          <section className="block" style={{ paddingTop: 40 }}>
            <div className="wrap">
              <p className="eyebrow">Spis vyšetřovatele</p>
              <h1 className="display">{myPlayer?.name || "Vítejte"}</h1>
              <div className="case-card">
                <HomeTaskCard solved={!!myPlayer?.homeClueSolved} onOpen={() => go("domaci-ukol")} />
                <p className="gh-note"><b>Tým zatím nemáte.</b> Přidělíme vám ho, jakmile bude jasné, kdo všechno hraje. Uvidíte ho tady, bez nutnosti se znovu přihlašovat. Do té doby se můžete pustit do domácího úkolu.</p>
                <div className="gh-grid">
                  <div className="gh-tile locked"><b>Tým a stanoviště</b><span>Odemkne se po přidělení týmu</span></div>
                  <div className="gh-tile locked"><b>Mapa</b><span>Odemkne se po přidělení týmu</span></div>
                  <div className="gh-tile locked"><b>Příběh a podezřelí</b><span>Odemkne se po přidělení týmu</span></div>
                  <button className="gh-tile" onClick={() => go("uvod")}><b>Jak hra funguje</b><span>Přehrát úvod</span></button>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "hra" && myPlayerId && myPlayer?.wantsGame !== "ne" && myPlayer?.teamId && (
          <section className="block">
            <div className="wrap">
              <p className="eyebrow">Spis týmu</p>
              <h1 className="display">{myTeam?.name || "…"}</h1>
              {weddingCountdown() && <p className="g-countdown">{weddingCountdown()}</p>}
              {!myPlayer?.homeClueSolved && <HomeTaskCard solved={false} onOpen={() => go("domaci-ukol")} />}
              <div className="case-card">
                <EvidenceShelf items={evidence} onGoStation={(i) => go(`stanoviste/${i + 1}`)} />
              </div>
              <div className="case-card">
                <h2 className="g-h2">Stanoviště</h2>
                <ProgressStrip total={STATIONS.length} doneMap={stationsDoneMap} />
                <div className="g-list">
                  {STATIONS.map((s, i) => {
                    const done = !!stationsDoneMap[i];
                    return (
                      <a key={s.id} href={`#/stanoviste/${i + 1}`} onClick={(e) => { e.preventDefault(); go(`stanoviste/${i + 1}`); }}
                         className="case-station-row g-row">
                        <span className="g-row-n">{i + 1}</span>
                        <span className="g-row-main">
                          <span className="g-row-title">{s.title || s.name}</span>
                          <span className="g-row-sub">
                            {done && s.evidence ? `Důkaz ${s.evidence.number}: ${s.evidence.summary}` : s.title ? s.name : "Obsah stanoviště připravujeme"}
                          </span>
                        </span>
                        <span className={`g-status${done ? " done" : ""}`}>{done ? "Vyřešeno" : "Otevřít"}</span>
                      </a>
                    );
                  })}
                </div>
                <a href="#/vysetrovani" onClick={(e) => { e.preventDefault(); go("vysetrovani"); }} className={`g-final${finalUnlocked ? " open" : ""}`}>
                  <span className="g-row-title">Finální vyšetřování</span>
                  <span className="g-status">{finalUnlocked ? "Otevřít" : `${stationsDoneCount} z ${FINAL_REQUIRES} indicií`}</span>
                </a>
                <div className="g-actions">
                  <TagButton onClick={() => go("mapa")}>Otevřít mapu</TagButton>
                  <TagButton variant="ghost" onClick={() => go("uvod")}>Jak hra funguje</TagButton>
                </div>
                <p style={{ fontSize: 13.5, marginTop: 18, marginBottom: 0 }}>
                  Stanoviště můžete řešit v libovolném pořadí. Postup se sdílí živě mezi všemi telefony vašeho týmu.
                </p>
              </div>
              <div className="case-card">
                <TeamFeed team={myTeam} members={teamMembers} />
                <InvestigatorLog team={myTeam} />
              </div>
            </div>
          </section>
        )}

        {page === "uvod" && myPlayerId && <GameIntro onDone={() => go("hra")} />}
        {page === "pribeh" && isTestMode() && <GameIntro scenes={FULL_STORY_SCENES} finishLabel="Hotovo" onDone={() => go(myPlayerId ? "hra" : "home")} />}

        {page === "pripad" && myPlayerId && myTeam && (
          <section className="block">
            <div className="wrap">
              <p className="eyebrow">Případ poslední vůle</p>
              <h1 className="display">Podezřelí</h1>
              <SuspectsBoard evidence={evidence} />
            </div>
          </section>
        )}

        {page === "mapa" && myTeam && (
          <MapPage
            stations={STATIONS}
            stationsDoneMap={stationsDoneMap}
            onGoOverview={() => go("hra")}
            onGoStation={(i) => go(`stanoviste/${i + 1}`)}
          />
        )}

        {page === "profil" && myPlayerId && (
          <ProfilePage
            player={myPlayer}
            team={myTeam}
            rsvp={myRsvp}
            onGoRsvp={() => go("rsvp")}
            onGoGame={() => go("hra")}
            onJoinGame={joinGame}
            onOpenHomeTask={() => go("domaci-ukol")}
            onLogout={logout}
          />
        )}

        {stationIndex !== null && (
          <StationPage
            stationIndex={stationIndex}
            stations={STATIONS}
            isDone={!!stationsDoneMap[stationIndex]}
            onComplete={completeStation}
            hintLevel={myTeam?.hintsOpened?.[stationIndex] || 0}
            onOpenHint={openHint}
            onGoOverview={() => go("hra")}
            onGoMap={() => go("mapa")}
            qrKey={stationQrKey}
            canSave={!!myTeam?.id}
          />
        )}

        {page === "vysetrovani" && myPlayerId && (
          <section className="block">
            <div className="wrap">
              <p className="eyebrow">Případ poslední vůle</p>
              <h1 className="display">Finální vyšetřování</h1>
              {finalUnlocked || myTeam?.accusation || myTeam?.revealed ? (
                <Accusation team={myTeam} evidence={evidence} onSeal={sealAccusation} teams={allTeams} />
              ) : (
                <div className="case-card">
                  <ClueTag>Zamčeno</ClueTag>
                  <p style={{ margin: "0 0 18px" }}>
                    Finální vyšetřování se odemkne, až budete mít všech {FINAL_REQUIRES} indicií ze stanovišť.
                  </p>
                  <ProgressStrip total={STATIONS.length} doneMap={stationsDoneMap} />
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <TagButton variant="ghost" onClick={() => go("hra")} style={{ color: "#f3e9d2", boxShadow: "inset 0 0 0 1.5px rgba(243,233,210,.45)" }}>Spis týmu</TagButton>
              </div>
            </div>
          </section>
        )}

        <Suspense fallback={null}>
          {page === "admin" && <AdminPage />}
          {page === "ukoly" && <TasksPage />}
          {page === "spravce-ukolu" && <TasksAdminPage />}
        </Suspense>
      </main>

      {!isGameScreen && (
      <>
      <footer className="pb-foot">
        <div className="wrap">
          <p>
            <strong style={{ color: "#221D16", fontWeight: 500 }}>Lukáš &amp; Tereza</strong><br />
            {DATES.long} · <a href={VENUE.googleMaps} target="_blank" rel="noopener noreferrer">{VENUE.name}, {VENUE.region}</a>
          </p>
          <p>Svatba na Vysočině</p>
        </div>
      </footer>
      </>
      )}
      </div>
    </div>
  );
}
