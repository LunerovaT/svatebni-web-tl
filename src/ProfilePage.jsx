import { Fragment } from "react";
import { COLUMNS, CONFIRM_ITEMS, extraAnswers } from "./rsvpFields.js";
import corner from "./assets/corner.webp";

// Můj profil — v klidném stylu svatebního webu (ne herní obrazovka), aby nemátl hosty, kteří nehrají.
export default function ProfilePage({ player, team, rsvp, onGoRsvp, onGoGame, onOpenHomeTask, onJoinGame, onLogout }) {
  if (!player) {
    return <section className="pb-sec"><div className="wrap"><p className="lede">Načítám profil…</p></div></section>;
  }
  const plays = player.wantsGame !== "ne";
  return (
    <>
      <section className="pb-page-head">
        <img className="pb-head-art" src={corner} alt="" />
        <div className="wrap" style={{ position: "relative" }}>
          <p className="eyebrow">můj profil</p>
          <h1 className="display pb-h1s">{player.name}</h1>
        </div>
      </section>

      <section className="pb-sec">
        <div className="wrap">
          <div className="pb-acc">
            <div className="pb-acc-card">
              <h2>Moje svatba</h2>
              {rsvp === undefined && <p style={{ margin: 0 }}>Načítám…</p>}
              {rsvp === null && (
                <>
                  <p style={{ margin: "0 0 14px" }}>Potvrzení účasti jsme od vás ještě nedostali.</p>
                  {onGoRsvp && <button type="button" className="pb-btn solid" onClick={onGoRsvp}>Potvrdit účast</button>}
                </>
              )}
              {rsvp && (
                <>
                  <dl className="pb-acc-dl">
                    {COLUMNS.map((c) => {
                      const v = c.get(rsvp);
                      return v ? <Fragment key={c.key}><dt>{c.label.replace(" (pořadí preferencí)", "")}</dt><dd>{v}</dd></Fragment> : null;
                    })}
                    {extraAnswers(rsvp).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}
                  </dl>
                  {rsvp.attending === "ano" && (
                    <>
                      <h3 className="display" style={{ fontSize: 20, margin: "18px 0 8px" }}>Od nás potvrzeno</h3>
                      <ul className="pb-acc-ok">
                        {CONFIRM_ITEMS.map((it) => {
                          const c = rsvp.confirm?.[it.key];
                          return (
                            <li key={it.key}>
                              <b>{it.label}:</b> {c?.ok ? <>potvrzeno ✓{c.text ? ` – ${c.text}` : ""}</> : "zatím čeká na potvrzení"}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                  {rsvp.guestNote && <p className="pb-acc-note">{rsvp.guestNote}</p>}
                  <p className="pb-guests-note" style={{ margin: "14px 0 0" }}>Něco se změnilo? Odešlete potvrzení účasti znovu se stejným e-mailem a heslem, nebo nám napište.</p>
                </>
              )}
            </div>

            <div className="pb-acc-card">
              <h2>Detektivní hra</h2>
              {plays ? (
                <>
                  <dl className="pb-acc-dl">
                    <dt>Tým</dt><dd>{team?.name || "Zatím bez týmu. Zařadíme vás, jakmile bude jasné, kdo všechno hraje."}</dd>
                    <dt>Domácí úkol</dt><dd>{player.homeClueSolved ? "vyřešen ✓" : "zatím nevyřešen"}</dd>
                  </dl>
                  <div className="pb-acc-actions">
                    <button type="button" className="pb-btn solid" onClick={onGoGame}>Otevřít hru</button>
                    <button type="button" className="pb-btn" onClick={onOpenHomeTask}>{player.homeClueSolved ? "Zobrazit důkaz" : "Domácí úkol"}</button>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 14px" }}>Hrát jste zatím nechtěli. Kdybyste si to rozmysleli, přidáme vás.</p>
                  <button type="button" className="pb-btn" onClick={onJoinGame}>Chci hrát</button>
                </>
              )}
            </div>

            <div>
              <button type="button" className="pb-btn ghost" onClick={onLogout}>Odhlásit se</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
