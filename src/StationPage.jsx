import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pushpin, ClueTag, TapeStrip, Polaroid, NoteBg, TagButton } from "./CaseFileBits.jsx";
import { checkAnswer, checkWords } from "./stations/answer.js";
import { HINT_TITLES } from "./stations/stations.js";
import { DocThumb } from "./game/DocViewer.jsx";
import { docSrc, docIsWide, evTitle } from "./stations/docImages.js";
import "./stations/stations.css";
import envClosed from "./assets/ev/env_closed.webp";
import envCracked from "./assets/ev/env_cracked.webp";
import envOpen from "./assets/ev/env_open.webp";
import shard1 from "./assets/ev/shard1.webp";
import shard2 from "./assets/ev/shard2.webp";
import shard3 from "./assets/ev/shard3.webp";
import shard4 from "./assets/ev/shard4.webp";
import defaultDoc from "./assets/ev/doc_02.webp";
import boxClosed from "./assets/ev/box_closed.webp";
import boxOpen from "./assets/ev/box_open.webp";
import folderTop from "./assets/ev/folder_top.webp";
import stamp03 from "./assets/ev/stamp_03.webp";
import finaleBg from "./assets/ev/books.webp";
import GameIntro from "./game/GameIntro.jsx";
import { STATION_STORY } from "./story/stationStory.js";
import { SUSPECTS } from "./story/suspects.js";

// obrázky dokumentů podle klíče evidence.docImage v stations.js (stations.js zůstává bez importů obrázků kvůli testům v Node)

const ANIM_MS = 4300;
const FOLDER_BOX_MS = 8100;

function useReducedMotion() {
  const [rm, setRm] = useState(() => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const q = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!q) return;
    const f = () => setRm(q.matches);
    q.addEventListener?.("change", f);
    return () => q.removeEventListener?.("change", f);
  }, []);
  return rm;
}

// Krátká realistická animace nalezení důkazu (CSS transform + opacity, bez knihoven):
// ztmavení → zavřená obálka → pečeť praskne, kousky vosku odletí → obálka se otevře → dokument se vysune a přiblíží.
// Obrázek dokumentu se dá pro každé stanoviště změnit v stations.js (evidence.docImage).
function EvidenceReveal({ docImage, onDone }) {
  const doneRef = useRef(false);
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };
  useEffect(() => {
    const t = setTimeout(finish, ANIM_MS);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="ev-overlay" role="presentation">
      <div className="ev-stage" aria-hidden="true">
        <img className="ev-f ev-f-closed" src={envClosed} alt="" draggable="false" />
        <img className="ev-f ev-f-cracked" src={envCracked} alt="" draggable="false" />
        <img className="ev-shard s1" src={shard1} alt="" draggable="false" />
        <img className="ev-shard s2" src={shard2} alt="" draggable="false" />
        <img className="ev-shard s3" src={shard3} alt="" draggable="false" />
        <img className="ev-shard s4" src={shard4} alt="" draggable="false" />
        <img className="ev-f ev-f-open" src={envOpen} alt="" draggable="false" />
        <img className="ev-doc" src={docImage || defaultDoc} alt="" draggable="false" />
      </div>
      <p className="ev-sr" role="status">Nalezen nový důkaz.</p>
      <button className="ev-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>Přeskočit animaci</button>
    </div>
  );
}

