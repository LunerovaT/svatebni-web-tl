// Všechny texty, údaje a čísla minihry „Poslední cesta Eleanor“.
// Úprava příběhu = úprava tohoto souboru. Šifra se přepočítá sama a při vývoji se kontroluje (cipher.js → verifyCipher).
import { encrypt } from "./cipher.js";

import ticketQm from "../assets/ht/ticket_qm.webp";
import ticketQmBack from "../assets/ht/ticket_qm_back.webp";
import ticketB from "../assets/ht/ticket_b.webp";
import ticketBBack from "../assets/ht/ticket_b_back.webp";
import booklet from "../assets/ht/booklet.webp";
import bookletInside from "../assets/ht/booklet_inside.webp";

export const CIPHER = {
  plain: "JEDEN Z PETI NEBYL POZVAN",          // šifruje se bez diakritiky (A–Z)
  display: "JEDEN Z PĚTI NEBYL POZVÁN.",       // takto se zobrazí při odhalení
  key: 7,                                       // číslo kajuty C-07 (písmeno C je paluba, ne klíč)
  expectedCipher: "QLKLU G WLAP ULIFS WVGCHU",  // ověřeno výpočtem
};
export const CIPHERTEXT = encrypt(CIPHER.plain, CIPHER.key);
export const CIPHER_WORDS = CIPHERTEXT.split(" ");
export const CIPHER_LETTERS = CIPHER_WORDS.join("").split("");
export const SLOT_COUNT = CIPHER_LETTERS.length; // 21

// Poznámky ke špatnému posunu kotouče (posun 0–25 → věta). Správný klíč sem nepatří.
export const SHIFT_FEEDBACK = {
  3: "C je paluba, ne dveře.",
  10: "Nic nesčítejte.",
  19: "Z vnějšího kruhu dovnitř, ne naopak.",
  12: "Tahle kajuta Eleanor nepatřila.",
  4: "Tahle kajuta Eleanor nepatřila.",
};

// Tři cestovní doklady. Údaje jsou zapečené v obrázcích (src/assets/ht) – tady jsou pro logiku, alt texty a spis.
export const DOCS = [
  {
    id: "qm", correct: true, kind: "ticket",
    title: "Palubní lístek Cunard Line",
    front: ticketQm, back: ticketQmBack, ratio: 1438 / 542,
    ship: "R.M.S. Queen Mary", passenger: "Miss E. Vranova", from: "Southampton", to: "New York",
    date: "14 May 1948", cls: "First", cabin: "C-07", no: "30418",
  },
  {
    id: "qe", correct: false, kind: "ticket",
    title: "Palubní lístek White Star",
    front: ticketB, back: ticketBBack, ratio: 1038 / 275,
    ship: "R.M.S. Queen Elizabeth", passenger: "Mr. E. Vavra", from: "Cherbourg", to: "New York",
    date: "21 May 1948", cls: "Tourist", cabin: "B-12", no: "30977",
  },
  {
    id: "nov", correct: false, kind: "booklet",
    title: "Cestovní knížka Cunard",
    front: booklet, inside: bookletInside, ratio: 419 / 490, insideRatio: 840 / 980,
    ship: "R.M.S. Queen Mary", passenger: "Mrs. E. Novotna", from: "Southampton", to: "New York",
    date: "14 May 1948", cls: "Tourist", cabin: "A-04", no: "30452",
  },
];
export const docAlt = (d) => `${d.title}: ${d.ship}, cestující ${d.passenger}, ${d.from} – ${d.to}, ${d.date}, třída ${d.cls}, kajuta ${d.cabin}, číslo ${d.no}.`;

// Neviditelný inkoust na zadní straně pravého lístku (v procentech plochy zadní strany).
export const INK = {
  line: "Nespala jsem pod písmenem, ale pod číslem. O tolik kroků ušlo každé písmeno.",
  box: { left: 7, top: 24, width: 86, height: 66 },
};

export const STORY = {
  title: "Poslední cesta Eleanor",
  caseName: "Případ poslední vůle",
  intro: [
    "Whitmore Manor, 02:40.",
    "Eleanor Whitmoreová je mrtvá. Majetek za 48 milionů dolarů čeká na závěť, která zmizela.",
    "Na jejím stole zůstalo pár věcí ze staré cesty.",
    "Vy jste vyšetřovatel. Začněte dopisem.",
  ],
  envelopeAddress: "Tomu, kdo přijde po mně",
  letter: {
    dateline: "Pracovna, hodinu před půlnocí",
    paragraphs: [
      "Milý neznámý příteli,",
      "jestli čtete tyto řádky, nedožila jsem se rána. Moje poslední vůle zmizela dřív než já.",
      "Jméno napsat nemohu. Tento dům má uši.",
      "Pravdu jsem ukryla tam, kde začal můj druhý život: za dveřmi, za kterými jsem poprvé usnula na moři.",
      "Kdo pozná, kým jsem byla, než jsem se stala Eleanor, ty dveře najde.",
    ],
    signature: "E. W.",
  },
  photoBackText: "Southampton, květen 1948. Ať nikdy nezapomeneš, odkud jsi vyplula. — maminka", // zapečeno v photo_back.webp
  hints: [
    "Eleanor nebyla vždycky Eleanor. Podívejte se pořádně na dívku na fotografii a na její kufr.",
    "Fotka prozrazuje dvě věci, které musí sedět i na dokladu: iniciály a jméno lodi. Splňuje je jediný doklad.",
    "Pravý je lístek na Queen Mary pro E. Vranovou, kajuta C-07. Označte ho, otočte a posviťte lampou. Písmeno je paluba, dveře mají číslo 7: nastavte posun 7.",
  ],
  msg: {
    docNothingSide: "Na téhle straně nic. Zkuste i druhou.",
    docWrong: "Na tomhle dokladu nic není. Sedí opravdu s fotografií?",
    lampNeedsDesignation: "Lampou posvítíte jen na doklad, který označíte jako Eleanořin.",
    inkFound: "Inkoust ztmavl. Zpráva je opsaná v zápisníku u kotouče.",
    noCipherYet: "Zatím nemáte žádnou zašifrovanou zprávu. Prozkoumejte stůl.",
    mixed: "Přepis je poskládaný z různých poloh kotouče. Nastavte kotouč jednou a přepište zprávu znovu.",
    generic: "Tohle česky není. Zkuste jiný posun.",
  },
  file: {
    evidence: "Palubní lístek R.M.S. Queen Mary, kajuta C-07",
    finding: "Jeden z pěti podezřelých nebyl pozván.",
    status: "Totožnost neznámá",
    nextTask: "Ověřit seznam hostů a časovou osu událostí.",
    closing: ["VYŠETŘOVÁNÍ", "POKRAČUJE", "NA SVATBĚ"],
  },
  revealAfter: "Eleanor věděla, že mezi pěti hosty sedí někdo, koho nezvala.",
};
