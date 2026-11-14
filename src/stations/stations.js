// Konfigurace stanovišť na svatbě. Pořadí = číslo stanoviště (1–5), pos = pozice značky na mapě v % (MapPage).
// Stanoviště jsou nezávislá – dají se řešit v libovolném pořadí.
// Po vyřešení všech pěti se odemkne finální vyšetřování (#/vysetrovani).
//
// QR kód uvnitř fyzické schránky vede na  #/stanoviste/N?k=ODPOVED  – stránka kód rovnou ověří.
// QR kódy k tisku najdeš v administraci (sekce „QR kódy ke stanovištím“).
//
// answerHash = SHA-256 normalizované odpovědi (viz answer.js → normalizeAnswer).
// Nový hash spočítáš v konzoli prohlížeče:  await (await import('/src/stations/answer.js')).sha256Hex('ODPOVED')

export const STATIONS = [
  {
    id: "s01",
    name: "Hlavní nádvoří",
    pos: { x: 78, y: 32 },
    title: "Křížovka paní Whitmoreové",
    type: "physical-puzzle",
    prompt: "Vyluštěte křížovku v dobových novinách. Zlatá políčka vám prozradí heslo. Zadejte ho sem.",
    answerLabel: "Tajenka",
    submitLabel: "Ověřit tajenku",
    wrongMessage: "Tahle tajenka nesedí. Zkontrolujte zlatá políčka v novinách.",
    answerHash: "c71090084fed243ded5b0e548f0fce0979a4b45439e333e2c2aaab3c4f5c478f", // SKRYTYDOKUMENT
    hints: [
      "Některé odpovědi znáte, jiné možná zná někdo u vedlejšího stolu. Nebojte se zapojit další svatebčany. Dobří detektivové přece nespoléhají jen na vlastní paměť.",
      "Nemusíte rozluštit úplně všechno. Zaměřte se na zvýrazněná políčka a zkuste si poskládat tajenku i z odpovědí, kterými jste si jistí.",
      "Tajenka má dvě slova. První popisuje něco, co mělo zůstat před ostatními utajené. Druhé označuje písemnost, která může obsahovat důležité informace. Co asi Eleanor nechtěla nechat na očích?",
    ],
    evidence: {
      finale: {
        kicker: "Důkaz 02 přidán do spisu",
        lines: [{ t: "ELEANOR NECHALA" }, { t: "ULOŽIT DOKUMENT" }, { t: "MIMO SÍDLO.", red: true }],
        after: "Proč potřebovala něco ukrýt před vlastní rodinou?",
        button: "Otevřít důkaz",
      },
      number: "02",
      title: "NEZNÁMÝ DOKUMENT",
      label: "DŮVĚRNÝ ARCHIV ELEANOR WHITMOREOVÉ",
      // docImage: obrázek dokumentu v animaci a na kartě (výchozí: assets/ev/doc_02.webp)
      text: "Mezi osobními záznamy Eleanor Whitmoreové byla nalezena poznámka o dokumentu, který nechala krátce před smrtí uložit mimo své sídlo. Jeho obsah ani místo uložení zatím nejsou známé.",
      question: "Proč Eleanor potřebovala něco ukrýt před vlastní rodinou?",
      summary: "Eleanor nechala před smrtí uložit neznámý dokument mimo sídlo.",
    },
  },
  {
    id: "s02",
    name: "Zahradní domek",
    pos: { x: 50, y: 46 },
    title: "Peníze, které zmizely",
    type: "physical-lock",
    prompt: "Na stole leží účetní kniha, bankovní výpis a svazek platebních příkazů. Odemkněte schránku. Uvnitř je obálka s QR kódem – načtěte ho, nebo sem zadejte kód ze zámku.",
    answerLabel: "Kód ze zámku",
    answerMode: "numeric",
    submitLabel: "Založit do spisu",
    wrongMessage: "Zámek nepovolil. Možná jste přehlédli některý záznam.",
    qrMessage: "Obálka ze schránky ověřena. Založte její obsah do spisu týmu.",
    answerHash: "9df82ff1547bdff292926e347ad933ea0af998b93568749faca6b121222a04cf", // 4813
    reveal: "folder",
    revealBox: true, // animace začne otevřením schránky (assets/ev/box_closed.webp, box_open.webp)
    hints: [
      "Na první pohled vypadají všechny dokumenty naprosto důvěryhodně. Jenže účetní kniha, banka a Eleanor nemusely mít na každou platbu stejný názor.",
      "Ne každý záznam v účetní knize znamená, že peníze skutečně odešly. A ne každá provedená platba musela mít Eleanorino svolení. Zkuste si u několika položek ověřit, co o nich říkají ostatní dokumenty.",
      "Hledáte čtyři převody, které banka skutečně provedla, ale Eleanor k nim nevystavila platební příkaz. Všechny směřovaly na stejný účet. Až je najdete, podívejte se na jejich data a čísla záznamů v účetní knize. Eleanor přece napsala, že odpověď se skrývá v tom, co se skutečně stalo – a kdy.",
    ],
    evidence: {
      number: "03",
      title: "PODEZŘELÉ FINANČNÍ PŘEVODY",
      label: "VYŠETŘOVACÍ SPIS WHITMORE",
      meta: "Účetní záznamy · Září 2025",
      docImage: "statement",
      text: "Z účtu Eleanor Whitmoreové odešly v září čtyři převody v celkové výši 120 000 USD, které nikdy nepodepsala. Všechny mířily na stejný neznámý účet a v účetní knize byly zapsané jako běžné výdaje. Jeden další pokus banka zamítla, protože podpis neodpovídal vzoru. Ve schránce ležela kopie plné moci, kterou Eleanor kdysi udělila kanceláři Blackwood & Partners.",
      finale: {
        kicker: "Důkaz 03 přidán do spisu",
        lines: [{ t: "ČTYŘI PŘEVODY." }, { t: "ŽÁDNÝ" }, { t: "NEPODEPSALA.", red: true }],
        after: "Někdo přede mnou něco skrývá. A mám podezření, že to není poprvé. E. W.",
        button: "Otevřít důkaz",
      },
      facts: ["4 převody", "120 000 USD", "1 zamítnutý pokus"],
      quote: ["„Tyto platby jsem nikdy neschválila.", "Někdo, komu jsem důvěřovala, nakládá s mými penězi bez mého vědomí.“"],
      quoteBy: "E. W.",
      question: "Kdo zapsal falešné položky do účetní knihy? A kdo mohl převody zadat místo Eleanor?",
      summary: "Z Eleanořina účtu odešlo bez jejího podpisu 120 000 USD na neznámý účet.",
      pins: [
        { suspect: "edward", text: "Jeho kancelář Blackwood & Partners měla plnou moc zadávat platby z Eleanořina účtu." },
        { suspect: "margaret", text: "Podvodné převody zapsala do účetní knihy jako běžné výdaje." },
        { suspect: "thomas", text: "Jeden z převodů byl v knize veden jako „správa investic“." },
      ],
    },
  },
  // Stanoviště 3–5: místa jsou provizorní, obsah doplníme podle kostry případu.
  {
    id: "s03",
    name: "Velký trávník",
    pos: { x: 42, y: 52 },
    title: "Slova, která Richard nikdy neřekl nahlas",
    type: "physical-words",
    prompt: "Vylosujte kartičku a předveďte slovo týmu pantomimou, nebo ho popište bez použití kořene slova. Každé uhodnuté slovo odhalí kus dopisu. Až budete mít všech šest, zadejte je sem v libovolném pořadí.",
    answerLabel: "Slova z kartiček",
    submitLabel: "Složit dopis",
    wrongMessage: "Tahle slova dopis nesloží. Zkontrolujte, která kartičky ještě nemáte uhodnuté.",
    answerMode: "words",
    answerWords: [
      ["f4b17df311eae6f267a0fd670a5db8a088d1ae7c4462b54475d43eadd77493a4"], // KRIVDA
      ["4d013d341683cd3bbcc25f7fb95422e7b8dbb3c64f1fca8436d19c24b9d7a22d"], // VERITEL
      ["ead7f159973504acace296c42b222f29551574ae4a0705306a6b30450642b6d0"], // ZAVET
      ["3b32bc04134785049021647809a89224b2e8dff1568d73034c366ff38acf5fca", "5dd13cf491b954ebc435e0ac565db95314a407b8b7b3e2488d2b1a961d11ddbc"], // NASLOUCHAT/NASLOUCHANI
      ["5a33f9a19cc7184702dc5180bd2d8a73a478917650a15941f47de7feebc58ca3"], // VYHRUZKA
      ["b4006625209ac38ce23490cfd665b659e2c9001c934aa40b40d52a8d44714c9a", "fcbc0a5c9d52a1468dd3b88d045059e5c0413a08d06876b1ae67df0b93a92f13"], // NEPOZVANY/NEPOZVANA
    ],
    reveal: "folder",
    revealBox: false,
    hints: [
      "Hrajte jako tým: jeden předvádí, ostatní hádají. Kartičku nikomu neukazujte a slovo neříkejte nahlas.",
      "Všechna slova patří k jednomu člověku a jeho vztahu k Eleanor. Po uhodnutí si přečtěte tajnou část kartičky, dopis se skládá z jejích částí.",
      "Slova jdou po sobě jako dopis: pocit, peníze, dokument, rozhovor, hrozba a příchod. Pomůže vám i to, co se v dopisech opakuje.",
    ],
    evidence: {
      number: "04",
      title: "DOPIS RICHARDA WHITMORA",
      displayTitle: "Dopis Richarda Whitmora",
      label: "Dopis synovce",
      meta: "Korespondence · Poslední týdny",
      docImage: "letter",
      text: "Synovec Richard Whitmore psal Eleanor, že mu zničí budoucnost, když přepíše závěť. Napsal, že je mu zakázáno vstoupit do domu, ale že přijede v ten večer, ať ho očekává, nebo ne. Dopis obsahuje výhrůžku.",
      question: "Kdo z domu byl opravdu nepozvaný? A stačí hrozba k tomu, aby člověk zabil?",
      summary: "Richard Whitmore Eleanor vyhrožoval a napsal, že přijede i bez pozvání.",
      finale: {
        kicker: "Důkaz 04 přidán do spisu",
        lines: [{ t: "DNES VEČER PŘIJEDU," }, { t: "AŤ MĚ OČEKÁVÁŠ," }, { t: "NEBO NE.", red: true }],
        after: "Richard Whitmore, Eleanořin synovec.",
        button: "Otevřít důkaz",
      },
      quote: ["„Jestli své rozhodnutí nezměníš, poneseš následky.“"],
      quoteBy: "R. W.",
      pins: [
        { suspect: "richard", text: "Eleanor vyhrožoval a napsal, že přijede i přes zákaz vstupu." },
        { suspect: "margaret", text: "Věděla o změně závěti a měla přístup k poště." },
      ],
    },
  },
  {
    id: "s04",
    name: "U rybníka",
    pos: { x: 68, y: 80 },
    title: "Kdo tady lže?",
    type: "physical-quiz",
    prompt: "Přiřaďte odpovědi k otázkám na časové ose, otočte kartičky a přečtěte výpovědi v pořadí času. Jedna kartička přebývá. Zjistěte, kdo podal výpověď z té přebývající, a zadejte jeho jméno.",
    answerLabel: "Jméno z přebývající kartičky",
    submitLabel: "Odhalit lháře",
    wrongMessage: "Tohle jméno k přebývající kartičce nepatří. Zkontrolujte, která odpověď nemá otázku.",
    answerHash: [
      "c9fdfeabeec31d09dbd34c1b5056e212627d8ca5ec32f4a1dda05089be814b8c", // AGNES
      "4e72b0117325f858541515b00c9169baea49a31b934c3c6bac18f13f1aa93831", // DOYLEOVA
      "5abc52d9c77d5ae4133bf24b62083a2ea44eebac34e8c1305262dc67e8bf5ebb", // AGNESDOYLEOVA
    ],
    reveal: "folder",
    revealBox: false,
    hints: [
      "Nejdřív vyřešte otázky u časové osy. Jedna kartička nebude k žádné otázce pasovat, to je ta důležitá.",
      "Otočte přebývající kartičku. Dole pod výpovědí je podepsaný ten, kdo ji řekl. Hledáte právě jeho.",
      "Stačí zadat křestní jméno osoby, která je podepsaná na výpovědi z přebývající kartičky. Je to jedna z pěti osob z případu.",
    ],
    evidence: {
      number: "05",
      title: "POSLEDNÍ NOC ELEANOR",
      displayTitle: "Poslední noc Eleanor",
      label: "Rekonstrukce výpovědí",
      meta: "Výpovědi · Noc vraždy",
      docImage: "timeline",
      text: "Z výpovědí vyplývá, že Eleanor oznámila změnu závěti a chystala prověrku financí. Richard a Thomas měli důvod se zlobit, Edward si vyžádal finanční dokumenty. Eleanor byla ještě ve 22:55 naživu, v 23:30 už ji našli mrtvou a ze stolu zmizelo mosazné těžítko.",
      question: "Kdo v domě lže, a proč? Jedna výpověď do příběhu nepatří.",
      summary: "Časová osa poslední noci: Eleanor v pracovně naživu do 22:55, v 23:30 mrtvá, zmizelo těžítko.",
      finale: {
        kicker: "Důkaz 05 přidán do spisu",
        lines: [{ t: "ZE STOLU ZMIZELO" }, { t: "TĚŽKÉ MOSAZNÉ" }, { t: "TĚŽÍTKO.", red: true }],
        after: "A jedna výpověď k téhle noci nesedí.",
        button: "Otevřít důkaz",
      },
      quote: ["„Zítra nechám nezávisle prověřit správu svého majetku. Někdo musí vysvětlit chybějící peníze.“"],
      quoteBy: "E. W., 22:30",
      pins: [
        { suspect: "edward", text: "Vyžádal si finanční dokumenty a později se o Eleanor „už nestaral“." },
        { suspect: "agnes", text: "Slyšela výkřik z pracovny. Nebo to jen tvrdí?" },
      ],
    },
  },
  { id: "s05", name: "Okraj lesa", pos: { x: 10, y: 42 } },
];

export const HINT_TITLES = ["Malé pošťouchnutí", "Pomoc vyšetřovatele", "Odborná asistence"];

export const FINAL_REQUIRES = STATIONS.length; // všech 5 indicií
export const doneCountOf = (doneMap = {}) => STATIONS.filter((_, i) => doneMap[i]).length;
