// Úvodní „minifilm“ před hrou: scény se zatmívají jedna do druhé. PROVIZORNÍ TEXTY – upravte tady.
// Každá scéna: kicker (malý nadpis), lines (řádky, objevují se postupně).
// Pozadí scény: bg (obrázek), pos (výřez, např. "20% 60%"), zoom (1–1.4, pomalý nájezd).
import manor from "../assets/intro/manor.webp";
import lampa from "../assets/intro/lampa.webp";
import vysetrovatele from "../assets/intro/vysetrovatele.webp";
import krok from "../assets/intro/krok.webp";

export const INTRO_SCENES = [
  { kicker: "Případ poslední vůle", bg: manor, pos: "50% 55%", zoom: 1.1, lines: ["48 milionů dolarů. Pět podezřelých. Jedna vražda.", "Eleanor Whitmoreová vybudovala obrovské jmění. Její život však skončil za záhadných okolností.", "Někdo z jejího nejbližšího okolí měl důvod chtít její smrt."] },
  { kicker: "Co se stalo", bg: lampa, pos: "50% 50%", zoom: 1.1, lines: ["Eleanor Whitmoreová byla nalezena mrtvá na svém panství Whitmore Manor. Bylo 23:30.", "Okolnosti její smrti zatím nikdo nevysvětlil."] },
  { kicker: "Vaše role", bg: vysetrovatele, pos: "50% 50%", zoom: 1.1, lines: ["Vy jste vyšetřovatelé.", "Pátrat budete v týmech. Tým vám přidělíme před svatbou."] },
  { kicker: "První krok", bg: krok, pos: "50% 55%", zoom: 1.1, lines: ["Ještě před svatbou vás čeká domácí úkol.", "Na stole zůstalo pár věcí z Eleanořiny dávné cesty. Začněte dopisem."] },
];
