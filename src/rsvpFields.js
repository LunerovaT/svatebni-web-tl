// Jediné místo, kde je popsané, co hosté v „Potvrdit účast“ vyplňují a co organizátoři potvrzují zpět.
// Až přibude nová otázka (jídlo, alergie, …):
//   1) přidejte pole do formuláře (WeddingSite.jsx) a do pravidel (firestore.rules, seznam hasOnly),
//   2) přidejte řádek do COLUMNS níž – objeví se v přehledu v administraci, v exportu CSV i v profilu hosta.
//   (Pole, které tu chybí, se v administraci stejně zobrazí v sekci „Další odpovědi“.)

// Možnosti přespání: host zaškrtne všechno, co mu vyhovuje (ukládá se do pole sleepRank).
export const SLEEP_OPTIONS = [
  ["pokoj", "Nejlépe 1 celý pokoj"],
  ["sdileny", "Nevadí mi spát v místnosti s více lidmi"],
  ["stan_nevadi", "Nevadí mi stan/auto, pokud nebude místo"],
  ["stan_vlastni", "Preferuji svůj stan/auto"],
  ["stul", "Ustelu si klidně pod stolem, když na to přijde :D"],
];
export const SLEEP_LABELS = { ...Object.fromEntries(SLEEP_OPTIONS), stan: "Ve stanu / autě" };
export const SLEEP_SHORT = {
  pokoj: "celý pokoj", sdileny: "sdílený pokoj", stan_nevadi: "stan/auto, když nebude místo",
  stan_vlastni: "vlastní stan/auto", stul: "i pod stolem", stan: "stan / auto",
};
export const ARRIVAL_LABELS = { patek: "V pátek", sobota: "V sobotu ráno", jindy: "Jindy" };
export const TRAVEL_LABELS = { auto: "Autem", odvoz: "Potřebuje odvoz", jinak: "Jinak" };

// Všichni lidé z jedné odpovědi (hlavní osoba + další osoby); „stejně jako já“ se dosadí z hlavní osoby.
export const peopleOf = (r) => {
  if (r.attending !== "ano") return [];
  const main = { name: r.name, main: true, arrival: r.arrival, arrivalOther: r.arrivalOther, sleep: r.sleep, sleepRank: r.sleepRank || [], travel: r.travel, travelFrom: r.travelFrom, diet: r.diet };
  const rest = (r.guests || []).map((g) => ({
    name: g.name, main: false,
    arrival: !g.arrival || g.arrival === "same" ? r.arrival : g.arrival,
    arrivalOther: !g.arrival || g.arrival === "same" ? r.arrivalOther : g.arrivalOther,
    sleep: g.sleep, sleepRank: g.sleepRank || [], diet: g.diet,
    travel: !g.travel || g.travel === "same" ? r.travel : g.travel,
    travelFrom: !g.travel || g.travel === "same" ? r.travelFrom : g.travelFrom,
  }));
  return [main, ...rest];
};

export const persons = (r) => (r.attending === "ano" ? 1 + (r.guests?.length || 0) : 0);

const sleepOf = (p) => (p.sleep === "ne" ? "nepřespí" : (p.sleepRank || []).map((k) => SLEEP_SHORT[k] || k).join(" · ") || "přespí");
const arrivalOf = (p) => (ARRIVAL_LABELS[p.arrival] || p.arrival || "") + (p.arrival === "jindy" && p.arrivalOther ? `: ${p.arrivalOther}` : "");
const travelOf = (p) => (TRAVEL_LABELS[p.travel] || p.travel || "") + (p.travel === "odvoz" && p.travelFrom ? ` (${p.travelFrom})` : "");

export const sleepText = (r) => (r.attending !== "ano" ? "" : sleepOf(peopleOf(r)[0]));
export const arrivalText = (r) => (r.attending !== "ano" ? "" : arrivalOf(peopleOf(r)[0]));
export const travelText = (r) => (r.attending !== "ano" ? "" : travelOf(peopleOf(r)[0]));
// jedna osoba na řádek: „Teta Marie – příjezd V pátek; přespání: celý pokoj; doprava: Autem“
export const personLine = (p) => `${p.name} – přespání: ${sleepOf(p)}; doprava: ${travelOf(p)}${p.diet ? `; dieta: ${p.diet}` : ""}`;
export const dietText = (r) => (r.attending !== "ano" ? "" : peopleOf(r).filter((p) => p.diet).map((p) => (p.main ? p.diet : `${p.name}: ${p.diet}`)).join(" | "));
export const guestsText = (r) => peopleOf(r).slice(1).map(personLine).join(" | ");

// sloupce přehledu / CSV / souhrnu v profilu
export const COLUMNS = [
  { key: "attending", label: "Účast", get: (r) => (r.attending === "ano" ? "Přijde" : "Nepřijde") },
  { key: "persons", label: "Osob", get: (r) => (r.attending === "ano" ? String(persons(r)) : "0") },
  { key: "sleep", label: "Přespání (pořadí preferencí)", get: sleepText },
  { key: "travel", label: "Doprava", get: travelText },
  { key: "diet", label: "Dietní omezení", get: dietText },
  { key: "guests", label: "Další osoby", get: guestsText },
  { key: "wantsGame", label: "Hra", get: (r) => (r.wantsGame === "ano" ? "Hraje" : "Nehraje") },
  { key: "comment", label: "Vzkaz", get: (r) => r.comment || "" },
];

// co organizátor hostovi potvrzuje zpět (ukládá se do rsvps/{id}.confirm.{key} = { ok, text })
export const CONFIRM_ITEMS = [
  { key: "room", label: "Ubytování", placeholder: "např. Pokoj 3, hlavní budova" },
  { key: "food", label: "Jídlo", placeholder: "např. vegetariánské" },
];

export const KNOWN_KEYS = new Set([
  "id", "name", "contact", "attending", "wantsGame", "sleep", "sleepRank", "travel", "travelFrom", "travelOther",
  "arrival", "arrivalOther", "diet", "comment", "guests", "createdAt", "confirm", "guestNote",
]);

export const extraAnswers = (r) =>
  Object.keys(r).filter((k) => !KNOWN_KEYS.has(k)).map((k) => [k, typeof r[k] === "object" ? JSON.stringify(r[k]) : String(r[k])]);

export const toMs = (r) => r.createdAt?.toMillis?.() ?? 0;

// export do CSV pro Excel (středník + BOM kvůli češtině)
export const toCsv = (rows) => {
  const head = ["Jméno", "E-mail", ...COLUMNS.map((c) => c.label), ...CONFIRM_ITEMS.map((c) => c.label + " – potvrzeno"), ...CONFIRM_ITEMS.map((c) => c.label + " – detail"), "Zpráva hostovi", "Odesláno"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.name, r.contact,
    ...COLUMNS.map((c) => c.get(r)),
    ...CONFIRM_ITEMS.map((c) => (r.confirm?.[c.key]?.ok ? "ano" : "ne")),
    ...CONFIRM_ITEMS.map((c) => r.confirm?.[c.key]?.text || ""),
    r.guestNote || "",
    toMs(r) ? new Date(toMs(r)).toLocaleString("cs-CZ") : "",
  ].map(esc).join(";"));
  return "﻿" + [head.map(esc).join(";"), ...lines].join("\r\n");
};
