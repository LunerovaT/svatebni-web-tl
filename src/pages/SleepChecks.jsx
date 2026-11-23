import { SLEEP_OPTIONS } from "../rsvpFields.js";

// Zaškrtávací možnosti přespání (hlavní osoba i další osoby).
export default function SleepChecks({ value, onChange }) {
  const toggle = (k) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <div className="pb-checks">
      {SLEEP_OPTIONS.map(([k, label]) => (
        <label key={k}><input type="checkbox" checked={value.includes(k)} onChange={() => toggle(k)} /><span>{label}</span></label>
      ))}
    </div>
  );
}
