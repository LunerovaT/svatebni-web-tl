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
  main.jsx          – vstupní bod React aplikace
  App.jsx           – jednoduchý wrapper
  WeddingSite.jsx    – celá aplikace (hlavička, routování přes # v URL, jednotlivé stránky)
  index.css         – základní reset
  assets/           – grafiky (monogram, ozubená kola, rohová grafika)
```

## Stránky (zatím jako sekce v jedné komponentě)

- Domů (`#/`)
- Náš příběh (`#/pribeh`)
- Informace (`#/info`)
- RSVP (`#/rsvp`)
- Hra (`#/hra`) — zatím jen uzamčený vstup, čeká na scénář detektivky

## Firebase

Projekt používá Firebase Firestore pro registrace, týmy a živý postup hrou. Konfigurace je v `src/firebase.js` (veřejné identifikátory, ne tajné klíče).

### Přihlášení organizátorů a bezpečnostní pravidla

Administrace, Úkoly a Správce úkolů se přihlašují přes Firebase Authentication (e-mail + heslo), hesla nejsou v kódu.

1. Firebase konzole → Authentication → Sign-in method → zapnout **E-mail/heslo**.
2. Authentication → Users → **Add user**: založ účet pro sebe (a případně další pro organizační tým).
3. Teprve potom: Firestore Database → Rules → vlož obsah souboru `firestore.rules` a **Publish**.
   Pravidla zamknou RSVP (čte jen organizátor), úkoly a zakládání/rušení týmů. Hra a registrace hráčů dál fungují bez účtu.

Pozor: hráči se přihlašují jen e-mailem bez hesla, proto musí zůstat čtení kolekce `players` veřejné. Kdo zná jeho strukturu, může e-maily hráčů přečíst. Pro ostrý provoz je to přijatelné jen s vědomím tohoto rizika.

**Upozornění:** tohle je záměrně jednoduché — nerozlišuje "hosta" od "admina" na úrovni databáze (ochrana admin stránek je jen heslem v appce, ne v pravidlech). Pro soukromou svatební appku s jmény/e-maily rodiny a přátel je to přiměřené riziko, ale pokud by to vadilo, dá se doplnit Firebase Authentication.

### Hesla (najdeš/měníš přímo v kódu)

- `src/AdminPage.jsx` — `ADMIN_PASSWORD` (přiřazování týmů a rolí ve hře)
- `src/TasksPage.jsx` — `TASKS_PASSWORD` (přehled úkolů pro organizační tým)
- `src/TasksAdminPage.jsx` — `TASKS_ADMIN_PASSWORD` (správa úkolů — jen pro vás dva)

### Datový model

- `players` — `{ name, contact, teamId, homeClueSolved, createdAt }`
- `teams` — `{ name, role, backstory, stationsDone: {"0": bool, ..., "7": bool}, createdAt }`
- `rsvps` — `{ name, contact, attending, wantsGame, createdAt }`
- `tasks` — `{ title, note, category, assignee, done, createdAt }`

## Co je potřeba doladit dál

- [ ] Vizuální styl — aktuální verze je základ, budeme ji dál ladit
- [ ] Skutečné texty místo `text later` placeholderů
- [ ] Scénář a texty hádanek pro stanoviště 3–5
- [ ] Zvážit heslo/přihlášení pro `/admin`
- [ ] Případně: přechod z jednoduchého hash routování na `react-router-dom`, pokud hra bude mít víc kroků/podstránek

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
