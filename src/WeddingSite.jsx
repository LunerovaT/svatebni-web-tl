import { useEffect, useState, lazy, Suspense } from "react";
import { weddingGameOpen, testModeOn } from "./gameConfig.js";
import LoadingNotice from "./pages/LoadingNotice.jsx";
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
import GameBackdrop from "./layout/GameBackdrop.jsx";
import GameHeader from "./layout/GameHeader.jsx";
import PublicHeader from "./layout/PublicHeader.jsx";
import SiteFooter from "./layout/SiteFooter.jsx";
import ProfilePage from "./ProfilePage.jsx";
import HomeTask from "./hometask/HomeTask.jsx";
import GameIntro from "./game/GameIntro.jsx";
import TestPanel from "./game/TestPanel.jsx";
import { HomePage, WherePage, ProgramPage, InfoPage } from "./public/PublicPages.jsx";
import { FINAL_REQUIRES, doneCountOf } from "./stations/meta.js";
import corner from "./assets/corner.webp";
import "./public/public.css";
import "./game/game.css";
import "./site.css";

const AdminPage = lazy(() => import("./AdminPage.jsx"));   // jen organizátoři – nezatěžuje hráče
const TasksPage = lazy(() => import("./TasksPage.jsx"));
const TasksAdminPage = lazy(() => import("./TasksAdminPage.jsx"));
// Části hry ze svatby: načtou se až když jsou otevřené (organizátor, testovací režim, nebo po přepnutí v gameConfig.js).
const wg = (name) => lazy(() => import("./game/WeddingGame.jsx").then((m) => ({ default: m[name] })));
const StationRoute = wg("StationRoute");
const MapRoute = wg("MapRoute");
const SuspectsRoute = wg("SuspectsRoute");
const FinalRoute = wg("FinalRoute");
const FullStoryRoute = wg("FullStoryRoute");

const GAME_PAGES = ["hra", "uvod", "pribeh", "pripad", "mapa", "vysetrovani"];

