// Finální obvinění. Správné řešení je uložené jen jako SHA-256 otisk (viz stations/answer.js → sha256Hex).
// PRACOVNÍ ROZUZLENÍ – až bude příběh hotový, přepočítej otisky:  await (await import('/src/stations/answer.js')).sha256Hex('edward')
export const MOTIVES = [
  { id: "dluhy", label: "Dluhy a očekávané dědictví" },
  { id: "odhaleni", label: "Strach z odhalení tajemství" },
  { id: "tajemstvi", label: "Ochrana tajemství domácnosti" },
  { id: "majetek", label: "Spor o společný majetek" },
  { id: "pomsta", label: "Pomsta za zradu" },
  { id: "zpronevera", label: "Zakrytí zpronevěry" },
];

export const SOLUTION = {
  suspectHash: "2632ec06e2c2e54a52245ffd9e5af1cb65b21a4cdb031d4e11383719cf8c0ca4",
  motiveHash: "ea8a4448fb1a0b60921d3382204929f0ea476f0500322e30c1e5ff28f8016c62",
  evidenceHash: null, // rozhodující důkaz zatím nehodnotíme – doplní se, až budou hotová všechna stanoviště
};

// Bodování: pachatel 2, motiv 1, důkaz 1 (jen pokud je nastavený). Při shodě rozhoduje dřívější zapečetění.
export const POINTS = { suspect: 2, motive: 1, evidence: 1 };

// Filmové titulky finále (zapojí se po dokončení stanoviště 5): úvod → po otevření důkazů → po správném obvinění.
export const FINAL_STORY = {
  intro: { kicker: "Stanoviště 5 · Poslední svědek", title: "Pravda na dosah", lines: ["Agnes ukryla důkazy, které mohou změnit celé vyšetřování."] },
  opened: { kicker: "Stanoviště 5 · Poslední svědek", title: "Poslední důkazy", lines: ["Agnes vraždu viděla. Ukryla těžítko s krvavým otiskem a další důkazy."] },
  solved: { kicker: "Případ uzavřen", title: "Případ uzavřen", lines: ["Vrahem byl Edward Blackwood. Eleanor chtěla odhalit jeho podvody a změnit závěť. Její majetek měl připadnout evropské rodině. A tou rodinou jste vy."] },
};

export const REVEAL = {
  title: "Případ uzavřen",
  text: FINAL_STORY.solved.lines.join(" "),
};
