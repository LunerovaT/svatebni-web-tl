// Po vyřešení domácího úkolu: postupné představení pěti podezřelých (texty a portréty ze suspects.js), pak první indicie.
import { SUSPECTS } from "./suspects.js";
import stul from "../assets/intro/stul.webp";

// Celé představení běží na jednom pozadí (nenačítá se znovu), mění se jen text a portrét.
const BLUR = { bg: stul, pos: "50% 50%", zoom: 1.1 };

export const SUSPECT_SCENES = [
  { kicker: "Případ poslední vůle", ...BLUR, lines: ["V domě té noci zůstalo pět lidí.", "Každý z nich měl k Eleanor blízko. A každý něco skrýval."] },
  ...SUSPECTS.map((s, i) => ({
    ...BLUR,
    kicker: `Podezřelý ${i + 1} z ${SUSPECTS.length}`,
    title: s.name,
    sub: s.relation,
    image: s.portrait,
    lines: [s.about],
  })),
  { kicker: "První indicie", ...BLUR, lines: ["Pět podezřelých.", "Jeden z pěti nebyl pozván."] },
];