// Animace založení dokumentu do vyšetřovací složky (stanoviště s reveal: "folder").
// Razítko: pro číslo s vlastním obrázkem (STAMPS) se použije ten, jinak se vykreslí textem.
const STAMPS = { "03": stamp03 };
function FolderReveal({ docImage, number, withBox, onDone }) {
  const doneRef = useRef(false);
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };
  useEffect(() => {
    const t = setTimeout(finish, withBox ? FOLDER_BOX_MS : FOLDER_BOX_MS - 1400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const stamp = STAMPS[number];
  return (
    <div className="ev-overlay fo" role="presentation" style={withBox ? undefined : { "--o": "-1.4s" }}>
      <div className={`fo2${withBox ? "" : " nobox"}`} aria-hidden="true">
        <div className="fo2-dust" />
        {withBox && (
          <div className="fo2-box">
            <img className="fo2-box-open" src={boxOpen} alt="" draggable="false" />
            <img className="fo2-box-closed" src={boxClosed} alt="" draggable="false" />
          </div>
        )}
        <img className="fo2-folder" src={folderTop} alt="" draggable="false" />
        <img className="fo2-doc" src={docImage} alt="" draggable="false" />
        <div className="fo2-flash" />
        {stamp ? <img className="fo2-stamp" src={stamp} alt="" draggable="false" />
               : <span className="fo2-stamp-txt">DŮKAZ {number}</span>}
      </div>
      <p className="ev-sr" role="status">Důkaz {number} založen do vyšetřovacího spisu.</p>
      <button className="ev-skip" onClick={(e) => { e.stopPropagation(); finish(); }}>Přeskočit animaci</button>
    </div>
  );
}

// Přímá řeč se odkrývá po řádcích stejně jako úvod domácího úkolu (bez psaní po znacích, bez zvuku).
function QuoteReveal({ lines, by, instant }) {
  const [n, setN] = useState(instant ? lines.length : 0);
  useEffect(() => {
    if (n >= lines.length) return undefined;
    const t = setTimeout(() => setN((v) => v + 1), n === 0 ? 700 : 1500);
    return () => clearTimeout(t);
  }, [n, lines.length]);
  return (
    <blockquote className="ev-quote" onClick={() => setN(lines.length)}>
      {lines.slice(0, n).map((l, i) => <p key={i}>{l}</p>)}
      {n >= lines.length && by && <cite>{by}</cite>}
    </blockquote>
  );
}

// Finále důkazu: obrazovka potemní, věta se po písmenech objeví psacím strojem (jako u domácího úkolu).
function FinaleView({ finale, rm, onContinue }) {
  const [ready, setReady] = useState(rm);
  const total = finale.lines.reduce((a, l) => a + l.t.length, 0);
  useEffect(() => {
    if (rm) return undefined;
    const t = setTimeout(() => setReady(true), 900 + total * 85 + 600);
    return () => clearTimeout(t);
  }, [rm, total]);
  let n = 0;
  return createPortal(
    <div className="fi" role="dialog" aria-label={finale.lines.map((l) => l.t).join(" ")} onClick={() => setReady(true)}>
      <div className="fi-glow" />
      <img className="fi-bg" src={finaleBg} alt="" />
      <p className="fi-kicker">{finale.kicker}</p>
      <h2 className="fi-msg" aria-hidden="true">
        {finale.lines.map((l, i) => (
          <span key={i} className={`fi-line${l.red ? " red" : ""}`}>
            {[...l.t].map((c, k) => <span key={k} className="fi-ch" style={{ animationDelay: `${900 + (n++) * 85}ms` }}>{c}</span>)}
          </span>
        ))}
      </h2>
      {ready && <p className="fi-after">{finale.after}</p>}
      {ready && <button className="fi-btn" onClick={(e) => { e.stopPropagation(); onContinue(); }}>{finale.button || "Pokračovat"}</button>}
    </div>,
    document.body
  );
}

function EvidenceCard({ station, saveState, onRetry, onGoMap, onGoOverview, appear }) {
  const ev = station.evidence;
  const rm = useReducedMotion();
  const pins = (ev.pins || []).map((p) => ({ ...p, s: SUSPECTS.find((x) => x.id === p.suspect) })).filter((p) => p.s);
  return (
    <div className={`ev-card${appear ? " is-appear" : ""}`}>
      <div className="ev-paper">
        <DocThumb className="ev-thumb" wide={docIsWide(ev)} src={docSrc(ev)} alt={`Důkaz ${ev.number}: ${evTitle(ev)}`}>
          {STAMPS[ev.number] && <img className="ev-stamp" src={STAMPS[ev.number]} alt="" />}
        </DocThumb>
      </div>
      <div className="ev-body">
        <p className="ev-kicker">Důkaz {ev.number}{ev.meta ? ` · ${ev.meta}` : ""}</p>
        <h2 className="ev-title">{evTitle(ev)}</h2>
        <p className="ev-text">{ev.text}</p>
        {ev.facts && <ul className="ev-facts">{ev.facts.map((f) => <li key={f}>{f}</li>)}</ul>}
        {ev.quote && <QuoteReveal lines={ev.quote} by={ev.quoteBy} instant={rm || !appear} />}
        <p className="ev-question">{ev.question}</p>
        {pins.length > 0 && (
          <ul className="ev-pins">
            {pins.map((p, i) => (
              <li key={p.suspect} style={{ "--d": `${0.4 + i * 0.25}s` }}>
                <img src={p.s.portrait} alt="" />
                <span><b>{p.s.name}</b>{p.text}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="ev-status" role="status">
          {saveState === "saving" && <span className="ev-chip">Ukládám do spisu…</span>}
          {saveState === "saved" && <span className="ev-chip ok">Důkaz přidán do vyšetřovacího spisu</span>}
          {saveState === "error" && (
            <>
              <span className="ev-chip err">Nepodařilo se uložit – zkontrolujte připojení.</span>
              <TagButton color="#f4d84a" rotate={-1} onClick={onRetry}>Zkusit znovu</TagButton>
            </>
          )}
        </div>
        <div className="ev-actions">
          <TagButton onClick={onGoMap}>Zpět na mapu</TagButton>
          <TagButton color="#d8c9a3" rotate={1} onClick={onGoOverview}>Spis týmu</TagButton>
        </div>
      </div>
    </div>
  );
}

// Nápovědy: 3 úrovně, odemykají se postupně. Stav je uložený v týmu (sdílí se mezi telefony); bez týmu jen lokálně.
function HelpPanel({ station, level, onOpenHint, open, onToggle }) {
  const hints = station.hints || [];
  const [local, setLocal] = useState(0);
  const [confirm3, setConfirm3] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const shown = Math.max(level, local);
  const reveal = async (lvl) => {
    if (busy) return;
    setBusy(true); setErr("");
    try { await onOpenHint(lvl); } catch { if (!onOpenHint) setLocal(lvl); else setErr("Nepodařilo se uložit, zkuste to znovu."); }
    setBusy(false); setConfirm3(false);
  };
  useEffect(() => {
    if (!confirm3) return undefined;
    const f = (e) => { if (e.key === "Escape") setConfirm3(false); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [confirm3]);
  if (hints.length < 3) return null;
  const ask = (lvl) => { if (lvl === 3) setConfirm3(true); else reveal(lvl); };
  return (
    <div className="st-help">
      <button type="button" className="st-help-btn" aria-expanded={open} onClick={onToggle}>
        <span aria-hidden="true">💡</span> Potřebujete nápovědu?
      </button>
      {open && (
        <ol className="st-help-list">
          {HINT_TITLES.map((title, i) => {
            const lvl = i + 1;
            if (lvl <= shown) return <li key={lvl} className="open"><b>{lvl}. {title}</b><p>{hints[i]}</p></li>;
            if (lvl === shown + 1) return <li key={lvl}><button type="button" className="st-help-next" disabled={busy} onClick={() => ask(lvl)}>{lvl}. {title}<span>Odhalit</span></button></li>;
            return <li key={lvl} className="locked"><b>{lvl}. {title}</b><p>Nejdřív odhalte předchozí úroveň.</p></li>;
          })}
        </ol>
      )}
      {err && <p className="st-err" role="alert">{err}</p>}
      {confirm3 && createPortal(
        <div className="st-modal" role="dialog" aria-modal="true" onClick={() => setConfirm3(false)}>
          <div className="st-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Požádat o odbornou asistenci?</h3>
            <p>I nejlepší detektivové občas potřebují pomoc. Tato nápověda vám výrazně usnadní pátrání, ale její využití se zaznamená do týmového spisu.</p>
            <div className="st-modal-btns">
              <button type="button" className="st-modal-back" autoFocus onClick={() => setConfirm3(false)}>Zpět</button>
              <button type="button" className="st-modal-go" disabled={busy} onClick={() => reveal(3)}>Odhalit nápovědu</button>
            </div>
          </div>
        </div>, document.body)}
    </div>
  );
}

// Stanoviště s ověřením odpovědi (např. křížovka) – typ physical-puzzle.
function PuzzleStation({ station, stationIndex, total, isDone, onComplete, onGoOverview, onGoMap, qrKey, canSave, hintLevel, onOpenHint }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const rm = useReducedMotion();
  const [value, setValue] = useState("");
  const isWords = station.answerMode === "words";
  const [words, setWords] = useState(() => Array((station.answerWords || []).length).fill(""));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const story = STATION_STORY[station.id];
  const introKey = `st_intro_${station.id}`;
  const introSeen = () => { try { return localStorage.getItem(introKey) === "1"; } catch { return true; } };
  const [phase, setPhase] = useState(isDone ? "solved" : story?.intro && !introSeen() ? "intro" : "form");   // intro | form | anim | finale | outro | solved
  const [saveState, setSaveState] = useState(isDone ? "saved" : "idle");
  const [appear, setAppear] = useState(false);
  const [qrOk, setQrOk] = useState(false);

  // QR kód ze schránky: #/stanoviste/N?k=KOD → kód se ověří a stačí jedno klepnutí
  useEffect(() => {
    let alive = true;
    if (qrKey && !isDone) checkAnswer(station, qrKey).then((ok) => { if (alive) { setQrOk(ok); if (ok) setValue(qrKey); } });
    return () => { alive = false; };
  }, [qrKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // vyřešil to mezitím někdo jiný z týmu → ukaž rovnou důkaz
  useEffect(() => {
    if (isDone && phase === "form") { setPhase("solved"); setSaveState("saved"); }
    // řešení bylo vráceno v administraci → znovu formulář
    if (!isDone && phase === "solved" && saveState === "saved") { setPhase("form"); setSaveState("idle"); setBusy(false); setValue(""); }
  }, [isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    setSaveState("saving");
    try { await onComplete(stationIndex); setSaveState("saved"); }
    catch { setSaveState("error"); }
  };

  const toOutro = () => {
    window.scrollTo({ top: 0 });
    if (story?.outro) setPhase("outro"); else { setAppear(true); setPhase("solved"); }
  };
  const afterAnim = () => {
    window.scrollTo({ top: 0 });
    if (station.evidence?.finale) setPhase("finale"); else toOutro();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy || phase !== "form") return;          // dvojklik / opakované odeslání
    setBusy(true);
    let ok;
    let near = "";
    try {
      if (isWords) {
        const r = await checkWords(station, words);
        ok = r.ok;
        if (!ok && r.matched > 0) near = ` Sedí ${r.matched} z ${r.total} slov.`;
      } else ok = await checkAnswer(station, value);
    } catch (ex) {
      // např. prohlížeč bez podpory kryptografie: ať tlačítko nezůstane navždy zablokované
      console.error(ex); setErr("Odpověď se nepodařilo ověřit. Zkuste stránku obnovit nebo ji otevřít v jiném prohlížeči."); setBusy(false); return;
    }
    if (!ok) { setErr(station.wrongMessage + near); setWrongCount((n) => n + 1); setBusy(false); return; }
    setErr("");
    if (rm) { setPhase("solved"); } else { setPhase("anim"); }
    save();                                         // ukládá se hned, aby se nic neztratilo při odchodu ze stránky
  };

  return (
    <section className="block" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <p className="eyebrow">Stanoviště {stationIndex + 1} z {total}, {station.name}</p>
        <h1 className="display">{station.title}</h1>

        <div className="case-bg">
          {phase === "solved" ? (
            <EvidenceCard station={station} saveState={saveState} onRetry={save} onGoMap={onGoMap} onGoOverview={onGoOverview} appear={appear} />
          ) : (
            <div className="case-card tilt-l" style={phase === "anim" || phase === "finale" || phase === "outro" ? { visibility: "hidden" } : undefined}>
              <Pushpin style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)" }} />
              <ClueTag>Zadání</ClueTag>
              {qrOk ? <p className="st-qr">{station.qrMessage || "Kód ověřen."}{!canSave && " Nejdřív se přihlaste, aby se důkaz uložil do spisu vašeho týmu."}</p>
                    : <p className="st-prompt">{station.prompt}</p>}
              <form onSubmit={submit} className="st-form" noValidate>
                {isWords ? (
                  <fieldset className="st-words" disabled={phase !== "form"}>
                    <legend>{station.answerLabel}</legend>
                    {words.map((w, i) => (
                      <input key={i} type="text" aria-label={`Slovo ${i + 1}`} placeholder={`Slovo ${i + 1}`} value={w} autoComplete="off" spellCheck="false"
                             onChange={(e) => { setWords((a) => a.map((x, k) => (k === i ? e.target.value : x))); if (err) setErr(""); }} />
                    ))}
                  </fieldset>
                ) : (
                <div className="field" style={{ flex: 1, minWidth: 200 }}>
                  <label htmlFor="st-answer">{station.answerLabel}</label>
                  <input id="st-answer" type="text" inputMode={station.answerMode === "numeric" ? "numeric" : undefined} value={value} autoComplete="off" autoCapitalize="characters" spellCheck="false"
                         maxLength={station.answerMode === "numeric" ? 4 : undefined}
                         onChange={(e) => { const v = station.answerMode === "numeric" ? e.target.value.replace(/\D/g, "") : e.target.value; setValue(v); if (err) setErr(""); }} disabled={phase !== "form"} />
                </div>
                )}
                <TagButton type="submit" color="#3a5a3a" textColor="#fff" rotate={1} disabled={busy || (isWords ? words.some((w) => !w.trim()) : !value.trim()) || (qrOk && !canSave)} style={{ alignSelf: "flex-end" }}>
                  {station.submitLabel}
                </TagButton>
              </form>
              <p className="st-err" role="alert">{err}</p>
              {wrongCount >= 3 && !helpOpen && !qrOk && <p className="st-nudge">Zasekli jste se? <button type="button" className="st-hint-btn" onClick={() => setHelpOpen(true)}>Podívejte se do nápověd</button></p>}
              {!qrOk && <HelpPanel station={station} level={hintLevel || 0} onOpenHint={onOpenHint ? (l) => onOpenHint(stationIndex, l) : null} open={helpOpen} onToggle={() => setHelpOpen((o) => !o)} />}
              <div style={{ marginTop: 14 }}>
                <TagButton color="#d8c9a3" rotate={-1} onClick={onGoMap}>Zpět na mapu</TagButton>
              </div>
            </div>
          )}
        </div>
      </div>
      {phase === "finale" && <FinaleView finale={station.evidence.finale} rm={rm} onContinue={toOutro} />}
      {phase === "intro" && <GameIntro scenes={[story.intro]} finishLabel="Začít úkol" onDone={() => { try { localStorage.setItem(introKey, "1"); } catch { /* bez ukládání */ } setPhase("form"); }} />}
      {phase === "outro" && <GameIntro scenes={[story.outro]} finishLabel="Zobrazit důkaz" onDone={() => { setAppear(true); setPhase("solved"); window.scrollTo({ top: 0 }); }} />}
      {phase === "anim" && (station.reveal === "folder"
        ? <FolderReveal docImage={docSrc(station.evidence)} number={station.evidence.number} withBox={station.revealBox} onDone={afterAnim} />
        : <EvidenceReveal docImage={docSrc(station.evidence)} onDone={afterAnim} />
      )}
    </section>
  );
}

// Stanoviště, jejichž obsah ještě není hotový – zástupná stránka (libovolný text potvrdí demo).
function PlaceholderStation({ station, stationIndex, total, isDone, onComplete, onGoOverview, onGoMap }) {
  return (
    <section className="block" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <p className="eyebrow">Stanoviště {stationIndex + 1} z {total}</p>
        <h1 className="display">{station.name}</h1>
        <div className="case-bg">
          <div className="case-card tilt-l">
            <Pushpin style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)" }} />
            <ClueTag>Stopa č. {stationIndex + 1}</ClueTag>
            <div style={{ margin: "18px 0 20px", display: "flex", justifyContent: "center" }}>
              <Polaroid rotate={-2}>
                <span style={{ color: "#8a7a68", fontSize: 12.5, padding: "0 14px", textAlign: "center" }}>
                  sem přijde fotka / důkaz<span className="placeholder">obsah later</span>
                </span>
              </Polaroid>
            </div>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <TapeStrip rotate={2} />
              <NoteBg style={{ fontSize: 14.5, color: "#2c2416" }}>
                Sem přijde text hádanky/indicie pro toto stanoviště.
                <span className="placeholder">obsah later</span>
              </NoteBg>
            </div>
            {!isDone ? (
              <form onSubmit={(e) => { e.preventDefault(); onComplete(stationIndex); }} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div className="field" style={{ flex: 1, minWidth: 200 }}>
                  <label>Zadejte odpověď / heslo</label>
                  <input type="text" placeholder="zatím libovolný text potvrdí demo" />
                </div>
                <TagButton type="submit" color="#3a5a3a" textColor="#fff" rotate={1} style={{ alignSelf: "flex-end" }}>Ověřit</TagButton>
              </form>
            ) : (
              <div style={{ border: "1px solid rgba(58,90,58,0.4)", padding: "18px 20px" }}>
                <p style={{ margin: 0, fontSize: 15 }}><b>Stanoviště vyřešeno ✓</b></p>
              </div>
            )}
            <div style={{ display: "flex", gap: 16, marginTop: 22, flexWrap: "wrap" }}>
              <TagButton color="#d8c9a3" rotate={-1} onClick={onGoMap}>Zpět na mapu</TagButton>
              <TagButton color="#d8c9a3" rotate={1} onClick={onGoOverview}>Spis týmu</TagButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StationPage({ stationIndex, stations, isDone, onComplete, onGoOverview, onGoMap, qrKey, canSave = true, hintLevel = 0, onOpenHint }) {
  const station = stations[stationIndex];
  const total = stations.length;
  if (!station) {
    return (
      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <p className="lede">Tohle stanoviště neexistuje.</p>
          <TagButton color="#d8c9a3" style={{ marginTop: 16 }} onClick={onGoOverview}>Zpět na přehled</TagButton>
        </div>
      </section>
    );
  }
  const props = { station, stationIndex, total, isDone, onComplete, onGoOverview, onGoMap, qrKey, canSave, hintLevel, onOpenHint };
  return (station.answerHash || station.answerWords) && station.evidence
    ? <PuzzleStation key={station.id} {...props} />
    : <PlaceholderStation key={station.id} {...props} />;
}
