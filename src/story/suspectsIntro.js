// Po vyřešení domácího úkolu: postupné představení pěti podezřelých (texty a portréty ze suspects.js), pak první indicie.
import { SUSPECTS } from "./suspects.js";
import lampa from "../assets/intro/lampa.webp";
import margaret from "../assets/intro/margaret.webp";
import desk from "../assets/intro/desk.webp";

const BLUR = { bg: desk, pos: "50% 60%", zoom: 1.2 };

export const SUSPECT_SCENES = [
  { kicker: "Případ poslední vůle", bg: lampa, pos: "50% 50%", zoom: 1.1, lines: ["V domě té noci zůstalo pět lidí.", "Každý z nich měl k Eleanor blízko. A každý něco skrýval."] },
  ...SUSPECTS.map((s, i) => ({
    ...(s.id === "margaret" ? { bg: margaret, pos: "50% 50%", zoom: 1.1 } : BLUR),
    kicker: `Podezřelý ${i + 1} z ${SUSPECTS.length}`,
    title: s.name,
    sub: s.relation,
    image: s.portrait,
    lines: [s.about],
  })),
  { kicker: "První indicie", ...BLUR, lines: ["Pět podezřelých.", "Jeden z pěti nebyl pozván."] },
];
