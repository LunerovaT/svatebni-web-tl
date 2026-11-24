# Lukáš & Tereza — svatební web

Vite + React projekt, zatím jako vizuální/strukturální koncept (texty jsou zástupné).

## Spuštění

```bash
npm install
npm run dev
```

Otevře se na `http://localhost:5173`.

Build pro nasazení:

```bash
npm run build
```

Výstup bude ve složce `dist/` — tu pak nahraješ na hosting (Vercel, Netlify, vlastní server...).

## Struktura

```
src/
  main.jsx, App.jsx      – vstupní bod, ErrorBoundary
  WeddingSite.jsx        – kostra: routování, přihlášení a data hráče, rozcestník stránek (cca 190 řádků)
  site.css               – základní styly webu a her; public/public.css (veřejný web), game/game.css (hra)
  hooks/
    usePlayerData.js     – přihlášený účet, profil hráče, odpověď z RSVP, tým a členové týmu (živé poslechy)
    useTeamActions.js    – zápisy: domácí úkol, stanoviště, nápovědy, obvinění, akce testovacího panelu
    useStationRoute.js   – #/stanoviste/N?k=KOD → index stanoviště a kód z QR
  useHashRoute.js        – routování přes # v URL
  layout/                – GameHeader, PublicHeader (včetně mobilního menu), SiteFooter, GameBackdrop
  pages/                 – RsvpPage, LoginPage, GameHubPage (spis), SuspectsPage, FinalPage, SleepChecks
  public/                – veřejné stránky (Domů, Kdy a kde, Program, Informace)
  game/                  – části spisu (CaseParts), GameIntro (filmová intra), TestPanel, DocViewer
  hometask/              – domácí minihra
  stations/              – stanoviště na svatbě (stations.js, answer.js, stations.css)
  story/                 – texty příběhu (intro, podezřelí, stationStory, final, evidence, fullStory)
  admin/                 – součásti administrace (RSVP přehled, QR kódy, přihlášení organizátorů)
  AdminPage, TasksPage, TasksAdminPage – administrace týmů, úkoly (jen organizátoři, načítají se líně)
  reportError.js         – jednotné hlášení chyb zápisu do Firestore
  authMessages.js        – české hlášky chyb přihlášení
  organizers.js          – e-maily organizátorů
  assets/                – grafiky
```

## Stránky (hash routování)

`#/` domů · `#/kde` · `#/program` · `#/info` · `#/rsvp` (potvrzení účasti, zakládá i účet a profil hráče) · `#/profil` (přihlášení / souhrn) ·
`#/hra` (spis) · `#/uvod` · `#/mapa` · `#/pripad` · `#/stanoviste/N` · `#/vysetrovani` · `#/domaci-ukol` · `#/admin` · `#/ukoly` · `#/spravce-ukolu`.

## Firebase

Firestore (data) + Authentication (e-mail a heslo) pro hosty i organizátory. Konfigurace je v `src/firebase.js` (veřejné identifikátory).

### Organizátoři a bezpečnostní pravidla

Organizátoři jsou rozpoznaní podle e-mailu. **Seznam musí být stejný na dvou místech**: `src/organizers.js` a funkce `isOrganizer()` v `firestore.rules`.
Po každé změně pravidel je nutné je **publikovat**: Firebase konzole → Firestore Database → Rules → vložit obsah `firestore.rules` → Publish.
Nepublikovaná pravidla neplatí. Typický příznak: zápis týmů nebo úkolů tiše selže (nově se ukáže hláška „permission-denied“).

Co pravidla dovolují: RSVP odešle kdokoli, čte jen organizátor (host jen svou odpověď). Hráč čte a upravuje svůj profil, členové týmu vidí jeden druhého a zapisují postup týmu. Týmy zakládá a ruší jen organizátor.
Známé omezení: člen týmu může zapsat do dokumentu svého týmu cokoli (i `revealed`, `accusation`), a správná řešení jsou v kódu jen jako SHA-256 otisky. Pro soukromou svatbu je to přijatelné riziko.

### Datový model

- `players` (id = uid) – `{ name, contact, wantsGame, teamId, homeClueSolved, homeTask?, createdAt }`
- `teams` – `{ name, stationsDone, stationsSolvedAt, stationsSolvedBy, hintsOpened, expertAssist, accusation?, revealed?, createdAt }`
- `rsvps` – `{ name, contact, attending, wantsGame, sleep, sleepRank, travel, travelFrom, diet, comment, guests, createdAt }`
- `tasks` – `{ title, note, category, assignee, done, createdAt }`

## Vývoj

