// Filmová intra a outra stanovišť (scény pro GameIntro). INTRO se přehraje při prvním otevření stanoviště,
// OUTRO po založení důkazu. Pravidlo: intro položí otázku, úkol přinese důkaz, outro vysvětlí jeho význam, ale neprozradí závěr.
// Pozadí: každou scénu lze doplnit o  bg (obrázek), pos, zoom – bez bg se použije společné pozadí (stůl).
// Texty upravujte tady; klíč = id stanoviště ze stations.js.

import st1 from "../assets/intro/st1_praha.webp";
import st2 from "../assets/intro/st2_ucty.webp";
import st3 from "../assets/intro/st3_dvere.webp";
import st4 from "../assets/intro/st4_hodiny.webp";
import o1 from "../assets/intro/st1_outro.webp";
import o2 from "../assets/intro/st2_outro.webp";
import o3 from "../assets/intro/st3_outro.webp";
import o4 from "../assets/intro/st4_outro.webp";

// Intro a outro mají každé svůj obraz (outro = důkaz, který úkol přinesl).
const BG = { s01: { low: true, bg: st1, pos: "50% 40%", zoom: 1.08 }, s02: { low: true, bg: st2, pos: "50% 50%", zoom: 1.08 }, s03: { low: true, bg: st3, pos: "50% 45%", zoom: 1.08 }, s04: { low: true, bg: st4, pos: "50% 50%", zoom: 1.1 } };

const OUT = { s01: { low: true, bg: o1, pos: "50% 50%", zoom: 1.08 }, s02: { low: true, bg: o2, pos: "50% 50%", zoom: 1.08 }, s03: { low: true, bg: o3, pos: "50% 40%", zoom: 1.08 }, s04: { low: true, bg: o4, pos: "50% 45%", zoom: 1.08 } };

const RAW = {
  s01: {
    intro: { kicker: "Stanoviště 1 · Tajemství minulosti", title: "Žena se dvěma životy", lines: [
      "Eleanor Whitmoreová nebyla vždy Eleanor. Narodila se jako Eliška Vránová a v roce 1948 opustila Československo.",
      "Po desítkách let se začala znovu zajímat o svou minulost. Proč právě teď?",
    ] },
    outro: { kicker: "Stanoviště 1 · Indicie", title: "Nezapomenuté kořeny", lines: [
      "Eleanor znovu navázala kontakt s příbuznými v Evropě. Krátce před smrtí navíc nechala mimo panství uložit důležitý dokument.",
      "Co obsahoval?",
      "Indicie: rodinná korespondence a zmínka o skrytém dokumentu.",
    ] },
  },
  s02: {
    intro: { kicker: "Stanoviště 2 · Účetnictví, které lže", title: "Kam mizely peníze?", lines: [
      "Správa milionového majetku vyžaduje důvěru. Eleanor ji svěřila lidem ze svého nejbližšího okolí.",
      "Pak si ale všimla nesrovnalostí v účetnictví.",
    ] },
    outro: { kicker: "Stanoviště 2 · Indicie", title: "Účty nelžou. Lidé ano.", lines: [
      "Čtyři podezřelé převody. Celkem 120 000 dolarů. Všechny směřovaly na stejný účet.",
      "Eleanor požadovala vysvětlení. Kdo měl možnost převody provést?",
      "Indicie: bankovní výpisy, účetní kniha, schvalovací záznamy a Eleanorin dopis Edwardovi.",
    ] },
  },
  s03: {
    intro: { kicker: "Stanoviště 3 · Nepozvaný host", title: "Rodinné vztahy mají svou cenu", lines: [
      "Eleanořino bohatství přitahovalo nejen obdiv, ale i očekávání.",
      "Její synovec Richard se dostal do finančních potíží. A s tetou měl nevyřízené účty.",
    ] },
    outro: { kicker: "Stanoviště 3 · Indicie", title: "Výhrůžka na papíře", lines: [
      "Richard se dozvěděl o plánované změně závěti. Eleanor vyhrožoval a rozhodl se přijít, přestože nebyl pozván.",
      "Měl motiv. Ale měl také příležitost?",
      "Indicie: Richardův dopis, jeho dluhy, zákaz návštěvy a informace o plánované změně závěti.",
    ] },
  },
  s04: {
    intro: { kicker: "Stanoviště 4 · Poslední hodina", title: "Co se stalo za zavřenými dveřmi?", lines: [
      "V osudnou noc se na panství setkali lidé s různými zájmy. Někteří se hádali. Jiní tvrdí, že nic neviděli.",
      "Sestavte poslední hodinu Eleanořina života.",
    ] },
    outro: { kicker: "Stanoviště 4 · Indicie", title: "23:17 – Poslední výkřik", lines: [
      "Eleanor chtěla změnit závěť a nechat prověřit správu svého majetku.",
      "Z pracovny zmizelo mosazné těžítko. A Agnes zřejmě neřekla celou pravdu.",
      "Co před ostatními skrývá?",
      "Indicie: časová osa, plán nezávislé kontroly, zmizelé těžítko a podezřelá výpověď Agnes.",
    ] },
  },
};

export const STATION_STORY = Object.fromEntries(Object.entries(RAW).map(([id, v]) => [id, { intro: { ...BG[id], ...v.intro }, outro: { ...OUT[id], ...v.outro } }]));
