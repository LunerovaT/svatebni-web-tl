import { Pushpin, ProgressStrip, TagButton } from "../CaseFileBits.jsx";
import { EvidenceShelf, TeamFeed, InvestigatorLog, weddingCountdown } from "../game/CaseParts.jsx";
import { STATIONS, FINAL_REQUIRES } from "../stations/stations.js";

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

// Hráč v potvrzení účasti zvolil, že hrát nechce.
function NotPlaying({ player, onJoin }) {
  return (
    <section className="block" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div className="case-bg">
          <div className="case-card tilt-r">
            <Pushpin tint={120} style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)" }} />
            <p className="case-label">detektivní hra</p>
            <h3 className="display" style={{ fontSize: 26, margin: "0 0 14px" }}>{player?.name}</h3>
            <p style={{ fontSize: 14.5, margin: "0 0 18px" }}>
              Při potvrzení účasti jste zvolili, že hrát nechcete. Pokud jste si to rozmysleli, přidejte se. Do týmu vás zařadíme.
            </p>
            <TagButton onClick={onJoin}>Chci hrát</TagButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// Hráč ještě nemá tým: jen domácí úkol a zamčené dlaždice.
function NoTeam({ player, go }) {
  return (
    <section className="block" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <p className="eyebrow">Spis vyšetřovatele</p>
        <h1 className="display">{player?.name || "Vítejte"}</h1>
        <div className="case-card">
          <HomeTaskCard solved={!!player?.homeClueSolved} onOpen={() => go("domaci-ukol")} />
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
  );
}

// Spis týmu: důkazy, stanoviště, finále, zprávy týmu.
function TeamHub({ player, team, members, evidence, stationsDoneMap, stationsDoneCount, finalUnlocked, go }) {
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

// Před svatbou: jen domácí úkol. Stanoviště, mapa a finále se odemknou až na svatbě (gameConfig.js).
function PreWedding({ player, go }) {
  return (
    <section className="block" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <p className="eyebrow">Spis vyšetřovatele</p>
        <h1 className="display">{player?.name || "Vítejte"}</h1>
        <div className="case-card">
          <HomeTaskCard solved={!!player?.homeClueSolved} onOpen={() => go("domaci-ukol")} />
          <p className="gh-note">
            {player?.homeClueSolved
              ? "První stopu máte. Další stanoviště a závěrečné vyšetřování odemkneme až na svatbě."
              : "Domácí úkol zvládnete kdykoli před svatbou. Další stanoviště a závěrečné vyšetřování odemkneme až na místě."}
          </p>
          <div className="g-actions">
            <TagButton variant="ghost" onClick={() => go("home")}>Zpět na svatební web</TagButton>
          </div>
        </div>
      </div>
    </section>
  );
}

// Úvodní stránka hry (#/hra): vybere správný pohled podle stavu hráče.
export default function GameHubPage({ player, team, members, evidence, stationsDoneMap, stationsDoneCount, finalUnlocked, go, onJoin, gameOpen }) {
  if (player?.wantsGame === "ne") return <NotPlaying player={player} onJoin={onJoin} />;
  if (!gameOpen) return <PreWedding player={player} go={go} />;
  if (!player?.teamId) return <NoTeam player={player} go={go} />;
  return <TeamHub player={player} team={team} members={members} evidence={evidence} stationsDoneMap={stationsDoneMap} stationsDoneCount={stationsDoneCount} finalUnlocked={finalUnlocked} go={go} />;
}
