// Jediné místo, kde je popsané, co hosté v „Potvrdit účast“ vyplňují a co organizátoři potvrzují zpět.
// Až přibude nová otázka (jídlo, alergie, …):
//   1) přidejte pole do formuláře (WeddingSite.jsx) a do pravidel (firestore.rules, seznam hasOnly),
//   2) přidejte řádek do COLUMNS níž – objeví se v přehledu v administraci, v exportu CSV i v profilu hosta.
//   (Pole, které tu chybí, se v administraci stejně zobrazí v sekci „Další odpovědi“.)

export const SLEEP_LABELS = {
  pokoj: "Nejlépe 1 celý pokoj",
  sdileny: "Nevadí mi víc lidí v jednom pokoji",
  stan: "Ve stanu / autě",
};
export const SLEEP_SHORT = { pokoj: "celý pokoj", sdileny: "sdílený pokoj", stan: "stan / auto" };
export const ARRIVAL_LABELS = { patek: "V pátek", sobota: "V sobotu ráno", jindy: "Jindy" };
export const TRAVEL_LABELS = { auto: "Autem", odvoz: "Potřebuje odvoz", jinak: "Jinak" };

export const persons = (r) => (r.attending === "ano" ? 1 + (r.guests?.length || 0) : 0);

export const sleepText = (r) => {
  if (r.attending !== "ano") return "";
  if (r.sleep === "ne") return "Nepřespí";
  const rank = (r.sleepRank?.length ? r.sleepRank : []).map((k, i) => `${i + 1}. ${SLEEP_SHORT[k] || k}`).join(", ");
  return rank || "Přespí";
};
export const arrivalText = (r) =>
  r.attending !== "ano" ? "" : (ARRIVAL_LABELS[r.arrival] || r.arrival || "") + (r.arrival === "jindy" && r.arrivalOther ? `: ${r.arrivalOther}` : "");
export const travelText = (r) =>
  r.attending !== "ano" ? "" : (TRAVEL_LABELS[r.travel] || r.travel || "") + (r.travel === "odvoz" && r.travelFrom ? ` (${r.travelFrom})` : "");
export const guestsText = (r) =>
  (r.guests || []).map((g) => `${g.name}${g.sleep === "ne" ? " (nepřespí)" : ""}`).join("; ");

// sloupce přehledu / CSV / souhrnu v profilu
export const COLUMNS = [
  { key: "attending", label: "Účast", get: (r) => (r.attending === "ano" ? "Přijde" : "Nepřijde") },
  { key: "persons", label: "Osob", get: (r) => (r.attending === "ano" ? String(persons(r)) : "0") },
  { key: "arrival", label: "Příjezd", get: arrivalText },
  { key: "sleep", label: "Přespání (pořadí preferencí)", get: sleepText },
  { key: "travel", label: "Doprava", get: travelText },
  { key: "guests", label: "Další osoby", get: guestsText },
  { key: "wantsGame", label: "Hra", get: (r) => (r.wantsGame === "ano" ? "Hraje" : "Nehraje") },
];

// co organizátor hostovi potvrzuje zpět (ukládá se do rsvps/{id}.confirm.{key} = { ok, text })
export const CONFIRM_ITEMS = [
  { key: "room", label: "Ubytování", placeholder: "např. Pokoj 3, hlavní budova" },
  { key: "food", label: "Jídlo", placeholder: "např. vegetariánské" },
];

export const KNOWN_KEYS = new Set([
  "id", "name", "contact", "attending", "wantsGame", "sleep", "sleepRank", "travel", "travelFrom", "travelOther",
  "arrival", "arrivalOther", "guests", "createdAt", "confirm", "guestNote",
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
