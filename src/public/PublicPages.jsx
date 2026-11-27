import monogram from "../assets/monogram.webp";
import cluster from "../assets/cluster.webp";
import dressPhoto from "../assets/dresscode.webp";
import dressPhoto2 from "../assets/dresscode2.webp";
import dressPhoto3 from "../assets/dresscode3.webp";
import dressPhoto4 from "../assets/dresscode4.webp";
import corner from "../assets/corner.webp";
import { VENUE, DATES } from "./venue.js";
import { weddingCountdown } from "../countdown.js";

const Soon = ({ children = "Doplníme brzy" }) => <span className="pb-soon">{children}</span>;

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);

function Fact({ k, v, sub, href, onClick }) {
  const body = (<><span className="pb-fact-k">{k}</span><span className="pb-fact-v">{v}</span>{sub && <span className="pb-fact-s">{sub}</span>}</>);
  return href || onClick
    ? <a className="pb-fact link" href={href || "#"} onClick={onClick}>{body}</a>
    : <div className="pb-fact">{body}</div>;
}

function Timeline() {
  return (
      <div className="pb-timeline">
        <div className="pb-t"><div className="pb-t-time"><b>pá 30. 7.</b></div><div><h4>Chystání akce</h4><p>Začínají přípravy.</p></div></div>
        <div className="pb-t"><div className="pb-t-time"><b>so 31. 7.</b> <Soon>čas doplníme</Soon></div><div><h4>Příjezd hostů</h4><p>Příjezd a ubytování.</p></div></div>
        <div className="pb-t"><div className="pb-t-time"><Soon>čas doplníme</Soon></div><div><h4>Obřad</h4><p>Slavnostní chvíle, kvůli které jsme tady.</p></div></div>
        <div className="pb-t"><div className="pb-t-time"><Soon>čas doplníme</Soon></div><div><h4>Hostina a večerní program</h4><p>Jídlo, pití, tanec a také malé pátrání pro ty, kdo budou chtít.</p></div></div>
        <div className="pb-t"><div className="pb-t-time"><b>ne 1. 8., 12:00</b></div><div><h4>Konec nájmu</h4><p>Areál musí být vyklizený. Kolem 10:00 se začneme balit a uklízet.</p></div></div>
      </div>
  );
}

function DressSection() {
  return (
      <section className="pb-sec" id="dresscode">
        <div className="wrap"><div className="pb-dress">
          <div>
            <p className="eyebrow">co na sebe</p>
            <h2 className="display pb-h2">Dress code</h2>
            <div className="pb-dress-figs">
              <figure className="pb-dress-fig"><img src={dressPhoto} alt="Ilustrační foto: světlá košile, vesta, kšandy, motýlek a kšiltovka" loading="lazy" /></figure>
              <figure className="pb-dress-fig"><img src={dressPhoto2} alt="Ilustrační foto: kilt s košilí a koženým sporranem" loading="lazy" /></figure>
              <figure className="pb-dress-fig"><img src={dressPhoto4} alt="Ilustrační foto: pánský oblek s vestou a kravatou" loading="lazy" /></figure>
            </div>
            <figure className="pb-dress-lady">
              <img src={dressPhoto3} alt="Ilustrační foto: dáma v dlouhých smaragdových šatech" loading="lazy" />
              <figcaption className="pb-dress-lady-txt">cokoli, co není bílé</figcaption>
            </figure>
          </div>
          <div className="pb-dress-text">
            <p className="pb-dress-lead">Náš dress code je slavnostní, ale uvolněný. Chceme, abyste se cítili dobře a užili si den s námi, ne abyste se celý den trápili v saku nebo nepohodlných šatech.</p>
            <p>Rádi vás uvidíme v elegantním oblečení, ale stejně tak uvítáme i něco méně tradičního. Ať už dorazíte v kiltu, kimonu (ano, Janusi, to je narážka na tebe 😁), originálních šatech nebo čemkoli jiném, co vás vystihuje a v čem se cítíte sami sebou.</p>
            <p>Nebojte se dát svému outfitu vlastní charakter, trochu duše a originality. Právě to udělá náš den ještě pestřejším a osobnějším.</p>
            <p className="pb-dress-heels"><b>Pro dámy:</b> nevolte prosím příliš vysoké podpatky, terén bude všelijaký. Bílou barvu šatů prosím nechte doma.</p>
            <p className="pb-dress-end">Zkrátka – přijďte slavnostně, ale hlavně po svém! 💚</p>
            <p className="pb-ps"><b>P. S.:</b> Uvolněný dress code má přece jen své hranice. Kdo dorazí v teplákovce, bude s láskou, ale nekompromisně odeslán domů se převléct. 😁</p>
            <p className="pb-dress-cap pb-dress-cap2">Ilustrační fotky. Inspirace, žádná povinnost.</p>
          </div>
        </div></div>
      </section>
  );
}

