import { TagButton } from "../CaseFileBits.jsx";
import { lazy, Suspense } from "react";

// Spis týmu se načítá až ve chvíli, kdy je hra otevřená (texty stanovišť a řešení se hostům předem nestahují).
const TeamHub = lazy(() => import("../game/WeddingGame.jsx").then((m) => ({ default: m.TeamHub })));

// Výrazná karta s domácím úkolem (pulzuje, dokud není vyřešený, ať si jí hráč hned všimne).
export function HomeTaskCard({ solved, onOpen }) {
  return (
    <div className={"gh-task" + (solved ? " done" : "")}>
      <span className="gh-badge">{solved ? "Hotovo" : "Nový úkol · začněte tady"}</span>
      <h2>Domácí úkol</h2>
      <p>{solved ? "Úkol je vyřešený. Spis si můžete kdykoli znovu otevřít." : "Na stole po Eleanor zůstalo pár věcí. Rozlušťte její zprávu: je to první stopa a jde ji řešit hned."}</p>
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
export default function GameHubPage({ player, team, members, stationsDoneMap, stationsDoneCount, finalUnlocked, go, onJoin, gameOpen }) {
  if (player?.wantsGame === "ne") return <NotPlaying player={player} onJoin={onJoin} />;
  if (!gameOpen) return <PreWedding player={player} go={go} />;
  if (!player?.teamId) return <NoTeam player={player} go={go} />;
  return <Suspense fallback={null}><TeamHub player={player} team={team} members={members} stationsDoneMap={stationsDoneMap} stationsDoneCount={stationsDoneCount} finalUnlocked={finalUnlocked} go={go} /></Suspense>;
}
