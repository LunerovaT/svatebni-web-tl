import { Fragment } from "react";
import { ClueTag, NoteBg, TagButton } from "./CaseFileBits.jsx";
import { COLUMNS, CONFIRM_ITEMS, extraAnswers } from "./rsvpFields.js";

export default function ProfilePage({ player, team, rsvp, onGoRsvp, onOpenHomeTask, onLogout }) {
  if (!player) {
    return (
      <section className="block">
        <div className="wrap"><p className="lede" style={{ textAlign: "center" }}>Načítání profilu…</p></div>
      </section>
    );
  }

  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">Váš profil</p>
        <h1 className="display">{player.name}</h1>

        <div className="case-card">
          <ClueTag>Moje svatba</ClueTag>
          {rsvp === undefined && <p style={{ margin: 0 }}>Načítám…</p>}
          {rsvp === null && (
            <>
              <p style={{ margin: "0 0 14px" }}>Potvrzení účasti jsme od vás ještě nedostali.</p>
              {onGoRsvp && <TagButton onClick={onGoRsvp}>Potvrdit účast</TagButton>}
            </>
          )}
          {rsvp && (
            <>
              <dl className="g-dossier-fields" style={{ margin: "0 0 14px" }}>
                {COLUMNS.filter((c) => c.key !== "guests" || rsvp.guests?.length).map((c) => {
                  const v = c.get(rsvp);
                  return v ? <Fragment key={c.key}><dt>{c.label.replace(" (pořadí preferencí)", "")}</dt><dd>{v}</dd></Fragment> : null;
                })}
                {extraAnswers(rsvp).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}
              </dl>
              {rsvp.attending === "ano" && (
                <>
                  <p className="case-label" style={{ margin: "6px 0 8px" }}>od nás potvrzeno</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {CONFIRM_ITEMS.map((it) => {
                      const c = rsvp.confirm?.[it.key];
                      return (
                        <li key={it.key} style={{ marginBottom: 4 }}>
                          <b>{it.label}:</b>{" "}
                          {c?.ok ? <>potvrzeno ✓{c.text ? ` – ${c.text}` : ""}</> : "zatím čeká na potvrzení"}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {rsvp.guestNote && <NoteBg style={{ marginTop: 14 }}>{rsvp.guestNote}</NoteBg>}
              <p style={{ margin: "14px 0 0", fontSize: 13, opacity: 0.75 }}>Něco se změnilo? Odešlete potvrzení účasti znovu se stejným e-mailem a heslem, nebo nám napište.</p>
            </>
          )}
        </div>

        {player.wantsGame === "ne" ? null : (<>
        <div className="case-card">
          <ClueTag>Osobní složka</ClueTag>
          <div className="g-dossier">
            {team?.portrait
              ? <img className="g-portrait" src={team.portrait} alt={team.role} />
              : <span className="g-portrait empty" aria-hidden="true"><svg viewBox="0 0 60 72" fill="currentColor"><circle cx="30" cy="25" r="13" /><path d="M6 72c2-17 12-26 24-26s22 9 24 26z" /></svg></span>}
            <dl className="g-dossier-fields">
              <dt>Postava</dt><dd>{team?.role || "Zatím nepřiřazena"}</dd>
              <dt>Tým</dt><dd>{team?.name || "Zatím bez týmu"}</dd>
            </dl>
          </div>
          <p style={{ margin: "18px 0 0" }}>
            {team?.role
              ? (team.backstory || "Krátký úvod k této postavě ještě chystáme.")
              : "Postava se přiřazuje spolu s týmem. Jakmile budete mít tým, objeví se tu i ona."}
            {team?.role && !team.backstory && <span className="placeholder">obsah later</span>}
          </p>
        </div>

        <div className="case-card">
          <ClueTag>Domácí úkol</ClueTag>
          <h2 style={{ fontSize: 30, margin: "0 0 12px" }}>Poslední cesta Eleanor</h2>
          <p style={{ margin: "0 0 18px" }}>
            Na stole zůstal zapečetěný dopis, stará fotografie, tři cestovní doklady a mosazný kotouč.
            Zabere to asi 10–15 minut a postup se ukládá, takže můžete kdykoliv pokračovat.
          </p>
          {!player.homeClueSolved ? (
            <TagButton onClick={onOpenHomeTask}>Otevřít detektivní stůl</TagButton>
          ) : (
            <>
              <NoteBg style={{ marginBottom: 18 }}>
                <b>Důkaz 01:</b> Palubní lístek R.M.S. Queen Mary. Jeden z pěti podezřelých nebyl pozván.
              </NoteBg>
              <TagButton variant="ghost" onClick={onOpenHomeTask}>Zobrazit důkaz</TagButton>
            </>
          )}
        </div>

        </>)}

        {onLogout && (
          <div style={{ textAlign: "center" }}>
            <button className="g-exit" onClick={onLogout}>Odhlásit se</button>
          </div>
        )}
      </div>
    </section>
  );
}
