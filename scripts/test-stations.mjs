// Spuštění:  node scripts/test-stations.mjs
import { normalizeAnswer, checkAnswer, checkWords } from "../src/stations/answer.js";
import { STATIONS } from "../src/stations/stations.js";

const s1 = STATIONS[0];
let fails = 0;
const t = async (input, expected) => {
  const got = await checkAnswer(s1, input);
  const ok = got === expected;
  if (!ok) fails++;
  console.log(`${ok ? "OK  " : "CHYBA"} ${JSON.stringify(input)} → ${got} (čekáno ${expected})  [${normalizeAnswer(input)}]`);
};
await t("SKRYTÝ DOKUMENT", true);
await t("skryty dokument", true);
await t("SKRYTYDOKUMENT", true);
await t("  Skrytý  dokument! ", true);
await t("skrytý-dokument", true);
await t("SKRYTY DOKUMENTY", false);
await t("SKRYTA ZAVET", false);
await t("", false);
await t("NORSKO", false);
// tajenka z odpovědí křížovky (kontrola tiskového podkladu)
const rows = [["NORSKO", "SK"], ["BRYLE", "R"], ["REALITYSHOW", "Y"], ["OCTAVIA1", "T"], ["KENNY", "Y"], ["DETI", "D"], ["OBA", "O"], ["TERKA", "K"], ["LUKAS", "U"], ["RAMMSTEIN", "M"], ["ZEROCOLA", "E"], ["SLOVENSKO", "N"], ["TINDER", "T"]];
const secret = rows.map(([, g]) => g).join("");
const lettersOk = rows.every(([w, g]) => [...g].every((c) => w.includes(c)));
console.log(`${secret === "SKRYTYDOKUMENT" && lettersOk ? "OK  " : "CHYBA"} tajenka z křížovky = ${secret}, zlatá písmena jsou ve slovech: ${lettersOk}`);
if (secret !== "SKRYTYDOKUMENT" || !lettersOk) fails++;
// stanoviště 2 – kód ze zámku
const s2 = STATIONS[1];
for (const [inp, exp] of [["4813", true], [" 48 13 ", true], ["48513", false], ["451", false], ["1348", false], ["", false]]) {
  const got = await checkAnswer(s2, inp);
  if (got !== exp) fails++;
  console.log(`${got === exp ? "OK  " : "CHYBA"} stanoviště 2 ${JSON.stringify(inp)} → ${got} (čekáno ${exp})`);
}
console.log(`${STATIONS.length === 5 ? "OK  " : "CHYBA"} počet stanovišť = ${STATIONS.length}`);
if (STATIONS.length !== 5) fails++;
// stanoviště 3 – šest slov z kartiček, pořadí je jedno
const s3 = STATIONS[2];
for (const [inp, ok, n] of [[["Křivda", "věřitel", "ZÁVĚŤ", "naslouchat", "výhrůžka", "nepozvaný"], true, 6], [["nepozvaný", "výhrůžka", "naslouchání", "zavet", "veritel", "krivda"], true, 6], [["křivda", "křivda", "závěť", "naslouchat", "výhrůžka", "nepozvaný"], false, 5], [["a", "b", "c", "d", "e", "f"], false, 0], [["křivda", "", "", "", "", ""], false, 1]]) {
  const r = await checkWords(s3, inp);
  const good = r.ok === ok && r.matched === n;
  if (!good) fails++;
  console.log(`${good ? "OK  " : "CHYBA"} stanoviště 3 ${JSON.stringify(inp)} → ${r.matched}/${r.total}, ok=${r.ok}`);
}
// stanoviště 4 – jméno z přebývající kartičky
const s4 = STATIONS[3];
for (const [inp, exp] of [["Agnes", true], ["agnes doyleová", true], ["Doyleová", true], ["AGNES!", true], ["Margaret", false], ["Richard", false], ["", false]]) {
  const got = await checkAnswer(s4, inp);
  if (got !== exp) fails++;
  console.log(`${got === exp ? "OK  " : "CHYBA"} stanoviště 4 ${JSON.stringify(inp)} → ${got} (čekáno ${exp})`);
}
// nápovědy: u každého stanoviště s nápovědami přesně 3 a žádná neprozradí řešení
const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const secrets = { s01: "SKRYTYDOKUMENT", s02: "4813", s03: "NEPOZVANY", s04: "AGNES" };
for (const st of STATIONS) {
  if (!st.hints) continue;
  const ok = st.hints.length === 3 && !st.hints.some((h) => secrets[st.id] && norm(h).includes(secrets[st.id]));
  console.log(`${ok ? "OK  " : "CHYBA"} nápovědy ${st.id}: ${st.hints.length}, bez prozrazení řešení`);
  if (!ok) fails++;
}
process.exit(fails ? 1 : 0);
