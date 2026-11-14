import { ClueTag, NoteBg, TagButton } from "./CaseFileBits.jsx";

export default function ProfilePage({ player, team, onOpenHomeTask, onLogout }) {
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

        {onLogout && (
          <div style={{ textAlign: "center" }}>
            <button className="g-exit" onClick={onLogout}>Odhlásit se</button>
          </div>
        )}
      </div>
    </section>
  );
}
