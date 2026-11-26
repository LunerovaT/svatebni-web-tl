// Pět podezřelých – úvodní složky bez spoilerů (vidí je hosté už v domácím úkolu). Možné motivy jsou v suspectMotives.js (jen ve hře na svatbě). Výpovědi a alibi se odemykají až s důkazy ze stanovišť.
import richardImg from "../assets/suspects/richard.webp";
import margaretImg from "../assets/suspects/margaret.webp";
import edwardImg from "../assets/suspects/edward.webp";
import agnesImg from "../assets/suspects/agnes.webp";
import thomasImg from "../assets/suspects/thomas.webp";

export const SUSPECTS = [
  {
    id: "richard", name: "Richard Whitmore", relation: "Synovec",
    about: "Jediný blízký příbuzný Eleanor. Žije nad poměry a jeho dluhy rostou.", portrait: richardImg,
  },
  {
    id: "margaret", name: "Margaret Bellová", relation: "Osobní sekretářka",
    about: "Eleanor jí svěřovala i ta největší tajemství. Poslední týdny se však jejich vztah změnil.", portrait: margaretImg,
  },
  {
    id: "edward", name: "Edward Blackwood", relation: "Rodinný právník",
    about: "Spravoval Eleanoriny smlouvy i část financí. Znal obsah její poslední vůle.", portrait: edwardImg,
  },
  {
    id: "agnes", name: "Agnes Doyleová", relation: "Hospodyně",
    about: "V domě sloužila přes dvacet let. Věděla, kdo přichází, odchází i co se děje za zavřenými dveřmi.", portrait: agnesImg,
  },
  {
    id: "thomas", name: "Thomas Reed", relation: "Obchodní partner",
    about: "Pomáhal Eleanor vybudovat její jmění. Nedávno se však nepohodli kvůli společné investici.", portrait: thomasImg,
  },
];