// Kostra aplikace: routování, přihlášení a data hráče, rozcestník stránek. Obsah stránek je v ./pages, ./layout a ./public.
export default function WeddingSite() {
  const [page, go] = useHashRoute();
  const { authUid, myPlayer, myPlayerId, myTeam, myRsvp, teamMembers, authLoading, clear } = usePlayerData();
  const { solveHomeClue, completeStation, openHint, sealAccusation, testActions } = useTeamActions({ myPlayer, myPlayerId, myTeam });
  const { stationIndex, stationQrKey } = useStationRoute(page);

  // --- potvrzení účasti (formulář je v RsvpPage; tady jen to, co potřebuje i zbytek webu) ---
  const [needRsvp, setNeedRsvp] = useState(false); // sem nás přesměrovala hra, protože host ještě není přihlášený
  const [rsvpAgain, setRsvpAgain] = useState(false); // už potvrzeno, ale host chce odeslat odpověď za někoho dalšího
  const [rsvpEpoch, setRsvpEpoch] = useState(0); // změna = formuláře (účast, přihlášení) se vynulují, např. po odhlášení
  const [rsvpSent, setRsvpSent] = useState(() => { try { return localStorage.getItem("rsvp_sent") === "1"; } catch { return false; } });
  const rsvpConfirmed = rsvpSent || !!myRsvp;

  // úvod hry se hráči ukáže jednou: pamatuje se u hráče v databázi (platí na všech zařízeních) i v prohlížeči;
  // stav držíme i v Reactu, aby po dokončení úvod hned zmizel
  const introKey = myPlayerId ? `intro_seen_${myPlayerId}` : null;
  const [introDoneFor, setIntroDoneFor] = useState(null);
  const introSeen = (() => { if (!introKey || myPlayer?.introSeen || introDoneFor === introKey) return true; try { return localStorage.getItem(introKey) === "1"; } catch { return true; } })();
  const gameOpen = weddingGameOpen(myPlayer?.contact);
  const testing = testModeOn(myPlayer?.contact); // testovací režim jen pro organizátory
  const finishIntro = () => {
    try { if (introKey) localStorage.setItem(introKey, "1"); } catch { /* bez ukládání */ }
    setIntroDoneFor(introKey);
    if (myPlayerId && !myPlayer?.introSeen) updateDoc(doc(db, "players", myPlayerId), { introSeen: true }).catch((e) => console.warn("Úvod se nepodařilo označit:", e));
    // před svatbou je jediný úkol domácí: rovnou na něj
    go(!gameOpen && !myPlayer?.homeClueSolved ? "domaci-ukol" : "hra");
  };

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

  const stationsDoneMap = myTeam?.stationsDone || {};
  const stationsDoneCount = doneCountOf(stationsDoneMap);
  const finalUnlocked = stationsDoneCount >= FINAL_REQUIRES;
  const isGameScreen = GAME_PAGES.includes(page) || stationIndex !== null;

  // kdokoli bez účtu, kdo klikne na cokoli ve hře, jde nejdřív na „Potvrdit účast“ (tam se zakládá účet i profil hráče)
  useEffect(() => {
    if ((isGameScreen || page === "domaci-ukol") && page !== "pribeh" && !authLoading && !myPlayerId) { setNeedRsvp(true); go("rsvp"); }
  }, [page, authLoading, myPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps
  // části hry, které se otevřou až na svatbě (nebo v testovacím režimu), hosta vrátí na přehled
  const weddingOnly = page === "mapa" || page === "pripad" || page === "vysetrovani" || stationIndex !== null;
  useEffect(() => {
    if (page === "pribeh" && !testing && !authLoading) go(myPlayerId ? "hra" : "home");   // přehrání celého příběhu je jen pro test
    else if (weddingOnly && myPlayerId && !gameOpen) go("hra");
    // mapa a příběh dávají smysl až s týmem; bez něj jdeme na přehled
    else if ((page === "mapa" || page === "pripad") && myPlayerId && myPlayer?.wantsGame !== "ne" && !myPlayer?.teamId) go("hra");
  }, [page, myPlayerId, myPlayer?.teamId, gameOpen, testing, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const testPanel = testing && (
    <TestPanel onPlayStory={() => go("pribeh")} stationIndex={stationIndex} stationTitle={stationIndex !== null ? `Stanoviště ${stationIndex + 1}` : null}
               hasTeam={!!myTeam?.id} isLoggedIn={!!myPlayerId} revealed={!!myTeam?.revealed} {...testActions} />
  );

  // Domácí minihra je samostatná celoobrazovková scéna (bez hlavičky a patičky webu).
  if (page === "domaci-ukol") {
    if (authLoading || !myPlayerId) return <LoadingNotice />; // počkat na hráče (bez účtu přesměrujeme na potvrzení účasti)
    return (
      <>
        <HomeTask
          key={myPlayerId || "anon"}
          playerId={myPlayerId}
          skipIntro={introSeen}
          showReset={testing}
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
        ? <GameHeader go={go} page={page} stationIndex={stationIndex} myPlayerId={myPlayerId} hasTeam={!!myTeam} gameOpen={gameOpen} />
        : <PublicHeader go={go} page={page} rsvpConfirmed={rsvpConfirmed} />}
      {isGameScreen && testPanel}

      <main className={isGameScreen ? "game-shell" : ""}>
        {page === "home" && <HomePage go={go} rsvpDone={rsvpConfirmed} />}
        {page === "kde" && <WherePage />}
        {page === "info" && <InfoPage />}
        {page === "program" && <ProgramPage />}

        {page === "rsvp" && <RsvpPage key={rsvpEpoch} go={go} authUid={authUid} needRsvp={needRsvp} setNeedRsvp={setNeedRsvp} rsvpConfirmed={rsvpConfirmed} rsvpAgain={rsvpAgain} setRsvpAgain={setRsvpAgain} myRsvp={myRsvp} onSent={() => setRsvpSent(true)} />}

        {(page === "hra" || page === "profil") && !myPlayerId && authLoading && (
          <LoadingNotice />
        )}
        {page === "profil" && !myPlayerId && !authLoading && <LoginPage key={rsvpEpoch} go={go} />}

        {page === "hra" && playing && !introSeen && <GameIntro onDone={finishIntro} finishLabel="Do hry" />}
        {page === "hra" && myPlayerId && (introSeen || myPlayer?.wantsGame === "ne") && (
          <GameHubPage player={myPlayer} team={myTeam} members={teamMembers} stationsDoneMap={stationsDoneMap}
                       stationsDoneCount={stationsDoneCount} finalUnlocked={finalUnlocked} go={go} onJoin={joinGame} gameOpen={gameOpen} />
        )}

        {page === "uvod" && myPlayerId && <GameIntro onDone={() => go("hra")} />}
        {page === "pribeh" && testing && <Suspense fallback={null}><FullStoryRoute onDone={() => go(myPlayerId ? "hra" : "home")} /></Suspense>}
        {page === "pripad" && gameOpen && myPlayerId && myTeam && <Suspense fallback={null}><SuspectsRoute team={myTeam} members={teamMembers} player={myPlayer} /></Suspense>}
        {page === "mapa" && gameOpen && myTeam && (
          <Suspense fallback={null}><MapRoute stationsDoneMap={stationsDoneMap} onGoOverview={() => go("hra")} onGoStation={(i) => go(`stanoviste/${i + 1}`)} /></Suspense>
        )}

        {page === "profil" && myPlayerId && (
          <ProfilePage player={myPlayer} team={myTeam} rsvp={myRsvp} onGoRsvp={() => go("rsvp")} onGoGame={() => go("hra")}
                       onJoinGame={joinGame} onOpenHomeTask={() => go("domaci-ukol")} onLogout={logout} />
        )}

        {stationIndex !== null && gameOpen && (
          <Suspense fallback={null}><StationRoute
            stationIndex={stationIndex}
            isDone={!!stationsDoneMap[stationIndex]}
            onComplete={completeStation}
            hintLevel={myTeam?.hintsOpened?.[stationIndex] || 0}
            onOpenHint={openHint}
            onGoOverview={() => go("hra")}
            onGoMap={() => go("mapa")}
            qrKey={stationQrKey}
            canSave={!!myTeam?.id}
          /></Suspense>
        )}

        {page === "vysetrovani" && gameOpen && myPlayerId && (
          <Suspense fallback={null}><FinalRoute team={myTeam} members={teamMembers} player={myPlayer} finalUnlocked={finalUnlocked} stationsDoneMap={stationsDoneMap} onSeal={sealAccusation} go={go} /></Suspense>
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
