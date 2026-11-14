import { useState } from "react";
import QRCode from "qrcode";
import { checkAnswer } from "../stations/answer.js";

// QR kódy do fyzických schránek: vedou na #/stanoviste/N?k=KOD a stanoviště se jedním klepnutím odemkne.
// Kód se zadává ručně (v kódu aplikace je jen otisk), adresa se bere z aktuální domény webu.
export default function StationQr({ stations }) {
  const puzzles = stations.map((s, i) => ({ s, i })).filter(({ s }) => s.answerHash && s.type === "physical-lock");
  const [codes, setCodes] = useState({});
  const [qr, setQr] = useState({});
  const [err, setErr] = useState({});

  const make = async (s, i) => {
    const code = (codes[i] || "").trim();
    if (!(await checkAnswer(s, code))) { setErr((e) => ({ ...e, [i]: "Tenhle kód neodpovídá stanovišti." })); return; }
    const url = `${location.origin}${location.pathname}#/stanoviste/${i + 1}?k=${encodeURIComponent(code)}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M", color: { dark: "#241a12", light: "#ffffff" } });
    setErr((e) => ({ ...e, [i]: "" }));
    setQr((q) => ({ ...q, [i]: { url, dataUrl } }));
  };

  const print = (i, s) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>QR – stanoviště ${i + 1}</title>
      <style>@page{size:A4;margin:20mm}body{font-family:sans-serif;text-align:center;color:#241a12}img{width:60mm;height:60mm}
      .c{display:inline-block;border:1px dashed #999;padding:8mm;margin:6mm}p{margin:3mm 0 0;font-size:10pt}</style></head><body>
      ${[0, 1].map(() => `<div class="c"><img src="${qr[i].dataUrl}"><p>Stanoviště ${i + 1}: ${s.name}</p></div>`).join("")}
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  if (!puzzles.length) return null;
  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "16px 18px", marginBottom: 28 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>QR kódy ke stanovištím</p>
      <p style={{ margin: "0 0 14px", fontSize: 13.5, opacity: 0.75 }}>
        Generujte je až na finální adrese webu (adresa se bere z tohoto okna: {location.origin}). Zadejte kód ze zámku.
      </p>
      {puzzles.map(({ s, i }) => (
        <div key={s.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", padding: "10px 0", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ margin: "0 0 8px", fontSize: 14 }}><b>{i + 1}. {s.name}</b> · {s.title}</p>
            <span style={{ display: "flex", gap: 8 }}>
              <input type="text" inputMode="numeric" placeholder="kód ze zámku" value={codes[i] || ""}
                     onChange={(e) => setCodes((c) => ({ ...c, [i]: e.target.value }))} style={{ width: 140, padding: "6px 8px" }} />
              <button className="btn" onClick={() => make(s, i)}>Vytvořit QR</button>
            </span>
            {err[i] && <p style={{ color: "#8f2a22", fontSize: 13, margin: "6px 0 0" }}>{err[i]}</p>}
            {qr[i] && <p style={{ fontSize: 12, wordBreak: "break-all", opacity: 0.7, margin: "8px 0 0" }}>{qr[i].url}</p>}
          </div>
          {qr[i] && (
            <div style={{ textAlign: "center" }}>
              <img src={qr[i].dataUrl} alt={`QR kód stanoviště ${i + 1}`} style={{ width: 140, height: 140, display: "block" }} />
              <span style={{ display: "flex", gap: 8, marginTop: 6, justifyContent: "center" }}>
                <a className="btn" href={qr[i].dataUrl} download={`qr-stanoviste-${i + 1}.png`}>Stáhnout</a>
                <button className="btn" onClick={() => print(i, s)}>Tisk</button>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