`npm install`, `npm run dev` (http://localhost:5173), `npm run build`, `npm test` (testy odpovědí a nápověd stanovišť).

## Zveřejnění: co je otevřené pro hosty

Soubor `src/gameConfig.js`, konstanta `WEDDING_GAME_OPEN`. Dokud je `false`, host vidí jen web, potvrzení účasti, profil a domácí úkol; stanoviště, mapa, příběh a finální vyšetřování jsou skrytá (adresy přesměrují na přehled).
Na svatbě stačí přepnout na `true` a nasadit. Všechno je vždy otevřené v testovacím režimu (administrace) a přihlášeným organizátorům (e-maily v `src/organizers.js`).

## Domácí minihra „Poslední cesta Eleanor“

- Adresa: `#/domaci-ukol` (odkaz je na profilu hráče). Celoobrazovková scéna na mahagonovém stole, responzivní (PC na šířku / mobil na výšku).
- Kód: `src/hometask/`
  - `config.js` – **všechny texty a údaje** (dopis, doklady, inkoust, nápovědy, odpovědi na chybný posun, spis).
  - `cipher.js` – logika Caesarovy šifry; při `npm run dev` hlásí v konzoli rozpor v konfiguraci (`verifyCipher`).
  - `HomeTask.jsx` – stůl, detaily předmětů (dopis, fotka, doklady s lampou, kotouč), odhalení, spis.
  - `Wheel.jsx` – mosazný kotouč (tažení, šipky, ±). `sound.js` – volitelné zvuky. `hometask.css` – vzhled.
- Grafiky: `src/assets/ht/` (stůl, fotka s iniciálami E. V. a nálepkou Queen Mary, doklady s údaji, zadní strany, kotouč).
- Průchod: dopis → fotka (visačka E. V., nálepka Queen Mary, zezadu Southampton) → vybrat a **označit** pravý doklad (Queen Mary, Miss E. Vranova, kajuta C-07) → lampa (svítí jen na označený doklad) → neviditelný inkoust na zadní straně → kotouč posun **7** → „JEDEN Z PĚTI NEBYL POZVÁN“.
- Šifra: `QLKLU G WLAP ULIFS WVGCHU` → `JEDEN Z PETI NEBYL POZVAN` (posun 7).
- Postup se ukládá v prohlížeči (`localStorage`, klíč `wedding_hometask_v2`). Po vyřešení se hráči ve Firestore nastaví `homeClueSolved: true` a `homeTask: { hintsUsed, wrongDocs, attempts, solvedAt }`.
- Test: ve spisu je odkaz „začít úkol znovu (test)“.
- Údaje na dokladech jsou zapečené v obrázcích – když je v `config.js` změníš, je potřeba přegenerovat i grafiku.

## Stanoviště na svatbě

- Konfigurace: `src/stations/stations.js` – název místa, úloha, zadání, hash odpovědi, texty důkazu. Stanoviště jsou **nezávislá** (libovolné pořadí).
- Odpovědi se normalizují (`src/stations/answer.js`): ořez mezer, bez diakritiky, velká písmena, bez mezer a interpunkce. Porovnává se SHA-256 hash, aby odpověď nebyla v kódu čitelně.
- Nový hash odpovědi: v konzoli prohlížeče (npm run dev) `await (await import('/src/stations/answer.js')).sha256Hex('ODPOVED')`.
- Po správné odpovědi: uložení do týmu (`teams.stationsDone.N`, `teams.stationsSolvedAt.N`) → krátká animace obálky (`StationPage.jsx`, `stations/stations.css`, grafiky `src/assets/ev/`) → karta důkazu. Opakované otevření ukáže kartu bez animace; s „omezit pohyb“ se animace nespouští.
- Finální vyšetřování (`#/vysetrovani`) se odemkne po vyřešení všech 5 stanovišť.
- Testy logiky odpovědí: `node scripts/test-stations.mjs`
- Stanoviště 01 – Křížovka paní Whitmoreové: tajenka SKRYTÝ DOKUMENT → Důkaz 02 – Neznámý dokument.
- Stanoviště 02 – Peníze, které zmizely (Zahradní domek, fyzická schránka, kód 4813) → Důkaz 03 – Podezřelé finanční převody. Animace: schránka se otevře a výpis se založí do spisu. Tři postupné nápovědy (`hints` v stations.js).
- Pozice značek na mapě: `pos: { x, y }` u každého stanoviště v `stations.js`. Stanoviště 3–5 mají zatím provizorní místa.
- **QR kódy do schránek**: administrace → „QR kódy ke stanovištím“ → zadat kód ze zámku → Stáhnout / Tisk. Generovat až na finální adrese webu (adresa se bere z prohlížeče). QR vede na `#/stanoviste/N?k=KOD`, kód zůstává zapamatovaný i přes přihlášení.

## Spis, podezřelí, finále a testovací režim

- **Spis týmu** (`#/hra`): odpočet do svatby, sbírka důkazů (klepnutím se důkaz otevře), stanoviště, finální vyšetřování, členové týmu a poslední dění. Kdo vyřešil stanoviště, se ukládá do `teams.stationsSolvedBy.N`.
- **Podezřelí** (`#/pripad`): `src/story/suspects.js` – texty a místo pro portrét (`portrait`). Ke stanovišti lze v `stations.js` přidat `evidence.pins: [{ suspect: "agnes", text: "…" }]` – poznámka se po vyřešení připne k podezřelému.
- **Důkazy**: `src/story/evidence.js` skládá Důkaz 01 (domácí úkol) a důkazy ze stanovišť.
- **Finální obvinění** (`#/vysetrovani`, po 5 stanovištích): pachatel + motiv + rozhodující důkaz → `teams.accusation` (jen jednou). Odhalení všem: administrace → „Odhalit výsledky všem“ (`teams.revealed`). Řešení je v `src/story/final.js` jen jako otisk – **pracovní rozuzlení**, upravit po dopsání scénáře.
- **Testovací režim**: tlačítko „Test“ vlevo dole. Na localhostu (`npm run dev`) je vždy, na ostré verzi se zapíná pro jedno zařízení v administraci. Umí vrátit stanoviště / všechna, vyřešit všechna, vrátit domácí úkol, smazat obvinění a odhalit výsledek vlastnímu týmu.
