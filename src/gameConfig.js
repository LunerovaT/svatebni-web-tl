import { isTestMode } from "./game/TestPanel.jsx";
import { isOrganizerEmail } from "./organizers.js";

// Co je právě pro hosty otevřené.
// false = zatím jen domácí úkol a web; stanoviště, mapa, příběh a finální vyšetřování se na svatbě odemknou přepnutím na true.
// Všechno je vidět vždy: v testovacím režimu (administrace → Testovací režim, nebo npm run dev) a přihlášeným organizátorům (e-maily v organizers.js).
export const WEDDING_GAME_OPEN = false;
export const weddingGameOpen = (email) => WEDDING_GAME_OPEN || isTestMode() || isOrganizerEmail(email);
