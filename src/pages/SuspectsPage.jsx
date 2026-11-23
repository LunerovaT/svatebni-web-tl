import { SuspectsBoard } from "../game/CaseParts.jsx";

export default function SuspectsPage({ evidence }) {
  return (
    <section className="block">
      <div className="wrap">
        <p className="eyebrow">Případ poslední vůle</p>
        <h1 className="display">Podezřelí</h1>
        <SuspectsBoard evidence={evidence} />
      </div>
    </section>
  );
}
