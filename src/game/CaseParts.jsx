import { useEffect, useMemo, useState } from "react";
import { DATES } from "../public/venue.js";
import { DocThumb } from "./DocViewer.jsx";
import { SUSPECTS } from "../story/suspects.js";
import { MOTIVES, SOLUTION, POINTS, REVEAL } from "../story/final.js";
import { sha256Hex } from "../stations/answer.js";
import { STATIONS } from "../stations/stations.js";
import envClosed from "../assets/ev/env_closed.webp";

// ---------- čas po česku ----------
function timeAgo(ms) {
  if (!ms) return "";
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return "právě teď";
  const m = Math.round(s / 60);
  if (m < 60) return m === 1 ? "před minutou" : `před ${m} minutami`;
  const h = Math.round(m / 60);
  if (h < 24) return h === 1 ? "před hodinou" : `před ${h} hodinami`;
  const d = Math.round(h / 24);
  return d === 1 ? "včera" : `před ${d} dny`;
}

// ---------- odpočet do svatby ----------
const WEDDING = new Date(DATES.start);
export function weddingCountdown(now = new Date()) {
  const days = Math.ceil((WEDDING - now) / 86400000);
  if (days > 4) return `Do svatby zbývá ${days} dní`;
  if (days > 1) return `Do svatby zbývají ${days} dny`;
  if (days === 1) return "Svatba je zítra";
  if (days === 0) return "Svatba je dnes";
  return null;
}

