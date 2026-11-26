import { isTestMode } from "./game/TestPanel.jsx";
import { isOrganizerEmail } from "./organizers.js";

// Co je právě pro hosty otevřené.
// false = zatím jen domácí úkol a web; stanoviště, mapa, příběh a finální vyšetřování se na svatbě odemknou přepnutím na true.
export const WEDDING_GAME_OPEN = false;

// Kdo smí testovat: jen přihlášený organizátor (e-maily v organizers.js) nebo vývoj na localhostu.
// Samotný přepínač testMode v prohlížeči nestačí – host by si ho mohl zapnout ručně.
const isDev = () => { try { return !!import.meta.env?.DEV; } catch { return false; } };
const canTest = (email) => isDev() || isOrganizerEmail(email);
export const testModeOn = (email) => canTest(email) && isTestMode();

// Hra ze svatby je vidět: po přepnutí WEDDING_GAME_OPEN, organizátorům a na localhostu.
export const weddingGameOpen = (email) => WEDDING_GAME_OPEN || canTest(email);
