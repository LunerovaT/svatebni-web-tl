// Po vyřešení domácího úkolu: postupné představení pěti podezřelých (texty a portréty ze suspects.js), pak první indicie.
import { SUSPECTS } from "./suspects.js";

export const SUSPECT_SCENES = [
  { kicker: "Případ poslední vůle", lines: ["V domě té noci zůstalo pět lidí.", "Každý z nich měl k Eleanor blízko. A každý něco skrýval."] },
  ...SUSPECTS.map((s, i) => ({
    kicker: `Podezřelý ${i + 1} z ${SUSPECTS.length}`,
    title: s.name,
    sub: s.relation,
    image: s.portrait,
    lines: [s.about],
  })),
  { kicker: "První indicie", lines: ["Pět podezřelých.", "Eleanor věděla, že mezi nimi sedí někdo, koho nezvala."] },
];
