// Pět podezřelých – úvodní složky bez spoilerů. Výpovědi a alibi se odemykají až s důkazy ze stanovišť.
import richardImg from "../assets/suspects/richard.webp";
import margaretImg from "../assets/suspects/margaret.webp";
import edwardImg from "../assets/suspects/edward.webp";
import agnesImg from "../assets/suspects/agnes.webp";
import thomasImg from "../assets/suspects/thomas.webp";

export const SUSPECTS = [
  {
    id: "richard", name: "Richard Whitmore", relation: "Synovec",
    about: "Jediný blízký příbuzný Eleanor. Žije nad poměry a jeho dluhy rostou.",
    motive: "Dědictví by vyřešilo všechny jeho problémy.", portrait: richardImg,
  },
  {
    id: "margaret", name: "Margaret Bellová", relation: "Osobní sekretářka",
    about: "Eleanor jí svěřovala i ta největší tajemství. Poslední týdny se však jejich vztah změnil.",
    motive: "Strach z toho, co Eleanor odhalila.", portrait: margaretImg,
  },
  {
    id: "edward", name: "Edward Blackwood", relation: "Rodinný právník",
    about: "Spravoval Eleanoriny smlouvy i část financí. Znal obsah její poslední vůle.",
    motive: "Zmizení závěti mohlo zakrýt něco mnohem závažnějšího.", portrait: edwardImg,
  },
  {
    id: "agnes", name: "Agnes Doyleová", relation: "Hospodyně",
    about: "V domě sloužila přes dvacet let. Věděla, kdo přichází, odchází i co se děje za zavřenými dveřmi.",
    motive: "Tajemství, které chtěla za každou cenu ochránit.", portrait: agnesImg,
  },
  {
    id: "thomas", name: "Thomas Reed", relation: "Obchodní partner",
    about: "Pomáhal Eleanor vybudovat její jmění. Nedávno se však nepohodli kvůli společné investici.",
    motive: "Závěť mohla rozhodnout o majetku, na který si dělal nárok.", portrait: thomasImg,
  },
];
export const suspectById = (id) => SUSPECTS.find((s) => s.id === id);
