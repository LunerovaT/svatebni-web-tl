// Filmová intra a outra stanovišť (scény pro GameIntro). INTRO se přehraje při prvním otevření stanoviště,
// OUTRO po založení důkazu. Pravidlo: intro položí otázku, úkol přinese důkaz, outro vysvětlí jeho význam, ale neprozradí závěr.
// Obrázky (mobile first): bg = vodorovná verze, bgp = svislá 9:16 verze pro telefony (když chybí, použije se bg),
// pos / posp = výřez vodorovného obrázku na počítači / na telefonu na výšku, low = text dole, zoom = pomalý nájezd.
// Texty a obrázky upravujte tady; klíč = id stanoviště ze stations.js.
import st1 from "../assets/intro/st1_praha.webp";
import st2 from "../assets/intro/st2_ucty.webp";
import st2p from "../assets/intro/st2_intro_p.webp";
import st3 from "../assets/intro/st3_dvere.webp";
import st4 from "../assets/intro/st4_hodiny.webp";
import o1 from "../assets/intro/st1_outro.webp";
import o2 from "../assets/intro/st2_outro.webp";
import o3 from "../assets/intro/st3_outro.webp";
import o4 from "../assets/intro/st4_outro.webp";
import o4p from "../assets/intro/st4_outro_p.webp";

const IN = {
  s01: { low: true, bg: st1, pos: "50% 40%", posp: "44% 50%", zoom: 1.08 },
  s02: { low: true, bg: st2, bgp: st2p, pos: "50% 50%", zoom: 1.08 },
  s03: { low: true, bg: st3, pos: "50% 45%", posp: "24% 50%", zoom: 1.08 },
  s04: { low: true, bg: st4, pos: "50% 50%", posp: "52% 50%", zoom: 1.1 },
};
const OUT = {
  s01: { low: true, bg: o1, pos: "50% 50%", posp: "52% 50%", zoom: 1.08 },
  s02: { low: true, bg: o2, pos: "50% 50%", posp: "30% 50%", zoom: 1.08 },
  s03: { low: true, bg: o3, pos: "50% 40%", posp: "58% 50%", zoom: 1.08 },
  s04: { low: true, bg: o4, bgp: o4p, pos: "50% 45%", zoom: 1.08 },
};

const RAW = {
  s01: {
    intro: { kicker: "Stanoviště 1 · Tajemství minulosti", title: "Žena se dvěma životy", lines: [
      "Eleanor se narodila jako Eliška Vránová. V roce 1948 opustila Československo a začala nový život.",
    ] },
    outro: { kicker: "Stanoviště 1 · Indicie", title: "Nezapomenuté kořeny", lines: [
      "Po letech znovu našla svou evropskou rodinu. Krátce před smrtí nechala ukrýt důležitý dokument.",
    ] },
  },
  s02: {
    intro: { kicker: "Stanoviště 2 · Účetnictví, které lže", title: "Co skrývají účetní knihy?", lines: [
      "Správa milionového majetku vyžaduje důvěru. Eleanor ji svěřila lidem ze svého nejbližšího okolí.",
      "Pak si ale všimla nesrovnalostí v účetnictví.",
    ] },
    outro: { kicker: "Stanoviště 2 · Indicie", title: "Podezřelé převody", lines: [
      "Z účtů zmizelo 120 000 dolarů. Eleanor začala pátrat, kdo za převody stojí.",
    ] },
  },
  s03: {
    intro: { kicker: "Stanoviště 3 · Nepozvaný host", title: "Rodinné napětí", lines: [
      "Richard měl dluhy a obával se, že přijde o dědictví. Jeho vztah s Eleanor se vyostřoval.",
    ] },
    outro: { kicker: "Stanoviště 3 · Indicie", title: "Výhrůžka", lines: [
      "Richard Eleanor vyhrožoval a přišel na panství navzdory jejímu zákazu.",
    ] },
  },
  s04: {
    intro: { kicker: "Stanoviště 4 · Osudná noc", title: "Poslední hodina", lines: [
      "Pět podezřelých. Protichůdné výpovědi. Co se odehrálo před Eleanořinou smrtí?",
    ] },
    outro: { kicker: "Stanoviště 4 · Indicie", title: "Někdo něco tají", lines: [
      "Eleanor chtěla změnit závěť a prověřit finance. Ve 23:17 zazněl výkřik. Zmizelo těžítko a Agnes zřejmě lhala.",
    ] },
  },
};

export const STATION_STORY = Object.fromEntries(Object.entries(RAW).map(([id, v]) => [id, { intro: { ...IN[id], ...v.intro }, outro: { ...OUT[id], ...v.outro } }]));
