import type { Messages } from '../lib/i18n'

const nf = new Intl.NumberFormat('hu-HU')

export const hu: Messages = {
  bcp47: 'hu-HU',
  nativeName: 'Magyar',
  flag: '🇭🇺',

  common: {
    close: 'Bezárás',
    cancel: 'Mégse',
    connecting: 'Kapcsolódás…',
    inBrowser: 'Böngészőben ↗',
  },

  setup: {
    tagline: 'nulla nézettségű bingó · túra a YouTube lomtárában',
    who: 'Ki játszik?',
    namePlaceholder: 'Játékos neve…',
    add: 'Hozzáad',
    needPlayer: 'Adj hozzá legalább egy játékost',
    start: 'Játék indítása ▸',
    language: 'Nyelv',
    rulesTitle: 'Hogyan játsszátok?',
    rules: [
      'Adjatok hozzá mindenkit itt a TV-n, majd mindenki beolvassa a saját QR-kódját a telefonjával.',
      'A telefonján mindenki megírja a saját 5×5-ös bingókártyáját — csupa olyat, amiről azt hiszi, elő fog kerülni a YouTube mélyéről („szülinapi buli”, „pontosan 0 megtekintés”, „valakinek a macskája”…).',
      'Felváltva pörgetitek a kereket a TV-n. A kerék egy keresést generál ~0 megtekintésű videókra — cím nélküliekre, elfeledettekre.',
      'Nyisd meg a keresést, válassz egy eltemetett videót, és nézzétek meg együtt. A játékosok a telefonjukon jelölik a találataikat.',
      'Az első teljes sor, oszlop vagy átló — és a TV felrobban. 🎉',
    ],
  },

  join: {
    noLan: '⚠️ Nem található hálózati cím — a gép ugyanazon a Wi-Fi-n legyen, mint a telefonok.',
    scanHint: 'Olvasd be a telefonoddal → írd meg a saját bingókártyád. ✅ = kártya leadva.',
  },

  host: {
    serverDown: 'A szerver nem elérhető — fut az `npm run dev`?',
    offline: '⚠️ megszakadt a kapcsolat a játékszerverrel…',
    connect: 'Csatlakozás',
    newGame: 'Új játék',
    players: 'Játékosok',
    spunBy: (name: string) => `pörgette: ${name}`,
    copyTitle: 'Kattints a másoláshoz',
    copied: '✓ másolva',
    search: '🔍 Keresés',
    sortedByDate: 'feltöltési idő szerint rendezve — a legújabb elöl',
    spinPrompt: 'Pörgesd meg a kereket!',
    marked: (n: number) => `${n}/24 jelölve`,
    writingCard: '✍️ kártyát ír…',
    bingo: '🏆 BINGÓ',
    cardOf: (name: string) => `${name} kártyája`,
    stillWriting: '✍️ Még írja a kártyáját…',
  },

  confirm: {
    newGameText: 'Mindenkinek véget ér a játék: játékosok, kártyák, győzelmek törlődnek. Biztos?',
    newGameLabel: 'Új játék',
    redealText: 'Új kör új kártyákkal — mindenki újraírja a sajátját a telefonján. Mehet?',
    redealLabel: 'Új kártyák',
  },

  celebration: {
    title: 'B I N G Ó !',
    keepCards: 'Új kör (kártyák maradnak)',
    newCards: 'Új kör új kártyákkal',
  },

  search: {
    results: '◂ Találatok',
    searching: 'Keresés…',
    noResults: 'Semmi találat — pörgessetek újra',
    failed: 'Nem sikerült lekérni a találatokat — nyisd meg böngészőben.',
    openInBrowser: 'Megnyitás böngészőben ↗',
    playerTitle: 'YouTube lejátszó',
  },

  watch: {
    views: (n: number) => `${nf.format(n)} megtekintés`,
    zeroViews: '☠️ 0 megtekintés',
    unknownViews: '? megtekintés',
    likes: (n: number) => `${nf.format(n)} lájk`,
    likesApprox: (s: string) => `${s} lájk`,
    likesHidden: 'rejtett lájkok',
    commentsOff: '🚫 kikapcsolt kommentek',
    subscribers: (n: number) => `${nf.format(n)} feliratkozó`,
    subscribersApprox: (s: string) => `${s} feliratkozó`,
    subscribersHidden: 'rejtett feliratkozók',
    videos: (n: number) => `${nf.format(n)} videó`,
    openChannel: 'Csatorna megnyitása ↗',
  },

  player: {
    cantReach: 'Nem érem el a játékot — egy Wi-Fi-n vagy a TV-vel?',
    notInGame:
      '🫥 Nem vagy benne ebben a játékban (újraindult?). Kérd meg a házigazdát, hogy adjon hozzá, aztán olvasd be újra a QR-kódod.',
    writeCard: 'Írd meg a bingókártyád',
    builderIntro:
      '24 dolog, amire fogadsz, hogy ma este felbukkan a videókban. Koppints egy kockára a szerkesztéshez, húzd egy másikra a cseréhez. A sarkok és az átlók több vonalban számítanak — oda tedd a tutikat.',
    fill: '✨ Üresek kitöltése',
    submit: 'Mehet ▸',
    save: 'Mentés',
    delete: 'Törlés',
    editPlaceholder: (example: string) => `pl. ${example}`,
    waiting: 'várunk, hogy a házigazda elindítsa…',
    yourTurn: '🎯 te jössz!',
    otherTurn: (name: string) => `🎯 ${name} pörget`,
    spin: 'PÖRGESS!',
    spinning: 'PÖRÖG…',
    bingoBanner: (name: string) => `🎉 BINGÓ — ${name}! 🎉`,
    youWon: '🏆 BINGÓD van — kiálts!',
    markedHint: (n: number) => `${n}/24 jelölve · koppints a kockára, ha kiszúrtad`,
    reconnecting: '⚠️ újracsatlakozás…',
  },

  card: {
    freeTitle: 'Ingyen kocka',
  },

  segments: {
    fresh: {
      label: 'Friss',
      tip: 'A találatok feltöltési idő szerint vannak rendezve — lehet, hogy te vagy az első ember, aki valaha látja őket.',
    },
    digicam: {
      label: 'Digikamera',
      tip: 'Görgess túl mindenen, ami népszerű — a temető pár találattal lejjebb kezdődik.',
    },
    ancient: {
      label: 'Őskor',
      tip: 'Ezek 2006–2008-as kövületek. Külön respekt mindenért, ami ennyi év után is 0 megtekintésen áll.',
    },
    gamer: {
      label: 'Gamer',
      tip: 'Automatikusan elnevezett játékfelvételek, amiknek soha senki nem adott címet. Tiszta 2012.',
    },
    chat: {
      label: 'Chat',
      tip: 'Videók, amik valakinek a csoportcsetjéből egyenesen a YouTube-ra szöktek.',
    },
    camcorder: {
      label: 'Kamkorder',
      tip: 'Egyenesen egy MiniDV-kazettáról vagy egy otthon írt DVD-ről.',
    },
    webcam: {
      label: 'Webkamera',
      tip: 'A hálószobai webkamerás monológok aranykora.',
    },
    world: {
      label: 'Nagyvilág',
      tip: 'A lomtár globális. Bónuszpont, ha a címet sem tudod elolvasni.',
    },
    screen: {
      label: 'Képernyő',
      tip: 'Valaki felvette a képernyőjét, aztán elfelejtette, minek.',
    },
    phones: {
      label: 'Régi mobil',
      tip: 'Olyan telefonról feltöltve, aminek még gombjai voltak.',
    },
    editors: {
      label: 'Szerkesztő',
      tip: 'Megnyitottak egy vágóprogramot, alapnéven exportáltak, és eltűntek.',
    },
    drones: {
      label: 'Drónok',
      tip: 'Sosem látott légifelvétel a Föld egy pontjáról.',
    },
    dates: {
      label: 'Dátumok',
      tip: 'Egy cím, ami csak egy dátum. Mi történt aznap? Egy módon derül ki.',
    },
    ext: {
      label: 'Fájltípus',
      tip: 'Ha a teljes cím egy fájlkiterjesztés, ott senki nem hajtott a nézettségre.',
    },
    slides: {
      label: 'Diavetítés',
      tip: 'Automata fotó-diavetítések jogdíjmentes zenével. Színtiszta nosztalgia.',
    },
    wild: {
      label: 'Joker',
      tip: 'A zöld nulla. Bármi lehet az egész temetőből.',
    },
  },
}
