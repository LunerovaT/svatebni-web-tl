import { DATES, VENUE } from "../public/venue.js";

export default function SiteFooter() {
  return (
    <footer className="pb-foot">
      <div className="wrap">
        <p>
          <strong style={{ color: "#221D16", fontWeight: 500 }}>Lukáš &amp; Tereza</strong><br />
          {DATES.long} · <a href={VENUE.googleMaps} target="_blank" rel="noopener noreferrer">{VENUE.name}, {VENUE.region}</a>
        </p>
        <p>Svatba na Vysočině</p>
      </div>
    </footer>
  );
}
