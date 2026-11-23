// Jednotné hlášení chyb při zápisu do Firestore (aby nic nepadalo tiše).
// Když pravidla zápis odmítnou (permission-denied), ukáže se srozumitelná hláška.
export function reportError(e, what = "Zápis") {
  console.error(e);
  const msg = e?.code === "permission-denied"
    ? `${what} Firestore odmítl (permission-denied). Přihlášený e-mail pravděpodobně není v seznamu organizátorů v PUBLIKOVANÝCH pravidlech (Firebase → Firestore → Rules).`
    : `${what} se nepodařil: ${e?.message || e}`;
  try { window.alert(msg); } catch { /* bez dialogu */ }
}

// Obalí asynchronní akci: chybu ohlásí místo tichého selhání.
export const safely = (fn, what) => async (...args) => {
  try { return await fn(...args); } catch (e) { reportError(e, what); return undefined; }
};
