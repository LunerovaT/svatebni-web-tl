// Jednotné hlášení chyb při zápisu do Firestore (aby nic nepadalo tiše).
// Když pravidla zápis odmítnou (permission-denied), ukáže se srozumitelná hláška.
export function reportError(e, what = "Zápis") {
  console.error(e);
  const msg = e?.code === "permission-denied"
    ? `${what} Firestore odmítl (permission-denied). Přihlášený e-mail pravděpodobně není v seznamu organizátorů v PUBLIKOVANÝCH pravidlech (Firebase → Firestore → Rules).`
    : `${what} se nepodařil: ${e?.message || e}`;
  try { window.alert(msg); } catch { /* bez dialogu */ }
}
