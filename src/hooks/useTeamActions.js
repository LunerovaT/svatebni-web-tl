import { useMemo } from "react";
import { deleteField, doc, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { reportError } from "../reportError.js";
import { STATIONS } from "../stations/stations.js";
import { collectEvidence } from "../story/evidence.js";

// Zápisy hráče a týmu (domácí úkol, stanoviště, nápovědy, obvinění) a akce testovacího panelu.
export default function useTeamActions({ myPlayer, myPlayerId, myTeam, teamMembers }) {
  const solveHomeClue = async (stats) => {
    if (!myPlayerId) return;
    // stats z domácí minihry (nápovědy, chybně určené doklady, pokusy) – hodí se pro ladění obtížnosti
    try {
      await updateDoc(doc(db, "players", myPlayerId), {
        homeClueSolved: true,
        ...(stats ? { homeTask: { ...stats, solvedAt: serverTimestamp() } } : {}),
      });
    } catch (e) { reportError(e, "Uložení postupu"); }
  };

  // --- stanoviště — postup se čte/zapisuje na dokument týmu (pole stationsDone jako mapa "0"..."7") ---
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
    // chybu nepolykáme: formulář obvinění ji zachytí, ukáže hlášku a odblokuje tlačítko
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

  return { solveHomeClue, completeStation, openHint, sealAccusation, evidence, testActions };
}
