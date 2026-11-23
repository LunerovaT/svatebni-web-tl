// Z adresy #/stanoviste/N?k=KOD vytáhne index stanoviště a kód z QR (kód si pamatuje i přes přihlášení).
export default function useStationRoute(page) {
  const stationMatch = page.match(/^stanoviste\/(\d+)(?:\?(.*))?$/);
  const stationIndex = stationMatch ? parseInt(stationMatch[1], 10) - 1 : null;
  // QR kód ze schránky (#/stanoviste/N?k=KOD) – kód si pamatujeme i přes přihlášení
  let stationQrKey = null;
  if (stationMatch) {
    const k = new URLSearchParams(stationMatch[2] || "").get("k");
    try {
      if (k) sessionStorage.setItem(`qr_${stationIndex}`, k);
      stationQrKey = k || sessionStorage.getItem(`qr_${stationIndex}`);
    } catch { stationQrKey = k; }
  }
  return { stationIndex, stationQrKey };
}
