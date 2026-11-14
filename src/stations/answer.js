// Normalizace a ověření odpovědí stanovišť (bez Reactu, aby šlo testovat v Node).
// trim → NFD → odstranění diakritiky → VELKÁ PÍSMENA → pryč mezery a interpunkce (zůstanou jen A–Z a číslice)
export function normalizeAnswer(input) {
  return String(input ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

// SHA-256 v hex – správné odpovědi nejsou v kódu čitelně (stačí na zvědavce v prohlížeči)
export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkAnswer(station, input) {
  const norm = normalizeAnswer(input);
  if (!norm || !station?.answerHash) return false;
  const h = await sha256Hex(norm);
  return [].concat(station.answerHash).includes(h); // answerHash může být i pole přípustných tvarů
}

// Stanoviště se slovy (např. šest kartiček): každé zadané slovo musí odpovídat jinému z očekávaných slov, pořadí je jedno.
// station.answerWords = pole polí otisků (u každého slova může být víc přípustných tvarů).
export async function checkWords(station, inputs) {
  const slots = station?.answerWords || [];
  const hashes = [];
  for (const v of inputs || []) {
    const n = normalizeAnswer(v);
    hashes.push(n ? await sha256Hex(n) : null);
  }
  const used = new Set();
  let matched = 0;
  for (const h of hashes) {
    if (!h) continue;
    const i = slots.findIndex((alts, k) => !used.has(k) && alts.includes(h));
    if (i >= 0) { used.add(i); matched++; }
  }
  return { matched, total: slots.length, ok: matched === slots.length && hashes.filter(Boolean).length === slots.length };
}