// ---------- detail důkazu (modální okno) ----------
function EvidenceModal({ item, onClose }) {
  useEffect(() => {
    const f = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  if (!item) return null;
  return (
    <div className="g-modal" role="dialog" aria-modal="true" aria-label={`Důkaz ${item.number}`} onClick={onClose}>
      <div className={`g-modal-card${item.image ? " has-img" : ""}`} onClick={(e) => e.stopPropagation()}>
        <button className="g-modal-x" onClick={onClose} aria-label="Zavřít">×</button>
        {item.image && (
          <div className="g-modal-doc">
            <DocThumb wide={item.wide} src={item.image} alt={`Důkaz ${item.number}: ${item.title}`} />
          </div>
        )}
        <div className="g-modal-body">
          <p className="g-kicker">Důkaz {item.number} · {item.source.toLocaleLowerCase("cs")}</p>
          <h2 className="g-modal-title">{item.title}</h2>
          {item.text && <p className="g-modal-text">{item.text}</p>}
          {item.question && <p className="g-modal-q">{item.question}</p>}
          {(item.foundBy || item.foundAt) && (
            <p className="g-modal-meta">Našel(a) {item.foundBy || "někdo z týmu"}{item.foundAt ? `, ${timeAgo(item.foundAt)}` : ""}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- sbírka důkazů ----------
export function EvidenceShelf({ items, onGoStation }) {
  const [open, setOpen] = useState(null);
  const found = items.filter((i) => i.found).length;
  return (
    <>
      <div className="g-shelf-head">
        <h2 className="g-h2">Nalezené důkazy</h2>
        <span className="g-status">{found} z {items.length}</span>
      </div>
      <div className="g-shelf">
        {items.map((it) => it.found ? (
          <button key={it.id} className={`g-ev${it.wide ? " wide" : ""}`} onClick={() => setOpen(it)} aria-label={`Důkaz ${it.number}: ${it.title}`}>
            {it.image ? <img src={it.image} alt="" /> : <span className="g-ev-n solid">{it.number}</span>}
            <span className="g-ev-cap"><b>{it.number}</b> {it.title}</span>
          </button>
        ) : (
          <button key={it.id} className={`g-ev empty${it.wide ? " wide" : ""}`} onClick={() => it.stationIndex != null && onGoStation?.(it.stationIndex)}
                  aria-label={`Důkaz ${it.number} zatím nenalezen, ${it.source}`}>
            <span className="g-ev-n">{it.number}</span>
            <span className="g-ev-src">{it.source}</span>
          </button>
        ))}
      </div>
      <EvidenceModal item={open} onClose={() => setOpen(null)} />
    </>
  );
}

// ---------- záznam vyšetřovatele (využitá odborná asistence) ----------
export function InvestigatorLog({ team }) {
  const rows = STATIONS.map((s, i) => (team?.expertAssist?.[i] ? { i, name: s.name } : null)).filter(Boolean);
  if (!rows.length) return null;
  return (
    <div className="g-log">
      <p className="g-log-h">Záznam vyšetřovatele</p>
      {rows.map((r) => (
        <p key={r.i} className="g-log-row">Tým využil odbornou asistenci při vyšetřování.<br /><span>Stanoviště: {r.name}</span></p>
      ))}
    </div>
  );
}

// ---------- dění v týmu ----------
export function TeamFeed({ team, members }) {
  const events = useMemo(() => {
    const ms = (t) => (t?.toMillis ? t.toMillis() : null);
    const ev = [];
    STATIONS.forEach((s, i) => {
      if (team?.stationsDone?.[i]) ev.push({ key: `s${i}`, at: ms(team?.stationsSolvedAt?.[i]), title: `${s.title || s.name}: vyřešeno`, who: team?.stationsSolvedBy?.[i] });
    });
    members.forEach((m) => { if (m.homeClueSolved) ev.push({ key: `h${m.id}`, at: ms(m.homeTask?.solvedAt), title: "Domácí úkol: vyřešeno", who: m.name }); });
    if (team?.accusation) ev.push({ key: "acc", at: ms(team.accusation.at), title: "Obvinění zapečetěno", who: team.accusation.by });
    return ev.sort((a, b) => (b.at ?? 0) - (a.at ?? 0)).slice(0, 6);
  }, [team, members]);
  return (
    <>
      <h2 className="g-h2">Váš tým</h2>
      <div className="g-members">
        {members.map((m) => (
          <span key={m.id} className="g-member">
            <span className="g-avatar" aria-hidden="true">{(m.name || "?").trim().charAt(0)}</span>
            {m.name}
            <span className={`g-dot${m.homeClueSolved ? " on" : ""}`} title={m.homeClueSolved ? "Domácí úkol hotový" : "Domácí úkol zatím ne"} />
          </span>
        ))}
      </div>
      <p className="g-legend"><span className="g-dot on" /> domácí úkol hotový</p>
      {events.length > 0 ? (
        <ul className="g-feed">
          {events.map((e) => (
            <li key={e.key}><span className="g-feed-t">{e.title}</span><span className="g-feed-m">{[e.who, timeAgo(e.at)].filter(Boolean).join(", ")}</span></li>
          ))}
        </ul>
      ) : <p className="g-feed-empty">Zatím se nic nestalo. První důkaz čeká v domácím úkolu.</p>}
    </>
  );
}

// ---------- portrét podezřelého ----------
function Portrait({ s, small }) {
  return s.portrait
    ? <img className={`g-portrait cut${small ? " small" : ""}`} src={s.portrait} alt={s.name} loading="lazy" />
    : (
      <span className={`g-portrait empty${small ? " small" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 60 72" fill="currentColor"><circle cx="30" cy="25" r="13" /><path d="M6 72c2-17 12-26 24-26s22 9 24 26z" /></svg>
      </span>
    );
}

// ---------- nástěnka podezřelých ----------
export function SuspectsBoard({ evidence }) {
  const found = evidence.filter((e) => e.found);
  const pins = {};
  STATIONS.forEach((s, i) => {
    if (!evidence.find((e) => e.stationIndex === i && e.found)) return;
    (s.evidence?.pins || []).forEach((p) => { (pins[p.suspect] ||= []).push({ text: p.text, number: s.evidence.number }); });
  });
  return (
    <>
      <div className="case-card">
        <p className="g-kicker">Co zatím víme</p>
        <p style={{ margin: "0 0 14px" }}>
          Eleanor Whitmoreová zemřela ráno po večeru, kdy z jejího trezoru zmizela nová závěť. Ve 23:17 se z pracovny ozval výkřik.
          V sídle tu noc bylo pět lidí a každý z nich měl důvod něco zatajit.
        </p>
        {found.length > 0 ? (
          <ul className="g-facts">
            {found.map((e) => <li key={e.id}><b>Důkaz {e.number}</b> {e.summary}</li>)}
          </ul>
        ) : <p style={{ margin: 0 }}>Zatím nemáte žádný důkaz. Začněte domácím úkolem.</p>}
      </div>
      <div className="g-suspects">
        {SUSPECTS.map((s) => (
          <article key={s.id} className="g-suspect">
            <Portrait s={s} />
            <div className="g-suspect-body">
              <p className="g-kicker">{s.relation}</p>
              <h3 className="g-suspect-name">{s.name}</h3>
              <p className="g-suspect-about">{s.about}</p>
              <p className="g-suspect-motive">Možný motiv: <em>{s.motive}</em></p>
              {(pins[s.id] || []).map((p, i) => <p key={i} className="g-pin">Důkaz {p.number}: {p.text}</p>)}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// ---------- finální obvinění ----------
async function scoreOf(acc) {
  if (!acc) return null;
  const [sh, mh, eh] = await Promise.all([sha256Hex(acc.suspect || ""), sha256Hex(acc.motive || ""), sha256Hex(acc.evidence || "")]);
  const r = { suspect: sh === SOLUTION.suspectHash, motive: mh === SOLUTION.motiveHash, evidence: SOLUTION.evidenceHash ? eh === SOLUTION.evidenceHash : null };
  r.points = (r.suspect ? POINTS.suspect : 0) + (r.motive ? POINTS.motive : 0) + (r.evidence ? POINTS.evidence : 0);
  r.max = POINTS.suspect + POINTS.motive + (SOLUTION.evidenceHash ? POINTS.evidence : 0);
  return r;
}

export function Accusation({ team, evidence, onSeal, teams }) {
  const [suspect, setSuspect] = useState("");
  const [motive, setMotive] = useState("");
  const [ev, setEv] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [culprit, setCulprit] = useState(null);
  const acc = team?.accusation;
  const found = evidence.filter((e) => e.found);

  useEffect(() => {
    if (!team?.revealed) return;
    let alive = true;
    (async () => {
      for (const s of SUSPECTS) if ((await sha256Hex(s.id)) === SOLUTION.suspectHash) { if (alive) setCulprit(s); break; }
      if (alive) setResult(await scoreOf(acc));
      const rows = [];
      for (const t of teams || []) if (t.accusation) rows.push({ id: t.id, name: t.name, at: t.accusation.at?.toMillis?.() ?? Infinity, assists: Object.keys(t.expertAssist || {}).length, ...(await scoreOf(t.accusation)) });
      rows.sort((a, b) => b.points - a.points || a.assists - b.assists || a.at - b.at);
      if (alive) setRanking(rows);
    })();
    return () => { alive = false; };
  }, [team?.revealed, acc, teams]);

  const seal = async () => {
    if (busy || acc) return;
    if (!window.confirm("Zapečetit obvinění? Potom už ho nepůjde změnit.")) return;
    setBusy(true); setErr("");
    try { await onSeal({ suspect, motive, evidence: ev }); }
    catch (e) { setErr("Nepodařilo se uložit, zkuste to znovu."); setBusy(false); }
  };

  // výsledek po odhalení
  if (team?.revealed) {
    return (
      <div className="case-card">
        <p className="g-kicker">{REVEAL.title}</p>
        <h2 className="g-h2" style={{ fontSize: 34 }}>{culprit ? `Pachatel: ${culprit.name}` : "Odhalení…"}</h2>
        <p>{REVEAL.text}</p>
        {result ? (
          <p className="g-result">Váš tým: <b>{result.points} z {result.max} bodů</b>
            {" "}({result.suspect ? "pachatel správně" : "pachatel špatně"}, {result.motive ? "motiv správně" : "motiv špatně"})</p>
        ) : <p className="g-result">Váš tým obvinění nezapečetil.</p>}
        {ranking.length > 0 && (
          <>
            <h3 className="g-h3">Pořadí týmů</h3>
            <ol className="g-rank">
              {ranking.map((r, i) => (
                <li key={r.id} className={r.id === team.id ? "me" : ""}>
                  <span className="g-rank-n">{i + 1}</span><span className="g-rank-name">{r.name}</span><span className="g-status">{r.points} b.</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    );
  }

  // zapečetěno, čeká na odhalení
  if (acc) {
    const s = SUSPECTS.find((x) => x.id === acc.suspect);
    const m = MOTIVES.find((x) => x.id === acc.motive);
    const e = evidence.find((x) => x.id === acc.evidence);
    return (
      <div className="case-card" style={{ textAlign: "center" }}>
        <img src={envClosed} alt="" className="g-sealed-img" />
        <h2 className="g-h2" style={{ fontSize: 32 }}>Obvinění je zapečetěné</h2>
        <p>Výsledek odhalíme všem týmům najednou na svatbě.</p>
        <ul className="g-facts" style={{ textAlign: "left", display: "inline-block" }}>
          <li><b>Pachatel</b> {s?.name}</li>
          <li><b>Motiv</b> {m?.label}</li>
          <li><b>Důkaz</b> {e ? `${e.number}, ${e.title}` : "–"}</li>
        </ul>
        <p className="g-modal-meta">Zapečetil(a) {acc.by || "někdo z týmu"}{acc.at?.toMillis ? `, ${timeAgo(acc.at.toMillis())}` : ""}</p>
      </div>
    );
  }

  // výběr
  return (
    <div className="case-card">
      <p className="g-kicker">Obvinění</p>
      <p style={{ marginTop: 0 }}>Máte všechny indicie. Rozhodněte se jako tým: kdo závěť ukradl, proč a který důkaz ho usvědčuje. Obvinění jde zapečetit jen jednou.</p>

      <h3 className="g-h3">1. Pachatel</h3>
      <div className="g-choice-grid" role="radiogroup" aria-label="Pachatel">
        {SUSPECTS.map((s) => (
          <button key={s.id} role="radio" aria-checked={suspect === s.id} className={`g-choice${suspect === s.id ? " on" : ""}`} onClick={() => setSuspect(s.id)}>
            <Portrait s={s} small />
            <span><b>{s.name}</b><small>{s.relation}</small></span>
          </button>
        ))}
      </div>

      <h3 className="g-h3">2. Motiv</h3>
      <div className="g-chips" role="radiogroup" aria-label="Motiv">
        {MOTIVES.map((m) => (
          <button key={m.id} role="radio" aria-checked={motive === m.id} className={`g-chip${motive === m.id ? " on" : ""}`} onClick={() => setMotive(m.id)}>{m.label}</button>
        ))}
      </div>

      <h3 className="g-h3">3. Rozhodující důkaz</h3>
      <div className="g-chips" role="radiogroup" aria-label="Rozhodující důkaz">
        {found.map((e) => (
          <button key={e.id} role="radio" aria-checked={ev === e.id} className={`g-chip${ev === e.id ? " on" : ""}`} onClick={() => setEv(e.id)}>Důkaz {e.number}: {e.title}</button>
        ))}
      </div>

      {err && <p className="st-err" role="alert">{err}</p>}
      <div className="g-actions">
        <button className="g-btn" disabled={!suspect || !motive || !ev || busy} onClick={seal}>{busy ? "Pečetím…" : "Zapečetit obvinění"}</button>
      </div>
    </div>
  );
}
