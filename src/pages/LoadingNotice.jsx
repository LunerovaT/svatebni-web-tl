import { useEffect, useState } from "react";

// „Chvilku…“ s pojistkou: když načítání trvá nezvykle dlouho (špatné připojení), nabídne obnovení místo nekonečného čekání.
export default function LoadingNotice() {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), 8000); return () => clearTimeout(t); }, []);
  return (
    <section className="block" style={{ paddingTop: 60 }}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <p className="lede" style={{ margin: "0 auto" }}>Chvilku…</p>
        {slow && (
          <>
            <p className="lede" style={{ margin: "14px auto" }}>Načítání trvá déle než obvykle. Zkontrolujte připojení k internetu.</p>
            <button type="button" className="pb-btn solid" onClick={() => window.location.reload()}>Načíst znovu</button>
          </>
        )}
      </div>
    </section>
  );
}
