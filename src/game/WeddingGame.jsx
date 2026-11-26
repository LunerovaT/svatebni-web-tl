// Části hry, které se otevírají až na svatbě (spis týmu, stanoviště, mapa, podezřelí, finále, celý příběh).
// Načítá se líně: hosté před svatbou tenhle kód (a s ním texty úloh a rozuzlení) vůbec nestahují.
import { useMemo } from "react";
import { ProgressStrip, TagButton } from "../CaseFileBits.jsx";
import { EvidenceShelf, TeamFeed, InvestigatorLog, weddingCountdown } from "./CaseParts.jsx";
import { STATIONS, FINAL_REQUIRES } from "../stations/stations.js";
import { collectEvidence } from "../story/evidence.js";
import { FULL_STORY_SCENES } from "../story/fullStory.js";
import { HomeTaskCard } from "../pages/GameHubPage.jsx";
import StationPage from "../StationPage.jsx";
import MapPage from "../MapPage.jsx";
import SuspectsPage from "../pages/SuspectsPage.jsx";
import FinalPage from "../pages/FinalPage.jsx";
import GameIntro from "./GameIntro.jsx";

const useEvidence = (team, members, player) => useMemo(() => collectEvidence({ team, members, player }), [team, members, player]);

// Spis týmu: důkazy, stanoviště, finále, zprávy týmu.
export function TeamHub({ player, team, members, stationsDoneMap, stationsDoneCount, finalUnlocked, go }) {
  const evidence = useMemo(() => collectEvidence({ team, members, player }), [team, members, player]);
  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">Spis týmu</p>
        <h1 className="display">{team?.name || "…"}</h1>
        {weddingCountdown() && <p className="g-countdown">{weddingCountdown()}</p>}
        {!player?.homeClueSolved && <HomeTaskCard solved={false} onOpen={() => go("domaci-ukol")} />}
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
          <TeamFeed team={team} members={members} />
          <InvestigatorLog team={team} />
        </div>
      </div>
    </section>
  );
}

export function StationRoute(props) {
  return <StationPage {...props} stations={STATIONS} />;
}

export function MapRoute(props) {
  return <MapPage {...props} stations={STATIONS} />;
}

export function SuspectsRoute({ team, members, player }) {
  return <SuspectsPage evidence={useEvidence(team, members, player)} />;
}

export function FinalRoute({ team, members, player, ...rest }) {
  return <FinalPage {...rest} team={team} evidence={useEvidence(team, members, player)} />;
}

export function FullStoryRoute({ onDone }) {
  return <GameIntro scenes={FULL_STORY_SCENES} finishLabel="Hotovo" onDone={onDone} />;
}
