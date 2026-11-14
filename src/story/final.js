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

export const REVEAL = {
  title: "Případ uzavřen",
  text: "Vysvětlení celého případu doplníme, až bude hotový scénář.",
};