export function HomePage({ go, rsvpDone }) {
  const countdown = weddingCountdown();
  return (
    <>
      <section className="pb-hero">
        <div className="wrap pb-hero-grid">
          <div className="pb-hero-text">
            <p className="eyebrow">{DATES.label} · {VENUE.name}, {VENUE.region}</p>
            <h1 className="display pb-h1">Bereme<br />se.</h1>
            <div className="pb-rule" />
            <p className="lede">Lukáš a Tereza vás zvou na svatbu na Vysočině. Najdete tu vše potřebné a pokud budete chtít, i něco navíc.</p>
            <a className="pb-bigcta" href="#/hra" onClick={(e) => { e.preventDefault(); go("hra"); }}>
              <span className="pb-bigcta-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="6.5" /><path d="M15 15l6 6" /><path d="M7.5 10a2.5 2.5 0 0 1 2.5-2.5" /></svg>
              </span>
              <span className="pb-bigcta-txt">
                <span className="pb-bigcta-k">Svatební detektivka</span>
                <span className="pb-bigcta-t">Zahrát si Případ poslední vůle</span>
                <span className="pb-bigcta-s">Začněte domácím úkolem, zbytek záhady vyřešíte na svatbě. Hra je dobrovolná.</span>
              </span>
              <span className="pb-bigcta-arrow" aria-hidden="true">→</span>
            </a>
            <div className="pb-cta">
              <a className="pb-btn solid" href="#/rsvp" onClick={(e) => { e.preventDefault(); go("rsvp"); }}>{rsvpDone ? "Účast potvrzena ✓" : "Potvrdit účast"}</a>
              <a className="pb-btn" href="#/kde" onClick={(e) => { e.preventDefault(); go("kde"); }}>Kdy a kde</a>
            </div>
            {countdown && <p className="pb-count">{countdown}</p>}
          </div>
          <div className="pb-hero-art"><img src={monogram} alt="Monogram L a T s ozubeným kolem a květinami" /></div>
        </div>
      </section>

      <section className="pb-facts-wrap">
        <div className="wrap"><div className="pb-facts">
          <Fact k="Kdy" v={DATES.label} sub="Program dne" href="#/program" onClick={(e) => { e.preventDefault(); go("program"); }} />
          <Fact k="Kde" v={VENUE.name} sub={`${VENUE.street}, ${VENUE.region}`} href={VENUE.googleMaps} />
          <Fact k="Dress code" v="Slavnostní, ale uvolněný" sub="Přijďte po svém" href="#dresscode" onClick={(e) => { e.preventDefault(); document.getElementById("dresscode")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
        </div></div>
      </section>

      <section className="pb-paths" id="jidlo">
        <img className="pb-paths-art" src={cluster} alt="" />
        <div className="wrap" style={{ position: "relative" }}>
          <div className="pb-paths-head">
            <p className="eyebrow" style={{ color: "#c9a962" }}>jídlo a pití</p>
            <h2 className="display">Jak to bude s jídlem</h2>
          </div>
          <div className="pb-food">
            <div className="pb-food-c">
              <h3>Sobota</h3>
              <p>O jídlo je postaráno. Pro všechny hosty bude připravený společný oběd a večer bohatý raut. Mezi obědem a rautem bude k dispozici také drobné pohoštění.</p>
            </div>
            <div className="pb-food-c">
              <h3>Pití</h3>
              <p>Na místě bude pivo ze sudu a nealko. Tvrdý alkohol bude v omezeném množství, určitě vás nezvládneme opít všechny, takže pokud máte větší spotřebu, určitě si přibalte nějakou lahev s sebou podle chuti :D 🍻</p>
            </div>
          </div>
          <p className="pb-food-note">Co konkrétně bude k jídlu, budeme teprve zveřejňovat. Dáme vám vědět.</p>
          <div className="pb-cta" style={{ marginTop: 22 }}>
            <a className="pb-btn solid" href="#/program" onClick={(e) => { e.preventDefault(); go("program"); }}>Program dne</a>
            <a className="pb-btn ghost" href="#/info" onClick={(e) => { e.preventDefault(); go("info"); }}>Všechny informace</a>
          </div>
        </div>
      </section>

      <DressSection />
    </>
  );
}

const TOP_Q = ["Jak to bude s jídlem?", "Co pití a alkohol?", "Bude bazén?"];
const FAQ = [
  ["Je pozvánka automaticky i pro +1?", [
    "Rádi bychom vás pozvali úplně všechny i s vašimi nejbližšími, ale kapacita areálu má své limity. ❤️ Proto jsme každému společně s pozvánkou dali vědět, s kolika osobami počítáme. Pokud si nejste jistí, klidně nám napište a společně to vyřešíme."]],
  ["Mohou přijet děti?", [
    "Děti jsou vítány! ❤️ Víme, že s nimi bývá občas veselo, a vůbec nám to nevadí. Pokud by během obřadu některé plakalo, budeme rádi, když s ním na chvilku poodejdete stranou (i když je dost pravděpodobné, že největší rámus bude dělat náš vlastní démon 😄).",
    "Kvůli kapacitě jsme i děti zohlednili v počtu hostů uvedeném u pozvánky. Pokud byste potřebovali cokoli změnit, dejte nám vědět."]],
  ["Jak to bude s jídlem?", [
    "Pátek: Na páteční odpoledne a večer nezajišťujeme společné stravování. Pokud dorazíte už v pátek, vezměte si prosím vlastní jídlo podle toho, na co budete mít chuť.",
    "Sobota: O jídlo už bude postaráno! Pro všechny hosty bude připravený společný oběd a večer bohatý raut. Mezi obědem a rautem bude k dispozici také drobné pohoštění."]],
  ["Co pití a alkohol?", [
    "Na místě bude pivo ze sudu a nealko. Tvrdý alkohol bude v omezeném množství, určitě vás nezvládneme opít všechny.",
    { b: "Takže můžu si přivézt vlastní tvrdý alkohol?" },
    "ANO! A budeme jen rádi! 🥃 Přivezte si, co máte rádi, pijte, bavte se a užijte si oslavu podle svého gusta. 🍻"]],
  ["Co je na místě k dispozici?", [
    "Elektřina, mobilní signál, pitná voda, sprchy i toalety. Zkrátka všechno potřebné, abychom společně zvládli víkend v pohodlí."]],
  ["Bude bazén?", [
    "Pokud všechno klapne podle plánu, bude k dispozici i bazén! 🏊",
    "Plavky si určitě přibalte (nebo je po 22. hodině klidně nechte v tašce 😁). Každopádně věříme, že se vykoupat půjde."]],
  ["Co když bude pršet?", [
    "Svatba se koná venku, ale pokud nám počasí nebude přát, schováme se do stodoly.",
    "Jsme na Vysočině, takže raději počítejte i s chladnějším počasím. Před svatbou mrkneme na předpověď a dáme vám vědět, jestli si máte přibalit i teplé svetry. 😁"]],
  ["Kdy se odjíždí?", [
    "V neděli kolem 12. hodiny už musí být všechno sbalené a areál vyklizený.",
    "Přibližně v 10 hodin se proto začneme pomalu probouzet, aktivovat a společně uklízet. Každá pomocná ruka se bude hodit! ❤️"]],
  ["Jak to bude s focením?", [
    "Na místě bude fotograf, který se postará o zachycení těch nejdůležitějších okamžiků.",
    "Budeme rádi, když si svatbu hlavně užijete vlastníma očima, ne přes displej telefonu. Foťte klidně taky, ale především se bavte!",
    "Po svatbě vytvoříme sdílený disk, kam budeme moct všichni nahrát své fotky a videa."]],
  ["Do kdy potvrdit účast?", [
    "Čím dřív, tím líp! ❤️ Pomůže nám to s organizací, jídlem i plánováním celého víkendu."]],
];

export function ProgramPage() {
  return (
    <>
      <section className="pb-page-head">
        <img className="pb-head-art" src={corner} alt="" />
        <div className="wrap" style={{ position: "relative" }}>
          <p className="eyebrow">{DATES.long}</p>
          <h1 className="display pb-h1s">Program</h1>
          <p className="lede">Jak bude vypadat víkend. Přesné časy doplníme, jakmile je budeme znát.</p>
        </div>
      </section>
      <section className="pb-sec">
        <div className="wrap">
          <Timeline />
        </div>
      </section>
    </>
  );
}

export function WherePage() {
  return (
    <>
      <section className="pb-page-head">
        <img className="pb-head-art" src={corner} alt="" />
        <div className="wrap" style={{ position: "relative" }}>
          <p className="eyebrow">praktické informace</p>
          <h1 className="display pb-h1s">Kdy a kde</h1>
          <p className="lede">Kde to bude a kdy. Průběh dne najdete v sekci Program.</p>
        </div>
      </section>

      <section className="pb-sec">
        <div className="wrap"><div className="pb-place">
          <div className="pb-place-main">
            <p className="eyebrow">místo</p>
            <h2 className="display pb-h2">{VENUE.name}</h2>
            <p className="pb-addr"><PinIcon /> <span>{VENUE.street}<br />{VENUE.zip} {VENUE.town}<br />kraj {VENUE.region}</span></p>
            <p className="pb-when"><b>{DATES.long}</b></p>
            <div className="pb-cta">
              <a className="pb-btn solid" href={VENUE.googleMaps} target="_blank" rel="noopener noreferrer">Otevřít v Google Maps</a>
              <a className="pb-btn" href={VENUE.mapyCz} target="_blank" rel="noopener noreferrer">Mapy.cz</a>
              <a className="pb-btn ghost" href={VENUE.web} target="_blank" rel="noopener noreferrer">Web areálu ↗</a>
            </div>
          </div>
          <div className="pb-place-note">
            <p className="eyebrow">dobré vědět</p>
            <p>Areál máme pronajatý do <b>{DATES.rentEnd}</b>. V neděli kolem 10:00 se začneme balit a uklízet, do 12:00 musí být vše sbalené.</p>
          </div>
        </div></div>
      </section>

    </>
  );
}

export function InfoPage() {
  return (
    <>
      <section className="pb-page-head">
        <img className="pb-head-art" src={corner} alt="" />
        <div className="wrap" style={{ position: "relative" }}>
          <p className="eyebrow">dobré vědět</p>
          <h1 className="display pb-h1s">Informace</h1>
          <p className="lede">Doprava, ubytování, jídlo a odpovědi na časté dotazy.</p>
        </div>
      </section>

      <section className="pb-sec">
        <div className="wrap pb-trio">
          <div className="pb-card"><h3>Doprava</h3><p>Na místě bude možnost parkování přímo v areálu.</p><p className="pb-small">Adresa: {VENUE.addressFull}.</p></div>
          <div className="pb-card"><h3>Ubytování</h3>
            <p>K dispozici bude omezené množství lůžek. Není v našich silách ufinancovat přespání pro všechny, proto si každý svou postýlku platí sám.</p>
            <ul className="pb-prices">
              <li><span>Hlavní část areálu</span><b>800 Kč os./noc</b></li>
              <li><span>Přistýlky</span><b>400 Kč os./noc</b></li>
              <li><span>Druhá část areálu</span><b>600 Kč os./noc</b></li>
              <li><span>Přespání ve stanu, autě nebo pod stolem</span><b>zdarma</b></li>
            </ul>
            <p>S každým se ohledně ubytování spojíme individuálně.</p>
          </div>
          <div className="pb-card"><h3>Dárky</h3><p>Svatba stojí ledvinu, proto budeme rádi za finanční příspěvky. Hmotné dárky prosím nevozte, všechno máme. 😄</p></div>
          {FAQ.filter(([q]) => TOP_Q.includes(q)).sort((x, y) => TOP_Q.indexOf(x[0]) - TOP_Q.indexOf(y[0])).map(([q, a]) => (
            <div className="pb-card pb-qa" key={q}>
              <h3>{q}</h3>
              <div className="pb-qa-a">{a.map((t, n) => (typeof t === "string" ? <p key={n}>{t}</p> : <p key={n}><b>{t.b}</b></p>))}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-sec pb-faqsec">
        <div className="wrap">
          <p className="eyebrow">na co se hosté ptají</p>
          <h2 className="display pb-h2">Časté dotazy</h2>
          <div className="pb-faqgrid">
            {FAQ.filter(([q]) => !TOP_Q.includes(q)).map(([q, a]) => (
              <div className="pb-card pb-qa" key={q}>
                <h3>{q}</h3>
                <div className="pb-qa-a">{a.map((t, n) => (typeof t === "string" ? <p key={n}>{t}</p> : <p key={n}><b>{t.b}</b></p>))}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
