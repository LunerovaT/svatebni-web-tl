import { useEffect, useState, lazy, Suspense } from "react";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import useHashRoute from "./useHashRoute.js";
import usePlayerData from "./hooks/usePlayerData.js";
import useTeamActions from "./hooks/useTeamActions.js";
import useStationRoute from "./hooks/useStationRoute.js";
import RsvpPage from "./pages/RsvpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GameHubPage from "./pages/GameHubPage.jsx";
import SuspectsPage from "./pages/SuspectsPage.jsx";
import FinalPage from "./pages/FinalPage.jsx";
import GameBackdrop from "./layout/GameBackdrop.jsx";
import GameHeader from "./layout/GameHeader.jsx";
import PublicHeader from "./layout/PublicHeader.jsx";
import SiteFooter from "./layout/SiteFooter.jsx";
import StationPage from "./StationPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import MapPage from "./MapPage.jsx";
import HomeTask from "./hometask/HomeTask.jsx";
import GameIntro from "./game/GameIntro.jsx";
import TestPanel, { isTestMode } from "./game/TestPanel.jsx";
import { HomePage, WherePage, ProgramPage, InfoPage } from "./public/PublicPages.jsx";
import { FULL_STORY_SCENES } from "./story/fullStory.js";
import { STATIONS, FINAL_REQUIRES, doneCountOf } from "./stations/stations.js";
import corner from "./assets/corner.webp";
import "./public/public.css";
import "./game/game.css";
import "./site.css";

const AdminPage = lazy(() => import("./AdminPage.jsx"));   // jen organizátoři – nezatěžuje hráče
const TasksPage = lazy(() => import("./TasksPage.jsx"));
const TasksAdminPage = lazy(() => import("./TasksAdminPage.jsx"));

const GAME_PAGES = ["hra", "uvod", "pribeh", "pripad", "mapa", "vysetrovani"];

