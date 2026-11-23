// Čistá logika Caesarovy šifry – bez Reactu, aby šla snadno testovat a měnit.
export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const mod = (n, m = 26) => ((n % m) + m) % m;

// Háčky a čárky pryč, jen A–Z.
export const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();

const shiftLetter = (ch, k) => {
  const i = ALPHA.indexOf(ch);
  return i < 0 ? ch : ALPHA[mod(i + k)];
};
const shiftText = (t, k) => [...t].map((c) => shiftLetter(c, k)).join("");
export const encrypt = (plain, key) => shiftText(normalize(plain), key);
// Co ukáže kotouč při posunu `offset`: vnější (šifrové) písmeno → vnitřní (pravé).
export const decodeLetter = (cipherLetter, offset) => shiftLetter(cipherLetter, -offset);

// Vyhodnocení přepisu. slots: pole {ch, off} | null
export function evaluate(slots, cipher, shiftFeedback, msg) {
  if (slots.some((s) => !s)) return { ok: false, kind: "incomplete" };
  const text = slots.map((s) => s.ch).join("");
  if (text === normalize(cipher.plain).replace(/ /g, "")) return { ok: true };
  const offs = new Set(slots.map((s) => s.off));
  if (offs.size > 1) return { ok: false, kind: "mixed", msg: msg.mixed };
  const only = [...offs][0];
  return { ok: false, kind: "wrong", msg: shiftFeedback[only] || msg.generic };
}

// Kontrola konzistence konfigurace – běží při vývoji a hlásí rozpor.
export function verifyCipher(cipher, shiftFeedback, docs) {
  const problems = [];
  const c = encrypt(cipher.plain, cipher.key);
  if (shiftText(c, -cipher.key) !== normalize(cipher.plain)) problems.push("Dešifrování nevrací původní text.");
  if (c !== cipher.expectedCipher) problems.push(`Šifra ${c} nesedí s očekávanou ${cipher.expectedCipher}.`);
  const first = normalize(cipher.plain).split(" ")[0];
  const hits = [];
  for (let k = 0; k < 26; k++) if (shiftText(c, -k).includes(first)) hits.push(k);
  if (hits.length !== 1) problems.push(`Čitelný text dává ${hits.length} posunů (${hits.join(", ")}).`);
  if (shiftFeedback[mod(cipher.key)]) problems.push("Poznámka ke špatnému posunu je přiřazena správnému klíči.");
  const correct = docs.filter((d) => d.correct);
  if (correct.length !== 1) problems.push("Musí existovat právě jeden pravý doklad.");
  else if (parseInt(correct[0].cabin.split("-")[1], 10) !== cipher.key) problems.push("Číslo kajuty pravého dokladu nesedí s klíčem.");
  return problems;
}