// Kostra aplikace: routování, přihlášení a data hráče, rozcestník stránek. Obsah stránek je v ./pages, ./layout a ./public.
export default function WeddingSite() {
  const [page, go] = useHashRoute();
  const [chosenPath, setChosenPath] = useState(null);
  const { authUid, myPlayer, myPlayerId, myTeam, myRsvp, teamMembers, authLoading, clear } = usePlayerData();
  const { solveHomeClue, completeStation, openHint, sealAccusation, evidence, testActions } = useTeamActions({ myPlayer, myPlayerId, myTeam, teamMembers });
  const { stationIndex, stationQrKey } = useStationRoute(page);

  // --- potvrzení účasti (formulář je v RsvpPage; tady jen to, co potřebuje i zbytek webu) ---
  const [needRsvp, setNeedRsvp] = useState(false); // sem nás přesměrovala hra, protože host ještě není přihlášený
  const [rsvpAgain, setRsvpAgain] = useState(false); // už potvrzeno, ale host chce odeslat odpověď za někoho dalšího
  const [rsvpEpoch, setRsvpEpoch] = useState(0); // změna = formuláře (účast, přihlášení) se vynulují, např. po odhlášení
  const [rsvpSent, setRsvpSent] = useState(() => { try { return localStorage.getItem("rsvp_sent") === "1"; } catch { return false; } });
  const rsvpConfirmed = rsvpSent || !!myRsvp;

  // úvod hry se hráči ukáže jednou (pamatuje se v prohlížeči)
  const introKey = myPlayerId ? `intro_seen_${myPlayerId}` : null;
  const introSeen = (() => { if (!introKey) return true; try { return localStorage.getItem(introKey) === "1"; } catch { return true; } })();
  const finishIntro = () => { try { if (introKey) localStorage.setItem(introKey, "1"); } catch { /* bez ukládání */ } go("hra"); };

  const joinGame = async () => {
    if (!authUid) return;
    try { await updateDoc(doc(db, "players", authUid), { wantsGame: "ano" }); } catch (err) { console.warn(err); }
  };

  const logout = async () => {
    await signOut(auth);
    clear();
    try { localStorage.removeItem("rsvp_sent"); } catch { /* bez ukládání */ }
    setRsvpSent(false);
    setNeedRsvp(false); setRsvpAgain(false); setRsvpEpoch((n) => n + 1);
    go("home");
  };

  const choosePath = (which) => {
    setChosenPath(which);
    setTimeout(() => go(which === "info" ? "info" : "hra"), 650);
  };

  const stationsDoneMap = myTeam?.stationsDone || {};
  const stationsDoneCount = doneCountOf(stationsDoneMap);
  const finalUnlocked = stationsDoneCount >= FINAL_REQUIRES;
  const isGameScreen = GAME_PAGES.includes(page) || stationIndex !== null;

  // kdokoli bez účtu, kdo klikne na cokoli ve hře, jde nejdřív na „Potvrdit účast“ (tam se zakládá účet i profil hráče)
  useEffect(() => {
    if (isGameScreen && page !== "pribeh" && !authLoading && !myPlayerId) { setNeedRsvp(true); go("rsvp"); }
  }, [page, authLoading, myPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps
  // mapa a příběh dávají smysl až s týmem; bez něj jdeme na přehled
  useEffect(() => {
    if ((page === "mapa" || page === "pripad") && myPlayerId && myPlayer?.wantsGame !== "ne" && !myPlayer?.teamId) go("hra");
  }, [page, myPlayerId, myPlayer?.teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const testPanel = isTestMode() && (
    <TestPanel onPlayStory={() => go("pribeh")} stationIndex={stationIndex} stationTitle={stationIndex !== null ? (STATIONS[stationIndex]?.title || STATIONS[stationIndex]?.name) : null}
               hasTeam={!!myTeam?.id} isLoggedIn={!!myPlayerId} revealed={!!myTeam?.revealed} {...testActions} />
  );

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
        {testPanel}
      </>
    );
  }

  const playing = myPlayerId && myPlayer?.wantsGame !== "ne";
  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: isGameScreen ? "#1a0c07" : "#F6F0E3", color: "#221D16", minHeight: "100%", position: "relative" }} className={isGameScreen ? "" : "pb-root"}>
      {/* full-page watermark — the corner graphic, faint but actually visible now, fixed behind everything */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <img src={corner} alt="" style={{ position: "absolute", width: "70vw", minWidth: 900, maxWidth: 1400, right: "-8vw", top: "50%", transform: "translateY(-50%) rotate(4deg)", opacity: 0.14, mixBlendMode: "multiply" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
      {isGameScreen && <GameBackdrop />}
      {isGameScreen
        ? <GameHeader go={go} page={page} stationIndex={stationIndex} myPlayerId={myPlayerId} hasTeam={!!myTeam} />
        : <PublicHeader go={go} page={page} rsvpConfirmed={rsvpConfirmed} />}
      {isGameScreen && testPanel}

      <main className={isGameScreen ? "game-shell" : ""}>
        {page === "home" && <HomePage go={go} choosePath={choosePath} chosenPath={chosenPath} rsvpDone={rsvpConfirmed} />}
        {page === "kde" && <WherePage />}
        {page === "info" && <InfoPage />}
        {page === "program" && <ProgramPage />}

        {page === "rsvp" && <RsvpPage key={rsvpEpoch} go={go} authUid={authUid} needRsvp={needRsvp} setNeedRsvp={setNeedRsvp} rsvpConfirmed={rsvpConfirmed} rsvpAgain={rsvpAgain} setRsvpAgain={setRsvpAgain} myRsvp={myRsvp} onSent={() => setRsvpSent(true)} />}

        {(page === "hra" || page === "profil") && !myPlayerId && authLoading && (
          <section className="block" style={{ paddingTop: 60 }}><div className="wrap"><p className="lede" style={{ textAlign: "center" }}>Chvilku…</p></div></section>
        )}
        {page === "profil" && !myPlayerId && !authLoading && <LoginPage key={rsvpEpoch} go={go} />}

        {page === "hra" && playing && !introSeen && <GameIntro onDone={finishIntro} finishLabel="Do hry" />}
        {page === "hra" && myPlayerId && (introSeen || myPlayer?.wantsGame === "ne") && (
          <GameHubPage player={myPlayer} team={myTeam} members={teamMembers} evidence={evidence} stationsDoneMap={stationsDoneMap}
                       stationsDoneCount={stationsDoneCount} finalUnlocked={finalUnlocked} go={go} onJoin={joinGame} />
        )}

        {page === "uvod" && myPlayerId && <GameIntro onDone={() => go("hra")} />}
        {page === "pribeh" && isTestMode() && <GameIntro scenes={FULL_STORY_SCENES} finishLabel="Hotovo" onDone={() => go(myPlayerId ? "hra" : "home")} />}
        {page === "pripad" && myPlayerId && myTeam && <SuspectsPage evidence={evidence} />}
        {page === "mapa" && myTeam && (
          <MapPage stations={STATIONS} stationsDoneMap={stationsDoneMap} onGoOverview={() => go("hra")} onGoStation={(i) => go(`stanoviste/${i + 1}`)} />
        )}

        {page === "profil" && myPlayerId && (
          <ProfilePage player={myPlayer} team={myTeam} rsvp={myRsvp} onGoRsvp={() => go("rsvp")} onGoGame={() => go("hra")}
                       onJoinGame={joinGame} onOpenHomeTask={() => go("domaci-ukol")} onLogout={logout} />
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
          <FinalPage team={myTeam} evidence={evidence} finalUnlocked={finalUnlocked} stationsDoneMap={stationsDoneMap} onSeal={sealAccusation} go={go} />
        )}

        <Suspense fallback={null}>
          {page === "admin" && <AdminPage />}
          {page === "ukoly" && <TasksPage />}
          {page === "spravce-ukolu" && <TasksAdminPage />}
        </Suspense>
      </main>

      {!isGameScreen && <SiteFooter />}
      </div>
    </div>
  );
}
